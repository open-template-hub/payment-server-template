/**
 * @description holds product routes
 */

import Router from 'express-promise-router';
import { Request, Response } from 'express';
import { ResponseCode, Context } from '@open-template-hub/common';
import { ProductController } from '../controller/product.controller';

const subRoutes = {
  root: '/',
};

export const adminRoutes = [subRoutes.root];

export const router = Router();

const productController = new ProductController();

router.post(subRoutes.root, async (req: Request, res: Response) => {
  // create a new product
  const context = res.locals.ctx as Context;
  const product = await productController.createProduct(
    context.mongodb_provider,
    req.body.product_id,
    req.body.name,
    req.body.description,
    req.body.amount,
    req.body.currency
  );

  res.status(ResponseCode.CREATED).json(product);
});

router.delete(subRoutes.root, async (req: Request, res: Response) => {
  // delete a product
  const context = res.locals.ctx as Context;
  const product = await productController.deleteProduct(
    context.mongodb_provider,
    req.query.product_id as string
  );

  res.status(ResponseCode.OK).json(product);
});
