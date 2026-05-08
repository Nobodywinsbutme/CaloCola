import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsNumber, IsString, Min } from 'class-validator';

export class CreateIntakeDto {
  @IsString()
  foodId: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  quantity: number;

  @IsString()
  @IsIn(['Uncategorized', 'Breakfast', 'Lunch', 'Dinner', 'Snack'])
  mealType: string;

  @IsDateString()
  intakeDate: string;
}
