import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import * as bcrypt from "bcrypt";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";

jest.mock("bcrypt");

describe("AuthService", () => {
  let service: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;

  const mockUser = {
    _id: { toString: () => "507f1f77bcf86cd799439011" },
    name: "John Doe",
    email: "john@example.com",
    password: "hashedpassword",
    createdAt: new Date(),
  };

  const mockLogger = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(async () => {
    usersService = {
      existsByEmail: jest.fn().mockResolvedValue(false),
      create: jest.fn().mockResolvedValue(mockUser),
      findByEmail: jest.fn().mockResolvedValue(mockUser),
      findById: jest.fn().mockResolvedValue(mockUser),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue("mock-jwt-token"),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue("7d") },
        },
        { provide: WINSTON_MODULE_NEST_PROVIDER, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  // ─────────────────────────────────────────────
  // signUp
  // ─────────────────────────────────────────────
  describe("signUp", () => {
    const signUpDto = {
      name: "John Doe",
      email: "john@example.com",
      password: "P@ssw0rd!",
    };

    it("should register a new user and return an access token", async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedpassword");

      const result = await service.signUp(signUpDto);

      expect(usersService.existsByEmail).toHaveBeenCalledWith(signUpDto.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(signUpDto.password, 12);
      expect(usersService.create).toHaveBeenCalledWith({
        name: signUpDto.name,
        email: signUpDto.email,
        password: "hashedpassword",
      });
      expect(result.accessToken).toBe("mock-jwt-token");
      expect(result.user.email).toBe(signUpDto.email);
    });

    it("should throw ConflictException if email already exists", async () => {
      (usersService.existsByEmail as jest.Mock).mockResolvedValue(true);

      await expect(service.signUp(signUpDto)).rejects.toThrow(
        ConflictException,
      );
      expect(usersService.create).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────
  // signIn
  // ─────────────────────────────────────────────
  describe("signIn", () => {
    const signInDto = { email: "john@example.com", password: "P@ssw0rd!" };

    it("should sign in successfully with valid credentials", async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.signIn(signInDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(
        signInDto.email,
        true,
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        signInDto.password,
        mockUser.password,
      );
      expect(result.accessToken).toBe("mock-jwt-token");
    });

    it("should throw UnauthorizedException if user not found", async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(service.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException if password is wrong", async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should use the same error message for missing user and wrong password (prevents enumeration)", async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
      let notFoundError: UnauthorizedException | undefined;
      try {
        await service.signIn(signInDto);
      } catch (e) {
        notFoundError = e as UnauthorizedException;
      }

      (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      let wrongPassError: UnauthorizedException | undefined;
      try {
        await service.signIn(signInDto);
      } catch (e) {
        wrongPassError = e as UnauthorizedException;
      }

      expect(notFoundError?.message).toBe(wrongPassError?.message);
    });
  });

  // ─────────────────────────────────────────────
  // getProfile
  // ─────────────────────────────────────────────
  describe("getProfile", () => {
    it("should return the user profile by id", async () => {
      const result = await service.getProfile("507f1f77bcf86cd799439011");
      expect(result.email).toBe(mockUser.email);
      expect(result.name).toBe(mockUser.name);
    });
  });
});
