import {
  IsNotEmpty,
  IsString,
  IsDate,
  IsNumber,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEventDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsNumber()
  maxParticipants: number;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsArray()
  @IsString({ each: true })
  interests: string[];

  @IsBoolean()
  isPublic: boolean;
}
