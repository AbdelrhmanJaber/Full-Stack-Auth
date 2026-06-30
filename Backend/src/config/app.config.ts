import { registerAs } from "@nestjs/config";

export const appConfig = registerAs("app", () => ({
  port: parseInt(process.env.PORT ?? "3000", 10),
  nodeEnv: process.env.NODE_ENV ?? "development",
  mongodbUri:
    process.env.MONGODB_URI ?? "mongodb://localhost:27017/easygenerator",
  jwtSecret: process.env.JWT_SECRET ?? "changeme-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
}));
