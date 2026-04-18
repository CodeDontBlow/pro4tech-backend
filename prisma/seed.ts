import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Role, SupportLevel } from '../generated/prisma/enums';
import * as bcrypt from 'bcrypt';
import { v7 as uuidv7 } from 'uuid';
import { generateCompanyAccessCode } from '../src/modules/accessCode/access-code.util';

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
  groupNames: string[];
};

type SupportGroupSeed = {
  name: string;
  description: string;
};

type TicketSubjectSeed = {
  name: string;
  description: string;
};

type SeededAgent = {
  id: string;
  email: string;
  supportLevel: SupportLevel;
  groupNames: string[];
};

type TriageLeafSeed = {
  answerTrigger: string;
  subjectName: string;
  targetGroupName: string;
};

type TriageNodeSeed = {
  answerTrigger?: string;
  question?: string;
  children?: TriageNodeSeed[];
  subjectName?: string;
  targetGroupName?: string;
};

type TriageStats = {
  totalNodes: number;
  leafNodes: number;
  maxDepth: number;
};

type DeepSubBranchSeed = {
  answerTrigger: string;
  question: string;
  diagnosticTrigger: string;
  diagnosticQuestion: string;
  contextTrigger: string;
  contextQuestion: string;
  urgencyTrigger: string;
  urgencyQuestion: string;
  criticalLeaf: TriageLeafSeed;
  controlledLeaf: TriageLeafSeed;
};

type CompactTriageBranchTemplate = {
  answerTrigger: string;
  question: string;
  optionQuestion: string;
  subjectPool: string[];
  targetGroupPool: string[];
};

const DEFAULT_PASSWORD = 'Password@123';

const REQUIRED_GROUP_NAMES = ['BI', 'Finanças', 'Geral'] as const;

const SUPPORT_GROUPS: SupportGroupSeed[] = [
  {
    name: 'Suporte Nível 1',
    description:
      'Atendimento inicial multicanal para incidentes operacionais e direcionamento.',
  },
  {
    name: 'Suporte Nível 2',
    description:
      'Tratativas técnicas avançadas e estabilização de fluxos críticos.',
  },
  {
    name: 'Suporte Fiscal',
    description: 'Especialistas em documentos fiscais, tributação e apuração.',
  },
  {
    name: 'Suporte de Integrações',
    description: 'Equipe focada em APIs, webhooks, conectores e automações.',
  },
  {
    name: 'Segurança da Informação',
    description: 'Resposta a incidentes de acesso, auditoria e risco de segurança.',
  },
  {
    name: 'Plataforma e Performance',
    description: 'Performance, estabilidade da plataforma e tuning operacional.',
  },
  {
    name: 'BI',
    description: 'Indicadores, dashboards, qualidade analítica e pipelines de dados.',
  },
  {
    name: 'Finanças',
    description: 'Conciliação, custos, faturamento e governança financeira.',
  },
  {
    name: 'Geral',
    description:
      'Fila de suporte transversal para dúvidas e demandas não classificadas.',
  },
];

const PRO4TECH_AGENTS: AgentSeed[] = [
  {
    name: 'Lucas Ramos',
    email: 'lucas.ramos@pro4tech.com',
    phone: '+5511999000002',
    role: Role.AGENT,
    supportLevel: SupportLevel.LEVEL_1,
    canAnswer: true,
    groupNames: ['Geral'],
  },
  {
    name: 'agent',
    email: 'agent@agent.com',
    phone: '+5511999000003',
    role: Role.AGENT,
    supportLevel: SupportLevel.LEVEL_1,
    canAnswer: true,
    groupNames: SUPPORT_GROUPS.map((group) => group.name),
  },
  {
    name: 'Bruno Araujo',
    email: 'bruno.araujo@pro4tech.com',
    phone: '+5511999000004',
    role: Role.AGENT,
    supportLevel: SupportLevel.LEVEL_2,
    canAnswer: true,
    groupNames: ['BI'],
  },
  {
    name: 'Julia Martins',
    email: 'julia.martins@pro4tech.com',
    phone: '+5511999000005',
    role: Role.AGENT,
    supportLevel: SupportLevel.LEVEL_2,
    canAnswer: true,
    groupNames: ['BI'],
  },
  {
    name: 'Diego Santos',
    email: 'diego.santos@pro4tech.com',
    phone: '+5511999000006',
    role: Role.AGENT,
    supportLevel: SupportLevel.LEVEL_1,
    canAnswer: true,
    groupNames: ['Geral'],
  },
  {
    name: 'Renata Costa',
    email: 'renata.costa@pro4tech.com',
    phone: '+5511999000007',
    role: Role.AGENT,
    supportLevel: SupportLevel.LEVEL_1,
    canAnswer: true,
    groupNames: ['BI'],
  },
  {
    name: 'Thiago Alves',
    email: 'thiago.alves@pro4tech.com',
    phone: '+5511999000008',
    role: Role.AGENT,
    supportLevel: SupportLevel.LEVEL_1,
    canAnswer: true,
    groupNames: ['Geral'],
  },
  {
    name: 'Marina Prado',
    email: 'marina.prado@pro4tech.com',
    phone: '+5511999000009',
    role: Role.AGENT,
    supportLevel: SupportLevel.LEVEL_1,
    canAnswer: true,
    groupNames: ['Finanças'],
  },
  {
    name: 'Caio Fernandes',
    email: 'caio.fernandes@pro4tech.com',
    phone: '+5511999000010',
    role: Role.AGENT,
    supportLevel: SupportLevel.LEVEL_1,
    canAnswer: true,
    groupNames: ['Geral'],
  },
  {
    name: 'Beatriz Moura',
    email: 'beatriz.moura@pro4tech.com',
    phone: '+5511999000011',
    role: Role.AGENT,
    supportLevel: SupportLevel.LEVEL_1,
    canAnswer: true,
    groupNames: ['Geral'],
  },
  {
    name: 'Rafael Nogueira',
    email: 'rafael.nogueira@pro4tech.com',
    phone: '+5511999000012',
    role: Role.AGENT,
    supportLevel: SupportLevel.LEVEL_1,
    canAnswer: true,
    groupNames: ['Finanças'],
  },
  {
    name: 'Larissa Duarte',
    email: 'larissa.duarte@pro4tech.com',
    phone: '+5511999000013',
    role: Role.AGENT,
    supportLevel: SupportLevel.LEVEL_1,
    canAnswer: true,
    groupNames: ['BI'],
  },
  {
    name: 'Felipe Cardoso',
    email: 'felipe.cardoso@pro4tech.com',
    phone: '+5511999000014',
    role: Role.AGENT,
    supportLevel: SupportLevel.LEVEL_2,
    canAnswer: true,
    groupNames: ['Finanças'],
  },
  {
    name: 'Vanessa Ribeiro',
    email: 'vanessa.ribeiro@pro4tech.com',
    phone: '+5511999000015',
    role: Role.AGENT,
    supportLevel: SupportLevel.LEVEL_2,
    canAnswer: true,
    groupNames: ['Finanças'],
  },
  {
    name: 'Igor Carvalho',
    email: 'igor.carvalho@pro4tech.com',
    phone: '+5511999000016',
    role: Role.AGENT,
    supportLevel: SupportLevel.LEVEL_2,
    canAnswer: true,
    groupNames: ['BI'],
  },
  {
    name: 'Natalia Pires',
    email: 'natalia.pires@pro4tech.com',
    phone: '+5511999000017',
    role: Role.AGENT,
    supportLevel: SupportLevel.LEVEL_2,
    canAnswer: true,
    groupNames: ['BI'],
  },
  {
    name: 'Danilo Faria',
    email: 'danilo.faria@pro4tech.com',
    phone: '+5511999000018',
    role: Role.AGENT,
    supportLevel: SupportLevel.LEVEL_2,
    canAnswer: true,
    groupNames: ['Geral'],
  },
  {
    name: 'Sergio Batista',
    email: 'sergio.batista@pro4tech.com',
    phone: '+5511999000019',
    role: Role.AGENT,
    supportLevel: SupportLevel.LEVEL_3,
    canAnswer: true,
    groupNames: ['BI'],
  },
  {
    name: 'Camila Monteiro',
    email: 'camila.monteiro@pro4tech.com',
    phone: '+5511999000020',
    role: Role.AGENT,
    supportLevel: SupportLevel.LEVEL_3,
    canAnswer: true,
    groupNames: ['Finanças'],
  },
  {
    name: 'Andre Lopes',
    email: 'andre.lopes@pro4tech.com',
    phone: '+5511999000021',
    role: Role.AGENT,
    supportLevel: SupportLevel.LEVEL_3,
    canAnswer: true,
    groupNames: ['BI'],
  },
];

const TICKET_SUBJECTS: TicketSubjectSeed[] = [
  {
    name: 'NFe com rejeicao tributaria',
    description:
      'Rejeicoes em NF-e por regra fiscal, cadastro, CST ou tributacao.',
  },
  {
    name: 'NFe com timeout de autorizacao',
    description: 'Falha de autorizacao de NF-e por timeout em lotes de emissao.',
  },
  {
    name: 'NFSe com schema invalido',
    description: 'Erros de schema no envio de NFS-e para prefeituras integradas.',
  },
  {
    name: 'NFSe com indisponibilidade municipal',
    description: 'Instabilidade no provedor municipal durante emissao de NFS-e.',
  },
  {
    name: 'Conciliacao fiscal com divergencia de aliquotas',
    description: 'Divergencia de aliquotas em conciliacao de apuracao fiscal.',
  },
  {
    name: 'Conciliacao fiscal com diferenca de base',
    description: 'Base tributavel divergente entre fontes no fechamento fiscal.',
  },
  {
    name: 'Provisao financeira com impostos em duplicidade',
    description:
      'Lancamentos duplicados de impostos na provisao e fechamento financeiro.',
  },
  {
    name: 'Provisao financeira com impostos ausentes',
    description: 'Impostos nao provisionados no ciclo financeiro mensal.',
  },
  {
    name: 'API ERP com erro de autenticacao',
    description: 'Falhas de token, credenciais ou assinatura em API com ERP.',
  },
  {
    name: 'API ERP com quebra de contrato',
    description: 'Mudanca de payload ou contrato quebrando integracao de ERP.',
  },
  {
    name: 'Webhook sem entrega de eventos',
    description: 'Eventos nao entregues no fluxo de webhook de integracoes.',
  },
  {
    name: 'Webhook com eventos duplicados',
    description: 'Eventos duplicados gerando reprocessamento indevido no fluxo.',
  },
  {
    name: 'ETL BI com atraso de carga',
    description: 'Pipeline ETL com atraso de carga e defasagem de indicadores.',
  },
  {
    name: 'ETL BI com quebra de transformacao',
    description: 'Erros em transformacoes do ETL impactando tabelas analiticas.',
  },
  {
    name: 'Sincronizacao BI com metricas divergentes',
    description: 'Diferenca de metricas entre ambiente transacional e analitico.',
  },
  {
    name: 'Sincronizacao BI com dados faltantes',
    description: 'Registros ausentes apos sincronizacao de dados para BI.',
  },
  {
    name: 'Login corporativo com falha de SSO',
    description: 'Falha de login em SSO corporativo com provedores de identidade.',
  },
  {
    name: 'Login corporativo com bloqueio por politica',
    description: 'Acesso bloqueado por politica de seguranca ou condicional.',
  },
  {
    name: 'Permissoes com perfil inconsistente',
    description: 'Permissoes divergentes em perfis de acesso de usuarios.',
  },
  {
    name: 'Permissoes com heranca indevida',
    description: 'Heranca de permissao indevida em estruturas organizacionais.',
  },
  {
    name: 'Incidente de seguranca com tentativa de invasao',
    description: 'Tentativa de invasao detectada em conta, endpoint ou sessao.',
  },
  {
    name: 'Incidente de seguranca com vazamento potencial',
    description: 'Suspeita de exposicao de dados ou vazamento potencial.',
  },
  {
    name: 'Auditoria de acesso com trilha incompleta',
    description: 'Logs de auditoria incompletos para rastreabilidade de acesso.',
  },
  {
    name: 'Auditoria de acesso com evidencia divergente',
    description: 'Evidencias de auditoria divergentes entre fontes monitoradas.',
  },
  {
    name: 'Dashboard financeiro com metrica incorreta',
    description: 'Indicadores financeiros inconsistentes em dashboards executivos.',
  },
  {
    name: 'Dashboard financeiro sem atualizacao diaria',
    description: 'Painel financeiro sem refresh diario esperado pela operacao.',
  },
  {
    name: 'Relatorio operacional com filtros inconsistentes',
    description: 'Filtros aplicados em relatorios retornando recorte incorreto.',
  },
  {
    name: 'Relatorio operacional com lentidao critica',
    description: 'Lentidao severa na geracao de relatorios operacionais.',
  },
  {
    name: 'Planejamento de custos com centro incorreto',
    description: 'Custos alocados no centro errado no planejamento financeiro.',
  },
  {
    name: 'Planejamento de custos com rateio incorreto',
    description: 'Rateio de custos com regras incorretas no planejamento.',
  },
  {
    name: 'Governanca de dados com cadastro duplicado',
    description: 'Cadastros duplicados impactando consistencia e governanca.',
  },
  {
    name: 'Governanca de dados com qualidade insuficiente',
    description: 'Qualidade de dados abaixo do esperado para tomada de decisao.',
  },
  {
    name: 'App Web - falha apenas na conta do cliente',
    description:
      'Encerrar triagem e abrir ticket de suporte nivel 1 para problema isolado em conta.',
  },
  {
    name: 'BI - painel nao carrega ou erro de acesso',
    description:
      'Encerrar triagem direcionando para o time de Infraestrutura por indisponibilidade de painel.',
  },
  {
    name: 'BI - dados desatualizados no dashboard',
    description:
      'Encerrar triagem direcionando para Engenharia de Dados por atraso de atualizacao.',
  },
  {
    name: 'RPA - robo parado por falha de login ou timeout',
    description:
      'Encerrar triagem com acao de reinicio do bot e abertura de log tecnico.',
  },
  {
    name: 'RPA - execucao com erro de regra de negocio',
    description:
      'Encerrar triagem direcionando para analista de RPA para ajuste de regra.',
  },
  {
    name: 'IoT - dispositivo offline sem conexao',
    description:
      'Encerrar triagem enviando guia de reinicializacao de hardware e conectividade.',
  },
  {
    name: 'IoT - dispositivo online sem enviar telemetria',
    description:
      'Encerrar triagem direcionando para investigacao de firmware e protocolo.',
  },
  {
    name: 'App Web - erro 500 para todos os usuarios',
    description:
      'Encerrar triagem abrindo incidente critico P1 para DevOps por erro interno.',
  },
  {
    name: 'App Web - erro 503 servico indisponivel',
    description:
      'Encerrar triagem verificando status do servico e informando o cliente.',
  },
  {
    name: 'App Web - tela branca ou travada sem codigo',
    description:
      'Encerrar triagem abrindo incidente P2 para time de Front-end.',
  },
];

const TRIAGE_MIN_OPTIONS_PER_BRANCH = 2;
const TRIAGE_MAX_OPTIONS_PER_BRANCH = 4;
const TRIAGE_MIN_LEAVES_PER_OPTION = 2;
const TRIAGE_MAX_LEAVES_PER_OPTION = 5;
const TRIAGE_MIN_DEPTH_PER_ROOT_BRANCH = 1;
const TRIAGE_MAX_OPTIONS_PER_QUESTION = 3;

const COMPACT_TRIAGE_BRANCHES: CompactTriageBranchTemplate[] = [
  {
    answerTrigger: 'fiscal',
    question: 'Qual frente fiscal esta com problema?',
    optionQuestion: 'Qual cenario fiscal representa melhor sua situacao?',
    subjectPool: [
      'NFe com rejeicao tributaria',
      'NFe com timeout de autorizacao',
      'NFSe com schema invalido',
      'NFSe com indisponibilidade municipal',
      'Conciliacao fiscal com divergencia de aliquotas',
      'Conciliacao fiscal com diferenca de base',
    ],
    targetGroupPool: ['Suporte Fiscal', 'Finanças', 'Suporte Nível 2'],
  },
  {
    answerTrigger: 'integracoes',
    question: 'Qual integracao foi impactada?',
    optionQuestion: 'Qual tipo de falha de integracao voce identificou?',
    subjectPool: [
      'API ERP com erro de autenticacao',
      'API ERP com quebra de contrato',
      'Webhook sem entrega de eventos',
      'Webhook com eventos duplicados',
      'ETL BI com atraso de carga',
      'Sincronizacao BI com dados faltantes',
    ],
    targetGroupPool: ['Suporte de Integrações', 'BI', 'Plataforma e Performance'],
  },
  {
    answerTrigger: 'acesso-seguranca',
    question: 'Qual contexto de acesso ou seguranca esta afetado?',
    optionQuestion: 'Qual tipo de incidente de acesso/seguranca ocorreu?',
    subjectPool: [
      'Login corporativo com falha de SSO',
      'Login corporativo com bloqueio por politica',
      'Permissoes com perfil inconsistente',
      'Permissoes com heranca indevida',
      'Incidente de seguranca com tentativa de invasao',
      'Auditoria de acesso com trilha incompleta',
    ],
    targetGroupPool: ['Segurança da Informação', 'Suporte Nível 2', 'Geral'],
  },
  {
    answerTrigger: 'dados-gestao',
    question: 'Qual dor de dados/gestao voce quer tratar?',
    optionQuestion: 'Qual bloco de dados e gestao esta com problema?',
    subjectPool: [
      'Dashboard financeiro com metrica incorreta',
      'Relatorio operacional com filtros inconsistentes',
      'Planejamento de custos com centro incorreto',
      'Planejamento de custos com rateio incorreto',
      'Governanca de dados com cadastro duplicado',
      'Governanca de dados com qualidade insuficiente',
    ],
    targetGroupPool: ['BI', 'Finanças', 'Geral', 'Plataforma e Performance'],
  },
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(items: T[]): T {
  if (items.length === 0) {
    throw new Error('Cannot pick a random item from an empty array');
  }

  return items[randomInt(0, items.length - 1)];
}

function buildCompactBranch(
  template: CompactTriageBranchTemplate,
): TriageNodeSeed {
  const optionCount = randomInt(
    TRIAGE_MIN_OPTIONS_PER_BRANCH,
    TRIAGE_MAX_OPTIONS_PER_BRANCH,
  );

  const options: TriageNodeSeed[] = [];

  for (let optionIndex = 1; optionIndex <= optionCount; optionIndex += 1) {
    const optionTrigger = `${template.answerTrigger}-opcao-${optionIndex}`;
    const leafCount = randomInt(
      TRIAGE_MIN_LEAVES_PER_OPTION,
      TRIAGE_MAX_LEAVES_PER_OPTION,
    );
    const subjectOffset = randomInt(0, template.subjectPool.length - 1);

    const leaves: TriageNodeSeed[] = [];

    for (let leafIndex = 1; leafIndex <= leafCount; leafIndex += 1) {
      const subjectName =
        template.subjectPool[
          (subjectOffset + leafIndex - 1) % template.subjectPool.length
        ];

      leaves.push(
        createLeaf({
          answerTrigger: `${optionTrigger}-resposta-${leafIndex}`,
          subjectName,
          targetGroupName: pickRandom(template.targetGroupPool),
        }),
      );
    }

    options.push(
      createBranch(
        optionTrigger,
        `${template.optionQuestion} (opcao ${optionIndex})`,
        leaves,
      ),
    );
  }

  return createBranch(template.answerTrigger, template.question, options);
}

function createCompactRandomTriageRoot(): TriageNodeSeed {
  return {
    question: 'Bem-vindo ao suporte Pro4Tech. Qual area voce quer atender?',
    children: COMPACT_TRIAGE_BRANCHES.map((branch) => buildCompactBranch(branch)),
  };
}

function createBranch(
  answerTrigger: string,
  question: string,
  children: TriageNodeSeed[],
): TriageNodeSeed {
  return {
    answerTrigger,
    question,
    children,
  };
}

function createLeaf(leaf: TriageLeafSeed): TriageNodeSeed {
  return {
    answerTrigger: leaf.answerTrigger,
    subjectName: leaf.subjectName,
    targetGroupName: leaf.targetGroupName,
  };
}

const REQUESTED_TRIAGE_ROOT_BLUEPRINT: TriageNodeSeed = {
  question: 'Qual serviço da Pro4tech está apresentando instabilidade?',
  children: [
    createBranch(
      'aplicativos-web-mobile',
      'O problema afeta todos os usuários do sistema ou apenas a sua conta?',
      [
        createBranch(
          'afeta-todos-os-usuarios',
          'Qual comportamento ou mensagem de erro está aparecendo na tela para os usuários?',
          [
            createLeaf({
              answerTrigger: 'erro-500',
              subjectName: 'App Web - erro 500 para todos os usuarios',
              targetGroupName: 'Plataforma e Performance',
            }),
            createLeaf({
              answerTrigger: 'erro-503',
              subjectName: 'App Web - erro 503 servico indisponivel',
              targetGroupName: 'Plataforma e Performance',
            }),
            createLeaf({
              answerTrigger: 'tela-branca-travada',
              subjectName: 'App Web - tela branca ou travada sem codigo',
              targetGroupName: 'Suporte Nível 2',
            }),
          ],
        ),
        createLeaf({
          answerTrigger: 'afeta-apenas-minha-conta',
          subjectName: 'App Web - falha apenas na conta do cliente',
          targetGroupName: 'Geral',
        }),
      ],
    ),
    createBranch(
      'dashboards-bi',
      'O dashboard não carrega na tela ou as informações estão desatualizadas?',
      [
        createLeaf({
          answerTrigger: 'painel-nao-carrega',
          subjectName: 'BI - painel nao carrega ou erro de acesso',
          targetGroupName: 'Plataforma e Performance',
        }),
        createLeaf({
          answerTrigger: 'dados-desatualizados',
          subjectName: 'BI - dados desatualizados no dashboard',
          targetGroupName: 'BI',
        }),
      ],
    ),
    createBranch(
      'robos-rpa',
      'O robô de automação parou completamente ou está executando a tarefa com erros?',
      [
        createLeaf({
          answerTrigger: 'robo-parou-completamente',
          subjectName: 'RPA - robo parado por falha de login ou timeout',
          targetGroupName: 'Suporte de Integrações',
        }),
        createLeaf({
          answerTrigger: 'robo-com-erros-de-regra',
          subjectName: 'RPA - execucao com erro de regra de negocio',
          targetGroupName: 'Suporte de Integrações',
        }),
      ],
    ),
    createBranch(
      'sensores-dispositivos-iot',
      'O dispositivo perdeu a conexão com a rede Wi-Fi/4G ou está online mas não envia a telemetria?',
      [
        createLeaf({
          answerTrigger: 'dispositivo-offline',
          subjectName: 'IoT - dispositivo offline sem conexao',
          targetGroupName: 'Geral',
        }),
        createLeaf({
          answerTrigger: 'dispositivo-sem-telemetria',
          subjectName: 'IoT - dispositivo online sem enviar telemetria',
          targetGroupName: 'Suporte de Integrações',
        }),
      ],
    ),
  ],
};

function createDeepSubBranch(seed: DeepSubBranchSeed): TriageNodeSeed {
  return createBranch(seed.answerTrigger, seed.question, [
    createBranch(seed.diagnosticTrigger, seed.diagnosticQuestion, [
      createBranch(seed.contextTrigger, seed.contextQuestion, [
        createBranch(seed.urgencyTrigger, seed.urgencyQuestion, [
          createLeaf(seed.criticalLeaf),
          createLeaf(seed.controlledLeaf),
        ]),
      ]),
    ]),
  ]);
}

const TRIAGE_ROOT_BLUEPRINT: TriageNodeSeed = {
  question: 'Bem-vindo ao suporte Pro4Tech. Qual macroarea descreve melhor seu problema?',
  children: [
    createBranch(
      'operacao-fiscal',
      'Qual frente fiscal da operacao foi impactada?',
      [
        createBranch(
          'emissao-documentos',
          'Em qual fluxo de emissao ocorreu o incidente?',
          [
            createDeepSubBranch({
              answerTrigger: 'nfe-eletronica',
              question: 'O problema esta concentrado em NF-e?',
              diagnosticTrigger: 'validacao-tributaria',
              diagnosticQuestion:
                'O erro aparece em regras tributarias ou cadastro fiscal?',
              contextTrigger: 'mudanca-recente',
              contextQuestion:
                'Houve mudanca recente de regra, cadastro ou versao?',
              urgencyTrigger: 'impacto-financeiro',
              urgencyQuestion:
                'Qual e o impacto financeiro imediato na operacao?',
              criticalLeaf: {
                answerTrigger: 'critico',
                subjectName: 'NFe com rejeicao tributaria',
                targetGroupName: 'Suporte Fiscal',
              },
              controlledLeaf: {
                answerTrigger: 'controlado',
                subjectName: 'NFe com timeout de autorizacao',
                targetGroupName: 'Suporte Nível 2',
              },
            }),
            createDeepSubBranch({
              answerTrigger: 'nfse-municipal',
              question: 'O problema esta concentrado em NFS-e?',
              diagnosticTrigger: 'integracao-prefeitura',
              diagnosticQuestion:
                'A falha ocorre durante comunicacao com prefeitura?',
              contextTrigger: 'janela-fechamento',
              contextQuestion:
                'A falha acontece em horarios de pico ou fechamento?',
              urgencyTrigger: 'impacto-faturamento',
              urgencyQuestion:
                'Qual e o impacto no faturamento da empresa cliente?',
              criticalLeaf: {
                answerTrigger: 'critico',
                subjectName: 'NFSe com schema invalido',
                targetGroupName: 'Suporte Fiscal',
              },
              controlledLeaf: {
                answerTrigger: 'controlado',
                subjectName: 'NFSe com indisponibilidade municipal',
                targetGroupName: 'Suporte Nível 2',
              },
            }),
          ],
        ),
        createBranch(
          'fechamento-apuracao',
          'Em qual etapa do fechamento fiscal a dificuldade aparece?',
          [
            createDeepSubBranch({
              answerTrigger: 'conciliacao-impostos',
              question: 'A divergencia esta na conciliacao de impostos?',
              diagnosticTrigger: 'apuracao-mensal',
              diagnosticQuestion:
                'O problema ocorre no fechamento mensal da apuracao?',
              contextTrigger: 'fonte-de-dados',
              contextQuestion:
                'Existe variacao entre fonte transacional e fiscal?',
              urgencyTrigger: 'impacto-obrigacoes',
              urgencyQuestion:
                'Qual e o risco para as obrigacoes fiscais em aberto?',
              criticalLeaf: {
                answerTrigger: 'critico',
                subjectName:
                  'Conciliacao fiscal com divergencia de aliquotas',
                targetGroupName: 'Finanças',
              },
              controlledLeaf: {
                answerTrigger: 'controlado',
                subjectName: 'Conciliacao fiscal com diferenca de base',
                targetGroupName: 'Finanças',
              },
            }),
            createDeepSubBranch({
              answerTrigger: 'provisao-financeira',
              question: 'A falha esta no provisionamento financeiro?',
              diagnosticTrigger: 'consolidacao-lotes',
              diagnosticQuestion:
                'O erro surge durante consolidacao de lotes financeiros?',
              contextTrigger: 'regra-de-rateio',
              contextQuestion:
                'As regras de rateio ou provisao mudaram recentemente?',
              urgencyTrigger: 'impacto-caixa',
              urgencyQuestion: 'Qual e o impacto na previsao de caixa?',
              criticalLeaf: {
                answerTrigger: 'critico',
                subjectName:
                  'Provisao financeira com impostos em duplicidade',
                targetGroupName: 'Finanças',
              },
              controlledLeaf: {
                answerTrigger: 'controlado',
                subjectName: 'Provisao financeira com impostos ausentes',
                targetGroupName: 'Finanças',
              },
            }),
          ],
        ),
      ],
    ),
    createBranch(
      'integracoes-automacoes',
      'Qual trilha de integracao ou automacao apresenta falha?',
      [
        createBranch(
          'integracao-erp',
          'A falha esta na integracao com ERP ou orquestracao de eventos?',
          [
            createDeepSubBranch({
              answerTrigger: 'api-erp',
              question: 'A API principal do ERP esta falhando?',
              diagnosticTrigger: 'autenticacao-api',
              diagnosticQuestion:
                'O incidente ocorre em autenticacao, token ou assinatura?',
              contextTrigger: 'mudanca-contratual',
              contextQuestion:
                'Houve mudanca de contrato ou versao do endpoint?',
              urgencyTrigger: 'impacto-transacao',
              urgencyQuestion: 'Qual e o impacto nas transacoes em producao?',
              criticalLeaf: {
                answerTrigger: 'critico',
                subjectName: 'API ERP com erro de autenticacao',
                targetGroupName: 'Suporte de Integrações',
              },
              controlledLeaf: {
                answerTrigger: 'controlado',
                subjectName: 'API ERP com quebra de contrato',
                targetGroupName: 'Suporte de Integrações',
              },
            }),
            createDeepSubBranch({
              answerTrigger: 'webhook-orquestracao',
              question: 'A falha esta no barramento de webhooks?',
              diagnosticTrigger: 'fila-eventos',
              diagnosticQuestion:
                'O problema ocorre na fila, retentativa ou acknowledgement?',
              contextTrigger: 'janelas-pico',
              contextQuestion:
                'A falha se intensifica em janelas de alto volume?',
              urgencyTrigger: 'impacto-operacional',
              urgencyQuestion: 'Qual e o impacto operacional para as equipes?',
              criticalLeaf: {
                answerTrigger: 'critico',
                subjectName: 'Webhook sem entrega de eventos',
                targetGroupName: 'Suporte de Integrações',
              },
              controlledLeaf: {
                answerTrigger: 'controlado',
                subjectName: 'Webhook com eventos duplicados',
                targetGroupName: 'Plataforma e Performance',
              },
            }),
          ],
        ),
        createBranch(
          'dados-pipeline',
          'A falha esta na camada de dados analiticos?',
          [
            createDeepSubBranch({
              answerTrigger: 'etl-bi',
              question: 'A quebra ocorre no pipeline de ETL?',
              diagnosticTrigger: 'transformacao-dados',
              diagnosticQuestion:
                'A falha aparece na extracao, transformacao ou carga?',
              contextTrigger: 'volume-excepcional',
              contextQuestion: 'O volume processado saiu do padrao esperado?',
              urgencyTrigger: 'impacto-painel',
              urgencyQuestion:
                'Qual e o impacto na atualizacao dos dashboards executivos?',
              criticalLeaf: {
                answerTrigger: 'critico',
                subjectName: 'ETL BI com atraso de carga',
                targetGroupName: 'BI',
              },
              controlledLeaf: {
                answerTrigger: 'controlado',
                subjectName: 'ETL BI com quebra de transformacao',
                targetGroupName: 'BI',
              },
            }),
            createDeepSubBranch({
              answerTrigger: 'sincronizacao-kpi',
              question: 'A falha esta na sincronizacao de indicadores?',
              diagnosticTrigger: 'comparacao-metricas',
              diagnosticQuestion:
                'As metricas diferem entre origem operacional e BI?',
              contextTrigger: 'janela-atualizacao',
              contextQuestion:
                'A sincronizacao falha em janelas especificas de atualizacao?',
              urgencyTrigger: 'impacto-decisao',
              urgencyQuestion:
                'Qual e o impacto para decisoes de negocio em tempo real?',
              criticalLeaf: {
                answerTrigger: 'critico',
                subjectName: 'Sincronizacao BI com metricas divergentes',
                targetGroupName: 'BI',
              },
              controlledLeaf: {
                answerTrigger: 'controlado',
                subjectName: 'Sincronizacao BI com dados faltantes',
                targetGroupName: 'Plataforma e Performance',
              },
            }),
          ],
        ),
      ],
    ),
    createBranch('acesso-seguranca', 'Qual contexto de acesso ou seguranca foi afetado?', [
      createBranch(
        'autenticacao-identidade',
        'O incidente esta em autenticacao ou permissao de identidade?',
        [
          createDeepSubBranch({
            answerTrigger: 'sso-corporativo',
            question: 'A falha ocorre no SSO corporativo?',
            diagnosticTrigger: 'federacao-identidade',
            diagnosticQuestion:
              'A federacao com o provedor de identidade esta inconsistente?',
            contextTrigger: 'politica-acesso',
            contextQuestion:
              'Houve mudanca de politica de acesso ou condicional?',
            urgencyTrigger: 'impacto-login',
            urgencyQuestion: 'Qual o impacto imediato na autenticacao dos usuarios?',
            criticalLeaf: {
              answerTrigger: 'critico',
              subjectName: 'Login corporativo com falha de SSO',
              targetGroupName: 'Segurança da Informação',
            },
            controlledLeaf: {
              answerTrigger: 'controlado',
              subjectName: 'Login corporativo com bloqueio por politica',
              targetGroupName: 'Segurança da Informação',
            },
          }),
          createDeepSubBranch({
            answerTrigger: 'permissao-perfis',
            question: 'A falha ocorre em perfis e permissoes?',
            diagnosticTrigger: 'matriz-acesso',
            diagnosticQuestion:
              'A matriz de acesso apresenta perfis divergentes?',
            contextTrigger: 'mudanca-organizacional',
            contextQuestion:
              'Houve mudanca organizacional afetando herancas de permissao?',
            urgencyTrigger: 'impacto-governanca',
            urgencyQuestion:
              'Qual o impacto sobre a governanca de acesso da empresa?',
            criticalLeaf: {
              answerTrigger: 'critico',
              subjectName: 'Permissoes com perfil inconsistente',
              targetGroupName: 'Segurança da Informação',
            },
            controlledLeaf: {
              answerTrigger: 'controlado',
              subjectName: 'Permissoes com heranca indevida',
              targetGroupName: 'Suporte Nível 2',
            },
          }),
        ],
      ),
      createBranch(
        'monitoramento-risco',
        'O incidente esta em monitoramento de risco e auditoria?',
        [
          createDeepSubBranch({
            answerTrigger: 'incidente-ativo',
            question: 'Existe incidente de seguranca em andamento?',
            diagnosticTrigger: 'detecao-alerta',
            diagnosticQuestion:
              'O alerta foi detectado por monitoramento interno ou externo?',
            contextTrigger: 'escopo-afetado',
            contextQuestion:
              'Qual escopo foi potencialmente afetado pelo incidente?',
            urgencyTrigger: 'impacto-confianca',
            urgencyQuestion:
              'Qual e o impacto esperado em confianca e continuidade?',
            criticalLeaf: {
              answerTrigger: 'critico',
              subjectName: 'Incidente de seguranca com tentativa de invasao',
              targetGroupName: 'Segurança da Informação',
            },
            controlledLeaf: {
              answerTrigger: 'controlado',
              subjectName: 'Incidente de seguranca com vazamento potencial',
              targetGroupName: 'Segurança da Informação',
            },
          }),
          createDeepSubBranch({
            answerTrigger: 'auditoria-rastro',
            question: 'A dor principal esta em auditoria de acesso?',
            diagnosticTrigger: 'consistencia-evidencias',
            diagnosticQuestion:
              'Existe inconsistencia nas evidencias exigidas para auditoria?',
            contextTrigger: 'periodo-compliance',
            contextQuestion:
              'A divergencia ocorre em periodo critico de compliance?',
            urgencyTrigger: 'impacto-regulatorio',
            urgencyQuestion: 'Qual o impacto regulatorio em aberto?',
            criticalLeaf: {
              answerTrigger: 'critico',
              subjectName: 'Auditoria de acesso com trilha incompleta',
              targetGroupName: 'Segurança da Informação',
            },
            controlledLeaf: {
              answerTrigger: 'controlado',
              subjectName: 'Auditoria de acesso com evidencia divergente',
              targetGroupName: 'Segurança da Informação',
            },
          }),
        ],
      ),
    ]),
    createBranch('dados-gestao', 'Qual contexto de dados e gestao precisa de suporte?', [
      createBranch(
        'indicadores-bi',
        'A dor esta em indicadores executivos ou relatorios operacionais?',
        [
          createDeepSubBranch({
            answerTrigger: 'dashboard-financeiro',
            question: 'A falha esta no dashboard financeiro?',
            diagnosticTrigger: 'consistencia-kpis',
            diagnosticQuestion:
              'Existe inconsistencia em KPIs financeiros exibidos no painel?',
            contextTrigger: 'rotina-atualizacao',
            contextQuestion:
              'A anomalia ocorre na rotina de atualizacao dos dados?',
            urgencyTrigger: 'impacto-diretoria',
            urgencyQuestion:
              'Qual o impacto para leitura executiva e tomada de decisao?',
            criticalLeaf: {
              answerTrigger: 'critico',
              subjectName: 'Dashboard financeiro com metrica incorreta',
              targetGroupName: 'BI',
            },
            controlledLeaf: {
              answerTrigger: 'controlado',
              subjectName: 'Dashboard financeiro sem atualizacao diaria',
              targetGroupName: 'BI',
            },
          }),
          createDeepSubBranch({
            answerTrigger: 'relatorio-operacional',
            question: 'A falha esta no relatorio operacional?',
            diagnosticTrigger: 'filtro-recorte',
            diagnosticQuestion:
              'A inconsistencia esta no filtro, recorte ou agregacao?',
            contextTrigger: 'janela-consulta',
            contextQuestion:
              'A lentidao ocorre em consultas de alto volume?',
            urgencyTrigger: 'impacto-time-operacao',
            urgencyQuestion: 'Qual o impacto direto no time de operacao?',
            criticalLeaf: {
              answerTrigger: 'critico',
              subjectName: 'Relatorio operacional com filtros inconsistentes',
              targetGroupName: 'Geral',
            },
            controlledLeaf: {
              answerTrigger: 'controlado',
              subjectName: 'Relatorio operacional com lentidao critica',
              targetGroupName: 'Plataforma e Performance',
            },
          }),
        ],
      ),
      createBranch(
        'planejamento-governanca',
        'A dor esta em planejamento financeiro ou governanca de dados?',
        [
          createDeepSubBranch({
            answerTrigger: 'custos-orcamento',
            question: 'A falha ocorre no planejamento de custos?',
            diagnosticTrigger: 'alocacao-centros',
            diagnosticQuestion:
              'A alocacao por centro de custo ou rateio esta incorreta?',
            contextTrigger: 'ciclo-orcamentario',
            contextQuestion:
              'O problema surgiu no ciclo atual de planejamento?',
            urgencyTrigger: 'impacto-previsao',
            urgencyQuestion:
              'Qual o impacto na previsao financeira da empresa cliente?',
            criticalLeaf: {
              answerTrigger: 'critico',
              subjectName: 'Planejamento de custos com centro incorreto',
              targetGroupName: 'Finanças',
            },
            controlledLeaf: {
              answerTrigger: 'controlado',
              subjectName: 'Planejamento de custos com rateio incorreto',
              targetGroupName: 'Finanças',
            },
          }),
          createDeepSubBranch({
            answerTrigger: 'qualidade-cadastro',
            question: 'A falha ocorre na qualidade de dados mestres?',
            diagnosticTrigger: 'integridade-cadastro',
            diagnosticQuestion:
              'Existe duplicidade, lacuna ou padrao inconsistente de cadastro?',
            contextTrigger: 'governanca-time',
            contextQuestion:
              'A governanca atual cobre todo o ciclo de vida dos dados?',
            urgencyTrigger: 'impacto-confiabilidade',
            urgencyQuestion:
              'Qual o impacto na confiabilidade das decisoes do negocio?',
            criticalLeaf: {
              answerTrigger: 'critico',
              subjectName: 'Governanca de dados com cadastro duplicado',
              targetGroupName: 'Geral',
            },
            controlledLeaf: {
              answerTrigger: 'controlado',
              subjectName: 'Governanca de dados com qualidade insuficiente',
              targetGroupName: 'Geral',
            },
          }),
        ],
      ),
    ]),
  ],
};

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
  const accessCode = generateCompanyAccessCode();
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

  const seededAgents: SeededAgent[] = [];

  for (const agent of PRO4TECH_AGENTS) {
    const agentUser = await upsertUser(company.id, agent);
    await upsertAgent(agentUser.id, agent);

    seededAgents.push({
      id: agentUser.id,
      email: agent.email,
      supportLevel: agent.supportLevel,
      groupNames: agent.groupNames,
    });
  }

  console.log(`✅ Pro4Tech users seeded (${seededAgents.length} agents + 1 admin)`);

  return { companyId: company.id, adminId: admin.id, agents: seededAgents };
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
  const supportGroupIdsByName = new Map<string, string>();

  for (const group of SUPPORT_GROUPS) {
    const existing = await prisma.supportGroup.findFirst({
      where: { name: group.name },
      select: { id: true },
    });

    const persistedGroup = existing
      ? await prisma.supportGroup.update({
          where: { id: existing.id },
          data: {
            description: group.description,
            isActive: true,
          },
          select: { id: true, name: true },
        })
      : await prisma.supportGroup.create({
          data: {
            id: uuidv7(),
            name: group.name,
            description: group.description,
            isActive: true,
          },
          select: { id: true, name: true },
        });

    supportGroupIdsByName.set(persistedGroup.name, persistedGroup.id);
  }

  if (supportGroupIdsByName.size !== SUPPORT_GROUPS.length) {
    throw new Error(
      `Unexpected support group count: expected ${SUPPORT_GROUPS.length} and got ${supportGroupIdsByName.size}`,
    );
  }

  for (const requiredName of REQUIRED_GROUP_NAMES) {
    if (!supportGroupIdsByName.has(requiredName)) {
      throw new Error(
        `Required support group "${requiredName}" was not created in seed`,
      );
    }
  }

  console.log(`✅ Support groups seeded (${supportGroupIdsByName.size})`);

  return supportGroupIdsByName;
}

async function seedTicketSubjects() {
  const subjectIdsByName = new Map<string, string>();

  for (const subject of TICKET_SUBJECTS) {
    const existing = await prisma.ticketSubject.findFirst({
      where: { name: subject.name },
      select: { id: true },
    });

    const persistedSubject = existing
      ? await prisma.ticketSubject.update({
          where: { id: existing.id },
          data: {
            description: subject.description,
            isActive: true,
          },
          select: { id: true, name: true },
        })
      : await prisma.ticketSubject.create({
          data: {
            id: uuidv7(),
            name: subject.name,
            description: subject.description,
            isActive: true,
          },
          select: { id: true, name: true },
        });

    subjectIdsByName.set(persistedSubject.name, persistedSubject.id);
  }

  if (subjectIdsByName.size !== TICKET_SUBJECTS.length) {
    throw new Error(
      `Unexpected ticket subject count: expected ${TICKET_SUBJECTS.length} and got ${subjectIdsByName.size}`,
    );
  }

  console.log(`✅ Ticket subjects seeded (${subjectIdsByName.size})`);

  return subjectIdsByName;
}

function getMinimumDepthToLeaf(node: TriageNodeSeed): number {
  const children = node.children ?? [];
  if (children.length === 0) {
    return 0;
  }

  return 1 + Math.min(...children.map((child) => getMinimumDepthToLeaf(child)));
}

function countLeafNodes(node: TriageNodeSeed): number {
  const children = node.children ?? [];
  if (children.length === 0) {
    return 1;
  }

  return children.reduce((sum, child) => sum + countLeafNodes(child), 0);
}

function assertUniqueSiblingTriggers(
  children: TriageNodeSeed[],
  parentPath: string,
) {
  const siblingTriggers = new Set<string>();

  for (const child of children) {
    if (!child.answerTrigger) {
      throw new Error(
        `Missing answerTrigger for child under ${parentPath}. Every non-root child must have answerTrigger.`,
      );
    }

    if (siblingTriggers.has(child.answerTrigger)) {
      throw new Error(
        `Duplicated answerTrigger "${child.answerTrigger}" under ${parentPath}.`,
      );
    }

    siblingTriggers.add(child.answerTrigger);
  }
}

function validateTriageNode(node: TriageNodeSeed, path: string, isRoot = false) {
  const children = node.children ?? [];
  const isLeaf = children.length === 0;

  if (!isRoot && !node.answerTrigger) {
    throw new Error(`Node ${path} must contain answerTrigger`);
  }

  if (isLeaf) {
    if (node.question) {
      throw new Error(`Leaf node ${path} cannot contain question`);
    }
    if (!node.subjectName || !node.targetGroupName) {
      throw new Error(
        `Leaf node ${path} must contain subjectName and targetGroupName`,
      );
    }
    return;
  }

  if (!node.question) {
    throw new Error(`Non-leaf node ${path} must contain question`);
  }

  if (node.subjectName || node.targetGroupName) {
    throw new Error(
      `Non-leaf node ${path} cannot contain subjectName or targetGroupName`,
    );
  }

  if (!isRoot && children.length > TRIAGE_MAX_OPTIONS_PER_QUESTION) {
    throw new Error(
      `Node ${path} cannot contain more than ${TRIAGE_MAX_OPTIONS_PER_QUESTION} answer options`,
    );
  }

  assertUniqueSiblingTriggers(children, path);

  for (const child of children) {
    validateTriageNode(
      child,
      `${path}/${child.answerTrigger ?? 'missing-trigger'}`,
      false,
    );
  }
}

function validateTriageBlueprint(root: TriageNodeSeed) {
  if (root.answerTrigger) {
    throw new Error('Root triage node cannot contain answerTrigger');
  }

  if (!root.question) {
    throw new Error('Root triage node must contain question');
  }

  const rootChildren = root.children ?? [];
  if (rootChildren.length !== 4) {
    throw new Error(
      `Root triage node must contain exactly 4 answer triggers, received ${rootChildren.length}`,
    );
  }

  validateTriageNode(root, 'root', true);

  for (const rootChild of rootChildren) {
    const rootChildOptions = rootChild.children ?? [];
    if (rootChildOptions.length !== 2) {
      throw new Error(
        `Branch ${rootChild.answerTrigger} must contain exactly 2 options, received ${rootChildOptions.length}`,
      );
    }

    const minDepth = getMinimumDepthToLeaf(rootChild);
    if (minDepth < TRIAGE_MIN_DEPTH_PER_ROOT_BRANCH) {
      throw new Error(
        `Branch ${rootChild.answerTrigger} has min depth ${minDepth} and must be at least ${TRIAGE_MIN_DEPTH_PER_ROOT_BRANCH}`,
      );
    }
  }
}

async function createTriageNodeRecursive(
  node: TriageNodeSeed,
  parentId: string | null,
  subjectIdsByName: Map<string, string>,
  supportGroupIdsByName: Map<string, string>,
  depth: number,
): Promise<TriageStats> {
  const children = node.children ?? [];
  const isLeaf = children.length === 0;

  let subjectId: string | null = null;
  let targetGroupId: string | null = null;

  if (isLeaf) {
    if (!node.subjectName || !node.targetGroupName) {
      throw new Error('Leaf node missing subjectName or targetGroupName');
    }

    subjectId = subjectIdsByName.get(node.subjectName) ?? null;
    targetGroupId = supportGroupIdsByName.get(node.targetGroupName) ?? null;

    if (!subjectId) {
      throw new Error(`Subject "${node.subjectName}" not found while creating triage`);
    }
    if (!targetGroupId) {
      throw new Error(
        `Support group "${node.targetGroupName}" not found while creating triage`,
      );
    }
  }

  const createdNode = await prisma.triageRule.create({
    data: {
      id: uuidv7(),
      parentId,
      question: isLeaf ? null : node.question ?? null,
      answerTrigger: node.answerTrigger ?? null,
      isLeaf,
      targetGroupId,
      subjectId,
    },
    select: { id: true },
  });

  let totalNodes = 1;
  let leafNodes = isLeaf ? 1 : 0;
  let maxDepth = depth;

  for (const child of children) {
    const childStats = await createTriageNodeRecursive(
      child,
      createdNode.id,
      subjectIdsByName,
      supportGroupIdsByName,
      depth + 1,
    );

    totalNodes += childStats.totalNodes;
    leafNodes += childStats.leafNodes;
    maxDepth = Math.max(maxDepth, childStats.maxDepth);
  }

  return { totalNodes, leafNodes, maxDepth };
}

async function seedTriageRules(
  subjectIdsByName: Map<string, string>,
  supportGroupIdsByName: Map<string, string>,
) {
  const triageRootBlueprint = REQUESTED_TRIAGE_ROOT_BLUEPRINT;

  validateTriageBlueprint(triageRootBlueprint);

  console.log('🌳 Creating compact triage rules tree...');

  const stats = await createTriageNodeRecursive(
    triageRootBlueprint,
    null,
    subjectIdsByName,
    supportGroupIdsByName,
    0,
  );

  console.log(
    `✅ Triage rules seeded (${stats.totalNodes} nodes, ${stats.leafNodes} leaves, max depth ${stats.maxDepth})`,
  );

  for (const branch of triageRootBlueprint.children ?? []) {
    const minDepth = getMinimumDepthToLeaf(branch);
    const leafCount = countLeafNodes(branch);
    const firstQuestion = branch.question ?? 'sem pergunta';
    console.log(
      `   - Branch ${branch.answerTrigger}: min depth ${minDepth}, leaves ${leafCount}, question "${firstQuestion}"`,
    );
  }
}

async function seedAgentGroupAssignments(
  agents: SeededAgent[],
  supportGroupIdsByName: Map<string, string>,
) {
  let persistedAssignments = 0;
  const assignmentKeys = new Set<string>();

  for (const agent of agents) {
    if (agent.groupNames.length === 0) {
      throw new Error(
        `Agent ${agent.email} must have at least one support group assignment`,
      );
    }

    for (const groupName of agent.groupNames) {
      const supportGroupId = supportGroupIdsByName.get(groupName);
      if (!supportGroupId) {
        throw new Error(
          `Support group "${groupName}" was not found for agent ${agent.email}`,
        );
      }

      const dedupKey = `${agent.id}:${supportGroupId}`;
      if (assignmentKeys.has(dedupKey)) {
        continue;
      }

      assignmentKeys.add(dedupKey);

      await prisma.agentGroup.upsert({
        where: {
          agentId_supportGroupId: {
            agentId: agent.id,
            supportGroupId,
          },
        },
        update: {
          assignedAt: new Date(),
        },
        create: {
          agentId: agent.id,
          supportGroupId,
        },
      });

      persistedAssignments += 1;
    }
  }

  console.log(`✅ Agent groups seeded (${persistedAssignments} assignments)`);
}

function summarizeSupportLevels(agents: SeededAgent[]) {
  const summary: Record<SupportLevel, number> = {
    [SupportLevel.LEVEL_1]: 0,
    [SupportLevel.LEVEL_2]: 0,
    [SupportLevel.LEVEL_3]: 0,
  };

  for (const agent of agents) {
    summary[agent.supportLevel] += 1;
  }

  return summary;
}

async function logSeedSummary(agents: SeededAgent[]) {
  const [agentCount, agentGroupCount, triageNodes, triageLeaves] =
    await Promise.all([
      prisma.agent.count(),
      prisma.agentGroup.count(),
      prisma.triageRule.count(),
      prisma.triageRule.count({ where: { isLeaf: true } }),
    ]);

  const levelSummary = summarizeSupportLevels(agents);

  console.log('📈 Seed summary:');
  console.log(`   Agents total: ${agentCount}`);
  console.log(
    `   Agents by level: L1=${levelSummary[SupportLevel.LEVEL_1]}, L2=${levelSummary[SupportLevel.LEVEL_2]}, L3=${levelSummary[SupportLevel.LEVEL_3]}`,
  );
  console.log(`   AgentGroup assignments: ${agentGroupCount}`);
  console.log(`   Triage nodes: ${triageNodes}`);
  console.log(`   Triage leaves: ${triageLeaves}`);
}

async function main() {
  if (await databaseHasData()) {
    console.log('🧹 Wiping existing data...');
    await wipeDatabase();
  }

  console.log('🌱 Starting seed...\n');

  console.log('👥 Creating Pro4Tech company and users...');
  const pro4TechSeed = await seedPro4Tech();

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
        name: 'client',
        email: 'client@client.com',
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
  const supportGroupIdsByName = await seedSupportGroups();

  console.log('🏷️ Creating ticket subjects...');
  const subjectIdsByName = await seedTicketSubjects();

  console.log('🌳 Creating triage rules...');
  await seedTriageRules(subjectIdsByName, supportGroupIdsByName);

  console.log('🧩 Assigning agents to support groups...');
  await seedAgentGroupAssignments(pro4TechSeed.agents, supportGroupIdsByName);

  await logSeedSummary(pro4TechSeed.agents);

  console.log('\n✨ Seed completed successfully!');
  console.log('📊 Test credentials:');
  console.log('   Email: admin@pro4tech.com');
  console.log(`   Password: ${DEFAULT_PASSWORD}`);
}

main()
  .catch(async (error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });