import { subscriptionsDataMapper } from '@/data/subscriptions-data-mapper';
import { ProjectService } from '@/modules/projects/services/project.service';
import { DatabaseService } from '@/modules/shared/database/database.service';
import { UserSubscriptionService } from '@/modules/users/services/user-subscription.service';
import { Injectable, Logger, NotAcceptableException } from '@nestjs/common';
import {
  FeedbackStatuses,
  FeedbackTypes,
  SubscriptionTypes,
} from '@prisma/client';
import { set, subDays } from 'date-fns';

type FetchFromProjectIdFilters = {
  search?: string;
  type?: FeedbackTypes;
  status?: FeedbackStatuses;
  startDate?: Date;
  endDate?: Date;
};

type CreateFeedbackParams = {
  projectId: string;
  userId: string;
  type: FeedbackTypes;
  content: string;
  url: string;
  userAgent: string;
  userEmail?: string;
};

type UpdateFeedbackStatusParams = {
  projectId: string;
  userId: string;
  status: FeedbackStatuses;
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
    private userSubscriptionService: UserSubscriptionService,
  ) {}

  async fetchFromProjectId(
    projectId: string,
    { filters }: { filters: FetchFromProjectIdFilters },
  ) {
    const { search, startDate, endDate, type, status } = {
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
        status,
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
    url,
    userAgent,
  }: CreateFeedbackParams) {
    const project = await this.projectService.getById(projectId, { userId });

    if (!project) {
      const e = new NotAcceptableException('Invalid project');
      this.logger.error(e.message);
      throw e;
    }

    this.logger.log('Found a project for passed id');

    const canCreateFeedback = await this.canCreateFeedback(userId);

    if (!canCreateFeedback) {
      const e = new NotAcceptableException(
        'You reach the limit of feedbacks on free, update to a paid plan to have unlimited.',
      );
      this.logger.error(e.message);
      throw e;
    }

    const data = await this.databaseService.feedback.create({
      data: {
        content: content.trim(),
        type,
        email: userEmail,
        projectId,
        status: FeedbackStatuses.Open,
        url,
        userAgent,
      },
    });

    this.logger.log('Feedback created');

    return data;
  }

  async updateStatus(
    id: string,
    { projectId, userId, status }: UpdateFeedbackStatusParams,
  ) {
    const project = await this.projectService.getById(projectId, { userId });

    if (!project) {
      const e = new NotAcceptableException('Invalid project');
      this.logger.error(e.message);
      throw e;
    }

    this.logger.log('Found a project for passed id');

    const data = await this.databaseService.feedback.update({
      where: { id },
      data: {
        status,
      },
    });

    this.logger.log('Feedback status updated');

    return data;
  }

  async canCreateFeedback(userId: string) {
    const { subscriptionType } =
      await this.userSubscriptionService.getFromUserId(userId);

    const feedbacksCount = await this.databaseService.feedback.count({
      where: {
        project: {
          userId,
        },
      },
    });

    if (subscriptionType === SubscriptionTypes.Pro) {
      return true;
    }

    return (
      feedbacksCount <=
      subscriptionsDataMapper[subscriptionType].features.feedbacksLimit
    );
  }
}
