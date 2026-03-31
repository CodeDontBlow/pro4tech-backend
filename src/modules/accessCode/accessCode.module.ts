import { Module } from '@nestjs/common';
import { AccessCodeService } from './accessCode.service';

@Module({
  providers: [AccessCodeService],
  exports: [AccessCodeService],
})
export class AccessCodeModule {}
