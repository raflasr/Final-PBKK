// Interface untuk mendefinisikan struktur data task
export interface ITask {
  id: number;               // ID task
  name: string;             // Nama task
  description: string | null; // Deskripsi task (boleh null)
  priority: string | null;  // Prioritas: low/medium/high (boleh null)
  status: string | null;    // Status: pending/done (boleh null)
  dueDate: Date | null;     // Tanggal jatuh tempo (boleh null)
  category: string | null;  // Kategori task (boleh null)
  completed: boolean;       // Apakah task sudah selesai
  isPublic: boolean;        // Apakah task bersifat publik
  filePath: string | null;  // Path file yang terlampir (boleh null)
  createdAt: Date;          // Waktu task dibuat
}

// DTO untuk response user lengkap, termasuk daftar task
export class ResponseUserDto {
  id: number;       // ID user
  name: string;     // Nama user
  email: string;    // Email user
  avatar: string | null; // Avatar user (boleh null)
  Task: ITask[];    // Daftar task milik user
}

// DTO untuk response saat user dibuat
export class ResponseCreateUserDto {
  id: number;       // ID user baru
  name: string;     // Nama user
  email: string;    // Email user
  passwordHash?: string; // Password hash (opsional, biasanya tidak dikirim ke client)
}

// DTO untuk response saat user diupdate
export class ResponseUpdateUserDto {
  message: string;  // Pesan sukses update
  updatedUser: {    // Data user yang diupdate
    id: number;
    name: string;
    email: string;
  };
}

// DTO untuk response saat avatar diupload
export class ResponseUploadAvatarImageDto {
  id: number;       // ID user
  name: string;     // Nama user
  email: string;    // Email user
  avatar: string | null; // Path avatar baru (boleh null)
}
