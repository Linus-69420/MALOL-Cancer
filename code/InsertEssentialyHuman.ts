import { Database as Driver} from "sqlite3";
import { open, Database } from "sqlite";

import {DB} from "./connection";

async function main(): Promise<void> {

    const con = await DB.createDBConnection();




    console.log("geht");
}


main();