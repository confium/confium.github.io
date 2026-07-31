/**
 * Audiences — the canonical list of audience pages.
 *
 * Single source of truth for the 12 audience pages. Consumed by
 * `/audiences/index.astro`, the WhoFor primitive, and any other
 * code that needs to enumerate or link to audience pages.
 *
 * The `aliases` field on each entry handles alternate names —
 * the docs schema uses singular forms (`developer`, `executive`)
 * while the page slugs are plural (`developers`, `executives`).
 * Components should look up via `resolveAudience(name)`.
 */

export const AUDIENCES = [
  { slug: 'executives', name: 'Executives', tagline: 'Business value, risk, and compliance', aliases: ['executive'] },
  { slug: 'architects', name: 'Security architects', tagline: 'Threat model and integration patterns', aliases: ['architect'] },
  { slug: 'developers', name: 'Developers', tagline: 'API, examples, and SDK choice', aliases: ['developer'] },
  { slug: 'operators', name: 'PKI operators', tagline: 'Deployment, monitoring, and runbooks', aliases: ['operator'] },
  { slug: 'compliance', name: 'Compliance officers', tagline: 'FIPS, jurisdictions, and audit', aliases: [] },
  { slug: 'evaluators', name: 'Evaluators and researchers', tagline: 'Test vectors, benchmarks, and protocol references', aliases: ['evaluator', 'researcher'] },
  { slug: 'ctos', name: 'CTOs and engineering directors', tagline: 'Strategic adoption and risk posture', aliases: ['cto'] },
  { slug: 'product-managers', name: 'Product managers', tagline: 'Scoping threshold-trust features', aliases: ['product-manager'] },
  { slug: 'contributors', name: 'Open source contributors', tagline: 'Code, docs, plugins, security research', aliases: ['contributor'] },
  { slug: 'students', name: 'Students and educators', tagline: 'Teaching materials, labs, and reading lists', aliases: ['student'] },
  { slug: 'auditors', name: 'Security auditors', tagline: 'Audit checklist, evidence, and common findings', aliases: ['auditor'] },
  { slug: 'web3', name: 'Web3 and blockchain developers', tagline: 'Threshold custody, MPC wallets, and on-chain signing', aliases: [] },
] as const;

export type AudienceSlug = (typeof AUDIENCES)[number]['slug'];

/**
 * Resolve any audience reference (slug or alias) to its slug.
 * Returns the input unchanged if no match — caller decides how to
 * handle unknown names.
 */
export function resolveAudience(name: string): string {
  for (const a of AUDIENCES) {
    if (a.slug === name || (a as { aliases?: readonly string[] }).aliases?.includes(name)) {
      return a.slug;
    }
  }
  return name;
}

