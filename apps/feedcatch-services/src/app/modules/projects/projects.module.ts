import { Module } from '@nestjs/common';
import { ProjectService } from '@services/src/app/modules/projects/services/project.service';
import { ProjectsController } from '@services/src/app/modules/projects/controllers/projects.controller';
import { SharedModule } from '@services/src/app/modules/shared/shared.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [SharedModule, UsersModule],
  exports: [ProjectService],
  providers: [ProjectService],
  controllers: [ProjectsController],
})
export class ProjectsModule {}
