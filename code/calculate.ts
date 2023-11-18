import {DB} from "./connection";
import {GenePairSL} from "./model/GenePairSL";

(async() => {
    const inputGene: number = 84930;
    let coreScore = 10;
    let essentialScore = 0;
    const db = await DB.createDBConnection();

    let essentiality = await db.get('select Essentiality from Gene where Identifier = ?1', inputGene);

    if (essentiality !== undefined && essentiality.Essentiality !== null) {
        console.log("This gene is essential! (" + essentiality.Essentiality + ")")
    }

    if (essentiality === null || essentiality.Essentiality === null) {
        essentialScore = 1;
    }
    else if (essentiality.Essentiality === "CSEGs") {
        essentialScore = 0.3;
    }
    else if (essentiality.Essentiality === "CEGs") {
        essentialScore = 0.05;
    }
    coreScore *= essentialScore;

    //console.log(coreScore);

    let genePairs: GenePairSL[] = await db.all<GenePairSL[]>(
        'select * from GenePairSL where Gene1Id = ?1 or Gene2Id = ?2', [inputGene, inputGene]);
    //console.log(genePairs);

    console.log("\nSL Human:");
    for (const genePair of genePairs) {
        let score = Math.round((coreScore * (genePair.rStatisticScore / 100)) * 100) / 100;
        if (genePair.Gene1Id === inputGene) {
            console.log("InputGene " + inputGene + " + Gene " + genePair.Gene2Id + " = " + score + " (score)");
        }
        else {
            console.log("InputGene " + inputGene + " + Gene " + genePair.Gene1Id + " = " + score + " (score)");
        }
    }

    let mappingDataMouse = await db.all(
        'select m.Gene2Id from MappingData m join Gene g on (m.Gene2Id = g.Identifier) where m.Gene1Id = ?1 and g.SpeciesId = 3', inputGene);
    //console.log(mappingDataMouse);

    console.log("\nHuman -> Mouse Mapping");
    for (const mdm of mappingDataMouse) {
        console.log("Human-Gene " + inputGene + " can be mapped to Mouse-Gene " + mdm.Gene2Id + ".")
    }

    console.log("\nSL Mouse:");
    for (const mdm of mappingDataMouse) {
        let genePairs: GenePairSL[] = await db.all<GenePairSL[]>(
            'select * from GenePairSL where Gene1Id = ?1 or Gene2Id = ?2', [mdm.Gene2Id, mdm.Gene2Id]);

        for (const genePair of genePairs) {
            let score = Math.round((coreScore * (genePair.rStatisticScore / 100)) * 100) / 100;
            if (genePair.Gene1Id === mdm.Gene2Id) {
                console.log("Gene " + mdm.Gene2Id + " + Gene " + genePair.Gene2Id + " = " + score + " (score)");
            }
            else {
                console.log("Gene " + mdm.Gene2Id + " + Gene " + genePair.Gene1Id + " = " + score + " (score)");
            }
        }
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
        let genePairs: GenePairSL[] = await db.all<GenePairSL[]>(
            'select * from GenePairSL where Gene1Id = ?1 or Gene2Id = ?2', [mdf.Gene2Id, mdf.Gene2Id]);

        for (const genePair of genePairs) {
            let score = Math.round((coreScore * (genePair.rStatisticScore / 100)) * 100) / 100;
            if (genePair.Gene1Id === mdf.Gene2Id) {
                console.log("Gene " + mdf.Gene2Id + " + Gene " + genePair.Gene2Id + " = " + score + " (score)");
            }
            else {
                console.log("Gene " + mdf.Gene2Id + " + Gene " + genePair.Gene1Id + " = " + score + " (score)");
            }
        }
    }

})();