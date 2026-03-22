import { BaseRule, Operator } from "../base.rule";

/**
 * Rule for validating day segments based on current time.
 * 
 * @description
 * Validates whether the current time falls within a specific day segment.
 */
export class DaySegmentRule extends BaseRule {
    /**
     * Predefined day segments with their time ranges.
     */
    private readonly daySegments: ReadonlyArray<string> = [
        'earlyMorning', 'morning', 'afternoon', 'evening', 'night', 'lateNight'
    ];

    /**
     * Validates input day segment.
     * 
     * @param values Input day segment to validate
     * @throws {Error} If the day segment is invalid
     */
    protected validateValuesHook(values: ReadonlyArray<string>) {
        const daySegment = values.at(0) ?? '';
        if (!this.daySegments.includes(daySegment)) {
            throw new Error(`Invalid day segment: ${daySegment}`);
        }
    }

    /**
     * Determines the current day segment based on the time of day.
     * 
     * @returns The current day segment
     */
    private getCurrentDaySegment(): string {
        const currentHour = new Date().getHours();

        if (currentHour >= 0 && currentHour < 3) return 'lateNight';
        if (currentHour >= 5 && currentHour < 8) return 'earlyMorning';
        if (currentHour >= 8 && currentHour < 12) return 'morning';
        if (currentHour >= 12 && currentHour < 17) return 'afternoon';
        if (currentHour >= 17 && currentHour < 21) return 'evening';
        if (currentHour >= 21 || currentHour < 5) return 'night';
        
        // Fallback (shouldn't happen, but TypeScript wants exhaustive check)
        return 'night';
    }

    /**
     * Implements the core rule validation logic for day segments.
     * 
     * @param values Validated day segment values
     * @param operator Comparison operator
     * @returns Boolean indicating if the day segment rule passes
     */
    protected ruleHook(values: ReadonlyArray<string>, operator: Operator): boolean {
        const inputDaySegment = values[0].toLowerCase();
        const currentDaySegment = this.getCurrentDaySegment();

        const inputIndex = this.daySegments.indexOf(inputDaySegment);
        const currentIndex = this.daySegments.indexOf(currentDaySegment);

        switch (operator) {
            case '==':
                return inputDaySegment === currentDaySegment;
            case '!=':
                return inputDaySegment !== currentDaySegment;
            case '<':
                return inputIndex < currentIndex;
            case '>':
                return inputIndex > currentIndex;
            case '<=':
                return inputIndex <= currentIndex;
            case '>=':
                return inputIndex >= currentIndex;
            default:
                return false;
        }
    }
}