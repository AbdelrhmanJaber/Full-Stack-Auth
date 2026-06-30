import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Request,
  Version,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { SignInDto } from "./dto/sign-in.dto";
import { AuthResponseDto } from "./dto/auth-response.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { UserResponseDto } from "../users/dto/user-response.dto";
import { Throttle } from "@nestjs/throttler";
import type { JwtPayload } from "./strategies/jwt.strategy";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("sign-up")
  @Version("1")
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ short: { limit: 3, ttl: 60000 } }) // Stricter limit on sign-up
  @ApiOperation({
    summary: "Register a new user",
    description: "Creates a new user account and returns a JWT access token.",
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: "User successfully created",
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Validation failed — check request body",
  })
  @ApiResponse({
    status: 409,
    description: "Conflict — email already registered",
  })
  @ApiResponse({ status: 429, description: "Too Many Requests" })
  async signUp(@Body() createUserDto: CreateUserDto): Promise<AuthResponseDto> {
    return this.authService.signUp(createUserDto);
  }

  @Post("sign-in")
  @Version("1")
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { limit: 5, ttl: 60000 } }) // Stricter limit on sign-in
  @ApiOperation({
    summary: "Authenticate a user",
    description: "Validates credentials and returns a JWT access token.",
  })
  @ApiBody({ type: SignInDto })
  @ApiResponse({
    status: 200,
    description: "Authentication successful",
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: "Invalid email or password" })
  @ApiResponse({ status: 429, description: "Too Many Requests" })
  async signIn(@Body() signInDto: SignInDto): Promise<AuthResponseDto> {
    return this.authService.signIn(signInDto);
  }

  @Get("me")
  @Version("1")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Get authenticated user profile",
    description: "Protected endpoint — requires a valid JWT bearer token.",
  })
  @ApiResponse({
    status: 200,
    description: "Returns the current user profile",
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getMe(@Request() req: { user: JwtPayload }): Promise<UserResponseDto> {
    return this.authService.getProfile(req.user.sub);
  }
}
