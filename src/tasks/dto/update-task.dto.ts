import {
  IsOptional,
  IsString,
  MinLength,
  IsBoolean,
  IsDateString,
} from 'class-validator';

// DTO untuk update task
export class UpdatesTaskDto {
  @IsOptional()
  @IsString({ message: 'The name must be a string.' })
  @MinLength(5, { message: 'The name must be at least 5 characters long.' })
  readonly name?: string; // Nama task (opsional, minimal 5 karakter)

  @IsOptional()
  @IsString({ message: 'The description must be a string.' })
  @MinLength(5, {
    message: 'The description must be at least 5 characters long.',
  })
  readonly description?: string; // Deskripsi task (opsional, minimal 5 karakter)

  @IsOptional()
  @IsBoolean({ message: 'The completed field must be a boolean value.' })
  readonly completed?: boolean; // Status selesai task (opsional)

  @IsOptional()
  @IsString({ message: 'The priority must be a string.' })
  readonly priority?: string; // Prioritas task: low/medium/high (opsional)

  @IsOptional()
  @IsString({ message: 'The status must be a string.' })
  readonly status?: string; // Status task: pending/done (opsional)

  @IsOptional()
  @IsDateString({}, { message: 'The dueDate must be a valid ISO date string.' })
  readonly dueDate?: string; // Tanggal jatuh tempo task (opsional)

  @IsOptional()
  @IsString({ message: 'The category must be a string.' })
  readonly category?: string; // Kategori task (opsional)

  @IsOptional()
  @IsBoolean({ message: 'The isPublic field must be a boolean value.' })
  readonly isPublic?: boolean; // Apakah task bersifat publik (opsional)
}
