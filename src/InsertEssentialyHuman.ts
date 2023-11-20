import { Database as Driver} from "sqlite3";
import { open, Database } from "sqlite";
import * as fs from 'fs';
import {DB} from "./connection";

async function main(): Promise<void> {

    const db = await DB.createDBConnection();

    const data: string = fs.readFileSync('../data/essential/CSEGs_CEGs.csv', 'utf-8');

    let tmp: string[] = [];

    for(let line of data.split('\n')){

        try{
            tmp = line.split('\t');

            if(tmp.length < 3 || tmp[2].includes(';') || tmp[1] === "essentiality"){
                continue;
            }

            const stmt = await db.prepare(`Insert or IGNORE into Gene VALUES (?1, ?2, ?3, ?4)`);

            await stmt.bind({
                1: Number(tmp[2]),
                2: tmp[0],
                3: tmp[1],
                4: 1
            });

            await stmt.run();
            await stmt.finalize();

        }
        catch (e) {
            console.log(e);
            console.log(tmp);
            console.log(tmp.length);
            console.log(Number(tmp[2]));
        }
    }

    await db.close();
}


main();

/*
    const db = await DB.createDBConnection();
    await DB.beginTransaction(db);

    const stmt = await db.prepare('insert into Car values (?1, ?2, ?3)');
    await stmt.bind({
        1: req.body.licensePlate,
        2: req.body.model,
        3: req.body.owner
    });

    const operationResult = await stmt.run();
    if (operationResult.changes === 1) {
        await DB.commitTransaction(db);
        res.status(StatusCodes.CREATED);
    } else {
        await DB.rollbackTransaction(db);
        res.status(StatusCodes.BAD_REQUEST);
    }

    await stmt.finalize();
    await db.close();
* */