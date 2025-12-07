import { PayloadTokenDto } from 'src/auth/dto/payload-token.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersController } from './users.controller';

describe('User controller', () => {
  let controller: UsersController;

  // Mock service supaya tidak akses database
  const usersServicesMock = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
    uploadAvatarImage: jest.fn(),
  };

  beforeEach(() => {
    controller = new UsersController(usersServicesMock as any);
  });

  // ======= TEST FIND ONE USER =======
  it('should find one user', async () => {
    const userId = 1;
    await controller.findOneUser(userId);
    expect(usersServicesMock.findOne).toHaveBeenCalledWith(userId);
  });

  // ======= TEST CREATE USER =======
  it('should create a new user', async () => {
    const createUserDto: CreateUserDto = {
      name: 'teste',
      email: 'teste@email.com',
      password: '123456',
    };
    await controller.createUser(createUserDto);
    expect(usersServicesMock.create).toHaveBeenCalledWith(createUserDto);
  });

  // ======= TEST UPDATE USER =======
  it('should update user', async () => {
    const userId = 1;
    const updateUserDto: UpdateUserDto = { name: 'teste' };
    const tokenPayload: PayloadTokenDto = {
      sub: 1,
      email: 'teste@email.com',
      aud: '',
      exp: 123,
      iat: 123,
      iss: '',
    };
    await controller.updateUser(userId, updateUserDto, tokenPayload);
    expect(usersServicesMock.update).toHaveBeenCalledWith(
      userId,
      updateUserDto,
      tokenPayload,
    );
  });

  // ======= TEST DELETE USER =======
  it('should delete user', async () => {
    const userId = 1;
    const tokenPayload: PayloadTokenDto = {
      sub: 1,
      email: 'teste@email.com',
      aud: '',
      exp: 123,
      iat: 123,
      iss: '',
    };
    await controller.deleteUser(userId, tokenPayload);
    expect(usersServicesMock.delete).toHaveBeenCalledWith(userId, tokenPayload);
  });

  // ======= TEST UPLOAD AVATAR =======
  it('should upload avatar', async () => {
    const tokenPayload: PayloadTokenDto = {
      sub: 1,
      email: 'teste@email.com',
      aud: '',
      exp: 123,
      iat: 123,
      iss: '',
    };
    const mockFile = {
      originalname: 'avatar.png',
      mimetype: 'image/png',
      buffer: Buffer.from('mock'),
    } as Express.Multer.File;

    await controller.uploadAvatar(tokenPayload, mockFile);
    expect(usersServicesMock.uploadAvatarImage).toHaveBeenCalledWith(
      tokenPayload,
      mockFile,
    );
  });
});
