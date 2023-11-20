import {DB} from "./connection";
import {GenePairSL} from "./model/GenePairSL";
import {Database, Statement} from "sqlite";
import * as rl from 'readline-sync';

(async() => {
    let geneId: number = 0;
    do {
        let input: string = rl.question('Please enter your GeneId: ');
        geneId = Number(input);
    } while (Number.isNaN(geneId));

    const inputGene: number = geneId;
    let coreScore: number = 10;
    const db: Database = await DB.createDBConnection();

    let essentiality = await db.get('select Essentiality from Gene where Identifier = ?1', inputGene);

    if (essentiality !== undefined && essentiality.Essentiality !== null) {
        console.log("This gene is essential! (" + essentiality.Essentiality + ")")
        if (essentiality.Essentiality === "CSEGs") {
            coreScore *= 0.3;
        }
        else if (essentiality.Essentiality === "CEGs") {
            coreScore *= 0.1;
        }
    }

    //console.log(coreScore);

    console.log("\nSL Human:");
    await getAndLogGenePairs(db, inputGene, coreScore);

    const mappingStmt: Statement = await db.prepare(
        'select m.Gene2Id from MappingData m join Gene g on (m.Gene2Id = g.Identifier) where m.Gene1Id = ?1 and g.SpeciesId = ?2');

    /*
    let mappingDataMouse = await db.all(
        'select m.Gene2Id from MappingData m join Gene g on (m.Gene2Id = g.Identifier) where m.Gene1Id = ?1 and g.SpeciesId = 3', inputGene);
    */
    await mappingStmt.bind({
        1: inputGene,
        2: 3
    });
    const mappingDataHumanToMouse = await mappingStmt.all();

    //console.log(mappingDataMouse);

    console.log("\nHuman -> Mouse Mapping");
    for (const mdhm of mappingDataHumanToMouse) {
        console.log("Human-Gene " + inputGene + " can be mapped to Mouse-Gene " + mdhm.Gene2Id + ".")
    }

    console.log("\nSL Mouse:");
    for (const mdhm of mappingDataHumanToMouse) {
        await getAndLogGenePairs(db, mdhm.Gene2Id, coreScore);
    }

    /*
    let mappingDataFly = await db.all(
        'select m.Gene2Id from MappingData m join Gene g on (m.Gene2Id = g.Identifier) where m.Gene1Id = ?1 and g.SpeciesId = 2', inputGene);
    */
    await mappingStmt.reset();
    await mappingStmt.bind({
        1: inputGene,
        2: 2
    });
    const mappingDataHumanToFly = await mappingStmt.all();

    //console.log(mappingDataFly);

    console.log("\nHuman -> Fly Mapping");
    for (const mdhf of mappingDataHumanToFly) {
        console.log("Human-Gene " + inputGene + " can be mapped to Fly-Gene " + mdhf.Gene2Id + ".")
    }

    console.log("\nSL Fly:");
    for (const mdhf of mappingDataHumanToFly) {
        await getAndLogGenePairs(db, mdhf.Gene2Id, coreScore);
    }

})();

async function getAndLogGenePairs(db: Database, geneId: number, coreScore: number): Promise<void> {
    let essentialityStmt: Statement = await db.prepare('select Essentiality from Gene where Identifier = ?1');

    let genePairs: GenePairSL[] = await db.all<GenePairSL[]>(
        'select * from GenePairSL where Gene1Id = ?1 or Gene2Id = ?2', [geneId, geneId]);

    let results: string[][] = [];

    for (const genePair of genePairs) {
        let score: number = Math.round((coreScore * (genePair.rStatisticScore / 100)) * 100) / 100;
        if (genePair.Gene1Id === geneId) {

            await essentialityStmt.reset();
            await essentialityStmt.bind(genePair.Gene2Id);
            const result = await essentialityStmt.get();

            if (result.Essentiality !== null) {
                score *= result.Essentiality === "CSEGs" ? 0.3 : 0.1;
                score = Math.round(score * 100) / 100;
            }

            results.push([geneId.toString(), genePair.Gene2Id.toString(), score.toString()]);
        }
        else {
            await essentialityStmt.reset();
            await essentialityStmt.bind(genePair.Gene1Id);
            const result = await essentialityStmt.get();

            if (result.Essentiality !== null) {
                score *= result.Essentiality === "CSEGs" ? 0.3 : 0.1;
                score = Math.round(score * 100) / 100;
            }

            results.push([geneId.toString(), genePair.Gene1Id.toString(), score.toString()]);
        }
    }
    logGenePairs(results);
}

function logGenePairs(results: string[][]): void {
    results.sort((a, b) => Number(b.at(2)) - Number(a.at(2)));

    results.forEach((value: string[], index: number) => {
        if (index === 3) console.log();
        console.log("| Gene " + value.at(0) + " + Gene " + value.at(1) + " = " + value.at(2) + " (score) |");
    });
}