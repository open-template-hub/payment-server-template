/**
 * @description holds product routes
 */

import { authorizedBy, ResponseCode, UserRole, } from '@open-template-hub/common';
import { Request, Response } from 'express';
import Router from 'express-promise-router';
import { ProductController } from '../controller/product.controller';

const subRoutes = {
  root: '/',
  all: '/all'
};

export const router = Router();

const productController = new ProductController();

router.get(
    subRoutes.root,
    authorizedBy( [ UserRole.DEFAULT, UserRole.ADMIN ] ),
    async ( req: Request, res: Response ) => {
      const context = res.locals.ctx;
      const product = await productController.getProduct(
          context.postgresql_provider,
          req.query.payment_config_key as string,
          context.username
      );

      res.status( ResponseCode.OK ).json( product );
    }
);

router.post(
    subRoutes.root,
    authorizedBy( [ UserRole.ADMIN ] ),
    async ( req: Request, res: Response ) => {
      // create a new product
      const context = res.locals.ctx;
      const product = await productController.createProduct(
          context.mongodb_provider,
          req.body.product_id,
          req.body.name,
          req.body.description,
          req.body.amount,
          req.body.currency
      );

      res.status( ResponseCode.CREATED ).json( product );
    }
);

router.delete(
    subRoutes.root,
    authorizedBy( [ UserRole.ADMIN ] ),
    async ( req: Request, res: Response ) => {
      // delete a product
      const context = res.locals.ctx;
      const product = await productController.deleteProduct(
          context.mongodb_provider,
          req.query.product_id as string
      );

      res.status( ResponseCode.OK ).json( product );
    }
);

router.get(
    subRoutes.all,
    authorizedBy( [ UserRole.ADMIN ] ),
    async ( req: Request, res: Response ) => {
      const context = res.locals.ctx;
      const product = await productController.getAllProducts(
          context.mongodb_provider,
          req.query.name as string,
          +( req.query.offset as string ),
          +( req.query.limit as string )
      );

      res.status( ResponseCode.OK ).json( product );
    }
);

router.put(
    subRoutes.root,
    authorizedBy( [ UserRole.ADMIN ] ),
    async ( req: Request, res: Response ) => {
      const context = res.locals.ctx;
      await productController.updateProduct(
          context.mongodb_provider,
          req.body.productId as string,
          req.body.name as string,
          req.body.description as string
      );

      res.status( ResponseCode.CREATED ).json( {} );
    }
);
