/**
 * @description holds user routes
 */

import Router from 'express-promise-router';
import { Request, Response } from 'express';
import { ResponseCode } from '../models/Constant';

const subRoutes = {
 root: '/'
}

const router = Router();

export = router;
