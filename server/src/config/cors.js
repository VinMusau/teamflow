
export const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_ORIGIN,
].filter(Boolean);