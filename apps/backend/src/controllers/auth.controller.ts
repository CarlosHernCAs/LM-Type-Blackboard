import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services';
import { CreateUserDTO, UserRole } from '../models';

export class AuthController {
  constructor(private authService: AuthService) {}

  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as CreateUserDTO;

      const user = await this.authService.register(body);

      // Generate JWT token
      const token = request.server.jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return reply.code(201).send({
        token,
        user,
      });
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email, password } = request.body as { email: string; password: string };

      const user = await this.authService.login(email, password);

      // Generate JWT token
      const token = request.server.jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      // Remove password from response
      const { password_hash, ...userWithoutPassword } = user;

      return reply.send({
        token,
        user: userWithoutPassword,
      });
    } catch (error: any) {
      return reply.code(401).send({ error: error.message });
    }
  }

  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request.user as any).id;

      const user = await this.authService.getUserById(userId);

      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }

      return reply.send(user);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async changePassword(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request.user as any).id;
      const { oldPassword, newPassword } = request.body as {
        oldPassword: string;
        newPassword: string;
      };

      await this.authService.changePassword(userId, oldPassword, newPassword);

      return reply.send({ message: 'Password changed successfully' });
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  }
}
