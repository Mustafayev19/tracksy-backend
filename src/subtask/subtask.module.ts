import { Module } from '@nestjs/common';
import { SubtaskController } from './subtask.controller';
import { SubtaskService } from './subtask.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [SubtaskController],
  providers: [SubtaskService, PrismaService],
})
export class SubtaskModule {}
