import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getInfo(): string {
    return "ESB Integration API - E-commerce Systems Integration";
  }
}
