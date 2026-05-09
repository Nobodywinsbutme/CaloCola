import { Injectable } from '@nestjs/common';
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
    // Preserve original string values (they get overwritten by the numeric calculations below)
    const activityLevelStr = data.activityLevel;
    const goalStr = data.goal;

    // 1. Calculate BMR (Mifflin-St Jeor Equation)
    let bmr = (10 * data.weight) + (6.25 * data.height) - (5 * data.age);
    bmr += (data.gender === 'Male' ? 5 : -161);
    bmr = Math.round(bmr);

    // 2. Calculate TDEE based on activity level
    let multiplier = 1.2; // Sedentary default
    if (activityLevelStr === 'Lightly Active') multiplier = 1.375;
    else if (activityLevelStr === 'Moderately Active') multiplier = 1.55;
    else if (activityLevelStr === 'Very Active') multiplier = 1.725;

    const tdee = Math.round(bmr * multiplier);

    // 3. Calculate Calorie Target based on goal
    let calorieTarget = tdee;
    if (goalStr === 'Lose') calorieTarget -= 500;
    if (goalStr === 'Gain') calorieTarget += 500;

    // 4. Calculate Macro Targets (30% Protein, 35% Carbs, 35% Fat)
    const proteinTarget = Math.round((calorieTarget * 0.30) / 4); // 4 calories per gram of protein
    const carbTarget = Math.round((calorieTarget * 0.35) / 4);    // 4 calories per gram of carbs
    const fatTarget = Math.round((calorieTarget * 0.35) / 9);     // 9 calories per gram of fat

    // 5. Construct the full profile data object
    const profileData = {
      age: data.age,
      height: data.height,
      weight: data.weight,
      gender: data.gender,
      activityLevel: activityLevelStr,
      goal: goalStr,
      bmr: bmr,
      tdee: tdee,
      calorieTarget: calorieTarget,
      proteinTarget: proteinTarget,
      fatTarget: fatTarget,
      carbTarget: carbTarget,
    };

    // 6. Save to database
    return this.prisma.userProfile.upsert({
      where: { userId },
      update: profileData,
      create: { 
        userId, 
        ...profileData 
      },
    });
  }
}