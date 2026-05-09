import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIntakeDto , UpdateIntakeDto , DeleteIntakeDto , IntakeResponseDto } from './dto/index';



@Injectable()
export class DailyTrackingService {
  constructor(private prisma: PrismaService) {}

  async addIntake(userId: string, data: CreateIntakeDto): Promise<IntakeResponseDto> {
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

    return this.toIntakeResponse(intake);
  }

  async updateIntake(userId: string, intakeId: string, data: UpdateIntakeDto): Promise<IntakeResponseDto | null> {
    const intakeDate = data.intakeDate;

    const existingIntake = await this.prisma.dailyIntake.findFirst({
      where: {
        id: intakeId,
        userId,
      },
    });

    if (!existingIntake) {
      return null;
    }

    const previousDate = existingIntake.intakeDate.toISOString().slice(0, 10);

    const intake = await this.prisma.dailyIntake.update({
      where: { id: intakeId },
      data: {
        ...data,
        intakeDate: intakeDate ? new Date(intakeDate) : existingIntake.intakeDate,
      },
    });

    const nextDate = intakeDate ?? previousDate;
    await this.recalculateDailyTotals(userId, previousDate);
    if (nextDate !== previousDate) {
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

    const date = existingIntake.intakeDate.toISOString().slice(0, 10);
    await this.recalculateDailyTotals(userId, date);

    return this.toIntakeResponse(deleted);
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