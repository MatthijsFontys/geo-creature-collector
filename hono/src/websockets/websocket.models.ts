import { Context } from "hono";
import { HasResponse } from "../middleware/mediator/mediator-middleware";
import { BaseRule, Operator } from "./rules/base.rule";
import { AppEnvEmpty } from "../middleware/app-environment";

export interface RuleResponse {
    result: boolean;
}

export interface RuleQuery extends HasResponse<RuleResponse> {
    values: ReadonlyArray<string>;
    operator: Operator;
}

export function createRuleHandler(rule: BaseRule) {
    const ruleHandler =  async (_c: Context<AppEnvEmpty>, query: RuleQuery) => {
        const result: boolean = rule.evaluate(query.values, query.operator);
        query.response = { result };
    }

    return [ruleHandler]; 
}