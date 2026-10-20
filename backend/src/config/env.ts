import Joi from 'joi';

// Defining a schema to validate environment variables
const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
  PORT: Joi.number().default(8000),
  OPENAI_API_KEY: Joi.string().trim().allow('').optional(),
  OPENAI_MODEL: Joi.string().trim().default('gpt-4o-mini'),
  GEMINI_API_KEY: Joi.string().trim().allow('').optional(),
  GEMINI_MODEL: Joi.string().trim().default('gemini-2.5-flash'),
  // Which configured provider to use for AI generation. Defaults to Gemini
  // when GEMINI_API_KEY is set, otherwise OpenAI.
  AI_PROVIDER: Joi.string().valid('openai', 'gemini').optional(),
  FIRESTORE_PRIVATE_KEY: Joi.string().required(),
  FIRESTORE_CLIENT_EMAIL: Joi.string().email().required(),
  FIRESTORE_PROJECT_ID: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  LOG_LEVEL: Joi.string()
    .valid('info', 'warn', 'error', 'debug')
    .default('info'),
  AUTH0_DOMAIN: Joi.string().required(),
  AUTH0_M2M_CLIENT_ID: Joi.string().required(),
  AUTH0_M2M_CLIENT_SECRET: Joi.string().required(),
  AUTH0_AUDIENCE: Joi.string().uri().required(),
  AUTH0_ISSUER: Joi.string().uri().required(),
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
  openaiApiKey: envVars.OPENAI_API_KEY as string | undefined,
  openaiModel: envVars.OPENAI_MODEL as string,
  geminiApiKey: envVars.GEMINI_API_KEY as string | undefined,
  geminiModel: envVars.GEMINI_MODEL as string,
  aiProvider: (envVars.AI_PROVIDER ??
    (envVars.GEMINI_API_KEY ? 'gemini' : 'openai')) as 'openai' | 'gemini',
  firestorePrivateKey: (envVars.FIRESTORE_PRIVATE_KEY as string).replace(
    /\\n/g,
    '\n',
  ),
  firestoreClientEmail: envVars.FIRESTORE_CLIENT_EMAIL as string,
  firestoreProjectId: envVars.FIRESTORE_PROJECT_ID as string,
  jwtSecret: envVars.JWT_SECRET as string,
  logLevel: envVars.LOG_LEVEL as 'info' | 'warn' | 'error' | 'debug',
  auth0Domain: envVars.AUTH0_DOMAIN as string,
  auth0M2MClientId: envVars.AUTH0_M2M_CLIENT_ID as string,
  auth0M2MClientSecret: envVars.AUTH0_M2M_CLIENT_SECRET as string,
  auth0Audience: envVars.AUTH0_AUDIENCE as string,
  auth0Issuer: envVars.AUTH0_ISSUER as string,
};
