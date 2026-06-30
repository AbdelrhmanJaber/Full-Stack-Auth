import { Test, TestingModule } from "@nestjs/testing";
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from "@nestjs/common";
import * as request from "supertest";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule } from "@nestjs/config";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Connection } from "mongoose";
import { getConnectionToken } from "@nestjs/mongoose";
import type { Server } from "http";
import { AuthModule } from "../src/auth/auth.module";
import { UsersModule } from "../src/users/users.module";
import { HttpExceptionFilter } from "../src/common/filters/http-exception.filter";
import { TransformInterceptor } from "../src/common/interceptors/transform.interceptor";
import { WinstonModule } from "nest-winston";
import * as winston from "winston";
import { appConfig } from "../src/config/app.config";

// Set env vars BEFORE any module resolves config
process.env.JWT_SECRET = "e2e-test-secret-key";
process.env.JWT_EXPIRES_IN = "1h";

describe("Authentication E2E", () => {
  let app: INestApplication;
  let httpServer: Server;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;

  beforeAll(async () => {
    // Spin up in-memory MongoDB for tests
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [appConfig],
        }),
        WinstonModule.forRoot({
          transports: [new winston.transports.Console({ silent: true })],
        }),
        MongooseModule.forRoot(uri),
        AuthModule,
        UsersModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix("api");
    app.enableVersioning({ type: VersioningType.URI });
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new TransformInterceptor());

    await app.init();

    httpServer = app.getHttpServer() as Server;
    mongoConnection = moduleFixture.get<Connection>(getConnectionToken());
  });

  afterEach(async () => {
    // Clean DB between tests
    const collections = mongoConnection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  afterAll(async () => {
    if (app) await app.close();
    if (mongod) await mongod.stop();
  });

  // ─────────────────────────────────────────────
  // POST /api/v1/auth/sign-up
  // ─────────────────────────────────────────────
  describe("POST /api/v1/auth/sign-up", () => {
    const validPayload = {
      name: "John Doe",
      email: "john@example.com",
      password: "P@ssw0rd!",
    };

    it("should register a new user and return 201 with a token", async () => {
      const res = await request(httpServer)
        .post("/api/v1/auth/sign-up")
        .send(validPayload)
        .expect(201);

      const body = res.body as {
        success: boolean;
        data: {
          accessToken: string;
          user: { email: string; password?: string };
        };
      };
      expect(body.success).toBe(true);
      expect(body.data.accessToken).toBeDefined();
      expect(body.data.user.email).toBe(validPayload.email);
      expect(body.data.user.password).toBeUndefined();
    });

    it("should return 409 when email is already registered", async () => {
      await request(httpServer).post("/api/v1/auth/sign-up").send(validPayload);

      await request(httpServer)
        .post("/api/v1/auth/sign-up")
        .send(validPayload)
        .expect(409);
    });

    it("should return 400 for invalid email", async () => {
      await request(httpServer)
        .post("/api/v1/auth/sign-up")
        .send({ ...validPayload, email: "not-an-email" })
        .expect(400);
    });

    it("should return 400 when name is too short", async () => {
      await request(httpServer)
        .post("/api/v1/auth/sign-up")
        .send({ ...validPayload, name: "AB" })
        .expect(400);
    });

    it("should return 400 when password has no letter", async () => {
      await request(httpServer)
        .post("/api/v1/auth/sign-up")
        .send({ ...validPayload, password: "12345678!" })
        .expect(400);
    });

    it("should return 400 when password has no number", async () => {
      await request(httpServer)
        .post("/api/v1/auth/sign-up")
        .send({ ...validPayload, password: "Password!" })
        .expect(400);
    });

    it("should return 400 when password has no special character", async () => {
      await request(httpServer)
        .post("/api/v1/auth/sign-up")
        .send({ ...validPayload, password: "Password1" })
        .expect(400);
    });

    it("should return 400 when password is too short", async () => {
      await request(httpServer)
        .post("/api/v1/auth/sign-up")
        .send({ ...validPayload, password: "P@1" })
        .expect(400);
    });
  });

  // ─────────────────────────────────────────────
  // POST /api/v1/auth/sign-in
  // ─────────────────────────────────────────────
  describe("POST /api/v1/auth/sign-in", () => {
    const credentials = { email: "john@example.com", password: "P@ssw0rd!" };

    beforeEach(async () => {
      await request(httpServer)
        .post("/api/v1/auth/sign-up")
        .send({ name: "John Doe", ...credentials });
    });

    it("should sign in with valid credentials and return 200 with a token", async () => {
      const res = await request(httpServer)
        .post("/api/v1/auth/sign-in")
        .send(credentials)
        .expect(200);

      const body = res.body as {
        success: boolean;
        data: { accessToken: string };
      };
      expect(body.success).toBe(true);
      expect(body.data.accessToken).toBeDefined();
    });

    it("should return 401 for wrong password", async () => {
      await request(httpServer)
        .post("/api/v1/auth/sign-in")
        .send({ ...credentials, password: "WrongPass1!" })
        .expect(401);
    });

    it("should return 401 for non-existent email", async () => {
      await request(httpServer)
        .post("/api/v1/auth/sign-in")
        .send({ email: "nobody@example.com", password: "P@ssw0rd!" })
        .expect(401);
    });
  });

  // ─────────────────────────────────────────────
  // GET /api/v1/auth/me — protected endpoint
  // ─────────────────────────────────────────────
  describe("GET /api/v1/auth/me", () => {
    it("should return 401 without a token", async () => {
      await request(httpServer).get("/api/v1/auth/me").expect(401);
    });

    it("should return user profile with a valid token", async () => {
      const signUpRes = await request(httpServer)
        .post("/api/v1/auth/sign-up")
        .send({
          name: "Jane Doe",
          email: "jane@example.com",
          password: "P@ssw0rd!",
        });

      const signUpBody = signUpRes.body as {
        data: { accessToken: string };
      };
      const token = signUpBody.data.accessToken;

      const meRes = await request(httpServer)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      const meBody = meRes.body as {
        data: { email: string; password?: string };
      };
      expect(meBody.data.email).toBe("jane@example.com");
      expect(meBody.data.password).toBeUndefined();
    });

    it("should return 401 with an invalid token", async () => {
      await request(httpServer)
        .get("/api/v1/auth/me")
        .set("Authorization", "Bearer invalid.token.here")
        .expect(401);
    });
  });
});
