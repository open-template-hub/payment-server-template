/**
 * @description holds server main
 */
import dotenv from 'dotenv'
import cors from 'cors';
import { Routes } from './app/routes';
import express = require('express');
import bodyParser = require('body-parser');

dotenv.config();

const app: express.Application = express();

app.use(bodyParser.urlencoded({extended: false}))

// parse application/json
app.use(bodyParser.json())
app.use(cors());

Routes.mount(app);

const port: string = process.env.PORT || '3000' as string;

app.listen(port, () => {
 console.log('Node app is running on port', port);
});
