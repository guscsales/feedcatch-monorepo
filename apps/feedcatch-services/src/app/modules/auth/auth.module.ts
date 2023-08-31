import { Module } from '@nestjs/common';
import { AuthController } from '@services/src/app/modules/auth/controllers/auth.controller';
import { AuthService } from '@services/src/app/modules/auth/services/auth.service';
import { UsersModule } from '@services/src/app/modules/users/users.module';
import { SharedModule } from '@services/src/app/modules/shared/shared.module';

@Module({
  imports: [SharedModule, UsersModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
