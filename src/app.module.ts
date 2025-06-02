/*
 * GŁÓWNY MODUŁ APLIKACJI ESB
 *
 * Problem do rozwiązania:
 * Aplikacja ESB potrzebuje zorganizowanej struktury modułów.
 * Każdy system (baza, kolejki, adaptery) powinien być oddzielny.
 *
 * Jak to rozwiązujemy:
 * Główny moduł importuje wszystkie potrzebne moduły:
 * - DatabaseModule - połączenie z PostgreSQL (Neon)
 * - QueuesModule - kolejki Redis/BullMQ
 * - AdaptersModule - adaptery do wszystkich systemów
 *
 * Dlaczego taka struktura:
 * - Separacja odpowiedzialności (każdy moduł ma swoją rolę)
 * - Łatwość testowania (można mockować pojedyncze moduły)
 * - Skalowanie (można przenieść moduły do osobnych serwisów)
 *
 * W pełnej implementacji:
 * - AuthModule (JWT, OAuth2)
 * - LoggingModule (structured logging)
 * - MonitoringModule (metryki, health checks)
 * - ValidationModule (Zod, class-validator)
 */

import { Module, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DatabaseModule } from "./config/database.module";
import { QueuesModule } from "./queues/queues.module";
import { AdaptersModule } from "./adapters/adapters.module";
import { OrdersModule } from "./orders/orders.module";
import { CorrelationIdMiddleware } from "./common/correlation-id.middleware";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    DatabaseModule,
    QueuesModule,
    AdaptersModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes("*"); // Dla wszystkich routów
  }
}
