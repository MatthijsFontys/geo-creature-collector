import { Point } from "geojson";
import { DeegreeCommandClient } from "../../services/deegree-services/deegree-command-client";
import { DeegreeQueryClient } from "../../services/deegree-services/deegree-query-client";
import { resolveSpawns } from "./spawner-logic";
import pinoLogger from "../../middleware/logger";

export async function spawnSpawnerResults(playerLocation: Point) {
    const deegreeQueries = new DeegreeQueryClient();
    const response = await deegreeQueries.getSpawnersForPlayer(playerLocation.coordinates, "LATER");
    const spawners = response.data;
    const spawnPoints = await resolveSpawns(spawners, playerLocation);
    pinoLogger.info(`Found ${spawnPoints.length} spawn points`);
    const deegreeCommands = new DeegreeCommandClient(); 

    for (const spawnPoint of spawnPoints) {
        const isShiny = Math.random() < 0.01;
        const result = await deegreeCommands.spawnCreature(spawnPoint.geometry.coordinates, spawnPoint.properties.name, isShiny);
        pinoLogger.info(`Inserted the following ids: ${result.insertedIds.join(',')}`);
    }
}