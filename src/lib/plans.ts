// The plans and models, the same ones the desktop app lists in
// desktop/plans.go. Usage goes up with the price the way the labs' plans do:
// every $10 is one Free's worth, so $200 is 20x.

export type PlanId = 'free' | 'lightweight' | 'middleweight' | 'heavyweight' | 'champion';

export type Plan = {
  id: PlanId;
  name: string;
  price: number; // US dollars a month
  usage: number; // multiples of Free
  // Large says it runs the large models, not only Qwen3.5.
  large: boolean;
  features: string[];
};

export const PLANS: Plan[] = [
  { id: 'free', name: 'Free', price: 0, usage: 1, large: false, features: ['Qwen3.5, abliterated', '256K token context', 'A small usage limit'] },
  {
    id: 'lightweight',
    name: 'Lightweight',
    price: 20,
    usage: 2,
    large: true,
    features: ['GLM-5.2 and GLM-5.3, abliterated', '1M token context', '2x usage'],
  },
  { id: 'middleweight', name: 'Middleweight', price: 50, usage: 5, large: true, features: ['Everything in Lightweight', '5x usage'] },
  { id: 'heavyweight', name: 'Heavyweight', price: 100, usage: 10, large: true, features: ['Everything in Middleweight', '10x usage'] },
  { id: 'champion', name: 'Champion', price: 200, usage: 20, large: true, features: ['Everything in Heavyweight', '20x usage'] },
];

export const POPULAR: PlanId = 'lightweight';

export function planById(id: string | null | undefined): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

export const FREE = PLANS[0];

// The Stripe price for a paid plan is found by this lookup key, in test and
// live mode alike, so no price ids live in the environment.
export function lookupKey(id: PlanId): string {
  return `caveira_${id}_monthly`;
}

export function planByLookupKey(key: string | null | undefined): Plan | undefined {
  return PLANS.find((p) => p.id !== 'free' && lookupKey(p.id) === key);
}

// One Free's worth of usage a month, in dollars of what the models cost
// caveira on abliteration.ai.
export function usageUnitUSD(): number {
  const v = Number(process.env.USAGE_UNIT_USD);
  return Number.isFinite(v) && v > 0 ? v : 5;
}

export type Model = {
  id: string;
  name: string;
  large: boolean;
  context: number;
  // abliteration.ai's prices, US dollars per million tokens.
  input: number;
  cached: number;
  output: number;
};

export const MODELS: Model[] = [
  { id: 'abliterated-model', name: 'Qwen3.5', large: false, context: 262_144, input: 1, cached: 0.1, output: 3 },
  { id: 'abliterated-model-large', name: 'GLM-5.2', large: true, context: 1_000_000, input: 3, cached: 0.3, output: 5 },
  { id: 'abliterated-model-large-v2', name: 'GLM-5.3', large: true, context: 1_000_000, input: 3, cached: 0.3, output: 5 },
];

export function modelById(id: unknown): Model | undefined {
  return MODELS.find((m) => m.id === id);
}

// costMicros prices a reply in millionths of a dollar.
export function costMicros(m: Model, input: number, cached: number, output: number): number {
  const fresh = Math.max(0, input - cached);
  return Math.round(fresh * m.input + cached * m.cached + output * m.output);
}
