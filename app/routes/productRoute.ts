/**
 * @description holds product routes
 */

import Router from 'express-promise-router';
import { Request, Response } from 'express';
import { getAdmin } from '../currentUser';
import { ResponseCode } from '../models/Constant';
import { createProduct } from '../controllers/ProductController';

const subRoutes = {
 root: '/'
}

const router = Router();

router.use('/*', async (req: Request, res: Response, next) => {
 res.locals.ctx.currentUser = await getAdmin(req);
 return next();
});

router.post(subRoutes.root, async (req: Request, res: Response) => {

 const product = await createProduct(res.locals.ctx.dbProviders, req.body.name, req.body.description, req.body.amount, req.body.currency);

 res.status(ResponseCode.CREATED).send(product);
});

export = router;
