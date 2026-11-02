import { IsEnum, IsNotEmpty } from 'class-validator'
import { AppointmentStatus } from '../appointment.entity'

export class UpdateStatusDto {
  @IsNotEmpty()
  @IsEnum(AppointmentStatus)
  status!: AppointmentStatus
}