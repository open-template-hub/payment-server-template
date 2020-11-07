/**
 * @description holds product routes
 */

import Router from 'express-promise-router';
import { Request, Response } from 'express';
import { ResponseCode } from '../constant';
import {
  createProduct,
  deleteProduct,
} from '../controller/product.controller';
import { Context } from '../interface/context.interface';

const subRoutes = {
  root: '/',
};

export const adminRoutes = [subRoutes.root];

export const router = Router();

router.post(subRoutes.root, async (req: Request, res: Response) => {
  const context = res.locals.ctx as Context;
  const product = await createProduct(
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
  const context = res.locals.ctx as Context;
  const product = await deleteProduct(
    context.mongodb_provider,
    req.query.product_id as string
  );

  res.status(ResponseCode.OK).json(product);
});
