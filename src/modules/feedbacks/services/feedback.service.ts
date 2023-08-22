import { DatabaseService } from '@/modules/shared/database/database.service';
import { Injectable, Logger } from '@nestjs/common';
import { set, subDays } from 'date-fns';

type FetchFromProjectIdFilters = {
  search?: string;
  startDate?: Date;
  endDate?: Date;
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

  constructor(private databaseService: DatabaseService) {}

  async fetchFromProjectId(
    projectId: string,
    { filters }: { filters: FetchFromProjectIdFilters },
  ) {
    const { search, startDate, endDate } = { ...defaultFilters, ...filters };

    const items = await this.databaseService.feedback.findMany({
      where: {
        projectId,
        OR: [
          { email: { startsWith: search } }, // filter by user email
          { email: { endsWith: search } }, // filter by providers
        ],
        AND: [{ createdAt: { gte: startDate, lte: endDate } }],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return items;
  }
}
