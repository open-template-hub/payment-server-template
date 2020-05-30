import { Pool } from 'pg';
import { Builder } from '../util/builder';

export class PostgreSqlProvider {
 pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
   rejectUnauthorized: false,
  }
 });

 builder = new Builder();

 preloadTablesTemplatePath = './assets/sql/preloadTables.psql';

 preload = async () => {
  let tables = this.builder.buildTemplate(this.preloadTablesTemplatePath, null);
  return this.query(tables, null);
 }

 query = async (text, params) => {
  const start = Date.now();
  try {
   return await this.pool.query(text, params);
  } catch (e) {
   console.error(e);

   // https://www.postgresql.org/docs/10/errcodes-appendix.html
   if (e.code && e.code.startsWith('23')) {
    e.responseCode = 400;
   } else {
    e.responseCode = 500;
   }

   throw e;
  } finally {
   const duration = Date.now() - start;
   console.log('executed query', {text, duration});
  }
 }
}
