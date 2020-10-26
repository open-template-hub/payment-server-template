/**
 * @description holds product routes
 */

import Router from "express-promise-router";
import { Request, Response } from "express";
import { ResponseCode } from "../util/constant";
import { createProduct } from "../controllers/product.controller";
import { Context } from "../models/context.model";

const subRoutes = {
  root: "/",
};

export const router = Router();

router.post(subRoutes.root, async (req: Request, res: Response) => {
  const context = res.locals.ctx as Context;
  
  const product = await createProduct(
    context.mongoDbProvider,
    req.body.product_id,
    req.body.name,
    req.body.description,
    req.body.amount,
    req.body.currency
  );

  res.status(ResponseCode.CREATED).json(product);
});
