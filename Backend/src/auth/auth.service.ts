import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Inject,
  LoggerService,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import * as bcrypt from "bcrypt";
import { UsersService } from "../users/users.service";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { SignInDto } from "./dto/sign-in.dto";
import { AuthResponseDto } from "./dto/auth-response.dto";
import { UserResponseDto } from "../users/dto/user-response.dto";

const BCRYPT_SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  async signUp(createUserDto: CreateUserDto): Promise<AuthResponseDto> {
    const { email, password, name } = createUserDto;

    // Check for duplicate email
    const emailExists = await this.usersService.existsByEmail(email);
    if (emailExists) {
      this.logger.warn(
        `Sign-up attempted with existing email: ${email}`,
        "AuthService",
      );
      throw new ConflictException("An account with this email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    // Create user
    const user = await this.usersService.create({
      name,
      email,
      password: hashedPassword,
    });

    this.logger.log(`New user registered: ${email}`, "AuthService");

    const userId = String(user._id);
    const tokens = this.generateTokens(userId, email);

    return {
      accessToken: tokens.accessToken,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  }

  async signIn(signInDto: SignInDto): Promise<AuthResponseDto> {
    const { email, password } = signInDto;

    // Explicitly select password (excluded by default via schema select: false)
    const user = await this.usersService.findByEmail(email, true);

    if (!user) {
      this.logger.warn(
        `Sign-in failed — user not found: ${email}`,
        "AuthService",
      );
      // Use a generic message to prevent user enumeration
      throw new UnauthorizedException("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      this.logger.warn(
        `Sign-in failed — wrong password for: ${email}`,
        "AuthService",
      );
      throw new UnauthorizedException("Invalid email or password");
    }

    this.logger.log(`User signed in: ${email}`, "AuthService");

    const userId = String(user._id);
    const tokens = this.generateTokens(userId, email);

    return {
      accessToken: tokens.accessToken,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  }

  private generateTokens(
    userId: string,
    email: string,
  ): { accessToken: string } {
    const payload = { sub: userId, email };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }

  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.usersService.findById(userId);
    return {
      id: String(user._id),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
