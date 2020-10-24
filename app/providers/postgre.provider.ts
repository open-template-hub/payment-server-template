import { Pool, QueryResult } from "pg";
import { Builder } from "../util/builder";

// debug logger
const debugLog = require("debug")(
  "file-server:" + __filename.slice(__dirname.length + 1)
);

export class PostgreSqlProvider {
  private connectionPool: Pool = new Pool();
  private currentPoolLimit: number = 1;

  builder = new Builder();

  preloadTablesTemplatePath = "./assets/sql/preload.tables.psql";

  preload = async () => {
    this.currentPoolLimit = process.env.POSTGRESQL_CONNECTION_LIMIT
      ? parseInt(process.env.POSTGRESQL_CONNECTION_LIMIT)
      : 1;

    // Creating Connection Pool
    this.connectionPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      application_name: "PaymentServer",
      max: this.currentPoolLimit,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    let queries = this.builder.buildTemplateFromFile(
      this.preloadTablesTemplatePath
    );
    return await this.query(queries, []);
  };

  query = async (text: string, params: Array<any>): Promise<any> => {
    const start = Date.now();

    const connectionPool = this.connectionPool;

    return new Promise(function (resolve, reject) {
      connectionPool.query(
        text,
        params,
        (err: Error, res: QueryResult<any>) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            debugLog("executed query", {
              sql: text,
              duration: Date.now() - start,
              result: res,
            });
            resolve(res);
          }
        }
      );
    });
  };
}
