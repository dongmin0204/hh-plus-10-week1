import { Module } from "@nestjs/common";
import { PointController } from "./point.controller";
import { PointService } from "./point.service";
import { PointLockManager } from "./point.lock";
import { DatabaseModule } from "../database/database.module";

export const LOCK_MANAGER_TOKEN = 'ILockManager';

@Module({
    imports: [DatabaseModule],
    controllers: [PointController],
    providers: [
        PointService,
        {
            provide: LOCK_MANAGER_TOKEN,
            useClass: PointLockManager,
        },
    ],
})
export class PointModule {}