import { FastifyInstance } from 'fastify';
import { db } from '../config/database';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../config';
import { randomUUID } from 'crypto';

// MinIO/S3 Client
const s3Client = new S3Client({
  endpoint: 'http://localhost:9000',
  region: config.s3Region,
  credentials: {
    accessKeyId: config.s3AccessKey || 'eduverse',
    secretAccessKey: config.s3SecretKey || 'eduverse123',
  },
  forcePathStyle: true,
});

export default async function uploadRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', fastify.authenticate);

  // Upload file
  fastify.post('/', async (request, reply) => {
    try {
      const userId = (request.user as any).id;
      const data = await request.file();

      if (!data) {
        return reply.code(400).send({ error: 'No file provided' });
      }

      const fileBuffer = await data.toBuffer();
      const fileExtension = data.filename.split('.').pop();
      const uniqueFilename = `${randomUUID()}.${fileExtension}`;
      const key = `uploads/${userId}/${uniqueFilename}`;

      // Upload to MinIO
      await s3Client.send(
        new PutObjectCommand({
          Bucket: config.s3Bucket,
          Key: key,
          Body: fileBuffer,
          ContentType: data.mimetype,
        })
      );

      // Save metadata to database
      const result = await db.query(
        `INSERT INTO files
         (filename, original_filename, file_type, file_size, storage_path, uploaded_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [uniqueFilename, data.filename, data.mimetype, fileBuffer.length, key, userId]
      );

      return reply.code(201).send(result.rows[0]);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'File upload failed' });
    }
  });

  // Get presigned download URL
  fastify.get('/:id/download', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const result = await db.query(
        'SELECT * FROM files WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'File not found' });
      }

      const file = result.rows[0];

      const command = new GetObjectCommand({
        Bucket: config.s3Bucket,
        Key: file.storage_path,
      });

      const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

      // Increment download count
      await db.query(
        'UPDATE files SET download_count = download_count + 1 WHERE id = $1',
        [id]
      );

      return { url, filename: file.original_filename };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to generate download URL' });
    }
  });

  // Delete file
  fastify.delete('/:id', async (request, reply) => {
    try {
      const userId = (request.user as any).id;
      const { id } = request.params as { id: string };

      const result = await db.query(
        'SELECT * FROM files WHERE id = $1 AND uploaded_by = $2',
        [id, userId]
      );

      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'File not found or unauthorized' });
      }

      const file = result.rows[0];

      // Delete from MinIO
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: config.s3Bucket,
          Key: file.storage_path,
        })
      );

      // Delete from database
      await db.query('DELETE FROM files WHERE id = $1', [id]);

      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to delete file' });
    }
  });

  // Get my files
  fastify.get('/my', async (request, reply) => {
    try {
      const userId = (request.user as any).id;

      const result = await db.query(
        `SELECT * FROM files
         WHERE uploaded_by = $1
         ORDER BY created_at DESC`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
}
