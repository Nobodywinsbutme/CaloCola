import { Controller, Get, Post, Body, UseGuards, Request, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DailyTrackingService } from './daily-tracking.service';

@Controller('daily-tracking')
@UseGuards(JwtAuthGuard)
export class DailyTrackingController {
  constructor(private dailyTrackingService: DailyTrackingService) {}

  @Post('intake')
  addIntake(@Request() req, @Body() data: { foodId: string; quantity: number; mealType: string; intakeDate: string }) {
    return this.dailyTrackingService.addIntake(req.user.id, data);
  }

  @Get('totals')
  getDailyTotals(@Request() req, @Query('date') date: string) {
    return this.dailyTrackingService.getDailyTotals(req.user.id, date);
  }

  @Get('intakes')
  getIntakes(@Request() req, @Query('date') date: string) {
    return this.dailyTrackingService.getIntakes(req.user.id, date);
  }
}