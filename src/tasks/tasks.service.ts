import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdatesTaskDto } from './dto/update-task.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PayloadTokenDto } from 'src/auth/dto/payload-token.dto';
import { ResponseTaskDto } from './dto/response-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  // =========================================
  // 📄 FIND ALL (Search + Filter + Pagination)
  // =========================================
  async findAll(
    query: QueryTaskDto,
    userId: number,
  ): Promise<{ data: ResponseTaskDto[]; meta: any }> {
    const {
      search,
      priority,
      status,
      category,
      dueDate,
      page = 1,
      limit = 10,
    } = query;

    const where = {
      userId,
      ...(search && {
        OR: [
          { name: { contains: search } },
          { description: { contains: search } },
        ],
      }),
      ...(priority && { priority }),
      ...(status && { status }),
      ...(category && { category }),
      ...(dueDate && { dueDate: { equals: new Date(dueDate) } }),
    };

    const total = await this.prisma.task.count({ where });

    const tasks = await this.prisma.task.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: tasks,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // =========================================
  // 📄 FIND ONE TASK
  // =========================================
  async findOne(id: number, userId: number): Promise<ResponseTaskDto> {
    const task = await this.prisma.task.findFirst({ where: { id, userId } });

    if (!task)
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);

    return task;
  }

  // =========================================
  // 📝 CREATE TASK
  // =========================================
  async create(
    createTasksDto: CreateTaskDto,
    payloadToken: PayloadTokenDto,
  ): Promise<ResponseTaskDto> {
    return this.prisma.task.create({
      data: {
        name: createTasksDto.name,
        description: createTasksDto.description,
        priority: createTasksDto.priority ?? 'medium',
        status: createTasksDto.status ?? 'pending',
        dueDate: createTasksDto.dueDate
          ? new Date(createTasksDto.dueDate)
          : null,
        category: createTasksDto.category ?? null,
        completed: createTasksDto.completed ?? false,
        filePath: null,
        isPublic: createTasksDto['isPublic'] ?? false,
        userId: payloadToken.sub,
      },
    });
  }

  // =========================================
  // ✏️ UPDATE TASK
  // =========================================
  async update(
    id: number,
    updateTasksDto: UpdatesTaskDto,
    payloadToken: PayloadTokenDto,
  ): Promise<ResponseTaskDto> {
    const task = await this.prisma.task.findFirst({ where: { id } });

    if (!task)
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    if (task.userId !== payloadToken.sub)
      throw new HttpException(
        'You cannot edit this task',
        HttpStatus.FORBIDDEN,
      );

    return this.prisma.task.update({
      where: { id: task.id },
      data: {
        name: updateTasksDto.name ?? task.name,
        description: updateTasksDto.description ?? task.description,
        completed: updateTasksDto.completed ?? task.completed,
        priority: updateTasksDto.priority ?? task.priority,
        status: updateTasksDto.status ?? task.status,
        dueDate: updateTasksDto.dueDate
          ? new Date(updateTasksDto.dueDate)
          : task.dueDate,
        category: updateTasksDto.category ?? task.category,
      },
    });
  }

  // =========================================
  // 📎 ATTACH FILE TO TASK
  // =========================================
  async attachFile(
    taskId: number,
    filePath: string,
    userId: number,
  ): Promise<ResponseTaskDto> {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task)
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    if (task.userId !== userId)
      throw new HttpException(
        'You are not allowed to attach files to this task.',
        HttpStatus.FORBIDDEN,
      );

    return this.prisma.task.update({
      where: { id: taskId },
      data: { filePath },
    });
  }

  // =========================================
  // ✅ TOGGLE STATUS (done/pending)
  // =========================================
  async toggleStatus(taskId: number, userId: number) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task)
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    if (task.userId !== userId)
      throw new HttpException(
        'You cannot change the status of this task',
        HttpStatus.FORBIDDEN,
      );

    const newStatus = task.status === 'done' ? 'pending' : 'done';

    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: { status: newStatus },
      select: { status: true }, // pastikan hanya status dikembalikan
    });

    return updated; // langsung return status sesuai ekspektasi test
  }

  // =========================================
  // 🌍 FIND PUBLIC TASKS OF A USER
  // =========================================
  async findPublicTasks(userId: number) {
    const publicTasks = await this.prisma.task.findMany({
      where: { userId, isPublic: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!publicTasks.length) {
      throw new HttpException(
        'No public tasks found for this user',
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      userId,
      count: publicTasks.length,
      tasks: publicTasks,
    };
  }

  // =========================================
  // 🌐 TOGGLE PUBLIC/PRIVATE VISIBILITY
  // =========================================
  async togglePublic(taskId: number, userId: number) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task)
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    if (task.userId !== userId)
      throw new HttpException(
        'You cannot modify visibility of this task',
        HttpStatus.FORBIDDEN,
      );

    const newVisibility = !task.isPublic;
    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: { isPublic: newVisibility },
    });

    return {
      message: `Task is now ${newVisibility ? 'public' : 'private'}`,
      task: updated,
    };
  }

  // =========================================
  // 🗑️ DELETE TASK
  // =========================================
  async delete(id: number, payloadToken: PayloadTokenDto) {
    const task = await this.prisma.task.findFirst({ where: { id } });

    if (!task)
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    if (task.userId !== payloadToken.sub)
      throw new HttpException(
        'You cannot delete this task',
        HttpStatus.FORBIDDEN,
      );

    await this.prisma.task.delete({ where: { id: task.id } });

    return { message: 'Task successfully deleted' };
  }
}
