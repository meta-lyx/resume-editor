import { Context } from 'hono';

export const safeJson = (c: Context, data: any, status: number = 200) => {
  return c.body(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint' ? Number(value) : value
  ), status as any, {
    'Content-Type': 'application/json'
  });
};
