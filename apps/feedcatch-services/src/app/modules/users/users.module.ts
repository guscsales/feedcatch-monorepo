import { Module } from '@nestjs/common';
import { UserService } from '@services/src/app/modules/users/services/user.service';
import { SharedModule } from '@services/src/app/modules/shared/shared.module';
import { UserSubscriptionService } from '@services/src/app/modules/users/services/user-subscription.service';

@Module({
  imports: [SharedModule],
  exports: [UserService, UserSubscriptionService],
  providers: [UserService, UserSubscriptionService],
})
export class UsersModule {}
