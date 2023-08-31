import { SubscriptionTypes } from '@prisma/client';

export const subscriptionsDataMapper = {
  [SubscriptionTypes.Free]: {
    type: SubscriptionTypes.Free,
    name: 'FeedCatch Free',
    lineItemId: '',
    priceId: '',
    features: {
      feedbacksLimit: 1,
    },
  },
  [SubscriptionTypes.Pro]: {
    type: SubscriptionTypes.Pro,
    name: 'FeedCatch Pro',
    lineItemId: 'li_1NiHntC5qal6Clj2tOyPMDok',
    priceId: 'price_1NhxyYC5qal6Clj2XDUXPVAs',
    features: {
      feedbacksLimit: undefined,
    },
  },
};
