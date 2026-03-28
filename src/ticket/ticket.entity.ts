export enum TicketStatus {
  TRIAGE = 'TRIAGE',
  OPENED = 'OPENED',
  ESCALATED = 'ESCALATED',
  CLOSED = 'CLOSED',
  RESOLVED = 'RESOLVED'
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  HIGHEST = 'HIGHEST'
}

export class Ticket {
  private created_at: Date = new Date();
  private updated_at: Date = new Date();
  private closed_at: Date | null = null;

  constructor(
    private ticket_id: string,
    private company_id: string,
    private client_id: string,
    private agent_id: string | null,
    private support_group_id: string | null,
    private subject_id: string | null,
    private status: TicketStatus = TicketStatus.TRIAGE,
    private priority: TicketPriority | null = null,
    private rating_score: number | null = null,
    private rating_comment: string | null = null
  ) {}

  // GETTERS
  getTicketId() { return this.ticket_id; }
  getCompanyId() { return this.company_id; }
  getClientId() { return this.client_id; }
  getAgentId() { return this.agent_id; }
  getSupportGroupId() { return this.support_group_id; }
  getSubjectId() { return this.subject_id; }
  getStatus() { return this.status; }
  getPriority() { return this.priority; }
  getRatingScore() { return this.rating_score; }
  getRatingComment() { return this.rating_comment; }

  private touch(): void {
    this.updated_at = new Date();
  }

  assignAgent(agent_id: string): void {
    if (this.status === TicketStatus.CLOSED) {
      throw new Error('Não é possível atribuir um agente a um ticket fechado.');
    }

    this.agent_id = agent_id;

    if (this.status === TicketStatus.TRIAGE) {
      this.status = TicketStatus.OPENED;
    }

    this.touch();
  }

  escalate(): void {
    if (this.status !== TicketStatus.OPENED) {
      throw new Error('Só é possível escalar tickets abertos.');
    }

    this.status = TicketStatus.ESCALATED;
    this.touch();
  }

  closeTicket(): void {
    if (this.status === TicketStatus.CLOSED) {
      throw new Error('Ticket já está fechado.');
    }

    this.status = TicketStatus.CLOSED;
    this.closed_at = new Date();
    this.touch();
  }

  updatePriority(priority: TicketPriority): void {
    this.priority = priority;
    this.touch();
  }

  addRating(score: number, comment?: string): void {
    if (score < 0 || score > 5) {
      throw new Error('Score deve ser entre 0 e 5.');
    }

    this.rating_score = score;
    if (comment) this.rating_comment = comment;

    this.touch();
  }
}

