import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { WinstonModule } from "nest-winston";
import * as winston from "winston";
import { Connection } from "mongoose";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { HealthModule } from "./health/health.module";
import { appConfig } from "./config/app.config";

@Module({
  imports: [
    // Configuration – load env variables globally
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: [".env.local", ".env"],
    }),

    // Winston structured logging
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction =
          configService.get<string>("NODE_ENV") === "production";
        return {
          transports: [
            new winston.transports.Console({
              format: isProduction
                ? winston.format.combine(
                    winston.format.timestamp(),
                    winston.format.json(),
                  )
                : winston.format.combine(
                    winston.format.colorize(),
                    winston.format.timestamp({ format: "HH:mm:ss" }),
                    winston.format.printf((info) => {
                      const level = info.level;
                      const msg =
                        typeof info.message === "string"
                          ? info.message
                          : JSON.stringify(info.message);
                      const ts =
                        typeof info.timestamp === "string"
                          ? info.timestamp
                          : "";
                      const ctx =
                        typeof info.context === "string"
                          ? `[${info.context}]`
                          : "";
                      const knownKeys = new Set([
                        "level",
                        "message",
                        "timestamp",
                        "context",
                      ]);
                      const metaEntries = Object.entries(info).filter(
                        ([k]) => !knownKeys.has(k),
                      );
                      const extra = metaEntries.length
                        ? ` ${JSON.stringify(Object.fromEntries(metaEntries))}`
                        : "";
                      return `${ts} ${level} ${ctx} ${msg}${extra}`;
                    }),
                  ),
            }),
            // Write errors to a dedicated file in production
            ...(isProduction
              ? [
                  new winston.transports.File({
                    filename: "logs/error.log",
                    level: "error",
                    format: winston.format.combine(
                      winston.format.timestamp(),
                      winston.format.json(),
                    ),
                  }),
                  new winston.transports.File({
                    filename: "logs/combined.log",
                    format: winston.format.combine(
                      winston.format.timestamp(),
                      winston.format.json(),
                    ),
                  }),
                ]
              : []),
          ],
        };
      },
    }),

    // MongoDB connection
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>("app.mongodbUri"),
        connectionFactory: (connection: Connection) => {
          connection.on("connected", () => console.log("✅ MongoDB connected"));
          connection.on("error", (err: Error) =>
            console.error("❌ MongoDB connection error:", err.message),
          );
          return connection;
        },
      }),
    }),

    // Rate limiting: 100 requests per 60 seconds per IP
    ThrottlerModule.forRoot([
      {
        name: "short",
        ttl: 1000,
        limit: 10,
      },
      {
        name: "medium",
        ttl: 10000,
        limit: 30,
      },
      {
        name: "long",
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Feature modules
    AuthModule,
    UsersModule,
    HealthModule,
  ],
  providers: [
    // Apply throttle guard globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
