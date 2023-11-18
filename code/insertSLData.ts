import {DB} from "./connection";
import fs from "fs";
import {Statement} from "sqlite";

(async() => {
    const humanSLData: string = fs.readFileSync('../data/syntheticLethalityGenes/csv/Human_SL.csv', 'utf-8');
    const flySLData: string = fs.readFileSync('../data/syntheticLethalityGenes/csv/Fly_SL.csv', 'utf-8');
    const mouseSLData: string = fs.readFileSync('../data/syntheticLethalityGenes/csv/Mouse_SL.csv', 'utf-8');

    await insertData(humanSLData, 1);
    await insertData(flySLData, 2);
    await insertData(mouseSLData, 3);
})();

async function insertData(data: string, speciesId: number): Promise<void> {
    const db = await DB.createDBConnection();
    const stmt: Statement = await db.prepare('select count(*) as cnt from Gene where Identifier = ?1');
    const insertGeneStmt: Statement = await db.prepare(`insert into Gene values (?1, ?2, null, ?3)`);
    const insertSLPairStmt: Statement = await db.prepare(`insert into GenePairSL values (?1, ?2, ?3)`);

    for(let line of data.split('\n').slice(1, data.length)) {
        console.log("[LINE] " + line)
        let infos: string[] = line.split(',');

        try {
            if (infos.length !== 5) {
                console.log("[LENGTH NOT 5] Ignoring this line: " + line)
            }

            else {
                let gene1Name: string = infos.at(0)!;
                let gene1Id: number = Number(infos.at(1));
                let gene2Name: string = infos.at(2)!;
                let gene2Id: number = Number(infos.at(3));
                let statisticScore: number = Number(infos.at(4)) * 100;

                await stmt.reset();
                await stmt.bind(gene1Id);
                let result = await stmt.get();

                if (result.cnt === 0) {
                    console.log('insert Gene1');

                    await insertGeneStmt.reset();
                    await insertGeneStmt.bind({
                        1: gene1Id,
                        2: gene1Name,
                        3: speciesId
                    });
                    await insertGeneStmt.run();
                }

                await stmt.reset();
                await stmt.bind(gene2Id);
                result = await stmt.get();

                if (result.cnt === 0) {
                    console.log('insert Gene2');

                    await insertGeneStmt.reset();
                    await insertGeneStmt.bind({
                        1: gene2Id,
                        2: gene2Name,
                        3: speciesId
                    });
                    await insertGeneStmt.run();
                }

                await insertSLPairStmt.reset();
                await insertSLPairStmt.bind({
                    1: gene1Id,
                    2: gene2Id,
                    3: statisticScore
                });
                await insertSLPairStmt.run();
            }
        }

        catch (e) {
            console.log("[" + e + "] Ignoring this line: " + line)
        }
    }

    await stmt.finalize();
    await insertGeneStmt.finalize();
    await insertSLPairStmt.finalize();
    await db.close();
}