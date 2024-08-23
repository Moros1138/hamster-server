import Database from 'better-sqlite3';

import { rm } from "node:fs/promises";

await rm("races.db", {
    force: true,
    recursive: true,
});

const races = new Database("races.db", { verbose: console.log });


races.exec(`CREATE TABLE IF NOT EXISTS 'races' (
    'id' INTEGER PRIMARY KEY AUTOINCREMENT,
    'color' TEXT,
    'name' TEXT,
    'map' TEXT,
    'time' INTEGER,
    'created_at' TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`);

const racesToInsert = [];
const colors = ["white", "black", "blue", "green", "red", "yellow", "orange"];

for(let j = 0; j < 5; j++)
{
    for(let i = 0; i < 50; i++)
    {
        racesToInsert.push({
            color: colors[Math.floor(Math.random() * colors.length)],
            name: `Entry${Math.floor(Math.random() * (i * 50))}`,
            map: `map${j + 1}`,
            time: (Math.floor(Math.random() * (i * 50)))
        });
    }
}

racesToInsert.sort(() => Math.random() - 0.5);

let stmt = races.prepare("INSERT INTO `races` (`color`, `name`, `map`, `time`) VALUES (@color, @name, @map, @time);");

racesToInsert.forEach((race) =>
{
    stmt.run(race);
});
