export enum SupportLevel {
  LEVEL_1 = 'LEVEL_1',
  LEVEL_2 = 'LEVEL_2',
  LEVEL_3 = 'LEVEL_3',
}

export class Agent {
  constructor(
    private readonly agentId: string,
    private supportLevel: SupportLevel,
    private canAnswer: boolean,
  ) {}

  getAgentId() {
    return this.agentId;
  }

  getSupportLevel() {
    return this.supportLevel;
  }

  getCanAnswer() {
    return this.canAnswer;
  }

  updateSupportLevel(supportLevel: SupportLevel): void {
    this.supportLevel = supportLevel;
  }

  updateCanAnswer(canAnswer: boolean): void {
    this.canAnswer = canAnswer;
  }

  toJSON() {
    return {
      agentId: this.agentId,
      supportLevel: this.supportLevel,
      canAnswer: this.canAnswer,
    };
  }
}
