import { IsNotEmpty, IsString } from 'class-validator'

export class CreateMedicalRecordDto {
  @IsNotEmpty()
  @IsString()
  text!: string
}
