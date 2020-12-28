/**
 * @description holds Payment Config repository
 */

import { PaymentConfigDataModel } from '../data/payment-config.data';

export class PaymentConfigRepository {
  private dataModel: any = null;

  /**
   * initializes payment config repository
   * @param connection db connection
   * @returns payment config repository
   */
  initialize = async (connection: any) => {
    this.dataModel = await new PaymentConfigDataModel().getDataModel(
      connection
    );
    return this;
  };

  /**
   * gets payment config by key
   * @param key key
   * @returns payment config
   */
  getPaymentConfigByKey = async (key: string) => {
    try {
      return await this.dataModel.findOne({ key });
    } catch (error) {
      console.error('> getPaymentConfigByKey error: ', error);
      throw error;
    }
  };
}
