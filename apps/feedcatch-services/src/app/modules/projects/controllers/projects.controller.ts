import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import { ProjectService } from '@services/src/app/modules/projects/services/project.service';
import { SchemaValidator } from '@services/src/app/modules/shared/decorators/schema-validator.decorator';
import { createProjectValidator } from '@services/src/app/modules/projects/validators/create-project.validator';
import { updateProjectValidator } from '@services/src/app/modules/projects/validators/update-project.validator';

@Controller('projects')
export class ProjectsController {
  constructor(private projectService: ProjectService) {}

  @Get()
  public async fetch(@Request() req) {
    const items = await this.projectService.fetch({
      userId: req.authUser.userId,
    });

    return { items };
  }

  @Get('/slug/:slug')
  public async getBySlug(@Param('slug') slug: string, @Request() req) {
    const data = await this.projectService.getBySlug(slug, {
      userId: req.authUser.userId,
    });

    if (!data) {
      throw new NotFoundException();
    }

    return data;
  }

  @Post()
  @SchemaValidator(createProjectValidator)
  public async create(@Body() payload, @Request() req) {
    const data = await this.projectService.create({
      ...payload,
      userId: req.authUser.userId,
    });

    return data;
  }

  @Patch('/:id')
  @SchemaValidator(updateProjectValidator)
  public async update(
    @Param('id') id: string,
    @Body() payload,
    @Request() req
  ) {
    const data = await this.projectService.update(id, {
      ...payload,
      userId: req.authUser.userId,
    });

    return data;
  }
}
