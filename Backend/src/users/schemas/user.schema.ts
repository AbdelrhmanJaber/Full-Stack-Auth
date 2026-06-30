import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { ApiProperty } from "@nestjs/swagger";

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  collection: "users",
  toJSON: {
    transform: (_doc, ret: Record<string, any>) => {
      delete ret["password"];
      delete ret["__v"];
      return ret;
    },
  },
})
export class User {
  @ApiProperty({ example: "John Doe", description: "Full name of the user" })
  @Prop({
    required: true,
    trim: true,
    minlength: 3,
  })
  name: string;

  @ApiProperty({
    example: "user@example.com",
    description: "Unique email address",
  })
  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @ApiProperty({ example: "2024-01-01T00:00:00.000Z" })
  createdAt?: Date;

  @ApiProperty({ example: "2024-01-01T00:00:00.000Z" })
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
