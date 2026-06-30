import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { NotFoundException } from "@nestjs/common";
import { UsersService } from "./users.service";
import { User } from "./schemas/user.schema";

describe("UsersService", () => {
  let service: UsersService;

  const mockUser = {
    _id: "507f1f77bcf86cd799439011",
    name: "John Doe",
    email: "john@example.com",
    password: "hashedpassword",
    createdAt: new Date(),
    save: jest.fn().mockResolvedValue({
      _id: "507f1f77bcf86cd799439011",
      name: "John Doe",
      email: "john@example.com",
    }),
  };

  let findOneMock: jest.Mock;
  let findByIdMock: jest.Mock;
  let countDocumentsMock: jest.Mock;

  beforeEach(async () => {
    const mockModelInstance = {
      save: jest.fn().mockResolvedValue(mockUser),
    };

    findOneMock = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(mockUser),
    });

    findByIdMock = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockUser),
    });

    countDocumentsMock = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(0),
    });

    // Mock the constructor so `new this.userModel()` returns mockModelInstance
    const MockModel = Object.assign(
      jest.fn().mockImplementation(() => mockModelInstance),
      {
        findOne: findOneMock,
        findById: findByIdMock,
        countDocuments: countDocumentsMock,
      },
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: MockModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe("create", () => {
    it("should create and return a user", async () => {
      const result = await service.create({
        name: "John Doe",
        email: "john@example.com",
        password: "hashedpassword",
      });
      expect(result).toBeDefined();
      expect(result.email).toBe("john@example.com");
    });
  });

  describe("findByEmail", () => {
    it("should return a user when found", async () => {
      const result = await service.findByEmail("john@example.com");
      expect(result).toBeDefined();
      expect(result?.email).toBe("john@example.com");
    });

    it("should return null when user not found", async () => {
      findOneMock.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });
      const result = await service.findByEmail("notfound@example.com");
      expect(result).toBeNull();
    });
  });

  describe("findById", () => {
    it("should return a user when found", async () => {
      const result = await service.findById("507f1f77bcf86cd799439011");
      expect(result).toBeDefined();
      expect(result.name).toBe("John Doe");
    });

    it("should throw NotFoundException when user not found", async () => {
      findByIdMock.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });
      await expect(service.findById("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("existsByEmail", () => {
    it("should return false when email does not exist", async () => {
      const result = await service.existsByEmail("new@example.com");
      expect(result).toBe(false);
    });

    it("should return true when email exists", async () => {
      countDocumentsMock.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(1),
      });
      const result = await service.existsByEmail("john@example.com");
      expect(result).toBe(true);
    });
  });
});
