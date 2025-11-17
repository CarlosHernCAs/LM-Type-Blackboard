import { createClient } from 'redis';
import { config } from './index';

export const redis = createClient({
  url: config.redisUrl,
});

redis.on('error', (err) => console.error('Redis Client Error', err));
redis.on('connect', () => console.log('Redis connected'));

redis.connect();

export default redis;
