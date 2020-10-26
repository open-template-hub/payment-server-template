import { ProductDataModel } from "../data/product.data";

export class ProductRepository {
  private dataModel: any = null;

  initialize = async (connection: any) => {
    this.dataModel = await new ProductDataModel().getDataModel(connection);
    return this;
  }

  createProductDocument = async (product_id, name, description, payload) => {
    try {
      return await this.dataModel.create({
        product_id,
        name,
        description,
        payload,
      });
    } catch (error) {
      console.error('> createProductDocument error: ', error);
      throw error;
    }
  }

  deleteProductDocument = async(product_id) => {
    try {
      return await this.dataModel.findOneAndRemove({ product_id });
    } catch (error) {
      console.error('> getProductByProductId error: ', error);
      throw error;
    }
  }

  getProductByProductId = async(product_id) => {
    try {
      return await this.dataModel.findOne({ product_id });
    } catch (error) {
      console.error('> getProductByProductId error: ', error);
      throw error;
    }
  }

  updateProductPayload = async (product_id, payloadName, payload) => {
    let obj = {};
    obj[payloadName] = payload;
    console.log('updateProductPayload::PayloadObject: ', obj);

    try {
      return await this.dataModel.findOneAndUpdate({ product_id }, obj, {
        new: true,
      });
    } catch (error) {
      console.error('> updateProductPayload error: ', error);
      throw error;
    }
  };
}
