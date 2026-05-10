import { IsOptional, IsNumber, IsInt, IsString, IsIn, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProfileDto {
  // Personal metrics
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  height?: number; // cm

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  weight?: number; // kg

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  age?: number; // years

  @IsOptional()
  @IsString()
  @IsIn(['Male', 'Female'])
  gender?: string;

  @IsOptional()
  @IsString()
  @IsIn(['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Extremely Active'])
  activityLevel?: string;

  @IsOptional()
  @IsString()
  @IsIn(['Lose', 'Maintain', 'Gain'])
  goal?: string;

  // Calculated metrics (optional to accept overrides)
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  bmr?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  tdee?: number;

  //Water Target
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  waterTarget?: number; // ml

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  cupSizeMl?: number; // ml per cup

  // Daily targets
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  calorieTarget?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  proteinTarget?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  fatTarget?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  carbTarget?: number;
}
