import productModel from '../models/productModel';

export const createProductDocument = async (db, product_id, name, description, payload) => {
 try {
  return await productModel(db.conn).create(
   {
    product_id,
    name,
    description,
    payload
   });
 } catch (e) {
  throw e;
 }
}
