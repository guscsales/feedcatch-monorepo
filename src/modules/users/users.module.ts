import { Module } from '@nestjs/common';
import { UserService } from '@/modules/users/services/user.service';
import { SharedModule } from '@/modules/shared/shared.module';

@Module({
  imports: [SharedModule],
  exports: [UserService],
  providers: [UserService],
})
export class UsersModule {}
