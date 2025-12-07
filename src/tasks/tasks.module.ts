import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { PrismaModule } from '../prisma/prisma.module';
import { APP_FILTER } from '@nestjs/core';
import { ApiExceptionFilter } from 'src/common/filters/execption-filter';

@Module({
  imports: [PrismaModule], // import PrismaModule supaya bisa akses database
  controllers: [TasksController], // register controller task
  providers: [
    TasksService, // service untuk logic task
    {
      provide: APP_FILTER,       // global exception filter
      useClass: ApiExceptionFilter, // menangani HttpException & response JSON error
    },
  ],
})
export class TasksModule {}
