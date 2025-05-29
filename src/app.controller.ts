import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getInfo(): string {
    return this.appService.getInfo();
  }

  @Get("/health")
  getHealth(): object {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "ESB Integration API",
    };
  }

  @Get("/health/database")
  async getDatabaseHealth(): Promise<object> {
    const dbStatus = await this.appService.testDatabaseConnection();
    return {
      database: dbStatus,
      service: "ESB Integration API",
    };
  }
}
