import { Module } from '@nestjs/common';
import { PrismaModule } from '@database/prisma/prisma.module';
import { TriageRuleController } from './triage-rule.controller';
import { TriageRuleService } from './triage-rule.service';
import { TriageRuleRepository } from './triage-rule.repository';

@Module({
  imports: [PrismaModule],
  controllers: [TriageRuleController],
  providers: [TriageRuleService, TriageRuleRepository],
  exports: [TriageRuleService],
})
export class TriageRuleModule {}
