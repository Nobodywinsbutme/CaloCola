import { Controller, Get, Post, Put, Delete, Body, UseGuards, Request, Query, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DailyTrackingService } from './daily-tracking.service';
import { CreateIntakeDto } from './dto/create-intake.dto';
import { CreateWaterIntakeDto } from './dto/create-water-intake.dto';
import { UpdateIntakeDto } from './dto/update-intake.dto';
import { DeleteIntakeDto } from './dto/delete-intake.dto';

@Controller('daily-tracking')
@UseGuards(JwtAuthGuard)
export class DailyTrackingController {
  constructor(private dailyTrackingService: DailyTrackingService) {}

  @Post('intake')
  addIntake(@Request() req, @Body() data: CreateIntakeDto) {
    return this.dailyTrackingService.addIntake(req.user.id, data);
  }

  @Put('intake/:id')
  updateIntake(
    @Request() req,
    @Param('id') id: string,
    @Body() data: UpdateIntakeDto,
  ) {
    return this.dailyTrackingService.updateIntake(req.user.id, id, data);
  }

  @Delete('intake/:id')
  deleteIntake(@Request() req, @Param() params: DeleteIntakeDto) {
    return this.dailyTrackingService.deleteIntake(req.user.id, params.id);
  }

  @Get('totals')
  getDailyTotals(@Request() req, @Query('date') date: string) {
    return this.dailyTrackingService.getDailyTotals(req.user.id, date);
  }

  @Get('intakes')
  getIntakes(@Request() req, @Query('date') date: string) {
    return this.dailyTrackingService.getIntakes(req.user.id, date);
  }

  @Post('water')
  addWaterIntake(@Request() req, @Body() data: CreateWaterIntakeDto) {
    return this.dailyTrackingService.addWaterIntake(req.user.id, data);
  }

  @Delete('water/latest')
  deleteLatestWaterIntake(@Request() req, @Query('date') date: string) {
    return this.dailyTrackingService.deleteLatestWaterIntake(req.user.id, date);
  }

  @Get('water')
  getWaterIntakes(@Request() req, @Query('date') date: string) {
    return this.dailyTrackingService.getWaterIntakes(req.user.id, date);
  }
}