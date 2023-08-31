import { DatabaseService } from '@services/src/app/modules/shared/database/database.service';
import { Injectable, Logger, NotAcceptableException } from '@nestjs/common';
import rand from '@services/src/app/helpers/services/rand';
import normalizeString from '@services/src/app/helpers/services/normalize-string';
import { UserService } from '@services/src/app/modules/users/services/user.service';

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);

  constructor(
    private databaseService: DatabaseService,
    private userService: UserService
  ) {}

  async fetch({ userId }: { userId: string }) {
    const items = await this.databaseService.project.findMany({
      where: { userId },
    });

    return items;
  }

  async getBySlug(slug: string, { userId }: { userId: string }) {
    const data = await this.databaseService.project.findFirst({
      where: { slug, userId },
    });

    return data;
  }

  async getById(id: string, { userId }: { userId: string }) {
    const data = await this.databaseService.project.findUnique({
      where: { id, userId },
    });

    return data;
  }

  async create({ name, userId }: { name: string; userId: string }) {
    const userExists = await this.userService.userExists(userId);

    if (!userExists) {
      const e = new NotAcceptableException('User not exists');
      this.logger.error(e.message);
      throw e;
    }

    const slug = normalizeString(name);
    const slugExists = await this.getBySlug(slug, { userId });

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
        where: { id: projectId },
      });
      foundKeyToUse = keyCount === 0;
    }

    this.logger.log('Found a project id for project');

    const data = await this.databaseService.project.create({
      data: {
        id: projectId,
        name,
        slug,
        userId,
      },
    });

    this.logger.log(`Project ${data.id} created!`);

    return data;
  }

  async update(
    id: string,
    {
      name,
      userId,
    }: {
      name: string;
      userId: string;
    }
  ) {
    const slug = normalizeString(name);
    const slugExists = await this.getBySlug(slug, { userId });

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
        userId,
      },
    });

    this.logger.log(`Project ${data.id} updated!`);

    return data;
  }
}
