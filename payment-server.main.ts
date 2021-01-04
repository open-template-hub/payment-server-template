/**
 * @description holds server main
 */
import dotenv from 'dotenv';
import cors from 'cors';
import { Routes } from './app/route/index.route';
import express from 'express';
import bodyParser from 'body-parser';
import { DebugLogUtil, UsageUtil } from '@open-template-hub/common';

const debugLogUtil = new DebugLogUtil();

const env = dotenv.config();
debugLogUtil.log(env.parsed);

// express init
const app: express.Application = express();

// public files
app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// mount routes
Routes.mount(app);

// listen port
const port: string = process.env.PORT || ('4003' as string);
app.listen(port, () => {
  console.info('Payment Server is running on port', port);

  const usageUtil = new UsageUtil();
  const memoryUsage = usageUtil.getMemoryUsage();
  console.info(`Startup Memory Usage: ${memoryUsage.toFixed(2)} MB`);
});
