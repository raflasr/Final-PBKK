import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {

  getHello(): any {
    return {
      // Pesan utama yang ditampilkan ketika user mengakses endpoint root "/"
      message: 'Welcome to ToDo App API!',

      // Daftar semua route yang ada di aplikasi beserta method HTTP-nya
      routes: [
        // ====== ROUTE UNTUK USERS ======
        { method: 'GET', path: '/users' },              // Ambil semua user
        { method: 'GET', path: '/users/:id' },          // Ambil user berdasarkan ID
        { method: 'POST', path: '/users' },             // Tambah user baru
        { method: 'PATCH', path: '/users/:id' },        // Update sebagian data user
        { method: 'DELETE', path: '/users/:id' },       // Hapus user
        { method: 'POST', path: '/users/upload' },      // Upload avatar/file user
        { method: 'GET', path: '/users/:id/public-tasks' }, // Ambil task publik milik user tertentu

        // ====== ROUTE UNTUK TASKS ======
        { method: 'GET', path: '/tasks' },              // Ambil semua task
        { method: 'POST', path: '/tasks' },             // Tambah task baru
        { method: 'PATCH', path: '/tasks/:id' },        // Edit task tertentu
        { method: 'PATCH', path: '/tasks/:id/toggle' }, // Toggle status selesai/belum
        { method: 'PATCH', path: '/tasks/:id/toggle-public' }, // Toggle publik/privat
        { method: 'GET', path: '/tasks/public/:userId' },      // Ambil task publik milik user

        // ====== ROUTE TESTE (contoh) ======
        { method: 'DELETE', path: '/tasks/:id' },       // Hapus task tertentu
        { method: 'GET', path: '/teste' },              // Endpoint test GET
        { method: 'POST', path: '/teste' },             // Endpoint test POST
      ],
    };
  }
}
