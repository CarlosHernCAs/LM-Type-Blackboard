import { Pool } from 'pg';

export abstract class BaseService {
  constructor(protected db: Pool) {}

  protected async query<T = any>(text: string, params?: any[]): Promise<T[]> {
    const result = await this.db.query(text, params);
    return result.rows;
  }

  protected async queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
    const result = await this.db.query(text, params);
    return result.rows[0] || null;
  }

  protected async execute(text: string, params?: any[]): Promise<number> {
    const result = await this.db.query(text, params);
    return result.rowCount || 0;
  }
}
