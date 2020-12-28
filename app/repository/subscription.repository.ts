/**
 * @description holds Subscription repository
 */

import { SubscriptionDataModel } from '../data/subscription.data';

export class SubscriptionRepository {
  private dataModel: any = null;

  /**
   * initializes subscription repository
   * @param connection connection
   * @returns subscription repository
   */
  initialize = async (connection: any) => {
    this.dataModel = await new SubscriptionDataModel().getDataModel(connection);
    return this;
  };

  /**
   * creates subscription
   * @param subscription_id subscription id
   * @param key key
   * @param username username
   * @param payload payload
   * @returns created subscription
   */
  createSubscription = async (
    subscription_id: string,
    key: string,
    username: string,
    payload: any
  ) => {
    try {
      return await this.dataModel.create({
        subscription_id,
        key,
        username,
        payload,
      });
    } catch (error) {
      console.error('> createSubscription error: ', error);
      throw error;
    }
  };

  /**
   * gets subscription by subscription id
   * @param subscription_id subscription id
   * @returns subscription
   */
  getSubscription = async (subscription_id: string) => {
    try {
      return await this.dataModel.findOne({ subscription_id });
    } catch (error) {
      console.error('> getSubscription error: ', error);
      throw error;
    }
  };

  /**
   * gets user's subscriptions
   * @param username username
   * @returns subscriptions
   */
  getUserSubscriptions = async (username: string) => {
    try {
      return await this.dataModel.find({ username });
    } catch (error) {
      console.error('> getUserSubscriptions error: ', error);
      throw error;
    }
  };
}
