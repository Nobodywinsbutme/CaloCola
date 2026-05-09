import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateIntakeDto {
	@IsOptional()
	@IsString()
	foodId?: string;

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	quantity?: number;

	@IsOptional()
	@IsString()
	@IsIn(['Breakfast', 'Lunch', 'Dinner', 'Snack'])
	mealType?: string;

	@IsOptional()
	@IsDateString()
	intakeDate?: string;
}
