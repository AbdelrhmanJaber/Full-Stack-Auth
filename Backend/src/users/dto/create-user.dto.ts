import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from "class-validator";

export class CreateUserDto {
  @ApiProperty({
    example: "John Doe",
    description: "Full name — minimum 3 characters",
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @MinLength(3, { message: "Name must be at least 3 characters long" })
  @MaxLength(100, { message: "Name must be at most 100 characters long" })
  name: string;

  @ApiProperty({
    example: "user@example.com",
    description: "A valid email address",
  })
  @IsEmail({}, { message: "Please provide a valid email address" })
  email: string;

  @ApiProperty({
    example: "P@ssw0rd!",
    description:
      "Password: min 8 chars, at least one letter, one number, and one special character",
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @Matches(/(?=.*[a-zA-Z])/, {
    message: "Password must contain at least one letter",
  })
  @Matches(/(?=.*\d)/, {
    message: "Password must contain at least one number",
  })
  @Matches(/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~])/, {
    message: "Password must contain at least one special character",
  })
  password: string;
}
