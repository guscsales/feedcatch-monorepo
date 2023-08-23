import { Module } from '@nestjs/common';
import { UserService } from '@/modules/users/services/user.service';
import { SharedModule } from '@/modules/shared/shared.module';
import { UserSubscriptionService } from '@/modules/users/services/user-subscription.service';

@Module({
  imports: [SharedModule],
  exports: [UserService, UserSubscriptionService],
  providers: [UserService, UserSubscriptionService],
})
export class UsersModule {}
