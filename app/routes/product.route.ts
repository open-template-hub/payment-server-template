/**
 * @description holds product routes
 */

import Router from "express-promise-router";
import { Request, Response } from "express";
import { ResponseCode } from "../util/constant";
import { createProduct } from "../controllers/product.controller";

const subRoutes = {
  root: "/",
};

export const router = Router();

router.post(subRoutes.root, async (req: Request, res: Response) => {
  const product = await createProduct(
    res.locals.ctx.mongoDbProvider,
    req.body.product_id,
    req.body.name,
    req.body.description,
    req.body.amount,
    req.body.currency
  );

  res.status(ResponseCode.CREATED).json(product);
});
