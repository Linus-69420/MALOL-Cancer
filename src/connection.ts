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

    public static async beginTransaction(connection: Database): Promise<void> {
        await connection.run('begin transaction;');
    }

    public static async commitTransaction(connection: Database): Promise<void> {
        await connection.run('commit;');
    }

    public static async rollbackTransaction(connection: Database): Promise<void> {
        await connection.run('rollback;');
    }

}