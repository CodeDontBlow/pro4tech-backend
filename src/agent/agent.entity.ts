export class Agent {
  constructor(
    private readonly agentId: string,
    private supportLevel: string,
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

  updateSupportLevel(supportLevel: string): void {
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
