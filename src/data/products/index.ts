export interface Product {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  accentColor: string;
  accentClass: string;
  logoConcept: string;
  audience: string[];
  crates: string[];
  install: string;
  useCases: string[];
  features: string[];
}

export const products: Product[] = [
  {
    slug: 'threshold',
    name: 'Confium Threshold',
    tagline: 'Eliminate single points of failure in your signing infrastructure.',
    description: 'Production-grade threshold signing with CMP20, GG18, FROST, and MuSig. Real Paillier MtA, distributed key generation, share recovery, and Herzberg refresh.',
    accentColor: '#1E40AF',
    accentClass: 'threshold',
    logoConcept: 'T-of-N shield segments',
    audience: ['Security Engineers', 'DevSecOps', 'Platform Engineers'],
    crates: ['confium-tc-core', 'confium-coordinator', 'confium-tc-keys', 'confium-tc-cmp20', 'confium-tc-gg18', 'confium-tc-frost-p256', 'confium-tc-frost-ed25519', 'confium-signerd'],
    install: 'cargo install confium-cli',
    useCases: ['HSM Replacement', 'Threshold CA Signing', 'Distributed Custody', 'DNSSEC Signing'],
    features: ['CMP20 with Paillier MtA', 'Multi-round orchestration', 'Rate limiting + policy', 'HSM share protection', 'K8s operator'],
  },
  {
    slug: 'transparency',
    name: 'Confium Transparency',
    tagline: 'Prove your operations are auditable and tamper-evident.',
    description: 'RFC 6962 append-only Merkle tree with inclusion/consistency proofs. Witness gossip, OTS anchoring, ERS archival. Log server, monitor, and Cloudflare Workers edge deployment.',
    accentColor: '#059669',
    accentClass: 'transparency',
    logoConcept: 'Merkle tree leaf',
    audience: ['Compliance Teams', 'CAs', 'Audit Teams', 'Blockchain Protocols'],
    crates: ['confium-transparency', 'confium-log-server', 'confium-log-monitor', 'confium-log-edge'],
    install: 'docker pull confium/log-server',
    useCases: ['Certificate Transparency', 'Supply Chain Provenance', 'Regulatory Audit Trail'],
    features: ['RFC 6962 Merkle tree', 'Witness gossip protocol', 'OTS Bitcoin anchoring', 'Cloudflare Workers edge', 'ERS long-term archival'],
  },
  {
    slug: 'pki',
    name: 'Confium PKI',
    tagline: 'Run a CA without a single trusted key.',
    description: 'Full PKI lifecycle from threshold keys: issue, revoke, CRL. OCSP responder, ACME integration. PKCS#11 server, OpenSSL 3.0 provider, JCE provider. Composite signatures for PQ migration.',
    accentColor: '#D97706',
    accentClass: 'pki',
    logoConcept: 'Certificate chain',
    audience: ['CA Operators', 'Enterprise PKI Teams', 'Institutional PKI'],
    crates: ['confium-pki', 'confium-pkcs11-server', 'confium-openssl-provider', 'confium-jce-provider', 'confium-tls-signer'],
    install: 'cargo install confium-cli',
    useCases: ['Threshold CA Operation', 'OCSP from Threshold Keys', 'ACME Integration', 'Sovereign PKI'],
    features: ['Threshold CA (issue/revoke/CRL)', 'PKCS#11 + OpenSSL adapters', 'OCSP responder', 'ACME protocol', 'PQ composite signatures'],
  },
  {
    slug: 'keyless',
    name: 'Confium Keyless',
    tagline: 'Sign releases without managing keys.',
    description: 'OIDC-based keyless threshold signing. GitHub Actions, Google, GitLab, Okta, Azure AD. Short-lived certificates from threshold keys anchored to transparency log.',
    accentColor: '#7C3AED',
    accentClass: 'keyless',
    logoConcept: 'Cloud dissolving key',
    audience: ['Open Source Maintainers', 'CI/CD Teams', 'DevOps'],
    crates: ['confium-oidc', 'confium-keyless'],
    install: 'uses: confium/action@v1',
    useCases: ['GitHub Release Signing', 'CI/CD Artifact Signing', 'OIDC-Based Signing'],
    features: ['OIDC verification (GitHub/Google/GitLab)', 'GitHub Action', 'Short-lived certificates', 'Transparency log anchoring'],
  },
  {
    slug: 'privacy',
    name: 'Confium Privacy',
    tagline: 'Build privacy-preserving applications on proven crypto.',
    description: 'ZK proofs, MPC, private set intersection, differential privacy, ring signatures, blind signatures, VRF, VDF. 15+ standalone privacy primitives.',
    accentColor: '#0D9488',
    accentClass: 'privacy',
    logoConcept: 'Overlapping ZK shields',
    audience: ['Privacy App Developers', 'Researchers', 'Compliance Engineers'],
    crates: ['confium-privacy', 'confium-crypto-zk', 'confium-crypto-vss', 'confium-ring'],
    install: 'cargo add confium-privacy',
    useCases: ['Private Set Intersection', 'ZK Proof Generation', 'Differential Privacy', 'Anonymous Credentials'],
    features: ['NIZK proofs', 'PSI + PIR', 'SPDZ MPC', 'Differential privacy', 'Ring signatures', 'VRF + VDF'],
  },
  {
    slug: 'verify',
    name: 'Confium Verify',
    tagline: 'Verify threshold signatures anywhere.',
    description: 'Lightweight verification in browser (WASM), Python, Ruby, Node, Go. HTTP verification service. Batch verification, LRU cache. Verifier-only by design.',
    accentColor: '#0891B2',
    accentClass: 'verify',
    logoConcept: 'Hexagonal checkmark',
    audience: ['Web Developers', 'Monitoring Tools', 'CI Pipelines'],
    crates: ['confium-wasm', 'confium-verify-server', 'confium-composite', 'confium-python', 'confium-node'],
    install: 'npm install @confium/verify',
    useCases: ['Browser-Side Verification', 'CI Verification', 'Batch Verification', 'Public Verification Endpoint'],
    features: ['WASM verifier', 'Python + Ruby + Node + Go bindings', 'HTTP verify service', 'Batch verification', 'LRU cache'],
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
