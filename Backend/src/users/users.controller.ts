import {
  Controller,
  Get,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Version,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UsersService } from "./users.service";
import { UserResponseDto } from "./dto/user-response.dto";
import type { JwtPayload } from "../auth/strategies/jwt.strategy";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  @Version("1")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Get current authenticated user profile",
    description: "Protected endpoint — requires a valid JWT bearer token.",
  })
  @ApiResponse({
    status: 200,
    description: "Returns the profile of the authenticated user.",
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized — invalid or missing token.",
  })
  async getProfile(
    @Request() req: { user: JwtPayload },
  ): Promise<UserResponseDto> {
    const user = await this.usersService.findById(req.user.sub);
    return {
      id: String(user._id),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
