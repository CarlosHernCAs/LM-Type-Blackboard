import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import { BaseService } from './base.service';
import { User, CreateUserDTO, UserRole } from '../models';

export class AuthService extends BaseService {
  constructor(db: Pool) {
    super(db);
  }

  async register(data: CreateUserDTO): Promise<Omit<User, 'password_hash'>> {
    const { username, email, password, role, first_name, last_name, phone, date_of_birth, address } = data;

    // Check if user already exists
    const existingUser = await this.queryOne<User>(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.queryOne<User>(
      `INSERT INTO users (username, email, password_hash, role, first_name, last_name, phone, date_of_birth, address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, username, email, role, first_name, last_name, phone, date_of_birth, address, is_active, created_at, updated_at`,
      [username, email, password_hash, role, first_name, last_name, phone, date_of_birth, address]
    );

    if (!user) {
      throw new Error('Failed to create user');
    }

    return user;
  }

  async login(email: string, password: string): Promise<User> {
    const user = await this.queryOne<User>(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.is_active) {
      throw new Error('Account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash || '');

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await this.execute(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    return user;
  }

  async getUserById(id: string): Promise<Omit<User, 'password_hash'> | null> {
    return this.queryOne<User>(
      `SELECT id, username, email, role, first_name, last_name, phone, date_of_birth, address,
              profile_picture_url, is_active, last_login, created_at, updated_at
       FROM users WHERE id = $1`,
      [id]
    );
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.queryOne<User>(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
  }

  async verifyPassword(userId: string, password: string): Promise<boolean> {
    const user = await this.queryOne<User>(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (!user || !user.password_hash) {
      return false;
    }

    return bcrypt.compare(password, user.password_hash);
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const isValid = await this.verifyPassword(userId, oldPassword);

    if (!isValid) {
      throw new Error('Invalid current password');
    }

    const password_hash = await bcrypt.hash(newPassword, 10);

    await this.execute(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [password_hash, userId]
    );
  }
}
