import type { FoodCategory } from '@/backend/openai/extractEventFromFlyer';

const RULES: { test: (t: string) => boolean; emoji: string }[] = [
  { test: (t) => /pizza/i.test(t), emoji: '🍕' },
  { test: (t) => /popcorn/i.test(t), emoji: '🍿' },
  { test: (t) => /bagel/i.test(t), emoji: '🥯' },
  { test: (t) => /breakfast|pancake|waffle/i.test(t), emoji: '🥞' },
  { test: (t) => /coffee|latte|espresso/i.test(t), emoji: '☕' },
  { test: (t) => /donut|doughnut/i.test(t), emoji: '🍩' },
  { test: (t) => /cookie|brownie|dessert|cake|cupcake/i.test(t), emoji: '🍪' },
  { test: (t) => /ice cream/i.test(t), emoji: '🍦' },
  { test: (t) => /taco|burrito/i.test(t), emoji: '🌯' },
  { test: (t) => /burger|hamburger/i.test(t), emoji: '🍔' },
  { test: (t) => /salad/i.test(t), emoji: '🥗' },
  { test: (t) => /sushi/i.test(t), emoji: '🍣' },
  { test: (t) => /pasta|spaghetti|lasagna/i.test(t), emoji: '🍝' },
  { test: (t) => /sandwich|sub\b/i.test(t), emoji: '🥪' },
  { test: (t) => /fruit/i.test(t), emoji: '🍎' },
  { test: (t) => /catering|meal|dinner|lunch|buffet/i.test(t), emoji: '🍽️' },
  { test: (t) => /refreshment|snack|treat|light bite/i.test(t), emoji: '🥤' },
  { test: (t) => /drink|beverage|soda|juice/i.test(t), emoji: '🥤' },
];

const CATEGORY_FALLBACK: Partial<Record<FoodCategory, string>> = {
  pizza: '🍕',
  dessert: '🍰',
  snacks: '🍿',
  refreshments: '🥤',
  drinks: '🥤',
  meal: '🍽️',
  other: '🍽️',
};

/** Default when we have no food signal */
export const DEFAULT_FOOD_EMOJI = '🍽️';

/**
 * Pick a single food emoji from free-text food line + category.
 */
export function inferFoodEmoji(food: string | null | undefined, foodCategory: FoodCategory | null | undefined): string {
  const t = `${food ?? ''}`.trim();
  if (t) {
    for (const { test, emoji } of RULES) {
      if (test(t)) return emoji;
    }
  }
  if (foodCategory && CATEGORY_FALLBACK[foodCategory]) {
    return CATEGORY_FALLBACK[foodCategory]!;
  }
  return DEFAULT_FOOD_EMOJI;
}
