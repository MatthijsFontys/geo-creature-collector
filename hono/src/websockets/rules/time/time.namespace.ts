import { RuleQuery, createRuleHandler } from "../../websocket.models";
import { DaySegmentRule } from "./day-segment.rule";
import { SeasonRule } from "./season.rule";

export type TimeRuleEvents = {
  "time:season": RuleQuery;
  "time:daySegment": RuleQuery;
};

export const timeHandlers = {
  "time:season": createRuleHandler(new SeasonRule()),
  "time:daySegment": createRuleHandler(new DaySegmentRule()),
};
