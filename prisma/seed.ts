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

async function seedSupportGroups() {
  const groups = [
    {
      name: 'Suporte Técnico L1',
      description: 'Equipe de suporte técnico nível 1 - atendimento inicial',
    },
    {
      name: 'Suporte Técnico L2',
      description: 'Equipe de suporte técnico nível 2 - problemas complexos',
    },
    {
      name: 'Suporte Administrativo',
      description: 'Equipe de suporte para questões administrativas',
    },
    {
      name: 'Equipe Fiscal',
      description: 'Equipe especializada em questões fiscais e NFe',
    },
    {
      name: 'Suporte a Integração',
      description: 'Equipe especializada em integração com sistemas terceiros',
    },
  ];

  for (const group of groups) {
    // Check if exists by name
    const existing = await prisma.supportGroup.findFirst({
      where: { name: group.name },
    });

    if (!existing) {
      await prisma.supportGroup.create({
        data: {
          id: uuidv7(),
          name: group.name,
          description: group.description,
        },
      });
    } else {
      // Update if exists
      await prisma.supportGroup.update({
        where: { id: existing.id },
        data: {
          description: group.description,
        },
      });
    }
  }

  console.log('✅ Support groups seeded');
}

async function seedTicketSubjects() {
  const subjects = [
    {
      name: 'Erro na Nota Fiscal',
      description:
        'Problemas na geração, validação ou emissão de notas fiscais. Inclui erros de validação, dados inconsistentes e falhas na emissão.',
    },
    {
      name: 'Integração com Sistemas',
      description:
        'Problemas de integração com sistemas terceirizados como ERP, WMS, softwares contábeis e outras plataformas.',
    },
    {
      name: 'Dúvida sobre Função',
      description:
        'Dúvidas gerais sobre como utilizar recursos e funcionalidades da plataforma. Explicações e tutoriais.',
    },
    {
      name: 'Acesso e Permissões',
      description:
        'Problemas com acesso à plataforma, autenticação, recuperação de senha e gerenciamento de permissões de usuário.',
    },
    {
      name: 'Relatórios e Dashboards',
      description:
        'Dúvidas ou problemas com geração de relatórios, visualização de dados, dashboards e exportação de informações.',
    },
    {
      name: 'Configuração de Empresa',
      description:
        'Necessidade de alterar configurações gerais, dados de empresa, informações fiscais e preferências do sistema.',
    },
    {
      name: 'Cobrança e Faturamento',
      description:
        'Dúvidas sobre cobranças, planos, faturamento, notas ou questões relacionadas a billing.',
    },
    {
      name: 'Bug ou Comportamento Inesperado',
      description:
        'Relato de erro, bug, crash ou comportamento inesperado da plataforma que prejudica o funcionamento.',
    },
    {
      name: 'Desempenho e Velocidade',
      description:
        'Reclamações sobre lentidão, problemas de performance, timeouts ou travamentos da aplicação.',
    },
    {
      name: 'Importação e Exportação de Dados',
      description:
        'Dúvidas ou problemas com importação em lote, exportação de dados, sincronização e migração.',
    },
  ];

  for (const subject of subjects) {
    // Check if exists by name
    const existing = await prisma.ticketSubject.findFirst({
      where: { name: subject.name },
    });

    if (!existing) {
      await prisma.ticketSubject.create({
        data: {
          id: uuidv7(),
          name: subject.name,
          description: subject.description,
          isActive: true,
        },
      });
    } else {
      // Update if exists
      await prisma.ticketSubject.update({
        where: { id: existing.id },
        data: {
          description: subject.description,
          isActive: true,
        },
      });
    }
  }

  console.log('✅ Ticket subjects seeded');
}

async function seedTriageRules() {
  // Buscar subjects e groups necessários
  const [subjects, supportGroups] = await Promise.all([
    prisma.ticketSubject.findMany(),
    prisma.supportGroup.findMany(),
  ]);

  if (subjects.length < 8 || supportGroups.length < 3) {
    console.warn(
      'Skipping triage rules seed: not enough subjects or support groups',
    );
    return;
  }

  console.log('🌳 Creating triage rules tree...');

  // Root node 1: "Qual é o seu problema?"
  const root1 = await prisma.triageRule.create({
    data: {
      id: uuidv7(),
      question: 'Qual é o seu problema?',
      isLeaf: false,
    },
  });

  // Root node 2: "Como posso ajudá-lo?"
  const root2 = await prisma.triageRule.create({
    data: {
      id: uuidv7(),
      question: 'Como posso ajudá-lo?',
      isLeaf: false,
    },
  });

  // Tree 1: Problemas técnicos
  const tech_branch = await prisma.triageRule.create({
    data: {
      id: uuidv7(),
      parentId: root1.id,
      answerTrigger: 'problema-tecnico',
      question: 'Qual é o problema técnico?',
      isLeaf: false,
    },
  });

  // Tech -> NFe issues
  await prisma.triageRule.create({
    data: {
      id: uuidv7(),
      parentId: tech_branch.id,
      answerTrigger: 'erro-nfe',
      isLeaf: true,
      subjectId: subjects[0].id,
      targetGroupId: supportGroups[0].id,
    },
  });

  // Tech -> Integration issues
  await prisma.triageRule.create({
    data: {
      id: uuidv7(),
      parentId: tech_branch.id,
      answerTrigger: 'integracao',
      isLeaf: true,
      subjectId: subjects[1].id,
      targetGroupId: supportGroups[4].id,
    },
  });

  // Tech -> Performance
  await prisma.triageRule.create({
    data: {
      id: uuidv7(),
      parentId: tech_branch.id,
      answerTrigger: 'desempenho',
      isLeaf: true,
      subjectId: subjects[8].id,
      targetGroupId: supportGroups[1].id,
    },
  });

  // Tech -> Bug report
  await prisma.triageRule.create({
    data: {
      id: uuidv7(),
      parentId: tech_branch.id,
      answerTrigger: 'bug',
      isLeaf: true,
      subjectId: subjects[7].id,
      targetGroupId: supportGroups[1].id,
    },
  });

  // Tree 1: Dúvidas
  const doubts_branch = await prisma.triageRule.create({
    data: {
      id: uuidv7(),
      parentId: root1.id,
      answerTrigger: 'duvida',
      question: 'Qual é sua categoria de dúvida?',
      isLeaf: false,
    },
  });

  // Doubts -> Feature question
  await prisma.triageRule.create({
    data: {
      id: uuidv7(),
      parentId: doubts_branch.id,
      answerTrigger: 'funcionalidade',
      isLeaf: true,
      subjectId: subjects[2].id,
      targetGroupId: supportGroups[0].id,
    },
  });

  // Doubts -> Access question
  await prisma.triageRule.create({
    data: {
      id: uuidv7(),
      parentId: doubts_branch.id,
      answerTrigger: 'acesso',
      isLeaf: true,
      subjectId: subjects[3].id,
      targetGroupId: supportGroups[0].id,
    },
  });

  // Doubts -> Reports
  await prisma.triageRule.create({
    data: {
      id: uuidv7(),
      parentId: doubts_branch.id,
      answerTrigger: 'relatorios',
      isLeaf: true,
      subjectId: subjects[4].id,
      targetGroupId: supportGroups[0].id,
    },
  });

  // Doubts -> Import/Export
  await prisma.triageRule.create({
    data: {
      id: uuidv7(),
      parentId: doubts_branch.id,
      answerTrigger: 'importacao',
      isLeaf: true,
      subjectId: subjects[9].id,
      targetGroupId: supportGroups[0].id,
    },
  });

  // Tree 2: Administrative
  const admin_branch = await prisma.triageRule.create({
    data: {
      id: uuidv7(),
      parentId: root2.id,
      answerTrigger: 'administrativo',
      question: 'Qual é sua necessidade administrativa?',
      isLeaf: false,
    },
  });

  // Admin -> Configuration
  await prisma.triageRule.create({
    data: {
      id: uuidv7(),
      parentId: admin_branch.id,
      answerTrigger: 'configuracao',
      isLeaf: true,
      subjectId: subjects[5].id,
      targetGroupId: supportGroups[2].id,
    },
  });

  // Admin -> Billing
  await prisma.triageRule.create({
    data: {
      id: uuidv7(),
      parentId: admin_branch.id,
      answerTrigger: 'faturamento',
      isLeaf: true,
      subjectId: subjects[6].id,
      targetGroupId: supportGroups[2].id,
    },
  });

  // Tree 2: Compliance
  const compliance_branch = await prisma.triageRule.create({
    data: {
      id: uuidv7(),
      parentId: root2.id,
      answerTrigger: 'compliance',
      question: 'Sobre qual aspecto de compliance você precisa de ajuda?',
      isLeaf: false,
    },
  });

  // Compliance -> NFe
  await prisma.triageRule.create({
    data: {
      id: uuidv7(),
      parentId: compliance_branch.id,
      answerTrigger: 'fiscal',
      isLeaf: true,
      targetGroupId: supportGroups[3].id,
    },
  });

  console.log('✅ Triage rules seeded');
}

async function main() {
  if (await databaseHasData()) {
    console.log('🧹 Wiping existing data...');
    await wipeDatabase();
  }

  console.log('🌱 Starting seed...\n');

  console.log('👥 Creating Pro4Tech company and users...');
  await seedPro4Tech();

  console.log('🏢 Creating client companies...');
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

  console.log('👨 Creating support groups...');
  await seedSupportGroups();

  console.log('🏷️  Creating ticket subjects...');
  await seedTicketSubjects();

  console.log('🌳 Creating triage rules...');
  await seedTriageRules();

  console.log('\n✨ Seed completed successfully!');
  console.log('📊 Test credentials:');
  console.log('   Email: admin@pro4tech.com');
  console.log('   Password: password123');
}

main()
  .catch(async (error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
