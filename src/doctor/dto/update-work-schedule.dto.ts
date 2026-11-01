import { Type } from 'class-transformer'
import {
  IsArray,
  IsInt,
  IsString,
  Matches,
  Min,
  Max,
  ValidateNested,
} from 'class-validator'

export class ShiftDto {
  @IsInt()
  @Min(0)
  @Max(6)
  weekDay!: number

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'startTime deve estar no formato HH:MM',
  })
  startTime!: string

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'endTime deve estar no formato HH:MM',
  })
  endTime!: string

  @IsInt()
  @Min(1)
  slotDurationMinutes!: number
}

export class UpdateWorkScheduleDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShiftDto)
  shifts!: ShiftDto[]
}
