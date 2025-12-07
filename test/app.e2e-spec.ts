// test/app.e2e-spec.ts
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { execSync } from 'child_process';

describe('🧩 App E2E Test (Full Workflow + Extra requirements)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let server: any;
  let authToken: string;
  let userId: number;
  let taskId: number;
  let otherUserId: number;

  beforeAll(async () => {
    try {
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    } catch (e) {}

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    await prisma.task.deleteMany();
    await prisma.user.deleteMany();

    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  // 1️⃣ REGISTER USER
  it('POST /users → should register a new user', async () => {
    const res = await request(server)
      .post('/users')
      .send({
        name: 'Clarissa Tester',
        email: 'clarissa@test.com',
        password: '123456',
      })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toBe('clarissa@test.com');
    userId = res.body.id;
  });

  // 1b️⃣ REGISTER OTHER USER
  it('POST /users → create other user for RBAC test', async () => {
    const res = await request(server)
      .post('/users')
      .send({
        name: 'Other User',
        email: 'other@test.com',
        password: '123456',
      })
      .expect(201);

    otherUserId = res.body.id;
    expect(otherUserId).toBeDefined();
  });

  // 2️⃣ LOGIN USER
  it('POST /auth → should login and return JWT', async () => {
    const res = await request(server)
      .post('/auth')
      .send({
        email: 'clarissa@test.com',
        password: '123456',
      })
      .expect(201);

    authToken = res.body.token;
    expect(authToken).toBeDefined();
  });

  // 3️⃣ CREATE TASK
  it('POST /tasks → should create a task', async () => {
    const res = await request(server)
      .post('/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Finish NestJS project',
        description: 'Implement full E2E tests for backend',
        priority: 'high',
        status: 'pending',
        isPublic: true,
      })
      .expect(201);

    taskId = res.body.id;
    expect(taskId).toBeDefined();
  });

  // 4️⃣ GET TASKS
  it('GET /tasks → should return tasks list', async () => {
    const res = await request(server)
      .get('/tasks?search=NestJS&page=1&limit=5')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // 4b️⃣ PAGINATION
  it('GET /tasks (pagination)', async () => {
    for (let i = 0; i < 5; i++) {
      await request(server)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: `Task ${i}`,
          description: `desc ${i}`,
          priority: 'low',
          status: 'pending',
          isPublic: true,
        })
        .expect(201);
    }

    const res = await request(server)
      .get('/tasks?page=2&limit=2')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(res.body.data.length).toBeLessThanOrEqual(2);
  });

  // 5️⃣ TOGGLE STATUS
  it('PATCH /tasks/:id/toggle', async () => {
    const res = await request(server)
      .patch(`/tasks/${taskId}/toggle`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(['pending', 'done']).toContain(res.body.status);
  });

  // 6️⃣ PUBLIC TASKS
  it('GET /users/:id/public-tasks', async () => {
    const res = await request(server).get(`/users/${userId}/public-tasks`).expect(200);
    expect(Array.isArray(res.body.tasks)).toBe(true);
  });

  // 7️⃣ FILE UPLOAD (SUCCESS)
  it('POST /tasks/:id/upload → authenticated upload', async () => {
    const uploadPath = `/tasks/${taskId}/upload`;

    const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

    const res = await request(server)
      .post(uploadPath)
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', pngBuffer, {
        filename: 'test.png',
        contentType: 'image/png',
      })
      .expect(201);

    expect(res.body).toHaveProperty('filePath');
    expect(res.body.filePath).toMatch(/\.png$/i);
  });

  // 8️⃣ FILE UPLOAD WITHOUT TOKEN
  it('POST /tasks/:id/upload → should fail without token', async () => {
    const uploadPath = `/tasks/${taskId}/upload`;

    const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

    await request(server)
      .post(uploadPath)
      .attach('file', pngBuffer, {
        filename: 'unauth.png',
        contentType: 'image/png',
      })
      .expect(401);
  });

  // 9️⃣ INVALID FILE TYPE
  it('POST /tasks/:id/upload → invalid file type should return 500', async () => {
    const uploadPath = `/tasks/${taskId}/upload`;

    const txtBuffer = Buffer.from('hello world');

    await request(server)
      .post(uploadPath)
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', txtBuffer, {
        filename: 'bad.txt',
        contentType: 'text/plain',
      })
      .expect(500);
  });

  // 🔟 RBAC DELETE OTHER USER (EXPECTED 400)
  it('DELETE /users/:id → non-admin deleting other user returns 400', async () => {
    await request(server)
      .delete(`/users/${otherUserId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(400);
  });

  // 11️⃣ DELETE OWN USER
  it('DELETE /users/:id → delete self', async () => {
    const res = await request(server)
      .delete(`/users/${userId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(res.body.message).toBeDefined();
  });

  // 12️⃣ DELETE WITHOUT TOKEN
  it('DELETE /users/:id → no token should fail', async () => {
    await request(server).delete(`/users/${userId}`).expect(401);
  });
});
