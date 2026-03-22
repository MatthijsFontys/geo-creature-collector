import { Maybe } from 'purify-ts';
import { Operator } from '../rules/base.rule';

export interface Spawner {
    name: string;
    always?: ReadonlyArray<Reward>;
    some?: ReadonlyArray<RuleGroup>;
    every?: ReadonlyArray<RuleGroup>;
}

export interface Creature {
    name: string;
    spawnRate?: number;
    disableShiny?: boolean;
    shinyRate?: number;
    minLvl?: number;
    maxLvl?: number;
}

export interface Rule {
    namespace: string;
    name: string;
    values: ReadonlyArray<string>;
    operator: Operator;
}

export interface Reward {
    priority?: number;
    creatures: ReadonlyArray<Creature>;
}

export interface RuleGroup {
    rules: ReadonlyArray<Rule>;
    reward: Reward;
}
