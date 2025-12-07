// DTO untuk response task (data yang dikembalikan ke client)
export class ResponseTaskDto {
  id: number;           // ID task
  name: string;         // Nama task
  description: string | null; // Deskripsi task (boleh null)
  priority: string | null;    // Prioritas task: low/medium/high (boleh null)
  status: string | null;      // Status task: pending/done (boleh null)
  dueDate: Date | null;       // Tanggal jatuh tempo (boleh null)
  category: string | null;    // Kategori task (boleh null)
  completed: boolean;         // Apakah task sudah selesai
  isPublic: boolean;          // Apakah task bersifat publik
  filePath: string | null;    // Path file terkait task (boleh null)
  userId: number;             // ID user pemilik task
  createdAt: Date;            // Waktu task dibuat
}
