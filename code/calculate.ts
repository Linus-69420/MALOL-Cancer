import {DB} from "./connection";
import {GenePairSL} from "./model/GenePairSL";
import {Database} from "sqlite";

(async() => {
    if (process.argv.length !== 3 || Number.isNaN(Number(process.argv.slice(2)))) {
        return;
    }

    const inputGene: number = Number(process.argv.slice(2));
    let coreScore: number = 10;
    const db: Database = await DB.createDBConnection();

    let essentiality = await db.get('select Essentiality from Gene where Identifier = ?1', inputGene);

    if (essentiality !== undefined && essentiality.Essentiality !== null) {
        console.log("This gene is essential! (" + essentiality.Essentiality + ")")
        if (essentiality.Essentiality === "CSEGs") {
            coreScore *= 0.3;
        }
        else if (essentiality.Essentiality === "CEGs") {
            coreScore *= 0.05;
        }
    }

    //console.log(coreScore);

    console.log("\nSL Human:");
    await getAndLogGenePairs(db, inputGene, coreScore);

    let mappingDataMouse = await db.all(
        'select m.Gene2Id from MappingData m join Gene g on (m.Gene2Id = g.Identifier) where m.Gene1Id = ?1 and g.SpeciesId = 3', inputGene);
    //console.log(mappingDataMouse);

    console.log("\nHuman -> Mouse Mapping");
    for (const mdm of mappingDataMouse) {
        console.log("Human-Gene " + inputGene + " can be mapped to Mouse-Gene " + mdm.Gene2Id + ".")
    }

    console.log("\nSL Mouse:");
    for (const mdm of mappingDataMouse) {
        await getAndLogGenePairs(db, mdm.Gene2Id, coreScore);
    }

    let mappingDataFly = await db.all(
        'select m.Gene2Id from MappingData m join Gene g on (m.Gene2Id = g.Identifier) where m.Gene1Id = ?1 and g.SpeciesId = 2', inputGene);
    //console.log(mappingDataFly);

    console.log("\nHuman -> Fly Mapping");
    for (const mdf of mappingDataFly) {
        console.log("Human-Gene " + inputGene + " can be mapped to Fly-Gene " + mdf.Gene2Id + ".")
    }

    console.log("\nSL Fly:");
    for (const mdf of mappingDataFly) {
        await getAndLogGenePairs(db, mdf.Gene2Id, coreScore);
    }

})();

async function getAndLogGenePairs(db: Database, geneId: number, coreScore: number): Promise<void> {
    let genePairs: GenePairSL[] = await db.all<GenePairSL[]>(
        'select * from GenePairSL where Gene1Id = ?1 or Gene2Id = ?2', [geneId, geneId]);
    genePairs.sort((a, b) => b.rStatisticScore - a.rStatisticScore);

    for (const genePair of genePairs) {
        let score = Math.round((coreScore * (genePair.rStatisticScore / 100)) * 100) / 100;
        if (genePair.Gene1Id === geneId) {
            console.log("Gene " + geneId + " + Gene " + genePair.Gene2Id + " = " + score + " (score)");
        }
        else {
            console.log("Gene " + geneId + " + Gene " + genePair.Gene1Id + " = " + score + " (score)");
        }
    }
}