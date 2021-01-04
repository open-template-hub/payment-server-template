/**
 * @description holds subscription controller
 */

import { PaymentConfigRepository } from '../repository/payment-config.repository';
import { SubscriptionRepository } from '../repository/subscription.repository';
import { v4 as uuidv4 } from 'uuid';
import { MongoDbProvider } from '@open-template-hub/common';

export class SubscriptionController {
  /**
   * saves a subscription
   * @param mongodb_provider mongodb provider
   * @param username username
   * @param payment_config_key payment config key
   * @param payload payload
   * @returns created subscription
   */
  saveSubscription = async (
    mongodb_provider: MongoDbProvider,
    username: string,
    payment_config_key: string,
    payload: object
  ) => {
    try {
      const paymentConfigRepository = await new PaymentConfigRepository().initialize(
        mongodb_provider.getConnection()
      );

      let paymentConfig: any = await paymentConfigRepository.getPaymentConfigByKey(
        payment_config_key
      );

      if (paymentConfig === null)
        throw new Error('Payment method can not be found');

      const subscriptionRepository = await new SubscriptionRepository().initialize(
        mongodb_provider.getConnection()
      );

      const subscription_id = uuidv4();

      await subscriptionRepository.createSubscription(
        subscription_id,
        payment_config_key,
        username,
        payload
      );
      return subscription_id;
    } catch (error) {
      console.error('> saveSubscription error: ', error);
      throw error;
    }
  };

  /**
   * gets subscription by subscription id
   * @param mongodb_provider mongodb provider
   * @param subscription_id subscription id
   * @returns subscription
   */
  getSubscription = async (
    mongodb_provider: MongoDbProvider,
    subscription_id: string
  ) => {
    try {
      const subscriptionRepository = await new SubscriptionRepository().initialize(
        mongodb_provider.getConnection()
      );

      return await subscriptionRepository.getSubscription(subscription_id);
    } catch (error) {
      console.error('> getSubscription error: ', error);
      throw error;
    }
  };

  /**
   * gets user's subscriptions
   * @param mongodb_provider mongodb provider
   * @param username username
   * @returns subscriptions
   */
  getUserSubscriptions = async (
    mongodb_provider: MongoDbProvider,
    username: string
  ) => {
    try {
      const subscriptionRepository = await new SubscriptionRepository().initialize(
        mongodb_provider.getConnection()
      );

      return await subscriptionRepository.getUserSubscriptions(username);
    } catch (error) {
      console.error('> getUserSubscriptions error: ', error);
      throw error;
    }
  };
}
