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
    {
      name: 'Suporte por Email',
      description:
        'Contato e suporte técnico disponível via email com prazo de resposta de 24 horas.',
    },
    {
      name: 'Suporte via Chat',
      description:
        'Suporte instantâneo via chat para problemas urgentes e dúvidas rápidas.',
    },
    {
      name: 'Questões de Compliance Fiscal',
      description:
        'Perguntas e esclarecimentos sobre obrigatoriedades fiscais e regulamentações.',
    },
    {
      name: 'Proteção de Dados e LGPD',
      description:
        'Dúvidas sobre conformidade com Lei Geral de Proteção de Dados (LGPD) e GDPR.',
    },
    {
      name: 'Auditoria e Conformidade',
      description:
        'Suporte para processos de auditoria interna e conformidade regulatória.',
    },
    {
      name: 'Segurança e Controle de Acesso',
      description:
        'Gestão de segurança, autenticação de dois fatores, e controles de acesso avançados.',
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

  if (subjects.length < 16 || supportGroups.length < 4) {
    console.warn(
      'Skipping triage rules seed: not enough subjects or support groups',
    );
    return;
  }

  console.log('🌳 Creating triage rules tree...');

  // Root node
  const root = await prisma.triageRule.create({
    data: {
      id: uuidv7(),
      question: 'Qual é o seu problema?',
      isLeaf: false,
    },
  });

  // ========== BRANCH 1: Faturamento ==========
  const faturamentoBranch = await prisma.triageRule.create({
    data: {
      id: uuidv7(),
      parentId: root.id,
      answerTrigger: 'faturamento',
      question: 'Qual é o seu problema de faturamento?',
      isLeaf: false,
    },
  });

  // Faturamento leaves - 4 children (subjects[0] to subjects[3])
  await prisma.triageRule.create({
    data: {
      id: uuidv7(),
      parentId: faturamentoBranch.id,
      answerTrigger: 'faturas-nao-enviadas',
      isLeaf: true,
      subjectId: subjects[0].id,
      targetGroupId: supportGroups[0].id,
    },
  });

  await prisma.triageRule.create({
    data: {
      id: uuidv7(),
      parentId: faturamentoBranch.id,
      answerTrigger: 'duplicacao-faturas',
      isLeaf: true,
      subjectId: subjects[1].id,
      targetGroupId: supportGroups[0].id,
    },
  });

  await prisma.triageRule.create({
    data: {
      id: uuidv7(),
      parentId: faturamentoBranch.id,
      answerTrigger: 'erro-calculo-valor',
      isLeaf: true,
      subjectId: subjects[2].id,
      targetGroupId: supportGroups[0].id,
    },
  });

  await prisma.triageRule.create({
    data: {
      id: uuidv7(),
      parentId: faturamentoBranch.id,
      answerTrigger: 'consulta-historico',
      isLeaf: true,
      subjectId: subjects[3].id,
      targetGroupId: supportGroups[0].id,
    },
  });

  // ========== BRANCH 2: Suporte Técnico ==========
  const suporteBranch = await prisma.triageRule.create({
    data: {
      id: uuidv7(),
      parentId: root.id,
      answerTrigger: 'suporte',
      question: 'Qual é o tipo de problema técnico?',
      isLeaf: false,
    },
  });

  // Suporte leaves - 4 children (subjects[4] to subjects[7])
  await prisma.triageRule.create({
    data: {
      id: uuidv7(),
      parentId: suporteBranch.id,
      answerTrigger: 'erro-nfe',
      isLeaf: true,
      subjectId: subjects[4].id,
      targetGroupId: supportGroups[1].id,
    },
  });

  await prisma.triageRule.create({
    data: {
      id: uuidv7(),
      parentId: suporteBranch.id,
      answerTrigger: 'integracao',
      isLeaf: true,
      subjectId: subjects[5].id,
      targetGroupId: supportGroups[1].id,
    },
  });

  await prisma.triageRule.create({
    data: {
      id: uuidv7(),
      parentId: suporteBranch.id,
      answerTrigger: 'desempenho',
      isLeaf: true,
      subjectId: subjects[6].id,
      targetGroupId: supportGroups[1].id,
    },
  });

  await prisma.triageRule.create({
    data: {
      id: uuidv7(),
      parentId: suporteBranch.id,
      answerTrigger: 'bug-report',
      isLeaf: true,
      subjectId: subjects[7].id,
      targetGroupId: supportGroups[1].id,
    },
  });

  // ========== BRANCH 3: Administrativo ==========
  const adminBranch = await prisma.triageRule.create({
    data: {
      id: uuidv7(),
      parentId: root.id,
      answerTrigger: 'admin',
      question: 'Qual é a sua necessidade administrativa?',
      isLeaf: false,
    },
  });

  // Admin leaves - 4 children (subjects[8] to subjects[11])
  await prisma.triageRule.create({
    data: {
      id: uuidv7(),
      parentId: adminBranch.id,
      answerTrigger: 'configuracao-sistema',
      isLeaf: true,
      subjectId: subjects[8].id,
      targetGroupId: supportGroups[2].id,
    },
  });

  await prisma.triageRule.create({
    data: {
      id: uuidv7(),
      parentId: adminBranch.id,
      answerTrigger: 'gerenciamento-usuarios',
      isLeaf: true,
      subjectId: subjects[9].id,
      targetGroupId: supportGroups[2].id,
    },
  });

  await prisma.triageRule.create({
    data: {
      id: uuidv7(),
      parentId: adminBranch.id,
      answerTrigger: 'relatorios',
      isLeaf: true,
      subjectId: subjects[10].id,
      targetGroupId: supportGroups[2].id,
    },
  });

  await prisma.triageRule.create({
    data: {
      id: uuidv7(),
      parentId: adminBranch.id,
      answerTrigger: 'integracao-erpme',
      isLeaf: true,
      subjectId: subjects[11].id,
      targetGroupId: supportGroups[2].id,
    },
  });

  // ========== BRANCH 4: Compliance ==========
  const complianceBranch = await prisma.triageRule.create({
    data: {
      id: uuidv7(),
      parentId: root.id,
      answerTrigger: 'compliance',
      question: 'Qual é o aspecto de compliance que precisa de ajuda?',
      isLeaf: false,
    },
  });

  // Compliance leaves - 4 children (subjects[12] to subjects[15])
  await prisma.triageRule.create({
    data: {
      id: uuidv7(),
      parentId: complianceBranch.id,
      answerTrigger: 'fiscal-nfe',
      isLeaf: true,
      subjectId: subjects[12].id,
      targetGroupId: supportGroups[3].id,
    },
  });

  await prisma.triageRule.create({
    data: {
      id: uuidv7(),
      parentId: complianceBranch.id,
      answerTrigger: 'rgpd-dados',
      isLeaf: true,
      subjectId: subjects[13].id,
      targetGroupId: supportGroups[3].id,
    },
  });

  await prisma.triageRule.create({
    data: {
      id: uuidv7(),
      parentId: complianceBranch.id,
      answerTrigger: 'auditoria',
      isLeaf: true,
      subjectId: subjects[14].id,
      targetGroupId: supportGroups[3].id,
    },
  });

  await prisma.triageRule.create({
    data: {
      id: uuidv7(),
      parentId: complianceBranch.id,
      answerTrigger: 'seguranca-acesso',
      isLeaf: true,
      subjectId: subjects[15].id,
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
