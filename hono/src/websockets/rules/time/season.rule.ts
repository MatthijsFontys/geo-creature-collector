import { BaseRule, Operator } from "../base.rule";

/**
 * Rule for validating season-based conditions.
 * 
 * @description
 * Validates whether a given season matches specific criteria.
 */
export class SeasonRule extends BaseRule {

    private readonly validSeasons: ReadonlyArray<string> = ['spring', 'summer', 'fall', 'winter'];

    /**
     * Restricts valid operators for season comparison.
     * 
     * @returns Array of allowed operators
     * @remarks
     * Only allows equality checks for seasons.
     */
    protected get validOperators(): ReadonlyArray<Operator> {
        return ['==', '!='];
    }

    protected validateValuesHook(values: ReadonlyArray<string>) {
        const season = values.at(0) ?? '';
        if(!this.validSeasons.includes(season)) {
            throw new Error(`Invalid season: ${season}`);
        }
    }

    protected ruleHook(values: ReadonlyArray<string>, operator: Operator): boolean {
        const season = values[0].toLowerCase();
        
        const currentSeason = this.getCurrentSeason();
        
        switch (operator) {
            case '==':
                return season === currentSeason;
            case '!=':
                return season !== currentSeason;
            default:
                return false;
        }
    }

    /**
     * Determines the current season based on the current date.
     * 
     * @returns The current season as a lowercase string
     */
    private getCurrentSeason(): string {
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1; // 1-12
        
        if (month >= 3 && month <= 5) return 'spring'; // March, April, May
        if (month >= 6 && month <= 8) return 'summer'; // June, July, August
        if (month >= 9 && month <= 11) return 'fall'; // September, October, November
        return 'winter'; // December, January, February
    }
}