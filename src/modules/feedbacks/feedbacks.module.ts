import { Module } from '@nestjs/common';
import { FeedbackService } from './services/feedback.service';
import { FeedbacksController } from './controllers/feedbacks.controller';
import { SharedModule } from '@/modules/shared/shared.module';
import { ProjectsModule } from '@/modules/projects/projects.module';

@Module({
  imports: [SharedModule, ProjectsModule],
  providers: [FeedbackService],
  controllers: [FeedbacksController],
})
export class FeedbacksModule {}
