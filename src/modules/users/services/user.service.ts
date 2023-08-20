import { DatabaseService } from '@/modules/shared/database/database.service';
import { Injectable, Logger, NotAcceptableException } from '@nestjs/common';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private databaseService: DatabaseService) {}

  async getByEmail(email: string) {
    const data = await this.databaseService.user.findUnique({
      where: { email },
    });

    return data;
  }

  async getById(id: string) {
    const data = await this.databaseService.user.findUnique({
      where: { id },
    });

    return data;
  }

  async createOnlyWithEmail({ email }: { email: string }) {
    const userExists = await this.getByEmail(email);

    if (userExists) {
      const e = new NotAcceptableException('User email already exists');
      this.logger.error(e.message);
      throw e;
    }

    const data = await this.databaseService.user.create({
      data: {
        email,
      },
    });

    return data;
  }
}
