import { IsNotEmpty, IsInt, IsISO8601 } from 'class-validator'

export class CreateAppointmentDto {
  @IsNotEmpty()
  @IsInt()
  doctorId!: number

  @IsNotEmpty()
  @IsInt()
  patientId!: number

  @IsNotEmpty()
  @IsISO8601()
  startsAt!: string
}
