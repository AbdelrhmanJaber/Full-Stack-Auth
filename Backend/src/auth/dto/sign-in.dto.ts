import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class SignInDto {
  @ApiProperty({
    example: "user@example.com",
    description: "Registered email address",
  })
  @IsEmail({}, { message: "Please provide a valid email address" })
  email: string;

  @ApiProperty({
    example: "P@ssw0rd!",
    description: "Account password",
  })
  @IsString()
  password: string;
}
