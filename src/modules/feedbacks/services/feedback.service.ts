import { ProjectService } from '@/modules/projects/services/project.service';
import { DatabaseService } from '@/modules/shared/database/database.service';
import { Injectable, Logger, NotAcceptableException } from '@nestjs/common';
import { FeedbackTypes } from '@prisma/client';
import { set, subDays } from 'date-fns';

type FetchFromProjectIdFilters = {
  search?: string;
  type?: FeedbackTypes;
  startDate?: Date;
  endDate?: Date;
};

type CreateFeedbackParams = {
  projectId: string;
  userId: string;
  type: FeedbackTypes;
  content: string;
  userEmail?: string;
};

const defaultFilters: FetchFromProjectIdFilters = {
  search: '',
  startDate: subDays(
    set(new Date(), { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }),
    7,
  ),
  endDate: set(new Date(), {
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  }),
};

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(
    private databaseService: DatabaseService,
    private projectService: ProjectService,
  ) {}

  async fetchFromProjectId(
    projectId: string,
    { filters }: { filters: FetchFromProjectIdFilters },
  ) {
    const { search, startDate, endDate, type } = {
      ...defaultFilters,
      ...filters,
    };

    const items = await this.databaseService.feedback.findMany({
      where: {
        projectId,
        ...(search
          ? {
              OR: [
                { email: { startsWith: search } }, // filter by user email
                { email: { endsWith: search } }, // filter by providers
              ],
            }
          : {}),
        type,
        createdAt: { gte: startDate, lte: endDate },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return items;
  }

  async create({
    content,
    projectId,
    userId,
    type,
    userEmail,
  }: CreateFeedbackParams) {
    const project = await this.projectService.getById(projectId, { userId });

    if (!project) {
      const e = new NotAcceptableException('Invalid project');
      this.logger.error(e.message);
      throw e;
    }

    this.logger.log('Found a project for passed id');

    const data = await this.databaseService.feedback.create({
      data: {
        content: content.trim(),
        type,
        email: userEmail,
        projectId,
      },
    });

    this.logger.log('Feedback created');

    return data;
  }
}
