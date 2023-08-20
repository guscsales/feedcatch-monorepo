import { DatabaseService } from '@/modules/shared/database/database.service';
import { SchemaValidator } from '@/modules/shared/validators/schema-validator.decorator';
import { Injectable, Logger } from '@nestjs/common';
import { createProjectValidator } from '@/modules/projects/validators/create-project.validator';
import rand from '@/helpers/services/rand';

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);

  constructor(private databaseService: DatabaseService) {}

  async fetch() {
    const items = await this.databaseService.project.findMany();

    return items;
  }

  @SchemaValidator(createProjectValidator)
  async create({ name }: { name: string }) {
    const projectId = rand(3);

    console.log(projectId);

    // const data = await this.databaseService.project.create({
    //   data: {
    //     name,
    //   },
    // });
  }
}
