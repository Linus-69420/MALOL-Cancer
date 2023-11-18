import fs from "fs";
import {DB} from "./connection";
import {Statement} from "sqlite";

(async() => {
    let regexHuman: RegExp = /HUMAN/gi;
    let regexFly: RegExp = /DROME/gi;
    let regexMouse: RegExp = /MOUSE/gi;

    let flyMappingData: string = fs.readFileSync('../data/mapping/human-fly-gene-mapping.csv', 'utf-8');
    flyMappingData = flyMappingData.replace(regexHuman, "");
    flyMappingData = flyMappingData.replace(regexFly, "");

    let mouseMappingData: string = fs.readFileSync('../data/mapping/human-mouse-gene-mapping.csv', 'utf-8');
    mouseMappingData = mouseMappingData.replace(regexHuman, "");
    mouseMappingData = mouseMappingData.replace(regexMouse, "");

    await insertData(flyMappingData, 2);
    await insertData(mouseMappingData, 3);
})()

async function insertData(data: string, speciesId: number): Promise<void> {
    const db = await DB.createDBConnection();
    const stmt: Statement = await db.prepare('select count(*) as cnt from Gene where Identifier = ?1');
    const insertGeneStmt: Statement = await db.prepare(`insert into Gene values (?1, ?2, null, ?3)`);
    const insertMappingDataStmt: Statement = await db.prepare(`insert into MappingData values (?1, ?2)`);

    for(let line of data.split('\n')) {
        console.log("[LINE] " + line)
        let infos: string[] = line.split('\t');

        try {
            if (infos.length !== 2) {
                console.log("[LENGTH NOT 2] Ignoring this line: " + line)
            }

            else {
                let gene1Id: number = Number(infos.at(0));
                let gene2Id: number = Number(infos.at(1));

                await stmt.reset();
                await stmt.bind(gene1Id);
                let result = await stmt.get();

                if (result.cnt === 0) {
                    console.log('insert Gene1');

                    await insertGeneStmt.reset();
                    await insertGeneStmt.bind({
                        1: gene1Id,
                        2: "",
                        3: 1
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
                        2: "",
                        3: speciesId
                    });
                    await insertGeneStmt.run();
                }

                await insertMappingDataStmt.reset();
                await insertMappingDataStmt.bind({
                    1: gene1Id,
                    2: gene2Id
                });
                await insertMappingDataStmt.run();
            }
        }

        catch (e) {
            console.log("[" + e + "] Ignoring this line: " + line)
        }
    }

    await stmt.finalize();
    await insertGeneStmt.finalize();
    await insertMappingDataStmt.finalize();
    await db.close();
}