import { PaymentConfigRepository } from "../repository/payment-config.repository";
import { SubscriptionRepository } from "../repository/subscription.repository";
import { v4 as uuidv4 } from "uuid";

export const saveSubscription = async (
  dbProviders,
  username,
  paymentConfigKey,
  payload
) => {
  try {
    const paymentConfigRepository = await new PaymentConfigRepository().initialize(
      dbProviders.mongoDbProvider.conn
    );

    let paymentConfig: any = await paymentConfigRepository.getPaymentConfigByKey(
      paymentConfigKey
    );

    if (paymentConfig === null)
      throw new Error("Payment method can not be found");

    const subscriptionRepository = await new SubscriptionRepository().initialize(
      dbProviders.mongoDbProvider.conn
    );

    const subscription_id = uuidv4();

    await subscriptionRepository.createSubscription(
      subscription_id,
      paymentConfigKey,
      username,
      payload
    );
    return subscription_id;
  } catch (error) {
    console.error("> saveSubscription error: ", error);
    throw error;
  }
};

export const getSubscription = async (dbProviders, subscription_id) => {
  try {
    const subscriptionRepository = await new SubscriptionRepository().initialize(
      dbProviders.mongoDbProvider.conn
    );

    return await subscriptionRepository.getSubscription(subscription_id);
  } catch (error) {
    console.error("> getSubscription error: ", error);
    throw error;
  }
}

export const getUserSubscriptions = async (dbProviders, username) => {
  try {
    const subscriptionRepository = await new SubscriptionRepository().initialize(
      dbProviders.mongoDbProvider.conn
    );

    return await subscriptionRepository.getUserSubscriptions(username);
  } catch (error) {
    console.error("> getUserSubscriptions error: ", error);
    throw error;
  }
}
