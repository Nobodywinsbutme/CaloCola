import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: { email: string; password: string; name?: string }) {
    return this.prisma.user.create({ data });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
  }

  async updateProfile(userId: string, data: any) {
    const existing = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (existing) {
      return this.prisma.userProfile.update({
        where: { userId },
        data,
      });
    }

    const height = Number(data.height);
    const weight = Number(data.weight);
    const age = Number(data.age);
    const gender = data.gender;
    const activityLevel = data.activityLevel;
    const goal = data.goal;

    if (!height || !weight || !age || !gender || !activityLevel || !goal) {
      throw new BadRequestException(
        'Missing required fields to create profile: height, weight, age, gender, activityLevel, goal.'
      );
    }

    const activityFactor = this.getActivityFactor(activityLevel);
    const goalOffset = this.getGoalOffset(goal);
    const bmr = Number.isFinite(data.bmr) ? Number(data.bmr) : this.calcBmr(height, weight, age, gender);
    const tdee = Number.isFinite(data.tdee) ? Number(data.tdee) : this.calcTdee(bmr, activityFactor, goalOffset);
    const calorieTarget = Number.isFinite(data.calorieTarget) ? Number(data.calorieTarget) : tdee;

    const macros = this.calcMacros(tdee, weight);
    const proteinTarget = Number.isFinite(data.proteinTarget) ? Number(data.proteinTarget) : macros.protein;
    const fatTarget = Number.isFinite(data.fatTarget) ? Number(data.fatTarget) : macros.fat;
    const carbTarget = Number.isFinite(data.carbTarget) ? Number(data.carbTarget) : macros.carbs;

    const waterTarget = Number.isFinite(data.waterTarget)
      ? Number(data.waterTarget)
      : Math.round(weight * 30);

    const cupSizeMl = Number.isFinite(data.cupSizeMl) ? Number(data.cupSizeMl) : 250;

    return this.prisma.userProfile.create({
      data: {
        userId,
        height,
        weight,
        age,
        gender,
        activityLevel,
        goal,
        bmr,
        tdee,
        calorieTarget,
        proteinTarget,
        fatTarget,
        carbTarget,
        waterTarget,
        cupSizeMl,
      },
    });
  }

  private getActivityFactor(level: string) {
    switch (level) {
      case 'Lightly Active':
        return 1.375;
      case 'Moderately Active':
        return 1.55;
      case 'Very Active':
        return 1.725;
      case 'Extremely Active':
        return 1.9;
      case 'Sedentary':
      default:
        return 1.2;
    }
  }

  private getGoalOffset(goal: string) {
    switch (goal) {
      case 'Lose':
        return -500;
      case 'Gain':
        return 300;
      case 'Maintain':
      default:
        return 0;
    }
  }

  private calcBmr(height: number, weight: number, age: number, gender: string) {
    const base = 10 * weight + 6.25 * height - 5 * age;
    return gender === 'Female' ? base - 161 : base + 5;
  }

  private calcTdee(bmr: number, activityFactor: number, goalOffset: number) {
    return Math.round(bmr * activityFactor + goalOffset);
  }

  private calcMacros(tdee: number, weight: number) {
    const protein = Math.round(weight * 1.5);
    const fat = Math.round((tdee * 0.3) / 9);
    const carbs = Math.round((tdee - protein * 4 - fat * 9) / 4);
    return { protein, fat, carbs };
  }
}