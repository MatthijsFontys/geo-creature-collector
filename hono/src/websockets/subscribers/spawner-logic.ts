import { Feature, FeatureCollection, Point, Polygon } from "geojson";
import { SpawnerGeoProps } from "../../services/deegree-services/deegree.models";
import { Spawner } from "../spawners/spawner.models";
import { emitWsMediatorAsync, getWsMediatorResponse, isValidRuleEvent } from "../mediator/websocket-mediator";
import { RuleResponse } from "../websocket.models";
import pinoLogger from "../../middleware/logger";
import { Just, Nothing, Maybe } from "purify-ts";
import { bbox, buffer, feature, featureCollection, intersect, randomPoint } from "@turf/turf";
import { spawn } from "bun";

// TODO: Contemplate if this should be a service
// TODO: Refactors to make it more readable, at the very least wrap the Feature Type in a type, instead of repeating it everywhere
// TODO: Check if the path is reliable this way, even on the linux VPS.
// TODO: Share logic between some and every, but keep it readable!
// TODO: There are so many performance optimizations to make here, but not important just yet.
// TODO: Refactor this to deal in a more readable and pragmatic way with the awaiting the async calls
export type CreatureToSpawn = Feature<Point, {name: string}>;

export async function resolveSpawns(spawners: FeatureCollection<Polygon, SpawnerGeoProps>, playerLocation: Point): Promise<ReadonlyArray<CreatureToSpawn>> {
    const spawnable: CreatureToSpawn[] = [];
    
    for (const spawnerFeature of spawners.features) {
        const spawnerFile = `./src/websockets/spawners/${spawnerFeature.properties.kind.toLowerCase()}/${spawnerFeature.properties.jsonUrl}.json`;
        const spawner = await Bun.file(spawnerFile).json() as Spawner;

        pinoLogger.info(`SpawnerFile ${spawnerFile} loaded`);
        
        // Always spawn creatures
        spawner.always ??= [];
        for (const alwaysSpawnConfig of spawner.always) {
            for (const creatureConfig of alwaysSpawnConfig.creatures) {
                const spawnPoint = findSpawnPoint(spawnerFeature, playerLocation, creatureConfig.name);
                if(spawnPoint.isJust()) {
                    pinoLogger.info(`Found spawn point for ${creatureConfig.name}`);
                }
                else {
                    pinoLogger.info(`No spawn point found for ${creatureConfig.name}`);
                }
                spawnPoint.ifJust(x => {
                    pinoLogger.info('HEY I GET HERE!!!');
                    spawnable.push(x);
                });
            }
        }

        // Some spawn conditions
        spawner.some ??= [];
        for (const someSpawnConfig of spawner.some) {
            const someRulesPassed = await (async () => {
                for (const ruleConfig of someSpawnConfig.rules) {
                    const event = `${ruleConfig.namespace}:${ruleConfig.name}`;
                    if(isValidRuleEvent(event)) {
                        const responseHolder = await emitWsMediatorAsync(event, {values: ruleConfig.values, operator: ruleConfig.operator})
                        const response: RuleResponse = getWsMediatorResponse(responseHolder);
                        if (response.result) return true;
                    }
                    else {
                        pinoLogger.warn(`Invalid rule event: ${event}`);
                    }
                }
                return false;
            })();

            if(someRulesPassed) {
                for (const creatureName of someSpawnConfig.reward.creatures.map(creature => creature.name)) {
                    const spawnPoint = findSpawnPoint(spawnerFeature, playerLocation, creatureName);
                    spawnPoint.ifJust(x => {
                        spawnable.push(x);
                    });
                }
            }
        }

        // Every spawn condition
        spawner.every ??= [];
        for (const everySpawnConfig of spawner.every) {
            const everyRulesPassed = await (async () => {
                for (const ruleConfig of everySpawnConfig.rules) {
                    const event = `${ruleConfig.namespace}:${ruleConfig.name}`;
                    if(isValidRuleEvent(event)) {
                        const responseHolder = await emitWsMediatorAsync(event, {values: ruleConfig.values, operator: ruleConfig.operator})
                        const response: RuleResponse = getWsMediatorResponse(responseHolder);
                        if (!response.result) return false;
                    }
                    else {
                        pinoLogger.warn(`Invalid rule event: ${event}`);
                        return false;
                    }
                }
                return true;
            })();

            if(everyRulesPassed) {
                for (const creatureName of everySpawnConfig.reward.creatures.map(creature => creature.name)) {
                    const spawnPoint = findSpawnPoint(spawnerFeature, playerLocation, creatureName);
                    spawnPoint.ifJust(x => {
                        spawnable.push(x);
                    });
                }
            }
        }
    }

    // Only a percentage of creatures actually spawn
    pinoLogger.info(`Found ${spawnable.length} spawnable creatures`);
    const spawnChance = 0.1;
    const spawnableAfterChance = spawnable.filter(() => Math.random() < spawnChance);
    pinoLogger.info(`After spawn chance, found ${spawnableAfterChance.length} spawnable creatures`);
    
    return spawnableAfterChance;
}

function findSpawnPoint(spawner: Feature<Polygon, SpawnerGeoProps>, playerLocation: Point, creatureName: string): Maybe<CreatureToSpawn> {
  const playerLocationBuffer = buffer(playerLocation, 100, {units: 'meters'});
  const validArea = playerLocationBuffer 
    ? intersect(featureCollection([playerLocationBuffer, spawner]))
    : spawner;
  if(validArea) {
    const spawnPoint = randomPoint(1, {bbox: bbox(validArea)});
    return Just(feature(spawnPoint.features[0].geometry, {name: creatureName}));
  }
  return Nothing;
}