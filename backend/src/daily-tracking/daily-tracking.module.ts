import { Module } from '@nestjs/common';
import { DailyTrackingService } from './daily-tracking.service';
import { DailyTrackingController } from './daily-tracking.controller';

@Module({
  providers: [DailyTrackingService],
  controllers: [DailyTrackingController],
})
export class DailyTrackingModule {}