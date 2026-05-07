import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIntakeDto , UpdateIntakeDto , DeleteIntakeDto , IntakeResponseDto } from './dto/index';



@Injectable()
export class DailyTrackingService {
  constructor(private prisma: PrismaService) {}

  async addIntake(userId: string, data: CreateIntakeDto): Promise<IntakeResponseDto> {
    const intakeDate = this.normalizeDate(data.intakeDate);
    // Create intake record
    const intake = await this.prisma.dailyIntake.create({
      data: {
        userId,
        ...data,
        intakeDate,
      },
    });

    // Recalculate daily totals
    await this.recalculateDailyTotals(userId, intakeDate);

    return this.toIntakeResponse(intake);
  }

  async updateIntake(userId: string, intakeId: string, data: UpdateIntakeDto): Promise<IntakeResponseDto | null> {
    const existingIntake = await this.prisma.dailyIntake.findFirst({
      where: {
        id: intakeId,
        userId,
      },
    });

    if (!existingIntake) {
      return null;
    }

    const previousDate = this.normalizeDate(existingIntake.intakeDate);
    const nextDate = data.intakeDate ? this.normalizeDate(data.intakeDate) : previousDate;

    const intake = await this.prisma.dailyIntake.update({
      where: { id: intakeId },
      data: {
        ...data,
        intakeDate: nextDate,
      },
    });

    await this.recalculateDailyTotals(userId, previousDate);
    if (nextDate.getTime() !== previousDate.getTime()) {
      await this.recalculateDailyTotals(userId, nextDate);
    }

    return this.toIntakeResponse(intake);
  }

  async deleteIntake(userId: string, intakeId: string): Promise<IntakeResponseDto | null> {
    const existingIntake = await this.prisma.dailyIntake.findFirst({
      where: {
        id: intakeId,
        userId,
      },
    });

    if (!existingIntake) {
      return null;
    }

    const deleted = await this.prisma.dailyIntake.delete({
      where: { id: intakeId },
    });

    const date = this.normalizeDate(existingIntake.intakeDate);
    await this.recalculateDailyTotals(userId, date);

    return this.toIntakeResponse(deleted);
  }

  async getDailyTotals(userId: string, date: string) {
    const targetDate = this.normalizeDate(date);
    const totals = await this.prisma.dailyTotal.findUnique({
      where: {
        userId_trackDate: {
          userId,
          trackDate: targetDate,
        },
      },
    });

    if (totals) {
      return totals;
    }

    await this.recalculateDailyTotals(userId, targetDate);
    return this.prisma.dailyTotal.findUnique({
      where: {
        userId_trackDate: {
          userId,
          trackDate: targetDate,
        },
      },
    });
  }

  async getIntakes(userId: string, date: string) {
    const targetDate = this.normalizeDate(date);
    return this.prisma.dailyIntake.findMany({
      where: {
        userId,
        intakeDate: targetDate,
      },
      include: {
        food: true,
      },
    });
  }

  private async recalculateDailyTotals(userId: string, date: string | Date) {
    const targetDate = this.normalizeDate(date);
    const intakes = await this.prisma.dailyIntake.findMany({
      where: {
        userId,
        intakeDate: targetDate,
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
        // Nutrient unit is per 100g
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
          trackDate: targetDate,
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
        trackDate: targetDate,
        totalCalories,
        totalProtein,
        totalFat,
        totalCarbs,
      },
    });
  }

  private normalizeDate(input: string | Date): Date {
    const dt = input instanceof Date ? input : new Date(input);
    return new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate()));
  }

  private toIntakeResponse(intake: {
    id: string;
    userId: string;
    foodId: string;
    quantity: number;
    mealType: string;
    intakeDate: Date;
    createdAt: Date;
    updatedAt: Date;
  }): IntakeResponseDto {
    return {
      id: intake.id,
      userId: intake.userId,
      foodId: intake.foodId,
      quantity: intake.quantity,
      mealType: intake.mealType,
      intakeDate: intake.intakeDate,
      createdAt: intake.createdAt,
      updatedAt: intake.updatedAt,
    };
  }
}