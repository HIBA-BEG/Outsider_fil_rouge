import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateRatingDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  score: number;
}