import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Endpoint utama: menampilkan info app + summary routes
  @Get()
  getHello(): any {
    return {
      message: 'Welcome to ToDo App API!',
      routes: [
        { method: 'GET', path: '/users' },
        { method: 'GET', path: '/users/:id' },
        { method: 'POST', path: '/users' },
        { method: 'PATCH', path: '/users/:id' },
        { method: 'DELETE', path: '/users/:id' },
        { method: 'POST', path: '/users/upload' },
        { method: 'GET', path: '/users/:id/public-tasks' },
        { method: 'GET', path: '/tasks' },
        { method: 'POST', path: '/tasks' },
        { method: 'PATCH', path: '/tasks/:id' },
        { method: 'PATCH', path: '/tasks/:id/toggle' },
        { method: 'PATCH', path: '/tasks/:id/toggle-public' },
        { method: 'GET', path: '/tasks/public/:userId' },
        { method: 'DELETE', path: '/tasks/:id' },
        { method: 'GET', path: '/teste' },
        { method: 'POST', path: '/teste' },
      ],
    };
  }

  // Endpoint tes GET
  @Get('/teste')
  getTest() {
    return { message: 'Rota GET /teste funcionando' };
  }

  // Endpoint tes POST
  @Post('/teste')
  createPost() {
    return { message: 'Rota POST /teste funcionando' };
  }
}
