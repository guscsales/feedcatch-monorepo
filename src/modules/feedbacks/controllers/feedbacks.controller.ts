import { SchemaValidator } from '@/modules/shared/decorators/schema-validator.decorator';
import { Body, Controller, Get, Post, Query, Request } from '@nestjs/common';
import { searchFeedbacksValidator } from '@/modules/feedbacks/validators/search-feedbacks.validator';
import { FeedbackService } from '@/modules/feedbacks/services/feedback.service';
import { createFeedbackValidator } from '@/modules/feedbacks/validators/create-feedback.validator';

@Controller('feedbacks')
export class FeedbacksController {
  constructor(private feedbackService: FeedbackService) {}

  @Get('/search')
  @SchemaValidator(searchFeedbacksValidator, ['query', 'headers'])
  async searchFromProjectId(@Query() query, @Request() req) {
    const { q, startDate, endDate } = query;
    const projectId = req.headers['fc-project-id'];

    const items = await this.feedbackService.fetchFromProjectId(projectId, {
      filters: {
        ...query,
        search: q,
        startDate: startDate && new Date(startDate),
        endDate: endDate && new Date(endDate),
      },
    });

    return { items };
  }

  @Post()
  @SchemaValidator(createFeedbackValidator, ['body', 'headers'])
  async createFeedback(@Body() payload, @Request() req) {
    const projectId = req.headers['fc-project-id'];
    const userId = req.authUser.userId;

    const data = await this.feedbackService.create({
      userId,
      projectId,
      ...payload,
    });

    return data;
  }
}
