import rand from '@/helpers/services/rand';
import { DatabaseService } from '@/modules/shared/database/database.service';
import { UserService } from '@/modules/users/services/user.service';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { addDays, isBefore } from 'date-fns';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private databaseService: DatabaseService,
    private userService: UserService,
  ) {}

  async authenticateFromMagicLink({ token }: { token: string }) {
    const data = await this.databaseService.userMagicAuthentication.findUnique({
      where: { token },
      include: {
        user: true,
      },
    });

    const isTokenValid = isBefore(new Date(), new Date(data?.expires));

    if (!isTokenValid) {
      const e = new UnauthorizedException('Invalid token');
      this.logger.error(`User ${data?.user?.id}: ${e.message}`);
      throw e;
    }

    await this.databaseService.userMagicAuthentication.delete({
      where: { token },
    });

    // TODO: Implement JWT

    const accessToken = 'tbd';
    const expires = addDays(new Date(), 1);
    const refreshToken = 'tbd_2';

    return { accessToken, expires, refreshToken };
  }

  async loginOrCreateFromMagicLink({ email }: { email: string }) {
    let user = await this.userService.getByEmail(email);

    if (user) {
      const userMagicAuthentication =
        await this.databaseService.userMagicAuthentication.findFirst({
          where: { userId: user?.id },
        });

      if (userMagicAuthentication) {
        await this.databaseService.userMagicAuthentication.delete({
          where: { token: userMagicAuthentication.token },
        });

        this.logger.log(`User ${user.id} delete token that already exists`);
      }
    } else {
      user = await this.userService.createOnlyWithEmail({ email });

      this.logger.log(`User ${user.id} created from magic link`);
    }

    // Register a new token for magic link
    let foundTokenToUse = false;
    let token;

    while (!foundTokenToUse) {
      // Generate random key
      token = rand(6);

      const tokenCount =
        await this.databaseService.userMagicAuthentication.count({
          where: { token },
        });
      foundTokenToUse = tokenCount === 0;
    }

    this.logger.log('Found a token for login');

    await this.databaseService.userMagicAuthentication.create({
      data: {
        userId: user.id,
        token,
        expires: addDays(new Date(), 1),
      },
    });

    this.logger.log(`User ${user.id} Token created`);

    // TODO: send token using email
  }
}
