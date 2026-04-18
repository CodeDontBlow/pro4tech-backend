import { Module } from '@nestjs/common';
import { PrismaModule } from './database/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { CompanyModule } from './modules/company/company.module';
import { TicketModule } from './modules/ticket/ticket.module';
import { SupportGroupModule } from './modules/support-group/support-group.module';
import { TriageRuleModule } from './modules/triage-rule/triage-rule.module';
import { TicketSubjectModule } from './modules/ticket-subject/ticket-subject.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      process.env.MONGO_URI ?? 'mongodb://localhost:27017/orbita-chat',
    ),
    PrismaModule,
    AuthModule,
    CompanyModule,
    UserModule,
    TicketModule,
    ChatModule,
    TriageRuleModule,
    TicketSubjectModule,
    SupportGroupModule,
  ],
})
export class AppModule {}
