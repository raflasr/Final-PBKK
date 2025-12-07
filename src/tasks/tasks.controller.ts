import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdatesTaskDto } from './dto/update-task.dto';
import { AuthTokenGuard } from 'src/auth/guard/auth-token.guard';
import { TokenPayloadParam } from 'src/auth/param/token-payload.param';
import { PayloadTokenDto } from 'src/auth/dto/payload-token.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { QueryTaskDto } from './dto/query-task.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly taskService: TasksService) {}

  // =========================================
  // 📄 GET /tasks → SEARCH + FILTER + PAGINATION
  // =========================================
  @UseGuards(AuthTokenGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'List all tasks (with search, filters, and pagination)' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by task name or description' })
  @ApiQuery({ name: 'priority', required: false, example: 'high', description: 'Filter by priority (low, medium, high)' })
  @ApiQuery({ name: 'status', required: false, example: 'done', description: 'Filter by status (done, pending)' })
  @ApiQuery({ name: 'category', required: false, example: 'work', description: 'Filter by category name' })
  @ApiQuery({ name: 'dueDate', required: false, example: '2025-12-05', description: 'Filter by due date (ISO format)' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Page number (default = 1)' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Tasks per page (default = 10)' })
  findAllTasks(
    @Query() query: QueryTaskDto,
    @TokenPayloadParam() payloadToken: PayloadTokenDto,
  ) {
    return this.taskService.findAll(query, payloadToken.sub);
  }

  // =========================================
  // 📝 POST /tasks → CREATE TASK
  // =========================================
  @UseGuards(AuthTokenGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  createTasks(
    @Body() createTasksDto: CreateTaskDto,
    @TokenPayloadParam() payloadToken: PayloadTokenDto,
  ) {
    return this.taskService.create(createTasksDto, payloadToken);
  }

  // =========================================
  // 📎 POST /tasks/:id/upload → FILE UPLOAD
  // =========================================
  @UseGuards(AuthTokenGuard)
  @ApiBearerAuth()
  @Post(':id/upload')
  @ApiOperation({ summary: 'Attach a file to a task (images or PDF)' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/tasks',
        filename: (req, file, cb) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueName + extname(file.originalname));
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|pdf)$/)) {
          cb(new Error('Unsupported file type! Only JPG, PNG, and PDF are allowed.'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  async uploadFile(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @TokenPayloadParam() payloadToken: PayloadTokenDto,
  ) {
    return this.taskService.attachFile(id, file.path, payloadToken.sub);
  }

  // =========================================
  // 📄 GET /tasks/:id → READ ONE TASK
  // =========================================
  @UseGuards(AuthTokenGuard)
  @ApiBearerAuth()
  @Get(':id')
  @ApiOperation({ summary: 'Get a single task by ID' })
  @ApiParam({ name: 'id', description: 'Task ID', example: 1 })
  findOneTask(
    @Param('id', ParseIntPipe) id: number,
    @TokenPayloadParam() payloadToken: PayloadTokenDto,
  ) {
    return this.taskService.findOne(id, payloadToken.sub);
  }

  // =========================================
  // ✏️ PATCH /tasks/:id → UPDATE TASK
  // =========================================
  @UseGuards(AuthTokenGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Update a task (only owner)' })
  updateTask(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTasksDto: UpdatesTaskDto,
    @TokenPayloadParam() payloadToken: PayloadTokenDto,
  ) {
    return this.taskService.update(id, updateTasksDto, payloadToken);
  }

  // =========================================
  // ✅ PATCH /tasks/:id/toggle → TOGGLE STATUS
  // =========================================
  @UseGuards(AuthTokenGuard)
  @ApiBearerAuth()
  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Toggle task status (done/pending)' })
  toggleTaskStatus(
    @Param('id', ParseIntPipe) id: number,
    @TokenPayloadParam() payloadToken: PayloadTokenDto,
  ) {
    return this.taskService.toggleStatus(id, payloadToken.sub);
  }

  // =========================================
  // 🌐 PATCH /tasks/:id/toggle-public → TOGGLE VISIBILITY
  // =========================================
  @UseGuards(AuthTokenGuard)
  @ApiBearerAuth()
  @Patch(':id/toggle-public')
  @ApiOperation({ summary: 'Toggle task visibility (public/private)' })
  toggleTaskVisibility(
    @Param('id', ParseIntPipe) id: number,
    @TokenPayloadParam() payloadToken: PayloadTokenDto,
  ) {
    return this.taskService.togglePublic(id, payloadToken.sub);
  }

  // =========================================
  // 🌍 GET /tasks/public/:userId → PUBLIC TASKS
  // =========================================
  @Get('public/:userId')
  @ApiOperation({ summary: 'Get all public tasks of a user' })
  async getPublicTasks(@Param('userId', ParseIntPipe) userId: number) {
    return this.taskService.findPublicTasks(userId);
  }

  // =========================================
  // 🗑️ DELETE /tasks/:id → DELETE TASK
  // =========================================
  @UseGuards(AuthTokenGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task (only owner)' })
  deleteTasks(
    @Param('id', ParseIntPipe) id: number,
    @TokenPayloadParam() payloadToken: PayloadTokenDto,
  ) {
    return this.taskService.delete(id, payloadToken);
  }
}
