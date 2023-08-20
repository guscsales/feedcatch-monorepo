import { Module } from '@nestjs/common';
import { AuthController } from '@/modules/auth/controllers/auth.controller';
import { AuthService } from '@/modules/auth/services/auth.service';
import { UsersModule } from '@/modules/users/users.module';
import { SharedModule } from '@/modules/shared/shared.module';

@Module({
  imports: [SharedModule, UsersModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
