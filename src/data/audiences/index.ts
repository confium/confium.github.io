export interface UseCase {
  slug: string;
  title: string;
  summary: string;
  productSlugs: string[];
  audienceSlugs: string[];
}

export interface Audience {
  slug: string;
  name: string;
  tagline: string;
  primaryProductSlugs: string[];
  useCaseSlugs: string[];
  journey: { title: string; description: string; href: string }[];
}

export const audiences: Audience[] = [
  {
    slug: 'security-engineer',
    name: 'Security Engineer',
    tagline: 'Eliminate single points of failure in enterprise signing.',
    primaryProductSlugs: ['threshold', 'pki'],
    useCaseSlugs: ['hsm-replacement', 'threshold-ca', 'automated-key-rotation', 'sovereign-pki'],
    journey: [
      { title: '1. Evaluate', description: 'Read the Threshold product overview.', href: '/threshold/' },
      { title: '2. Prototype', description: 'Run a 3-party local DKG.', href: '/threshold/quickstart/' },
      { title: '3. Deploy', description: 'Stand up a production signerd cluster.', href: '/threshold/docs/deploy/' },
    ],
  },
  {
    slug: 'devsecops',
    name: 'DevSecOps / Platform Engineer',
    tagline: 'Deploy, monitor, and operate threshold signing infrastructure.',
    primaryProductSlugs: ['threshold', 'verify'],
    useCaseSlugs: ['cicd-signing', 'k8s-operator-deploy', 'monitoring-alerting', 'policy-enforcement'],
    journey: [
      { title: '1. Evaluate', description: 'Read the Threshold + Verify overviews.', href: '/threshold/' },
      { title: '2. Deploy', description: 'Use the Kubernetes operator recipe.', href: '/threshold/docs/deploy-k8s/' },
      { title: '3. Verify', description: 'Add CI verification gate.', href: '/verify/quickstart/' },
    ],
  },
  {
    slug: 'ca-operator',
    name: 'CA Operator',
    tagline: 'Run a CA without a single trusted key.',
    primaryProductSlugs: ['pki', 'transparency'],
    useCaseSlugs: ['threshold-ca', 'certificate-transparency', 'ocsp-crl', 'acme-automation'],
    journey: [
      { title: '1. Evaluate', description: 'Read the PKI product overview.', href: '/pki/' },
      { title: '2. Prototype', description: 'Run a threshold CA locally.', href: '/pki/quickstart/' },
      { title: '3. Audit', description: 'Anchor certificates to a transparency log.', href: '/transparency/quickstart/' },
    ],
  },
  {
    slug: 'oss-maintainer',
    name: 'Open Source Maintainer',
    tagline: 'Sign releases without managing keys.',
    primaryProductSlugs: ['keyless', 'verify'],
    useCaseSlugs: ['github-release-signing', 'artifact-provenance', 'oidc-keyless', 'supply-chain-attestation'],
    journey: [
      { title: '1. Evaluate', description: 'Read the Keyless product overview.', href: '/keyless/' },
      { title: '2. Wire up', description: 'Add the GitHub Action to your release workflow.', href: '/keyless/quickstart/' },
      { title: '3. Verify', description: 'Verify signatures in CI.', href: '/verify/quickstart/' },
    ],
  },
  {
    slug: 'compliance',
    name: 'Compliance / Audit Team',
    tagline: 'Prove your operations are auditable and tamper-evident.',
    primaryProductSlugs: ['transparency'],
    useCaseSlugs: ['tamper-evident-audit', 'inclusion-proofs', 'long-term-archival', 'witness-gossip'],
    journey: [
      { title: '1. Evaluate', description: 'Read the Transparency product overview.', href: '/transparency/' },
      { title: '2. Verify', description: 'Run an inclusion proof against a log.', href: '/transparency/quickstart/' },
      { title: '3. Archive', description: 'Configure ERS long-term archival.', href: '/transparency/docs/ers/' },
    ],
  },
  {
    slug: 'blockchain-dev',
    name: 'Blockchain Protocol Developer',
    tagline: 'Threshold + privacy primitives for bridges, swaps, custody.',
    primaryProductSlugs: ['threshold', 'privacy'],
    useCaseSlugs: ['bridge-signing', 'atomic-swaps', 'mpc-dkg', 'vrf-randomness', 'threshold-custody'],
    journey: [
      { title: '1. Evaluate', description: 'Read Threshold + Privacy overviews.', href: '/threshold/' },
      { title: '2. Prototype', description: 'Run a CMP20 sign ceremony.', href: '/threshold/quickstart/' },
      { title: '3. Adapt', description: 'Apply adaptor signatures for atomic swaps.', href: '/privacy/docs/adaptor-sigs/' },
    ],
  },
  {
    slug: 'privacy-dev',
    name: 'Privacy App Developer',
    tagline: 'Build privacy-preserving applications on proven crypto.',
    primaryProductSlugs: ['privacy'],
    useCaseSlugs: ['private-set-intersection', 'zk-proofs', 'differential-privacy', 'anonymous-credentials'],
    journey: [
      { title: '1. Evaluate', description: 'Read the Privacy product overview.', href: '/privacy/' },
      { title: '2. Prototype', description: 'Run a two-party PSI.', href: '/privacy/quickstart/' },
      { title: '3. Deploy', description: 'Integrate with your application.', href: '/privacy/docs/integrate/' },
    ],
  },
  {
    slug: 'web-developer',
    name: 'Web Developer',
    tagline: 'Verify threshold signatures in the browser, on the edge, or via HTTP.',
    primaryProductSlugs: ['verify'],
    useCaseSlugs: ['browser-verification', 'public-verify-endpoint', 'wasm-integration', 'real-time-dashboard'],
    journey: [
      { title: '1. Evaluate', description: 'Read the Verify product overview.', href: '/verify/' },
      { title: '2. Embed', description: 'Drop the WASM snippet into your page.', href: '/verify/quickstart/' },
      { title: '3. Scale', description: 'Deploy verify-server for batch verification.', href: '/verify/docs/server/' },
    ],
  },
];

export const useCases: UseCase[] = [
  // Threshold product
  {
    slug: 'hsm-replacement',
    title: 'HSM Replacement',
    summary: 'Replace a single-key HSM with T-of-N distributed signing. No single party can sign alone; compromising T-1 parties does not compromise the key.',
    productSlugs: ['threshold'],
    audienceSlugs: ['security-engineer', 'ca-operator'],
  },
  {
    slug: 'threshold-ca',
    title: 'Threshold CA Signing',
    summary: 'Operate a certificate authority where the root key is split across multiple parties. Issue certifies requires T-of-N quorum.',
    productSlugs: ['threshold', 'pki'],
    audienceSlugs: ['security-engineer', 'ca-operator'],
  },
  {
    slug: 'automated-key-rotation',
    title: 'Automated Key Rotation',
    summary: 'Run Herzberg share refresh on a schedule so that compromising the same T parties over time still does not reveal the key.',
    productSlugs: ['threshold'],
    audienceSlugs: ['security-engineer'],
  },
  {
    slug: 'sovereign-pki',
    title: 'Sovereign PKI',
    summary: 'Operate a national or industry PKI where the root of trust is held by a quorum of institutional parties rather than a single operator.',
    productSlugs: ['threshold', 'pki'],
    audienceSlugs: ['security-engineer', 'ca-operator'],
  },
  // DevSecOps
  {
    slug: 'cicd-signing',
    title: 'CI/CD Signing',
    summary: 'Sign build artifacts at release time using threshold keys held outside CI. Compromising CI does not compromise the signing key.',
    productSlugs: ['threshold', 'keyless'],
    audienceSlugs: ['devsecops', 'oss-maintainer'],
  },
  {
    slug: 'k8s-operator-deploy',
    title: 'Kubernetes Operator Deployment',
    summary: 'Run Confium signerd as a Kubernetes operator with declarative share management, automated failover, and graceful shutdown.',
    productSlugs: ['threshold'],
    audienceSlugs: ['devsecops'],
  },
  {
    slug: 'monitoring-alerting',
    title: 'Monitoring & Alerting',
    summary: 'Wire signerd into Prometheus/Grafana. Alert on signing-op failures, slow rounds, share-recovery events.',
    productSlugs: ['threshold'],
    audienceSlugs: ['devsecops'],
  },
  {
    slug: 'policy-enforcement',
    title: 'Policy Enforcement',
    summary: 'Define attribute-based policies that signing sessions must satisfy (geography, role, time-of-day).',
    productSlugs: ['threshold', 'pki'],
    audienceSlugs: ['devsecops', 'security-engineer'],
  },
  // CA Operator
  {
    slug: 'certificate-transparency',
    title: 'Certificate Transparency',
    summary: 'Run an RFC 6962 transparency log for your CA. Every issued cert is appended; mis-issuance is detectable.',
    productSlugs: ['transparency', 'pki'],
    audienceSlugs: ['ca-operator', 'compliance'],
  },
  {
    slug: 'ocsp-crl',
    title: 'OCSP / CRL from Threshold Keys',
    summary: 'Operate OCSP responders and CRL signing from threshold keys. No single party can revoke or attest alone.',
    productSlugs: ['pki', 'threshold'],
    audienceSlugs: ['ca-operator'],
  },
  {
    slug: 'acme-automation',
    title: 'ACME Automation',
    summary: 'Integrate ACME protocol with threshold-backed certificate issuance. Drop-in for certbot-style automation.',
    productSlugs: ['pki'],
    audienceSlugs: ['ca-operator', 'devsecops'],
  },
  // OSS Maintainer
  {
    slug: 'github-release-signing',
    title: 'GitHub Release Signing',
    summary: 'Sign GitHub release artifacts keylessly using OIDC. No long-lived signing key to manage or compromise.',
    productSlugs: ['keyless'],
    audienceSlugs: ['oss-maintainer'],
  },
  {
    slug: 'artifact-provenance',
    title: 'Artifact Provenance',
    summary: 'Generate SLSA-compatible provenance attestations for build artifacts, anchored to a transparency log.',
    productSlugs: ['keyless'],
    audienceSlugs: ['oss-maintainer', 'compliance'],
  },
  {
    slug: 'oidc-keyless',
    title: 'OIDC-Based Keyless Signing',
    summary: 'Use GitHub, Google, GitLab, Azure AD, or Okta as the identity provider for short-lived signing certificates.',
    productSlugs: ['keyless'],
    audienceSlugs: ['oss-maintainer', 'devsecops'],
  },
  {
    slug: 'supply-chain-attestation',
    title: 'Supply Chain Attestation',
    summary: 'Produce verifiable attestations linking artifacts to their source, build, and signing ceremony.',
    productSlugs: ['keyless', 'transparency'],
    audienceSlugs: ['oss-maintainer', 'compliance'],
  },
  // Compliance
  {
    slug: 'tamper-evident-audit',
    title: 'Tamper-Evident Audit Trail',
    summary: 'Append every material event to an RFC 6962 log. Any later tampering is cryptographically detectable.',
    productSlugs: ['transparency'],
    audienceSlugs: ['compliance'],
  },
  {
    slug: 'inclusion-proofs',
    title: 'Inclusion Proofs for Regulations',
    summary: 'Produce inclusion proofs showing a record was in the log as of a given root. Satisfies regulatory audit requirements.',
    productSlugs: ['transparency'],
    audienceSlugs: ['compliance'],
  },
  {
    slug: 'long-term-archival',
    title: 'Long-Term Archival (ERS)',
    summary: 'Archive signatures for decades using Evidence Record Syntax (ERS). Renew cryptographic strength as algorithms age.',
    productSlugs: ['transparency'],
    audienceSlugs: ['compliance'],
  },
  {
    slug: 'witness-gossip',
    title: 'Witness Gossip Verification',
    summary: 'Distribute log roots across multiple witnesses so that a single log cannot silently rewrite history.',
    productSlugs: ['transparency'],
    audienceSlugs: ['compliance'],
  },
  // Blockchain
  {
    slug: 'bridge-signing',
    title: 'Bridge Signing',
    summary: 'Operate a cross-chain bridge where the signing key is held by a threshold quorum of validators.',
    productSlugs: ['threshold'],
    audienceSlugs: ['blockchain-dev'],
  },
  {
    slug: 'atomic-swaps',
    title: 'Atomic Swaps (Adaptor Signatures)',
    summary: 'Use adaptor signatures to construct atomic cross-chain swaps without trusted escrow.',
    productSlugs: ['privacy', 'threshold'],
    audienceSlugs: ['blockchain-dev'],
  },
  {
    slug: 'mpc-dkg',
    title: 'MPC DKG',
    summary: 'Run distributed key generation across N parties so that no party ever holds the full key.',
    productSlugs: ['threshold', 'privacy'],
    audienceSlugs: ['blockchain-dev', 'security-engineer'],
  },
  {
    slug: 'vrf-randomness',
    title: 'VRF Randomness',
    summary: 'Generate verifiable, unpredictable randomness for on-chain lotteries, leader election, and commit-reveal schemes.',
    productSlugs: ['privacy'],
    audienceSlugs: ['blockchain-dev'],
  },
  {
    slug: 'threshold-custody',
    title: 'Threshold Custody',
    summary: 'Custody digital assets under T-of-N quorum control. Withdrawals require threshold sign-off.',
    productSlugs: ['threshold'],
    audienceSlugs: ['blockchain-dev', 'security-engineer'],
  },
  // Privacy
  {
    slug: 'private-set-intersection',
    title: 'Private Set Intersection',
    summary: 'Two parties learn the intersection of their sets without revealing anything outside the intersection.',
    productSlugs: ['privacy'],
    audienceSlugs: ['privacy-dev'],
  },
  {
    slug: 'zk-proofs',
    title: 'ZK Proof Generation',
    summary: 'Generate zero-knowledge proofs of set membership, signature possession, or policy satisfaction.',
    productSlugs: ['privacy'],
    audienceSlugs: ['privacy-dev', 'blockchain-dev'],
  },
  {
    slug: 'differential-privacy',
    title: 'Differential Privacy Analytics',
    summary: 'Release aggregate statistics with formal privacy guarantees. Useful for telemetry, ad-tech, healthcare analytics.',
    productSlugs: ['privacy'],
    audienceSlugs: ['privacy-dev'],
  },
  {
    slug: 'anonymous-credentials',
    title: 'Anonymous Credentials',
    summary: 'Issue credentials that the holder can later prove possession of without revealing the underlying identity.',
    productSlugs: ['privacy'],
    audienceSlugs: ['privacy-dev'],
  },
  // Web Developer
  {
    slug: 'browser-verification',
    title: 'Browser-Side Verification',
    summary: 'Verify composite signatures, transparency proofs, and certificate chains entirely client-side via WASM.',
    productSlugs: ['verify'],
    audienceSlugs: ['web-developer'],
  },
  {
    slug: 'public-verify-endpoint',
    title: 'Public Verification Endpoint',
    summary: 'Deploy a stateless HTTP verify endpoint for clients that cannot run WASM (e.g., curl, server-to-server).',
    productSlugs: ['verify'],
    audienceSlugs: ['web-developer', 'devsecops'],
  },
  {
    slug: 'wasm-integration',
    title: 'WASM Integration',
    summary: 'Embed the Confium WASM verifier in any SPA, blog, or static site via a single npm install.',
    productSlugs: ['verify'],
    audienceSlugs: ['web-developer'],
  },
  {
    slug: 'real-time-dashboard',
    title: 'Real-Time Verification Dashboard',
    summary: 'Stream verification events to a dashboard. Monitor signing-ceremony rates, failure modes, geographic distribution.',
    productSlugs: ['verify', 'transparency'],
    audienceSlugs: ['web-developer', 'devsecops'],
  },
];

export function getAudience(slug: string): Audience | undefined {
  return audiences.find((a) => a.slug === slug);
}

export function getUseCase(slug: string): UseCase | undefined {
  return useCases.find((u) => u.slug === slug);
}

export function useCasesForProduct(productSlug: string): UseCase[] {
  return useCases.filter((u) => u.productSlugs.includes(productSlug));
}

export function useCasesForAudience(audienceSlug: string): UseCase[] {
  return useCases.filter((u) => u.audienceSlugs.includes(audienceSlug));
}

export function audiencesForProduct(productSlug: string): Audience[] {
  return audiences.filter((a) => a.primaryProductSlugs.includes(productSlug));
}
