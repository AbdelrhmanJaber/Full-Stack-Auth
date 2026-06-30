import { Controller, Get, HttpCode, HttpStatus, Version } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection, ConnectionStates } from "mongoose";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
  ) {}

  @Get()
  @Version("1")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Application health check" })
  @ApiResponse({ status: 200, description: "Service is healthy" })
  @ApiResponse({ status: 503, description: "Service unavailable" })
  check() {
    const mongoState = this.mongoConnection.readyState;
    const isConnected = mongoState === ConnectionStates.connected;
    const mongoStatus = isConnected ? "connected" : "disconnected";

    return {
      status: isConnected ? "ok" : "degraded",
      services: {
        database: mongoStatus,
      },
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
