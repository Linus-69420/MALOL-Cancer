import { Database as Driver} from "sqlite3";
import { open, Database } from "sqlite";

export const dbFileName = 'database.sqlite';

export class DB {
    public static async createDBConnection(): Promise<Database> {
        const db = await open({
            filename: `../${dbFileName}`,
            driver: Driver
        });

        return db;
    }
}