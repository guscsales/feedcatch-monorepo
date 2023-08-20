import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { ProjectService } from '@/modules/projects/services/project.service';
import { SchemaValidator } from '@/modules/shared/validators/schema-validator.decorator';
import { createProjectValidator } from '@/modules/projects/validators/create-project.validator';

@Controller('projects')
export class ProjectsController {
  constructor(private projectService: ProjectService) {}

  @Get()
  public async fetch() {
    const items = await this.projectService.fetch();

    return { items };
  }

  @Get('/slug/:slug')
  public async getBySlug(@Param('slug') slug: string) {
    const data = await this.projectService.getBySlug({ slug });

    if (!data) {
      throw new NotFoundException();
    }

    return data;
  }

  @Post()
  @SchemaValidator(createProjectValidator)
  public async create(@Body() payload) {
    const data = await this.projectService.create(payload);

    return data;
  }
}
