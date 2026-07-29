/**
 * Typed homepage content — single source of truth for the homepage
 * and any component that needs homepage data (e.g. ModeSelector).
 *
 * Components consume these models; they never hardcode content.
 */

export type ModeId = 'peer-tc' | 'pki-drop-in' | 'sovereign-pki';

/**
 * The three identity tones of the Confium brand. Map 1:1 to the
 * three-circle logo and the three deployment modes. Used by Card,
 * Section, ModeVenn, and Timeline to tint mode-specific surfaces.
 */
export type BrandTone = 'blue' | 'teal' | 'gold';

export interface Mode {
  readonly id: ModeId;
  readonly tone: BrandTone;
  readonly label: string;
  readonly name: string;
  readonly tagline: string;
  readonly description: string;
  readonly bullets: readonly string[];
  readonly href: string;
  readonly ctaLabel: string;
}

export interface ProofPoint {
  readonly title: string;
  readonly body: string;
}

export interface Deployment {
  readonly name: string;
  readonly body: string;
}

export interface Step {
  readonly n: number;
  readonly title: string;
  readonly body: string;
  readonly tone: BrandTone;
}

export interface Sponsor {
  readonly name: string;
  readonly role: string;
  readonly href: string;
  readonly imageSrc?: string;
  readonly imageAlt?: string;
  readonly wordmarkText?: string;
}

export const MODES: readonly Mode[] = [
  {
    id: 'peer-tc',
    tone: 'blue',
    label: 'Mode 1',
    name: 'Peer-to-Peer TC',
    tagline: 'Direct threshold cryptography between nodes.',
    description:
      'The simplest deployment: nodes exchange threshold signing messages directly over the transport of choice. No intermediary, no PKI, no translation layer. Use this when you control both ends of the channel and you want minimal moving parts.',
    bullets: [
      'MPC, distributed custody, BFT consensus',
      'Async sessions across hours or days',
      'Two-round FROST signing, three-round CMP20',
    ],
    href: '/docs/mode1-peer-tc/',
    ctaLabel: 'Read the Mode 1 docs',
  },
  {
    id: 'pki-drop-in',
    tone: 'teal',
    label: 'Mode 2',
    name: 'PKI Drop-in',
    tagline: 'Threshold keys, unchanged consumers.',
    description:
      'Drop Confium in front of existing PKCS#11, OpenSSL, or JCE consumers. They keep working unchanged — but every signature now requires a threshold quorum behind the scenes. This is the natural home for post-quantum migration via composite signatures.',
    bullets: [
      'PKCS#11 v3.0 server, OpenSSL 3.0 provider, JCE, TLS signer',
      'HSM replacement without replacing the HSM consumer',
      'Composite Ed25519 + ECDSA-P256 + ML-DSA-65 signatures',
    ],
    href: '/docs/mode2-pki-drop-in/',
    ctaLabel: 'Read the Mode 2 docs',
  },
  {
    id: 'sovereign-pki',
    tone: 'gold',
    label: 'Mode 3',
    name: 'Sovereign PKI',
    tagline: 'Institutional PKI without a single trusted party.',
    description:
      'Custom certificate formats, delegation rules, archival cadence, and quorum composition for institutions where no single stakeholder can be trusted. Sovereignty over formats, jurisdictions, governance — the things conventional PKI locks down.',
    bullets: [
      'Custom certificate profiles via confium-cert',
      'Attribute-based quorum: 5-of-9 directors from 3 regions',
      'Transparency log + OTS anchoring + RFC 4998 ERS archival',
    ],
    href: '/docs/mode3-sovereign-pki/',
    ctaLabel: 'Read the Mode 3 docs',
  },
] as const;

export const PROOF_POINTS: readonly ProofPoint[] = [
  {
    title: 'Software upgrade, not HSM replacement',
    body: 'Migrate to post-quantum signatures without re-issuing every certificate. Add an ML-DSA-65 component alongside Ed25519 via composite signatures; verifiers that haven\'t upgraded still accept the classical component, verifiers that have already migrated. No flag day, no forklift upgrade, no new hardware.',
  },
  {
    title: 'Catches silent certificate fraud',
    body: 'Every signing operation anchors into an append-only Merkle transparency log implementing RFC 6962. Split-view attacks become detectable via consistency proofs and witness gossip between coordinators. Optional OpenTimestamps anchoring in Bitcoin gives an irrefutable "what head existed at time T" record.',
  },
  {
    title: 'Standards-only — no vendor lock-in',
    body: 'PKCS#11 v3.0, OpenSSL 3.0 provider, JCE provider, CMS (RFC 5652), X.509, RFC 6962 transparency. Confium slots into existing infrastructure; it never asks you to adopt a proprietary protocol or a single-vendor SDK.',
  },
  {
    title: 'Globally distributed signers',
    body: 'The async coordinator handles round-trip latency across continents. Parties don\'t need to be online simultaneously — sessions complete over hours or days. A director in Tokyo can sign during their workday; a director in New York submits theirs hours later; the coordinator combines when quorum is reached.',
  },
  {
    title: 'Open source, BSD-2-Clause',
    body: 'No per-transaction fees, no proprietary protocol, no CLA. Funded by the European Commission through NLnet\'s NGI Zero PET program and by Mozilla MOSS. Project decisions stay with the maintainer collective.',
  },
  {
    title: 'No unsafe code, anywhere',
    body: 'Every crate carries `#![forbid(unsafe_code)]`. FFI is centralized in confium-core and uses edition 2024\'s #[unsafe(no_mangle)] form. All threshold protocols (FROST, CMP20, GG18) ship real cryptography — not stubs, not placeholders, not unfinished work.',
  },
] as const;

export const DEPLOYMENTS: readonly Deployment[] = [
  { name: 'Calibration registries', body: 'BIPM-style metrology chains where measurements must be traceable to a sovereign reference.' },
  { name: 'Pharma regulator approvals', body: 'Multi-jurisdiction regulatory sign-off on clinical trial data and drug approvals.' },
  { name: 'Academic accreditation', body: 'Cross-institutional degree and credential verification without a single trusted authority.' },
  { name: 'Supply-chain provenance', body: 'Manufacturing step attestation anchored in a public transparency log.' },
  { name: 'Treaty organizations', body: 'Multi-state cooperative instruments requiring concurrent sovereign approval.' },
  { name: 'Certified instruments registry', body: 'A reference Mode 3 deployment among many others.' },
] as const;

export const STEPS: readonly Step[] = [
  { n: 1, title: 'Generate', body: 'Distributed key generation ceremony. Secret exists once, then is split.', tone: 'blue' },
  { n: 2, title: 'Distribute', body: 'Shares go to N parties. No single party holds the full key.', tone: 'teal' },
  { n: 3, title: 'Sign', body: 'T-of-N quorum co-signs without reconstructing the secret.', tone: 'blue' },
  { n: 4, title: 'Refresh', body: 'Shares re-randomize periodically. Compromise windows shrink.', tone: 'gold' },
  { n: 5, title: 'Anchor', body: 'Event lands in transparency log. Public, auditable, immutable.', tone: 'teal' },
] as const;

export const SPONSORS: readonly Sponsor[] = [
  {
    name: 'NLnet',
    role: 'Project sponsor',
    href: 'https://nlnet.nl/project/Confium/',
    imageSrc: '/assets/nlnet-banner.svg',
    imageAlt: 'NLnet',
  },
  {
    name: 'NGI Zero PET',
    role: 'European Commission · Next Generation Internet',
    href: 'https://www.ngi.eu/ngi-projects/ngi-zero-pet/',
    imageSrc: '/assets/ngi-zeropet-banner.svg',
    imageAlt: 'NGI Zero PET',
  },
  {
    name: 'Mozilla MOSS',
    role: 'Open Source Support',
    href: 'https://www.mozilla.org/moss/',
    wordmarkText: 'mozilla',
  },
] as const;

/**
 * Map a BrandTone to its semantic CSS color token name. Centralised
 * so consumers never branch on tone — they look up the token.
 */
export const TONE_COLOR: Readonly<Record<BrandTone, 'accent' | 'accent2' | 'gold-ink'>> = {
  blue: 'accent',
  teal: 'accent2',
  gold: 'gold-ink',
};

/**
 * Map a BrandTone to its tint CSS token (for backgrounds).
 */
export const TONE_TINT: Readonly<Record<BrandTone, 'tint-blue' | 'tint-teal' | 'tint-gold'>> = {
  blue: 'tint-blue',
  teal: 'tint-teal',
  gold: 'tint-gold',
};
