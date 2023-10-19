DROP TABLE MappingData;
DROP TABLE GenePairSL;
DROP TABLE Gene;
DROP TABLE Species;


CREATE TABLE Species(
    SpeciesId INTEGER NOT NULL ,
    Name TEXT NOT NULL ,
    PRIMARY KEY (SpeciesId)
);

CREATE TABLE Gene(
    Identifier INTEGER NOT NULL ,
    Name TEXT NOT NULL ,
    Essentiality INTEGER Null,
    SpeciesId INTEGER NOT NULL,
    PRIMARY KEY (Identifier),
    FOREIGN KEY (SpeciesId) REFERENCES Species (SpeciesId)
);

CREATE TABLE MappingData(
    Gene1Id INTEGER NOT NULL,
    Gene2Id INTEGER NOT NULL,
    PRIMARY KEY (Gene1Id, Gene2Id),
    FOREIGN KEY (Gene1Id) REFERENCES Gene (Identifier),
    FOREIGN KEY (Gene2Id) REFERENCES Gene (Identifier)
);

CREATE TABLE GenePairSL(
    Gene1Id INTEGER NOT NULL,
    Gene2Id INTEGER NOT NULL,
    rStatisticScore INTEGER NOT NULL,
    PRIMARY KEY (Gene1Id, Gene2Id),
    FOREIGN KEY (Gene1Id) REFERENCES Gene (Identifier),
    FOREIGN KEY (Gene2Id) REFERENCES Gene (Identifier)
);