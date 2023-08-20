import { Module } from '@nestjs/common';
import { ProjectService } from './services/project.service';

@Module({
  providers: [ProjectService],
})
export class ProjectsModule {}
