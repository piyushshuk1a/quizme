import Joi from 'joi';

// Defining a schema to validate environment variables
const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
  PORT: Joi.number().default(8000),
  DATABASE_URL: Joi.string().uri().required(),
  JWT_SECRET: Joi.string().required(),
  LOG_LEVEL: Joi.string()
    .valid('info', 'warn', 'error', 'debug')
    .default('info'),
}).unknown(); // Allow additional environment variables

// Validate the environment variables
const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Environment variable validation error: ${error.message}`);
}

// Export the validated environment variables
export const config = {
  nodeEnv: envVars.NODE_ENV as 'development' | 'production' | 'test',
  port: envVars.PORT as number,
  databaseUrl: envVars.DATABASE_URL as string,
  jwtSecret: envVars.JWT_SECRET as string,
  logLevel: envVars.LOG_LEVEL as 'info' | 'warn' | 'error' | 'debug',
};
