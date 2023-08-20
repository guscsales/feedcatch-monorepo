import { DatabaseService } from '@/modules/shared/database/database.service';
import { Injectable, Logger, NotAcceptableException } from '@nestjs/common';
import rand from '@/helpers/services/rand';
import normalizeString from '@/helpers/services/normalize-string';

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);

  constructor(private databaseService: DatabaseService) {}

  async fetch() {
    const items = await this.databaseService.project.findMany();

    return items;
  }

  async getBySlug({ slug }: { slug: string }) {
    const data = await this.databaseService.project.findFirst({
      where: { slug },
    });

    return data;
  }

  async create({ name }: { name: string }) {
    const slug = normalizeString(name);
    const slugExists = await this.getBySlug({ slug });

    if (slugExists) {
      const e = new NotAcceptableException('Project slug already exists');
      this.logger.error(e.message);
      throw e;
    }

    let foundKeyToUse = false;
    let projectId;

    while (!foundKeyToUse) {
      // Generate random key
      projectId = rand(2);

      const keyCount = await this.databaseService.project.count({
        where: { projectId },
      });
      foundKeyToUse = keyCount === 0;
    }

    this.logger.log('Found a project id for project');

    const data = await this.databaseService.project.create({
      data: {
        name,
        slug,
        projectId,
      },
    });

    this.logger.log(`Project ${data.id} created!`);

    return data;
  }

  async update({ id, name }: { id: string; name: string }) {
    const slug = normalizeString(name);
    const slugExists = await this.getBySlug({ slug });

    if (slugExists) {
      const e = new NotAcceptableException('Project slug already exists');
      this.logger.error(e.message);
      throw e;
    }

    const data = await this.databaseService.project.update({
      where: { id },
      data: {
        name,
        slug,
      },
    });

    this.logger.log(`Project ${data.id} updated!`);

    return data;
  }
}
