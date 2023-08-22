import rand from '@/helpers/services/rand';
import { DatabaseService } from '@/modules/shared/database/database.service';
import { UserService } from '@/modules/users/services/user.service';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { addDays, isBefore } from 'date-fns';
import { JwtService } from '@nestjs/jwt';
import { TokenTypes, User } from '@prisma/client';
import { Resend } from 'resend';
import { MagicLink } from '@/templates/emails/magic-link';
import { render } from '@react-email/render';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private resend: Resend;

  constructor(
    private databaseService: DatabaseService,
    private userService: UserService,
    private jwtService: JwtService,
  ) {
    this.resend = new Resend(process.env.EMAIL_PROVIDER_API_KEY);
  }

  async authenticateFromMagicLink({ token }: { token: string }) {
    const data = await this.databaseService.userToken.findUnique({
      where: { token, type: TokenTypes.MagicLogin },
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

    const authTokens = await this.createAuthTokens({ user: data.user });

    return authTokens;
  }

  async loginOrCreateFromMagicLink({ email }: { email: string }) {
    let user = await this.userService.getByEmail(email);

    if (user) {
      const userToken = await this.databaseService.userToken.findFirst({
        where: { userId: user?.id },
      });

      if (userToken) {
        await this.databaseService.userToken.deleteMany({
          where: { userId: user.id },
        });

        this.logger.log(`User ${user.id} delete token that already exists`);
      }
    } else {
      user = await this.userService.createOnlyWithEmail({ email });

      this.logger.log(`User ${user.id} created from magic link`);
    }

    const { token } = await this.createToken({
      user,
      type: TokenTypes.MagicLogin,
      daysToExpire: 1,
    });

    await this.resend.emails.send({
      from: `${process.env.EMAIL_FROM_TEAM_NAME} <${process.env.EMAIL_FROM_NO_REPLY}>`,
      to: email,
      subject: 'You login access link for FeedCatch',
      html: render(MagicLink({ token })),
    });

    this.logger.log('Magic login email sent');
  }

  async reAuthenticateFromRefreshToken({ token }: { token: string }) {
    const data = await this.databaseService.userToken.findUnique({
      where: { token, type: TokenTypes.Refresh },
      include: { user: true },
    });

    const isTokenValid = isBefore(new Date(), new Date(data?.expires));

    if (!isTokenValid) {
      const e = new UnauthorizedException('Invalid token');
      this.logger.error(`User ${data?.user?.id}: ${e.message}`);
      throw e;
    }

    const authTokens = await this.createAuthTokens({ user: data.user });

    return authTokens;
  }

  async createAuthTokens({ user }: { user: User }) {
    await this.databaseService.userToken.deleteMany({
      where: { userId: user.id },
    });

    this.logger.log(`User ${user.id} tokens deleted`);

    const [accessToken, { token: refreshToken }] = await Promise.all([
      this.jwtService.signAsync(
        { sub: user.id },
        {
          expiresIn: '1 day',
        },
      ),
      this.createToken({
        user,
        type: TokenTypes.Refresh,
        daysToExpire: 5,
      }),
    ]);

    this.logger.log('Auth tokens created');

    return { accessToken, refreshToken };
  }

  private async createToken({
    user,
    type,
    daysToExpire,
  }: {
    user: User;
    type: TokenTypes;
    daysToExpire: number;
  }) {
    // Register a new token for magic link
    let foundTokenToUse = false;
    let token;

    while (!foundTokenToUse) {
      // Generate random key
      token = rand(6);

      const tokenCount = await this.databaseService.userToken.count({
        where: { token },
      });
      foundTokenToUse = tokenCount === 0;
    }

    this.logger.log(
      `Found a token for ${
        type === TokenTypes.MagicLogin ? 'magic login' : 'refresh'
      }`,
    );

    await this.databaseService.userToken.create({
      data: {
        userId: user.id,
        token,
        expires: addDays(new Date(), daysToExpire),
        type,
      },
    });

    this.logger.log(
      `User ${user.id} ${
        type === TokenTypes.MagicLogin ? 'magic login' : 'refresh'
      } token created`,
    );

    return { token };
  }
}
