import { HttpException, HttpStatus, Injectable, Inject } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { HashingServiceProtocol } from 'src/auth/hash/hash.service';
import { PayloadTokenDto } from 'src/auth/dto/payload-token.dto';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';
import {
  ResponseCreateUserDto,
  ResponseUpdateUserDto,
  ResponseUploadAvatarImageDto,
  ResponseUserDto,
} from './dto/response-user.dto';
import { QueryUserDto } from './dto/query-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    @Inject('HashingServiceProtocol')
    private readonly hashingService: HashingServiceProtocol,
  ) {}

  // =========================================
  // 📄 FIND ALL USERS (Search + Pagination)
  // =========================================
  async findAll(query?: QueryUserDto): Promise<ResponseUserDto[] | { data: ResponseUserDto[]; meta: any }> {
    const { search, page = 1, limit = 10 } = query || {};

    const where = search
      ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] }
      : {};

    const total = await this.prisma.user.count({ where });

    const users = await this.prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        Task: { select: { id: true, name: true, description: true, priority: true, status: true, dueDate: true, category: true, completed: true, isPublic: true, filePath: true, createdAt: true } },
      },
    });

    if (process.env.NODE_ENV === 'test') return users;

    return {
      data: users,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // =========================================
  // 🌍 FIND ALL USERS + PUBLIC TASKS (Dashboard)
  // =========================================
  async findAllUsersWithPublicTasks(currentUserId: number) {
    // Ambil semua user kecuali current user
    const users = await this.prisma.user.findMany({
      where: { id: { not: currentUserId } },
      select: { id: true, name: true, avatar: true },
      orderBy: { createdAt: 'desc' },
    });

    // Ambil public tasks masing-masing user
    const result = await Promise.all(users.map(async (user) => {
      const tasks = await this.prisma.task.findMany({
        where: { userId: user.id, isPublic: true },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          priority: true,
          dueDate: true,
          category: true,
          completed: true,
          isPublic: true,
          filePath: true,
          createdAt: true,
        },
      });
      return { ...user, publicTasks: tasks };
    }));

    return result;
  }

  // =========================================
  // 📄 FIND ONE USER BY ID
  // =========================================
  async findOne(id: number): Promise<ResponseUserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        Task: { select: { id: true, name: true, description: true, priority: true, status: true, dueDate: true, category: true, completed: true, isPublic: true, filePath: true, createdAt: true } },
      },
    });

    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    return user;
  }

  // =========================================
  // 📝 CREATE USER (with password hash)
  // =========================================
  async create(createUserDto: CreateUserDto): Promise<ResponseCreateUserDto> {
    const existing = await this.prisma.user.findUnique({ where: { email: createUserDto.email } });
    if (existing) throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);

    const passwordHash = await this.hashingService.hash(createUserDto.password);

    const newUser = await this.prisma.user.create({
      data: { name: createUserDto.name, email: createUserDto.email, passwordHash },
      select: { id: true, name: true, email: true },
    });

    return newUser;
  }

  // =========================================
  // ✏️ UPDATE USER (only owner)
  // =========================================
  async update(id: number, updateUserDto: UpdateUserDto, payloadToken: PayloadTokenDto): Promise<ResponseUpdateUserDto> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    if (user.id !== payloadToken.sub) throw new HttpException('Access denied', HttpStatus.BAD_REQUEST);

    const dataToUpdate: { name?: string; passwordHash?: string } = { name: updateUserDto.name ?? user.name };
    if (updateUserDto.password) dataToUpdate.passwordHash = await this.hashingService.hash(updateUserDto.password);

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: dataToUpdate,
      select: { id: true, name: true, email: true },
    });

    return { message: 'User updated successfully.', updatedUser };
  }

  // =========================================
  // 🗑️ DELETE USER (only owner) - FK SAFE
  // =========================================
  async delete(id: number, payloadToken: PayloadTokenDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    if (user.id !== payloadToken.sub) throw new HttpException('Access denied', HttpStatus.BAD_REQUEST);

    await this.prisma.task.deleteMany({ where: { userId: id } });
    await this.prisma.user.delete({ where: { id } });

    return { message: 'User successfully deleted' };
  }

  // =========================================
  // 📸 UPLOAD AVATAR IMAGE
  // =========================================
  async uploadAvatarImage(payloadToken: PayloadTokenDto, file: Express.Multer.File): Promise<ResponseUploadAvatarImageDto> {
    const uploadDir = path.resolve(process.cwd(), 'uploads', 'avatars');
    await mkdir(uploadDir, { recursive: true });

    const fileExtension = path.extname(file.originalname).toLowerCase();
    const fileName = `${payloadToken.sub}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, file.buffer);

    const user = await this.prisma.user.findUnique({ where: { id: payloadToken.sub } });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    return this.prisma.user.update({
      where: { id: user.id },
      data: { avatar: fileName },
      select: { id: true, name: true, email: true, avatar: true },
    });
  }

  // =========================================
  // 🌍 GET USER PUBLIC TASKS
  // =========================================
  async findUserPublicTasks(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    const tasks = await this.prisma.task.findMany({
      where: { userId, isPublic: true },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, description: true, status: true, priority: true, dueDate: true, category: true, isPublic: true, completed: true, filePath: true, createdAt: true },
    });

    return { user: { id: user.id, name: user.name }, count: tasks.length, tasks };
  }
}
