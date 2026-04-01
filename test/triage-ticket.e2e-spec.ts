import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '@database/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { v7 as uuidv7 } from 'uuid';

describe('TriageRule and TicketSubject E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let supportGroupId: string;
  let triageRuleRootId: string;
  let triageRuleChild1Id: string;
  let triageRuleLeaf1Id: string;
  let ticketSubjectId: string;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    const jwtService = moduleFixture.get<JwtService>(JwtService);
    app.useGlobalPipes(new ValidationPipe());

    await app.init();

    // Create admin user for testing
    let adminId: string;
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin-e2e@test.com' },
    });

    if (existingAdmin) {
      adminId = existingAdmin.id;
    } else {
      // First create a company for the user
      const company = await prisma.company.create({
        data: {
          id: uuidv7(),
          cnpj: '12.345.678/0001-90',
          name: 'Test Company',
          accessCode: `test-${Date.now()}`,
        },
      });

      const admin = await prisma.user.create({
        data: {
          id: uuidv7(),
          email: 'admin-e2e@test.com',
          hashedPassword: 'Admin@123456',
          name: 'Admin User',
          role: 'ADMIN',
          companyId: company.id,
        },
      });
      adminId = admin.id;
    }

    // Generate JWT token for admin user
    adminToken = jwtService.sign({
      sub: adminId,
      email: 'admin-e2e@test.com',
      role: 'ADMIN',
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.triageRule.deleteMany({});
    await prisma.ticketSubject.deleteMany({});
    await app.close();
  });

  describe('Setup: Admin Authentication', () => {
    it('should create a support group', async () => {
      const supportGroup = await prisma.supportGroup.create({
        data: {
          id: uuidv7(),
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
    it('POST /ticket-subjects should create ticket subject (ADMIN)', async () => {
      const response = await request(app.getHttpServer())
        .post('/ticket-subjects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Billing Issues',
          description: 'Issues related to billing and payments',
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Billing Issues');
      ticketSubjectId = response.body.id;
    });

    it('GET /ticket-subjects should be PUBLIC', async () => {
      const response = await request(app.getHttpServer()).get('/ticket-subjects');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('GET /ticket-subjects/:id should be PUBLIC', async () => {
      const response = await request(app.getHttpServer()).get(
        `/ticket-subjects/${ticketSubjectId}`,
      );

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(ticketSubjectId);
    });

    it('PATCH /ticket-subjects/:id should require ADMIN token', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/ticket-subjects/${ticketSubjectId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          description: 'Updated description',
        });

      expect(response.status).toBe(200);
      expect(response.body.description).toBe('Updated description');
    });
  });

  describe('TriageRule API - ADMIN Endpoints', () => {
    it('POST /triage-rules requires ADMIN and creates root', async () => {
      const response = await request(app.getHttpServer())
        .post('/triage-rules')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          question: 'What is your main issue?',
          isLeaf: false,
        });

      expect(response.status).toBe(201);
      expect(response.body.question).toBe('What is your main issue?');
      triageRuleRootId = response.body.id;
    });

    it('POST /triage-rules creates child rule', async () => {
      const response = await request(app.getHttpServer())
        .post('/triage-rules')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          parentId: triageRuleRootId,
          answerTrigger: 'billing-related',
          isLeaf: false,
          question: 'Is it about invoices or payments?',
        });

      expect(response.status).toBe(201);
      expect(response.body.parentId).toBe(triageRuleRootId);
      triageRuleChild1Id = response.body.id;
    });

    it('POST /triage-rules creates leaf with subject', async () => {
      const response = await request(app.getHttpServer())
        .post('/triage-rules')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          parentId: triageRuleChild1Id,
          answerTrigger: 'invoice-issue',
          isLeaf: true,
          targetGroupId: supportGroupId,
          subjectId: ticketSubjectId,
        });

      expect(response.status).toBe(201);
      expect(response.body.isLeaf).toBe(true);
      triageRuleLeaf1Id = response.body.id;
    });

    it('GET /triage-rules requires ADMIN', async () => {
      const response = await request(app.getHttpServer())
        .get('/triage-rules')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      const root = response.body.find((r: any) => r.id === triageRuleRootId);
      expect(root).toBeDefined();
    });

    it('GET /triage-rules/:id requires ADMIN', async () => {
      const response = await request(app.getHttpServer())
        .get(`/triage-rules/${triageRuleRootId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(triageRuleRootId);
      expect(Array.isArray(response.body.children)).toBe(true);
    });

    it('GET /triage-rules/react-flow requires ADMIN', async () => {
      const response = await request(app.getHttpServer())
        .get('/triage-rules/react-flow')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('nodes');
      expect(response.body).toHaveProperty('edges');
    });

    it('PATCH /triage-rules/:id requires ADMIN', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/triage-rules/${triageRuleRootId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          question: 'Updated question?',
        });

      expect(response.status).toBe(200);
      expect(response.body.question).toBe('Updated question?');
    });

    it('DELETE /triage-rules/:id requires ADMIN', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/triage-rules')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          question: 'Temporary rule',
          isLeaf: false,
        });

      const tempId = createRes.body.id;
      const deleteRes = await request(app.getHttpServer())
        .delete(`/triage-rules/${tempId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteRes.status).toBe(204);
    });
  });

  describe('TriageRule API - PUBLIC Traverse Endpoints', () => {
    it('POST /triage-rules/traverse should be PUBLIC', async () => {
      const response = await request(app.getHttpServer())
        .post('/triage-rules/traverse')
        .send({
          answerTrigger: 'billing-related',
        });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(triageRuleChild1Id);
      expect(response.body.question).toBe('Is it about invoices or payments?');
    });

    it('POST /triage-rules/:id/traverse should be PUBLIC', async () => {
      const response = await request(app.getHttpServer())
        .post(`/triage-rules/${triageRuleChild1Id}/traverse`)
        .send({
          answerTrigger: 'invoice-issue',
        });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(triageRuleLeaf1Id);
      expect(response.body.isLeaf).toBe(true);
      expect(response.body.subject).toBeDefined();
    });
  });

  describe('Validations', () => {
    it('POST /triage-rules fails without question for non-leaf', async () => {
      const response = await request(app.getHttpServer())
        .post('/triage-rules')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          isLeaf: false,
        });

      expect(response.status).toBe(400);
    });

    it('POST /triage-rules fails without answerTrigger for leaf', async () => {
      const response = await request(app.getHttpServer())
        .post('/triage-rules')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          isLeaf: true,
        });

      expect(response.status).toBe(400);
    });

    it('POST /ticket-subjects fails with duplicate name', async () => {
      const response = await request(app.getHttpServer())
        .post('/ticket-subjects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Billing Issues',
          description: 'Duplicate',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('React Flow Format API - ADMIN Only', () => {
    it('GET /triage-rules/react-flow returns nodes and edges', async () => {
      const response = await request(app.getHttpServer())
        .get('/triage-rules/react-flow')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('nodes');
      expect(response.body).toHaveProperty('edges');
      expect(Array.isArray(response.body.nodes)).toBe(true);
      expect(Array.isArray(response.body.edges)).toBe(true);
    });

    it('nodes have correct React Flow structure', async () => {
      const response = await request(app.getHttpServer())
        .get('/triage-rules/react-flow')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      const { nodes } = response.body;
      if (nodes.length > 0) {
        const node = nodes[0];
        expect(node).toHaveProperty('id');
        expect(node).toHaveProperty('data');
        expect(node).toHaveProperty('type');
        expect(node.data).toHaveProperty('label');
        expect(node.data).toHaveProperty('nodeType');
      }
    });

    it('edges connect nodes correctly', async () => {
      const response = await request(app.getHttpServer())
        .get('/triage-rules/react-flow')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      const { nodes, edges } = response.body;

      edges.forEach((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        const targetNode = nodes.find((n) => n.id === edge.target);
        expect(sourceNode).toBeDefined();
        expect(targetNode).toBeDefined();
      });
    });

    it('root nodes have no parentId', async () => {
      const response = await request(app.getHttpServer())
        .get('/triage-rules/react-flow')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      const { nodes } = response.body;
      const rootNodes = nodes.filter((n) => n.data.nodeType === 'root');
      rootNodes.forEach((node) => {
        expect(node.data.parentId).toBeFalsy(); // null or undefined
      });
    });

    it('leaf nodes have subject data', async () => {
      const response = await request(app.getHttpServer())
        .get('/triage-rules/react-flow')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      const { nodes } = response.body;
      const leafNodes = nodes.filter((n) => n.data.nodeType === 'leaf');
      leafNodes.forEach((node) => {
        if (node.data.subject) {
          expect(node.data.subject).toHaveProperty('id');
          expect(node.data.subject).toHaveProperty('name');
        }
      });
    });
  });
});
