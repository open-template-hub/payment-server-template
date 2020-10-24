import { PaymentConfigDataModel } from "../data/payment-config.data";

export class PaymentConfigRepository {
  private dataModel: any = null;

  initialize = async (connection: any) => {
    this.dataModel = await new PaymentConfigDataModel().getDataModel(connection);
    return this;
  }

  getPaymentConfigByKey = async(key) => {
    try {
      return await this.dataModel.findOne({ key });
    } catch (error) {
      console.error('> getPaymentConfigByKey error: ', error);
      throw error;
    }
  }
}
