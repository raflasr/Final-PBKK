// Kelas abstrak sebagai "kontrak" untuk layanan hashing
export abstract class HashingServiceProtocol {
  // method untuk membuat hash (harus di-implement di class turunannya)
  abstract hash(password: string): Promise<string>;

  // method untuk membandingkan password dengan hash
  abstract compare(password: string, passwordHash: string): Promise<boolean>;
}
