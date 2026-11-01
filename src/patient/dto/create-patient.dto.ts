import { IsNotEmpty, IsString, Length } from 'class-validator'

export class CreatePatientDto {
  @IsNotEmpty()
  @IsString()
  name!: string

  @IsNotEmpty()
  @IsString()
  @Length(11, 11, { message: 'CPF deve ter exatamente 11 digitos' })
  cpf!: string
}
