import { Type } from 'class-transformer';
import { IsDateString, IsNumber, Min } from 'class-validator';

export class CreateWaterIntakeDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  amountMl: number;

  @IsDateString()
  intakeDate: string;
}
