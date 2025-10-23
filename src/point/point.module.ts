import { Module } from '@nestjs/common';
import { PointController } from './point.controller';
import { PointService } from './point.service';
import { PointLockManager } from './point.lock';
import { DatabaseModule } from '../database/database.module';
import { LOCK_MANAGER_TOKEN } from './point.constants';

@Module({
  imports: [DatabaseModule],
  controllers: [PointController],
  providers: [
    PointService,
    PointLockManager,
    {
      provide: LOCK_MANAGER_TOKEN,
      useExisting: PointLockManager,
    },
  ],
  exports: [PointService],
})
export class PointModule {}
