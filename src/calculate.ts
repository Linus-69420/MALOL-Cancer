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
        console.log("==============================================================");
        console.log("| This gene is essential! (" + essentiality.Essentiality + ") |");
        console.log("===============================================================");
        if (essentiality.Essentiality === "CSEGs") {
            coreScore *= 0.3;
        }
        else if (essentiality.Essentiality === "CEGs") {
            coreScore *= 0.1;
        }
    }

    //console.log(coreScore);

    console.log("\n=============");
    console.log("| SL Human: |");
    console.log("=============");

    await getAndLogGenePairs(db, inputGene, coreScore);

    const humanMappingStmt: Statement = await db.prepare(
        'select m.Gene2Id from MappingData m join Gene g on (m.Gene2Id = g.Identifier) where m.Gene1Id = ?1 and g.SpeciesId = ?2');
    const animalMappingStmt: Statement = await db.prepare(
        'select m.Gene1Id from MappingData m join Gene g on (m.Gene1Id = g.Identifier) where m.Gene2Id = ?1 and g.SpeciesId = 1');

    await humanMappingStmt.bind({
        1: inputGene,
        2: 3
    });
    const mappingDataHumanToMouse = await humanMappingStmt.all();

    console.log("\n==========================");
    console.log("| Human -> Mouse Mapping |");
    console.log("==========================");

    for (const mdhm of mappingDataHumanToMouse) {
        console.log("Human-Gene " + inputGene + " can be mapped to Mouse-Gene " + mdhm.Gene2Id + ".")
    }

    console.log("\n=============");
    console.log("| SL Mouse: |");
    console.log("=============");

    let allMousePairIds: number[] = [];
    for (const mdhm of mappingDataHumanToMouse) {
        allMousePairIds.push(... await getAndLogGenePairs(db, mdhm.Gene2Id, coreScore));
    }

    console.log("\n==========================");
    console.log("| Mouse -> Human Mapping |");
    console.log("==========================");

    for (const id of allMousePairIds) {
        await animalMappingStmt.reset();
        await animalMappingStmt.bind(id);
        const mappingDataMouseToHuman = await animalMappingStmt.all();

        for (const mdmh of mappingDataMouseToHuman) {
            console.log("Mouse-Gene " + id + " can be mapped to Human-Gene " + mdmh.Gene1Id + ".")
        }
    }

    await humanMappingStmt.reset();
    await humanMappingStmt.bind({
        1: inputGene,
        2: 2
    });
    const mappingDataHumanToFly = await humanMappingStmt.all();

    console.log("\n==========================");
    console.log("| Human -> Fly Mapping |");
    console.log("==========================");

    for (const mdhf of mappingDataHumanToFly) {
        console.log("Human-Gene " + inputGene + " can be mapped to Fly-Gene " + mdhf.Gene2Id + ".")
    }

    console.log("\n=============")
    console.log("| SL Fly: |");
    console.log("=============")

    let allFlyPairIds: number[] = [];
    for (const mdhf of mappingDataHumanToFly) {
        allFlyPairIds.push(... await getAndLogGenePairs(db, mdhf.Gene2Id, coreScore));
    }

    console.log("\n==========================");
    console.log("| Fly -> Human Mapping |");
    console.log("==========================");

    for (const id of allFlyPairIds) {
        await animalMappingStmt.reset();
        await animalMappingStmt.bind(id);
        const mappingDataFlyToHuman = await animalMappingStmt.all();

        for (const mdfh of mappingDataFlyToHuman) {
            console.log("Mouse-Gene " + id + " can be mapped to Human-Gene " + mdfh.Gene1Id + ".")
        }
    }
})();

async function getAndLogGenePairs(db: Database, geneId: number, coreScore: number): Promise<number[]> {
    let essentialityStmt: Statement = await db.prepare('select Essentiality from Gene where Identifier = ?1');

    let genePairs: GenePairSL[] = await db.all<GenePairSL[]>(
        'select * from GenePairSL where Gene1Id = ?1 or Gene2Id = ?2', [geneId, geneId]);

    let results: string[][] = [];
    let everyPairId: number[] = [];

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

            everyPairId.push(genePair.Gene2Id);
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

            everyPairId.push(genePair.Gene1Id);
            results.push([geneId.toString(), genePair.Gene1Id.toString(), score.toString()]);
        }
    }

    results.sort((a, b) => Number(b.at(2)) - Number(a.at(2)));
    logGenePairs(results);

    return everyPairId;
}

function logGenePairs(results: string[][]): void {
    results.forEach((value: string[], index: number) => {
        if (index === 3) console.log();
        console.log("| Gene " + value.at(0) + " + Gene " + value.at(1) + " = " + value.at(2) + " (score) |");
    });
}