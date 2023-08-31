import { SchemaValidator } from '@services/src/app/modules/shared/decorators/schema-validator.decorator';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { searchFeedbacksValidator } from '@services/src/app/modules/feedbacks/validators/search-feedbacks.validator';
import { FeedbackService } from '@services/src/app/modules/feedbacks/services/feedback.service';
import { createFeedbackValidator } from '@services/src/app/modules/feedbacks/validators/create-feedback.validator';
import { updateFeedbackStatusValidator } from '../validators/update-feedback-status.validator';

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

  @Patch(':id/status')
  @SchemaValidator(updateFeedbackStatusValidator, ['body', 'headers'])
  async updateFeedbackStatus(
    @Param('id') id: string,
    @Body() { status },
    @Request() req
  ) {
    const projectId = req.headers['fc-project-id'];
    const userId = req.authUser.userId;

    await this.feedbackService.updateStatus(id, {
      userId,
      projectId,
      status,
    });
  }
}
