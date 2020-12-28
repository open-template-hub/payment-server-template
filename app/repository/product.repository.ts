/**
 * @description holds Product repository
 */

import { ProductDataModel } from '../data/product.data';

export class ProductRepository {
  private dataModel: any = null;

  /**
   * initializes product repository
   * @param connection db connection
   * @returns product repository
   */
  initialize = async (connection: any) => {
    this.dataModel = await new ProductDataModel().getDataModel(connection);
    return this;
  };

  /**
   * creates a product
   * @param product_id product id
   * @param name product name
   * @param description product description
   * @param payload payload
   * @returns created product
   */
  createProductDocument = async (
    product_id: string,
    name: string,
    description: string,
    payload: any
  ) => {
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
  };

  /**
   * deletes a product by product id
   * @param product_id product id
   * @returns deleted product
   */
  deleteProductDocument = async (product_id: string) => {
    try {
      return await this.dataModel.findOneAndRemove({ product_id });
    } catch (error) {
      console.error('> getProductByProductId error: ', error);
      throw error;
    }
  };

  /**
   * gets product by product id
   * @param product_id product id
   * @returns product
   */
  getProductByProductId = async (product_id: string) => {
    try {
      return await this.dataModel.findOne({ product_id });
    } catch (error) {
      console.error('> getProductByProductId error: ', error);
      throw error;
    }
  };

  /**
   * updates product payload
   * @param product_id product id
   * @param payloadName payload name
   * @param payload payload
   * @returns updated product
   */
  updateProductPayload = async (
    product_id: string,
    payloadName: string,
    payload: any
  ) => {
    let obj = {} as any;
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
