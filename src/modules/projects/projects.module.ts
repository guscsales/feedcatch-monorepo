import { Module } from '@nestjs/common';
import { ProjectService } from '@/modules/projects/services/project.service';
import { ProjectsController } from '@/modules/projects/controllers/projects.controller';
import { SharedModule } from '@/modules/shared/shared.module';

@Module({
  imports: [SharedModule],
  providers: [ProjectService],
  controllers: [ProjectsController],
})
export class ProjectsModule {}
