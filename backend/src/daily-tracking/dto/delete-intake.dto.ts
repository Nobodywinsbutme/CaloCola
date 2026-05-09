import { IsString } from 'class-validator';

export class DeleteIntakeDto {
  @IsString()
  id: string;
}
