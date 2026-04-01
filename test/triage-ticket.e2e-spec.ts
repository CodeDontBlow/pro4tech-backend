import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '@database/prisma/prisma.service';
import request from 'supertest';

describe('TriageRule and TicketSubject E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let supportGroupId: string;
  let triageRuleRootId: string;
  let triageRuleChild1Id: string;
  let triageRuleLeaf1Id: string;
  let ticketSubjectId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    app.useGlobalPipes(new ValidationPipe());

    await app.init();
  });

  afterAll(async () => {
    // Cleanup
    await prisma.triageRule.deleteMany({});
    await prisma.ticketSubject.deleteMany({});
    await app.close();
  });

  describe('Setup: Create SupportGroup', () => {
    it('should create a support group', async () => {
      const supportGroup = await prisma.supportGroup.create({
        data: {
          id: require('uuid').v7(),
          name: 'Support Team',
          description: 'Main support team',
          isActive: true,
        },
      });

      supportGroupId = supportGroup.id;
      expect(supportGroupId).toBeDefined();
    });
  });

  describe('TicketSubject API', () => {
    it('POST /ticket-subjects should create a new ticket subject', async () => {
      const response = await request(app.getHttpServer())
        .post('/ticket-subjects')
        .send({
          name: 'Billing Issues',
          description: 'Issues related to billing and payments',
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Billing Issues');
      ticketSubjectId = response.body.id;
    });

    it('GET /ticket-subjects should return all ticket subjects', async () => {
      const response = await request(app.getHttpServer()).get(
        '/ticket-subjects',
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('GET /ticket-subjects/:id should return ticket subject details', async () => {
      const response = await request(app.getHttpServer()).get(
        `/ticket-subjects/${ticketSubjectId}`,
      );

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(ticketSubjectId);
      expect(response.body.name).toBe('Billing Issues');
    });

    it('PATCH /ticket-subjects/:id should update a ticket subject', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/ticket-subjects/${ticketSubjectId}`)
        .send({
          description: 'Updated description',
          isActive: true,
        });

      expect(response.status).toBe(200);
      expect(response.body.description).toBe('Updated description');
    });
  });

  describe('TriageRule API', () => {
    it('POST /triage-rules should create a root triage rule', async () => {
      const response = await request(app.getHttpServer())
        .post('/triage-rules')
        .send({
          question: 'What is your main issue?',
          isLeaf: false,
        });

      expect(response.status).toBe(201);
      expect(response.body.question).toBe('What is your main issue?');
      expect(response.body.isLeaf).toBe(false);
      expect(response.body.parentId).toBeNull();
      triageRuleRootId = response.body.id;
    });

    it('POST /triage-rules should create child triage rule', async () => {
      const response = await request(app.getHttpServer())
        .post('/triage-rules')
        .send({
          parentId: triageRuleRootId,
          answerTrigger: 'billing-related',
          isLeaf: false,
          question: 'Is it about invoices or payments?',
        });

      expect(response.status).toBe(201);
      expect(response.body.parentId).toBe(triageRuleRootId);
      expect(response.body.answerTrigger).toBe('billing-related');
      triageRuleChild1Id = response.body.id;
    });

    it('POST /triage-rules should create leaf triage rule with subject', async () => {
      const response = await request(app.getHttpServer())
        .post('/triage-rules')
        .send({
          parentId: triageRuleChild1Id,
          answerTrigger: 'invoice-issue',
          isLeaf: true,
          targetGroupId: supportGroupId,
          subjectId: ticketSubjectId,
        });

      expect(response.status).toBe(201);
      expect(response.body.isLeaf).toBe(true);
      expect(response.body.subjectId).toBe(ticketSubjectId);
      expect(response.body.targetGroupId).toBe(supportGroupId);
      triageRuleLeaf1Id = response.body.id;
    });

    it('GET /triage-rules should return tree structure', async () => {
      const response = await request(app.getHttpServer()).get(
        '/triage-rules',
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      // Should return root nodes
      const root = response.body.find((r: any) => r.id === triageRuleRootId);
      expect(root).toBeDefined();
    });

    it('GET /triage-rules/:id should return triage rule with children', async () => {
      const response = await request(app.getHttpServer()).get(
        `/triage-rules/${triageRuleRootId}`,
      );

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(triageRuleRootId);
      // Should include children array
      expect(Array.isArray(response.body.children)).toBe(true);
    });

    it('POST /triage-rules/traverse should navigate tree', async () => {
      const response = await request(app.getHttpServer())
        .post('/triage-rules/traverse')
        .send({
          answerTrigger: 'billing-related',
        });

      expect(response.status).toBe(201);
      expect(response.body.id).toBe(triageRuleChild1Id);
      expect(response.body.question).toBe(
        'Is it about invoices or payments?',
      );
    });

    it('POST /triage-rules/:id/traverse should continue traversal', async () => {
      const response = await request(app.getHttpServer())
        .post(`/triage-rules/${triageRuleChild1Id}/traverse`)
        .send({
          answerTrigger: 'invoice-issue',
        });

      expect(response.status).toBe(201);
      expect(response.body.id).toBe(triageRuleLeaf1Id);
      expect(response.body.isLeaf).toBe(true);
      expect(response.body.subject).toBeDefined();
      expect(response.body.subject.name).toBe('Billing Issues');
    });

    it('PATCH /triage-rules/:id should update triage rule', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/triage-rules/${triageRuleRootId}`)
        .send({
          question: 'Updated question?',
        });

      expect(response.status).toBe(200);
      expect(response.body.question).toBe('Updated question?');
    });

    it('DELETE /triage-rules/:id should delete triage rule', async () => {
      // Create a temporary rule to delete
      const createRes = await request(app.getHttpServer())
        .post('/triage-rules')
        .send({
          question: 'Temporary rule',          isLeaf: false,
        });

      const tempId = createRes.body.id;

      const deleteRes = await request(app.getHttpServer()).delete(
        `/triage-rules/${tempId}`,
      );

      expect(deleteRes.status).toBe(204);

      // Verify it's deleted
      const getRes = await request(app.getHttpServer()).get(
        `/triage-rules/${tempId}`,
      );
      expect(getRes.status).toBe(404);
    });
  });

  describe('Validations', () => {
    it('should fail to create non-leaf without question', async () => {
      const response = await request(app.getHttpServer())
        .post('/triage-rules')
        .send({
          isLeaf: false,
          // Missing question
        });

      expect(response.status).toBe(400);
    });

    it('should fail to create leaf without answerTrigger', async () => {
      const response = await request(app.getHttpServer())
        .post('/triage-rules')
        .send({
          isLeaf: true,
          // Missing answerTrigger
        });

      expect(response.status).toBe(400);
    });

    it('should fail to create subject with duplicate name', async () => {
      const response = await request(app.getHttpServer())
        .post('/ticket-subjects')
        .send({
          name: 'Billing Issues', // Already exists
          description: 'Duplicate',
        });

      expect(response.status).toBe(400);
    });
  });
});
