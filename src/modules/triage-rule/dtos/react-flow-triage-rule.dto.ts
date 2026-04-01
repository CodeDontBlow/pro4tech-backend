/**
 * React Flow DTOs
 *
 * Estrutura otimizada para integração com React Flow (visualization library)
 * Formato: Flat (nodes + edges separados) para facilitar edição e visualização
 *
 * React Flow espera:
 * - nodes: Array de nós com {id, data, type, ...}
 * - edges: Array de conexões com {id, source, target, label, ...}
 */

/**
 * Node Data para React Flow
 * Armazena todos os dados da TriageRule que serão acessíveis no frontend
 */
export interface ReactFlowNodeData {
  // Identificação do nó
  id: string;
  label: string; // Para exibir no nó: para folhas = subject.name, para intermediárias = question

  // Dados da TriageRule
  question?: string;
  answerTrigger?: string;
  isLeaf: boolean;
  parentId?: string;

  // Relações
  subjectId?: string;
  targetGroupId?: string;

  // Dados relacionados (para não precisar fazer requisições adicionais)
  subject?: {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
  };

  supportGroup?: {
    id: string;
    name: string;
    description: string;
  };

  // Metadados para UI
  nodeType: 'root' | 'question' | 'leaf'; // Para facilitar styling/filtering
  childrenCount?: number; // Número de filhas
}

/**
 * Node React Flow
 * Estructura padrão esperada pela biblioteca React Flow
 */
export interface ReactFlowNode {
  id: string;
  data: ReactFlowNodeData;
  type?: string; // 'default' | 'input' | 'output' - opcionais
}

/**
 * Edge (Conexão) React Flow
 * Conecta source (parent) para target (child)
 */
export interface ReactFlowEdge {
  id: string; // Formato: "source->target" ou similar
  source: string; // ID do nó pai
  target: string; // ID do nó filho
  label?: string; // Label na aresta (ex: answerTrigger como "billing")
  animated?: boolean;
}

/**
 * Response DTO para React Flow - Formato Flat
 * Retorna toda a árvore em formato nodes+edges otimizado para React Flow
 */
export class ReactFlowTriageRuleDto {
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];

  constructor(nodes: ReactFlowNode[] = [], edges: ReactFlowEdge[] = []) {
    this.nodes = nodes;
    this.edges = edges;
  }
}

/**
 * Estrutura auxiliar para construir o React Flow DTO
 * (Usada internamente no service)
 */
export interface FlattenedTriageRule {
  id: string;
  parentId?: string;
  question?: string;
  answerTrigger?: string;
  isLeaf: boolean;
  targetGroupId?: string;
  subjectId?: string;
  subject?: {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
  };
  supportGroup?: {
    id: string;
    name: string;
    description: string;
  };
  children?: FlattenedTriageRule[];
}
