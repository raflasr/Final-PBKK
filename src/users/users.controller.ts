import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthTokenGuard } from 'src/auth/guard/auth-token.guard';
import { TokenPayloadParam } from 'src/auth/param/token-payload.param';
import { PayloadTokenDto } from 'src/auth/dto/payload-token.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { QueryUserDto } from './dto/query-user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  // =========================================
  // 📄 GET /users → SEARCH + PAGINATION
  // =========================================
  @ApiOperation({ summary: 'Get all users (with search and pagination)' })
  @ApiQuery({ name: 'search', required: false, example: 'clarissa', description: 'Search by username or email' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Page number (default = 1)' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Results per page (default = 10)' })
  @Get()
  findAllUsers(@Query() query: QueryUserDto) {
    return this.userService.findAll(query);
  }

  // =========================================
  // 🌍 GET /users/public → ALL USERS + PUBLIC TASKS
  // =========================================
  @UseGuards(AuthTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users with their public tasks (exclude current user)' })
  @Get('public')
  async findAllUsersWithPublicTasks(@TokenPayloadParam() payloadToken: PayloadTokenDto) {
    return this.userService.findAllUsersWithPublicTasks(payloadToken.sub);
  }

  // =========================================
  // 📄 GET /users/:id → FIND ONE USER
  // =========================================
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', example: 1 })
  findOneUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  // =========================================
  // 📝 POST /users → CREATE USER (PUBLIC)
  // =========================================
  @Post()
  @ApiOperation({ summary: 'Create a new user (PUBLIC)' })
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  // =========================================
  // ✏️ PATCH /users/:id → UPDATE USER (AUTH REQUIRED)
  // =========================================
  @UseGuards(AuthTokenGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Update user (only self)' })
  @ApiParam({ name: 'id', description: 'User ID', example: 1 })
  updateUser(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto, @TokenPayloadParam() payloadToken: PayloadTokenDto) {
    return this.userService.update(id, updateUserDto, payloadToken);
  }

  // =========================================
  // 🗑️ DELETE /users/:id → DELETE USER (AUTH REQUIRED)
  // =========================================
  @UseGuards(AuthTokenGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete user (only self)' })
  @ApiParam({ name: 'id', description: 'User ID', example: 1 })
  deleteUser(@Param('id', ParseIntPipe) id: number, @TokenPayloadParam() payloadToken: PayloadTokenDto) {
    return this.userService.delete(id, payloadToken);
  }

  // =========================================
  // 📎 POST /users/upload → UPLOAD AVATAR (AUTH REQUIRED)
  // =========================================
  @UseGuards(AuthTokenGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file'))
  @Post('/upload')
  @ApiOperation({ summary: 'Upload user avatar (JPEG, JPG, PNG)' })
  async uploadAvatar(
    @TokenPayloadParam() payloadToken: PayloadTokenDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /jpeg|jpg|png/g })
        .addMaxSizeValidator({ maxSize: 2 * 1024 * 1024 })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    )
    file: Express.Multer.File,
  ) {
    return this.userService.uploadAvatarImage(payloadToken, file);
  }

  // =========================================
  // 🌍 GET /users/:id/public-tasks → VIEW PUBLIC TASKS
  // =========================================
  @Get(':id/public-tasks')
  @ApiOperation({ summary: 'Get all public tasks from a user' })
  @ApiParam({ name: 'id', description: 'User ID', example: 1 })
  getUserPublicTasks(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findUserPublicTasks(id);
  }
}
