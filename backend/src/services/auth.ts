import { query } from '../database/connection.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { User } from '../types/index.js';

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
}

export class AuthService {
  private jwtSecret = process.env.JWT_SECRET || 'dev_secret_key';

  async registerUser(
    email: string,
    name: string,
    password: string,
    role: 'guest' | 'host' = 'guest'
  ) {
    try {
      // Check if user already exists
      const existingUser = await query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const passwordHash = await bcryptjs.hash(password, 10);

      // Create user
      const result = await query(
        `INSERT INTO users (email, name, password_hash, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, email, name, role, created_at`,
        [email, name, passwordHash, role]
      );

      const user = result.rows[0];

      // Generate JWT token
      const token = this.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.created_at,
        },
        token,
      };
    } catch (error) {
      throw error;
    }
  }

  async loginUser(email: string, password: string) {
    try {
      // Find user
      const result = await query(
        'SELECT id, email, name, password_hash, role, created_at FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        throw new Error('Invalid email or password');
      }

      const user = result.rows[0];

      // Verify password
      const isPasswordValid = await bcryptjs.compare(password, user.password_hash);

      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Generate JWT token
      const token = this.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.created_at,
        },
        token,
      };
    } catch (error) {
      throw error;
    }
  }

  generateToken(payload: AuthPayload): string {
    return jwt.sign(payload, this.jwtSecret, { expiresIn: '7d' });
  }

  verifyToken(token: string): AuthPayload | null {
    try {
      return jwt.verify(token, this.jwtSecret) as AuthPayload;
    } catch (error) {
      return null;
    }
  }

  async getUserById(id: string) {
    const result = await query(
      'SELECT id, email, name, role, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }
}

export default new AuthService();
