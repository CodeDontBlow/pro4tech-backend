import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Role, SupportLevel } from '../generated/prisma/enums';
import * as bcrypt from 'bcrypt';
import { v7 as uuidv7 } from 'uuid';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

type CompanySeed = {
  cnpj: string;
  name: string;
  contactName: string;
  contactEmail: string;
};

type UserSeed = {
  name: string;
  email: string;
  phone: string;
  role: Role;
};

type AgentSeed = UserSeed & {
  supportLevel: SupportLevel;
  canAnswer: boolean;
};

const DEFAULT_PASSWORD = 'password123';

async function databaseHasData() {
  const [companyCount, userCount, agentCount, ticketCount] = await Promise.all([
    prisma.company.count(),
    prisma.user.count(),
    prisma.agent.count(),
    prisma.ticket.count(),
  ]);

  return companyCount + userCount + agentCount + ticketCount > 0;
}

async function wipeDatabase() {
  await prisma.ticketHistory.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.agentGroup.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.triageRule.deleteMany();
  await prisma.ticketSubject.deleteMany();
  await prisma.supportGroup.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();
}

async function upsertCompany(data: CompanySeed) {
  const accessCode = uuidv7();
  return prisma.company.upsert({
    where: { cnpj: data.cnpj },
    update: {
      name: data.name,
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      accessCode,
      isActive: true,
    },
    create: {
      id: uuidv7(),
      cnpj: data.cnpj,
      name: data.name,
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      accessCode,
      isActive: true,
    },
    select: { id: true },
  });
}

async function upsertUser(companyId: string, data: UserSeed) {
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  return prisma.user.upsert({
    where: { email: data.email },
    update: {
      name: data.name,
      phone: data.phone,
      role: data.role,
      companyId,
      hashedPassword,
      isActive: true,
    },
    create: {
      id: uuidv7(),
      companyId,
      name: data.name,
      phone: data.phone,
      email: data.email,
      hashedPassword,
      role: data.role,
      isActive: true,
    },
    select: { id: true },
  });
}

async function upsertAgent(agentUserId: string, data: AgentSeed) {
  await prisma.agent.upsert({
    where: { id: agentUserId },
    update: {
      supportLevel: data.supportLevel,
      canAnswer: data.canAnswer,
    },
    create: {
      id: agentUserId,
      supportLevel: data.supportLevel,
      canAnswer: data.canAnswer,
    },
  });
}

async function seedPro4Tech() {
  const company = await upsertCompany({
    cnpj: '11.111.111/0001-11',
    name: 'Pro4Tech',
    contactName: 'Marina Souza',
    contactEmail: 'contato@pro4tech.com',
  });

  const admin = await upsertUser(company.id, {
    name: 'admin',
    email: 'admin@pro4tech.com',
    phone: '+5511999000001',
    role: Role.ADMIN,
  });

  const agents: AgentSeed[] = [
    {
      name: 'Lucas Ramos',
      email: 'lucas.ramos@pro4tech.com',
      phone: '+5511999000002',
      role: Role.AGENT,
      supportLevel: SupportLevel.LEVEL_1,
      canAnswer: true,
    },
    {
      name: 'Fernanda Lima',
      email: 'fernanda.lima@pro4tech.com',
      phone: '+5511999000003',
      role: Role.AGENT,
      supportLevel: SupportLevel.LEVEL_1,
      canAnswer: true,
    },
    {
      name: 'Bruno Araujo',
      email: 'bruno.araujo@pro4tech.com',
      phone: '+5511999000004',
      role: Role.AGENT,
      supportLevel: SupportLevel.LEVEL_2,
      canAnswer: true,
    },
    {
      name: 'Julia Martins',
      email: 'julia.martins@pro4tech.com',
      phone: '+5511999000005',
      role: Role.AGENT,
      supportLevel: SupportLevel.LEVEL_2,
      canAnswer: true,
    },
    {
      name: 'Diego Santos',
      email: 'diego.santos@pro4tech.com',
      phone: '+5511999000006',
      role: Role.AGENT,
      supportLevel: SupportLevel.LEVEL_1,
      canAnswer: true,
    },
  ];

  for (const agent of agents) {
    const agentUser = await upsertUser(company.id, agent);
    await upsertAgent(agentUser.id, agent);
  }

  return { companyId: company.id, adminId: admin.id };
}

async function seedCompanyWithClients(
  companyData: CompanySeed,
  clients: UserSeed[],
) {
  const company = await upsertCompany(companyData);

  for (const client of clients) {
    await upsertUser(company.id, client);
  }

  return company.id;
}

async function main() {
  if (await databaseHasData()) {
    await wipeDatabase();
  }

  await seedPro4Tech();

  await seedCompanyWithClients(
    {
      cnpj: '22.222.222/0001-22',
      name: 'Uber',
      contactName: 'Paula Nunes',
      contactEmail: 'contato@uber.com',
    },
    [
      {
        name: 'Marcos Teixeira',
        email: 'marcos.teixeira@uber-client.com',
        phone: '+5511999000101',
        role: Role.CLIENT,
      },
      {
        name: 'Patricia Gomes',
        email: 'patricia.gomes@uber-client.com',
        phone: '+5511999000102',
        role: Role.CLIENT,
      },
      {
        name: 'Renato Oliveira',
        email: 'renato.oliveira@uber-client.com',
        phone: '+5511999000103',
        role: Role.CLIENT,
      },
      {
        name: 'Juliana Rocha',
        email: 'juliana.rocha@uber-client.com',
        phone: '+5511999000104',
        role: Role.CLIENT,
      },
    ],
  );

  await seedCompanyWithClients(
    {
      cnpj: '33.333.333/0001-33',
      name: 'Mercado Livre',
      contactName: 'Rafael Mendes',
      contactEmail: 'contato@mercadolivre.com',
    },
    [
      {
        name: 'Camila Ferreira',
        email: 'camila.ferreira@ml-client.com',
        phone: '+5511999000201',
        role: Role.CLIENT,
      },
      {
        name: 'Eduardo Costa',
        email: 'eduardo.costa@ml-client.com',
        phone: '+5511999000202',
        role: Role.CLIENT,
      },
      {
        name: 'Aline Barbosa',
        email: 'aline.barbosa@ml-client.com',
        phone: '+5511999000203',
        role: Role.CLIENT,
      },
      {
        name: 'Gustavo Almeida',
        email: 'gustavo.almeida@ml-client.com',
        phone: '+5511999000204',
        role: Role.CLIENT,
      },
    ],
  );
}

main()
  .catch(async (error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
