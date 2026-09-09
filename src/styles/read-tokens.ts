export type TokenRule =
  | { name: `--${string}`; kind: 'color' }
  | { name: `--${string}`; kind: 'number'; min: number; max: number };

type TokenValue<Rule extends TokenRule> = Rule extends { kind: 'number' } ? number : string;

export type ReadTokenValues<Schema extends Record<string, TokenRule>> = {
  [Key in keyof Schema]: TokenValue<Schema[Key]>;
};

const HEX_COLOR = /^#[\da-f]{3}(?:[\da-f]{3})?$/i;
const DECIMAL_NUMBER = /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/;

export function readTokens<const Schema extends Record<string, TokenRule>>(
  element: Element,
  schema: Schema,
): ReadTokenValues<Schema> {
  const style = getComputedStyle(element);
  const result: Partial<Record<keyof Schema, string | number>> = {};

  for (const [key, rule] of Object.entries(schema) as [keyof Schema, TokenRule][]) {
    const rawValue = style.getPropertyValue(rule.name).trim();

    if (rule.kind === 'color') {
      if (!HEX_COLOR.test(rawValue)) throw new Error(`Invalid color token ${rule.name}: ${rawValue || '(empty)'}`);
      result[key] = rawValue;
      continue;
    }

    if (!DECIMAL_NUMBER.test(rawValue)) throw new Error(`Invalid number token ${rule.name}: ${rawValue || '(empty)'}`);
    const value = Number(rawValue);
    if (!Number.isFinite(value) || value < rule.min || value > rule.max) {
      throw new Error(`Number token ${rule.name} is outside ${rule.min}..${rule.max}: ${rawValue}`);
    }
    result[key] = value;
  }

  return result as ReadTokenValues<Schema>;
}
