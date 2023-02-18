export const EnvConfiguration = () => ({
  environment: process.env.NODE_ENV || 'development',
  mongodb: process.env.MONGODB,
  port: process.env.PORT,
  defaultLimit: +process.env.DEFAULT_LIMIT || 10,
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
  sendinblueApiKey: process.env.SENDINBLUE_API_KEY,
});
