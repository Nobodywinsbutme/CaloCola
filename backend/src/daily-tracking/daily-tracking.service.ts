import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DailyTrackingService {
  constructor(private prisma: PrismaService) {}

  async addIntake(userId: string, data: { foodId: string; quantity: number; mealType: string; intakeDate: string }) {
    // Create intake record
    const intake = await this.prisma.dailyIntake.create({
      data: {
        userId,
        ...data,
        intakeDate: new Date(data.intakeDate),
      },
    });

    // Recalculate daily totals
    await this.recalculateDailyTotals(userId, data.intakeDate);

    return intake;
  }

  async getDailyTotals(userId: string, date: string) {
    return this.prisma.dailyTotal.findUnique({
      where: {
        userId_trackDate: {
          userId,
          trackDate: new Date(date),
        },
      },
    });
  }

  async getIntakes(userId: string, date: string) {
    return this.prisma.dailyIntake.findMany({
      where: {
        userId,
        intakeDate: new Date(date),
      },
      include: {
        food: true,
      },
    });
  }

  private async recalculateDailyTotals(userId: string, date: string) {
    const intakes = await this.prisma.dailyIntake.findMany({
      where: {
        userId,
        intakeDate: new Date(date),
      },
      include: {
        food: true,
      },
    });

    let totalCalories = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalCarbs = 0;

    for (const intake of intakes) {
      if (intake.food) {
        const factor = intake.quantity / 100;
        totalCalories += intake.food.calories * factor;
        totalProtein += intake.food.protein * factor;
        totalFat += intake.food.fat * factor;
        totalCarbs += intake.food.carbs * factor;
      }
    }

    await this.prisma.dailyTotal.upsert({
      where: {
        userId_trackDate: {
          userId,
          trackDate: new Date(date),
        },
      },
      update: {
        totalCalories,
        totalProtein,
        totalFat,
        totalCarbs,
      },
      create: {
        userId,
        trackDate: new Date(date),
        totalCalories,
        totalProtein,
        totalFat,
        totalCarbs,
      },
    });
  }
}