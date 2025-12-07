import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { PayloadTokenDto } from '../auth/dto/payload-token.dto';
import { Readable } from 'stream';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  // ============================
  // FIXED PAYLOAD TOKEN
  // ============================
  const mockPayload: PayloadTokenDto = {
    sub: 1,
    email: 'a@b.com',
    iat: 0,
    exp: 0,
    aud: 'test',
    iss: 'test',
  };

  // ============================
  // MOCK PRISMA
  // ============================
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    task: {
      deleteMany: jest.fn(),
      findMany: jest.fn(),
    },
  };

  // ============================
  // MOCK HASH SERVICE
  // ============================
  const mockHashingService = {
    hash: jest.fn().mockResolvedValue('hashedpassword'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: 'HashingServiceProtocol', useValue: mockHashingService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  // ============================
  // CREATE USER
  // ============================
  describe('create', () => {
    it('should create new user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 1,
        name: 'Test',
        email: 'a@b.com',
      });

      const result = await service.create({
        name: 'Test',
        email: 'a@b.com',
        password: '123456',
      });

      expect(result.id).toBe(1);
      expect(mockPrisma.user.create).toHaveBeenCalled();
    });
  });

  // ============================
  // FIND ONE
  // ============================
  describe('findOne', () => {
    it('should return user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        name: 'Test',
        email: 'a@b.com',
        avatar: null,
        Task: [],
      });

      const res = await service.findOne(1);
      expect(res.id).toBe(1);
    });

    it('should throw not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow('User not found');
    });
  });

  // ============================
  // UPDATE USER
  // ============================
  describe('update', () => {
    it('should update user if owner', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        name: 'Old',
        email: 'a@b.com',
        passwordHash: 'xxx',
      });

      mockPrisma.user.update.mockResolvedValue({
        id: 1,
        name: 'New',
        email: 'a@b.com',
      });

      const res = await service.update(1, { name: 'New' }, mockPayload);

      expect(res.updatedUser.name).toBe('New');
      expect(res.message).toBeDefined();
    });

    it('should throw access denied if not owner', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 2 });

      await expect(service.update(2, { name: 'x' }, mockPayload)).rejects.toThrow(
        'Access denied',
      );
    });
  });

  // ============================
  // DELETE USER
  // ============================
  describe('delete', () => {
    it('should delete user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1 });

      mockPrisma.task.deleteMany.mockResolvedValue({});
      mockPrisma.user.delete.mockResolvedValue({});

      const res = await service.delete(1, mockPayload);

      expect(res).toHaveProperty('message');
    });

    it('should throw error if not owner', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 2 });

      await expect(service.delete(2, mockPayload)).rejects.toThrow(
        'Access denied',
      );
    });
  });

  // ============================
  // UPLOAD AVATAR
  // ============================
  describe('uploadAvatarImage', () => {
    it('should upload avatar', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1 });

      mockPrisma.user.update.mockResolvedValue({
        id: 1,
        name: 'Test',
        email: 'a@b.com',
        avatar: '1.png',
      });

      const file: Express.Multer.File = {
        originalname: 'avatar.png',
        mimetype: 'image/png',
        buffer: Buffer.from([1, 2, 3]),
        size: 3,
        fieldname: 'file',
        encoding: '7bit',

        // FIX: stream cannot be null
        stream: Readable.from(Buffer.from([1, 2, 3])),

        destination: '',
        filename: '',
        path: '',
      };

      const res = await service.uploadAvatarImage(mockPayload, file);

      expect(res.avatar).toBeDefined();
      expect(res.email).toBe('a@b.com');
    });
  });

  // ============================
  // PUBLIC TASKS
  // ============================
  describe('findUserPublicTasks', () => {
    it('should return tasks', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, name: 'User' });

      mockPrisma.task.findMany.mockResolvedValue([
        { id: 1, name: 'Task A', isPublic: true },
      ]);

      const res = await service.findUserPublicTasks(1);

      expect(res.user.id).toBe(1);
      expect(res.tasks.length).toBe(1);
    });
  });
});
