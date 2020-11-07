import { SubscriptionDataModel } from '../data/subscription.data';

export class SubscriptionRepository {
  private dataModel: any = null;

  initialize = async (connection: any) => {
    this.dataModel = await new SubscriptionDataModel().getDataModel(connection);
    return this;
  };

  createSubscription = async (subscription_id, key, username, payload) => {
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

  getSubscription = async (subscription_id) => {
    try {
      return await this.dataModel.findOne({ subscription_id });
    } catch (error) {
      console.error('> getSubscription error: ', error);
      throw error;
    }
  };

  getUserSubscriptions = async (username) => {
    try {
      return await this.dataModel.find({ username });
    } catch (error) {
      console.error('> getUserSubscriptions error: ', error);
      throw error;
    }
  };
}
