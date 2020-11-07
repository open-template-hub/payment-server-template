/**
 * @description holds server main
 */
import dotenv from 'dotenv';
import cors from 'cors';
import { Routes } from './app/routes/index.route';
import express = require('express');
import bodyParser = require('body-parser');
import { debugLog } from './app/services/debug-log.service';
import { configureCronJobs } from './app/services/cron.service';

const env = dotenv.config();
debugLog(env.parsed);

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
});

// cron
configureCronJobs();
