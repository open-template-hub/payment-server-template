/**
 * @description holds product routes
 */

import Router from "express-promise-router";
import { Request, Response } from "express";
import { ResponseCode } from "../util/constant";
import { getSuccesfulReceipts } from "../controllers/receipt.controller";

const subRoutes = {
  root: "/",
};

export const router = Router();

router.get(subRoutes.root, async (req: Request, res: Response) => {
  const successful_receipts = await getSuccesfulReceipts(
    res.locals.ctx.dbProviders,
    res.locals.ctx.currentUser.username,
    req.query.product_id
  );

  res
    .status(ResponseCode.OK)
    .json({ successful_receipts: successful_receipts });
});

