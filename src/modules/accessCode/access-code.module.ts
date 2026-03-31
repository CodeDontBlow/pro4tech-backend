import { Module } from '@nestjs/common';
import { AccessCodeService } from './access-code.service';

@Module({
  providers: [AccessCodeService],
  exports: [AccessCodeService],
})
export class AccessCodeModule {}
