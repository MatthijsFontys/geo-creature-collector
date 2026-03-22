import { Either } from "purify-ts";

/**
 * Represents a comparison operator for rule evaluation.
 * Supports numeric and strict equality comparisons.
 */
export type Operator = '<' | '<=' | '>' | '>=' | '==' | '!=';

/**
 * Abstract base class for implementing flexible validation rules.
 * 
 * @description
 * This class provides a framework for creating complex validation rules with 
 * different comparison operators and value validation strategies.
 * 
 * @remarks
 * To create a concrete rule:
 * 1. Extend this class
 * 2. Implement the abstract {@link ruleHook} method
 * 3. Optionally override {@link expectedValueRules} to customize the amount of expected values
 * 4. Optionally override {@link validOperators} to disallow certain operators
 * 5. Optionally override {@link validateValuesHook} to add further custom validation logic for input values
 * 
 * @example
 * ```typescript
 * class MyRule extends BaseRule {
 *   protected ruleHook(values: ReadonlyArray<string>, operator: Operator): boolean {
 *     // Implement specific rule logic using compareValues if needed
 *     return this.compareValues(values, operator);
 *   }
 * }
 * ```
 */
export abstract class BaseRule {
    /**
     * Creates an instance of BaseRule.
     * Intentionally left empty for subclass flexibility.
     */
    constructor() {}

    private readonly operatorMap: ReadonlyMap<Operator, (a: number, b: number) => boolean> = new Map([
        ['==', (a, b) => a === b],
        ['!=', (a, b) => a !== b],
        ['<', (a, b) => a < b],
        ['<=', (a, b) => a <= b],
        ['>', (a, b) => a > b],
        ['>=', (a, b) => a >= b]
    ]);

    /**
     * Abstract method to implement specific rule validation logic.
     * 
     * @param values - Array of string values to validate
     * @param operator - Comparison operator to use
     * @returns boolean indicating whether the rule passes
     * 
     * @remarks
     * Subclasses MUST implement this method to define their specific validation rules.
     */
    protected abstract ruleHook(values: ReadonlyArray<string>, operator: Operator): boolean;

    /**
     * 
     * @param values Array of values passed by the spawner JSON to validate 
     * 
     * @remarks
     * Override this method to add custom validation logic for input values.
     * By default, does nothing.
     * For the validation to fail throw an error.
     */
    protected validateValuesHook(_values: ReadonlyArray<string>) {
        // Empty hook by default
    }

    /**
     * Preprocesses input values before validation.
     * 
     * @returns Processed values from the spawner JSON.
     * 
     * @remarks
     * Override this method to add custom preprocessing logic for input values.
     * By default, returns the input values unchanged.
     */
    protected mapValues(values: ReadonlyArray<string>): ReadonlyArray<string> {
        return values;
    }

    /**
     * Gets the list of supported comparison operators.
     * 
     * @returns Array of valid operators.
     * @remarks
     * By default supports all possible operators.
     */
    protected get validOperators(): ReadonlyArray<Operator> {
        return ['==', '!=', '<', '>', '<=', '>='];
    }

    /**
     * Defines the default expected number of values and comparison operator.
     * 
     * @returns Object with default amount and operator
     * 
     * @remarks
     * Override this method to customize the default validation rules.
     * Default is 1 value with '==' operator.
     */
    protected get expectedValueRules(): {amount: number, operator: Operator} {
        return {amount: 1, operator: '=='};
    }

    /**
     * Validates that the provided operator is supported.
     * 
     * @param operator - Operator to validate
     * @returns The validated operator
     * @throws {Error} If the operator is not in the list of valid operators
     */
    protected validateOperator(operator: Operator): Operator {
        if (this.validOperators.includes(operator)) {
            return operator;
        } else {
            throw new Error(`Invalid operator: ${operator}`);
        }
    }

    /**
     * Validates the input values based on the expected rules.
     * 
     * @param values - Array of input values to validate
     * @returns Processed and validated values
     * 
     * @throws {Error} If the number of values doesn't match expected amount
     * 
     * @remarks
     * Uses the expected value rules to validate input values.
     * Applies value mapping after validation.
     */
    protected validateValues(values: ReadonlyArray<string>): ReadonlyArray<string> {
        const {amount, operator} = this.expectedValueRules;
        const compareFn = this.operatorMap.get(operator);

        this.validateValuesHook(values);

        if (!compareFn) {
            throw new Error(`Invalid operator: ${operator}`);
        }

        if (!compareFn(values.length, amount)) {
            throw new Error(`Expected ${amount} value(s), but got ${values.length}`);
        }
        
        return values;
    }

    /**
     * Evaluates the rule against input values and operator.
     * 
     * @param inputValues - Array of input values to evaluate, passed by the spawners JSON.
     * @param inputOperator - Comparison operator passed by the spawners JSON.
     * @returns Boolean indicating whether the rule passes.
     * 
     * @remarks
     * Performs validation on both values and operator before
     * executing the rule-specific logic.
     */
    evaluate(inputValues: ReadonlyArray<string>, inputOperator: Operator): boolean {
        const [values, operator] = [
            Either.encase(() => this.validateValues(inputValues)),
            Either.encase(() => this.validateOperator(inputOperator))
          ];
          
        [values, operator]
        .forEach(e => e.ifLeft(l => this.log(l.message)));
        
        return values.chain(v => {
            return operator.map(o => this.ruleHook(v, o));
        }).orDefault(false);
    }

    /**
     * Logs error messages during rule evaluation.
     * 
     * @param message - Error message to log
     * @private
     * @todo: TODO: replace with actual Pino logger.
     */
    private log(message: string) {
        console.log(message);
    }
}
