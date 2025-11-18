import { Pool } from 'pg';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { BaseService } from './base.service';
import { FileUpload, CreateFileDTO } from '../models';

export class UploadService extends BaseService {
  private s3Client: S3Client;
  private bucket: string;

  constructor(db: Pool, s3Config: { endpoint: string; bucket: string; credentials: any }) {
    super(db);

    this.s3Client = new S3Client({
      endpoint: s3Config.endpoint,
      credentials: s3Config.credentials,
      region: 'us-east-1',
      forcePathStyle: true,
    });

    this.bucket = s3Config.bucket;
  }

  async subirArchivo(
    usuarioId: string,
    buffer: Buffer,
    nombreOriginal: string,
    mimeType: string
  ): Promise<FileUpload> {
    // Generar nombre único
    const timestamp = Date.now();
    const extension = nombreOriginal.split('.').pop();
    const nombreLimpio = nombreOriginal
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase();

    const claveS3 = `uploads/${usuarioId}/${timestamp}_${nombreLimpio}`;

    // Subir a S3/MinIO
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: claveS3,
        Body: buffer,
        ContentType: mimeType,
      })
    );

    // Guardar metadata en DB
    const archivo = await this.queryOne<FileUpload>(
      `INSERT INTO files (user_id, filename, original_name, mime_type, size, s3_key, s3_bucket)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [usuarioId, nombreLimpio, nombreOriginal, mimeType, buffer.length, claveS3, this.bucket]
    );

    if (!archivo) {
      throw new Error('Error al guardar metadata del archivo');
    }

    return archivo;
  }

  async obtenerArchivoPorId(id: string): Promise<FileUpload | null> {
    return this.queryOne<FileUpload>(
      `SELECT f.*, u.first_name || ' ' || u.last_name as subido_por
       FROM files f
       LEFT JOIN users u ON f.user_id = u.id
       WHERE f.id = $1`,
      [id]
    );
  }

  async obtenerArchivosPorUsuario(usuarioId: string): Promise<FileUpload[]> {
    return this.query<FileUpload>(
      `SELECT * FROM files
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [usuarioId]
    );
  }

  async generarUrlDescarga(archivo: FileUpload, expiracion: number = 3600): Promise<string> {
    const comando = new GetObjectCommand({
      Bucket: archivo.s3_bucket,
      Key: archivo.s3_key,
    });

    const url = await getSignedUrl(this.s3Client, comando, { expiresIn: expiracion });
    return url;
  }

  async eliminarArchivo(id: string, usuarioId: string, esAdmin: boolean = false): Promise<void> {
    // Obtener archivo
    const archivo = await this.queryOne<FileUpload>(
      'SELECT * FROM files WHERE id = $1',
      [id]
    );

    if (!archivo) {
      throw new Error('Archivo no encontrado');
    }

    // Verificar permisos
    if (!esAdmin && archivo.user_id !== usuarioId) {
      throw new Error('No autorizado para eliminar este archivo');
    }

    // Eliminar de S3
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: archivo.s3_bucket,
          Key: archivo.s3_key,
        })
      );
    } catch (error) {
      console.error('Error al eliminar de S3:', error);
      // Continuar para eliminar de DB de todos modos
    }

    // Eliminar de DB
    await this.execute('DELETE FROM files WHERE id = $1', [id]);
  }

  async obtenerEstadisticas(usuarioId: string): Promise<any> {
    return this.queryOne(
      `SELECT
        COUNT(*) as total_archivos,
        SUM(size) as espacio_total_usado,
        MAX(created_at) as ultimo_archivo
       FROM files
       WHERE user_id = $1`,
      [usuarioId]
    );
  }

  async buscarArchivos(usuarioId: string, termino: string): Promise<FileUpload[]> {
    return this.query<FileUpload>(
      `SELECT * FROM files
       WHERE user_id = $1
         AND (filename ILIKE $2 OR original_name ILIKE $2)
       ORDER BY created_at DESC`,
      [usuarioId, `%${termino}%`]
    );
  }

  async obtenerArchivosPorTipo(usuarioId: string, tipoMime: string): Promise<FileUpload[]> {
    return this.query<FileUpload>(
      `SELECT * FROM files
       WHERE user_id = $1
         AND mime_type LIKE $2
       ORDER BY created_at DESC`,
      [usuarioId, `${tipoMime}%`]
    );
  }

  validarTamano(tamano: number, limiteBytes: number = 10 * 1024 * 1024): boolean {
    return tamano <= limiteBytes;
  }

  validarTipo(mimeType: string, tiposPermitidos: string[]): boolean {
    return tiposPermitidos.some(tipo => mimeType.startsWith(tipo));
  }

  obtenerExtension(nombreArchivo: string): string {
    return nombreArchivo.slice((nombreArchivo.lastIndexOf('.') - 1 >>> 0) + 2);
  }

  formatearTamano(bytes: number): string {
    const tamanos = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + tamanos[i];
  }
}
