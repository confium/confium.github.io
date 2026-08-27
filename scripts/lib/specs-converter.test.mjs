import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { convertSpec, serializeSpec } from './specs-converter.mjs';
import { isBlockedSpec, isNeutralitySvg, isBlockedDoc } from './neutrality.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VENDOR_SPECS = join(__dirname, '..', '..', 'vendor', 'specs', 'specs');

/**
 * In-memory resolve adapter: two specs exist, one is blocked, one is
 * unwritten; one diagram embeds, one is kept off-site.
 */
function testResolve() {
  return {
    specHref: (leaf) =>
      ['22-threshold-session', '91-keyless-flow'].includes(leaf) ? `/specs/${leaf}/` : null,
    specStatus: (leaf) => {
      if (leaf === '80-cnml-deployment') return 'blocked';
      return ['22-threshold-session', '91-keyless-flow'].includes(leaf) ? 'page' : 'missing';
    },
    imageHref: (file) => (file === 'async-session-lifecycle.svg' ? `/specs/images/${file}` : null),
    blobUrl: (path) => `https://github.com/confium/specs/blob/main/${path}`,
  };
}

function convert(text, name = '22-threshold-session.adoc') {
  return convertSpec(text, name, testResolve());
}

describe('neutrality policy', () => {
  it('blocks the institutional deployment spec and doc', () => {
    expect(isBlockedSpec('80-cnml-deployment.adoc')).toBe(true);
    expect(isBlockedSpec('22-threshold-session.adoc')).toBe(false);
    expect(isBlockedDoc('cnml-profile.mdx')).toBe(true);
    expect(isBlockedDoc('index.mdx')).toBe(false);
  });

  it('flags diagrams carrying the institutional label', () => {
    expect(isNeutralitySvg('<svg><text>OIML CNML 5-tier hierarchy</text></svg>')).toBe(true);
    expect(isNeutralitySvg('<svg><text>Transparency log</text></svg>')).toBe(false);
  });
});

describe('header and frontmatter', () => {
  it('takes the title from the = heading and drops author/attribute lines', () => {
    const { frontmatter, body } = convert(
      ['= Specification 22 — Threshold session', ':product: threshold', ':status: accepted',
       'Ribose Inc. <open.source@ribose.com>', ':sectnums:', '', '== Overview', '', 'Body text.'].join('\n'),
    );
    expect(frontmatter.title).toBe('Specification 22 — Threshold session');
    expect(frontmatter.product).toBe('threshold');
    expect(frontmatter.status).toBe('accepted');
    expect(frontmatter.spec_id).toBe(22);
    expect(body).not.toContain(':sectnums:');
    expect(body).not.toContain('Ribose');
  });

  it('always emits title, upstream_path, and category', () => {
    const { frontmatter } = convert('= Bare\n\nNo attrs at all.');
    expect(typeof frontmatter.title).toBe('string');
    expect(frontmatter.upstream_path).toBe('specs/22-threshold-session.adoc');
    expect(typeof frontmatter.category).toBe('string');
  });

  it('derives category from :product: first, then number prefix', () => {
    expect(convert('= T\n:product: pki\n\nX.', '30-x509-pki.adoc').frontmatter.category).toBe('pki');
    expect(convert('= T\n\nX.', '02-workspace-organization.adoc').frontmatter.category).toBe('architecture');
    expect(convert('= T\n\nX.', '11-mode2-pki-replacement.adoc').frontmatter.category).toBe('modes');
    expect(convert('= T\n\nX.', '90-security-model.adoc').frontmatter.category).toBe('security');
    expect(convert('= T\n\nX.', 'PRODUCTS.adoc').frontmatter.category).toBe('index');
  });

  it('extracts the first prose sentence as description', () => {
    const { frontmatter } = convert('= T\n\nFirst sentence here. Second sentence.');
    expect(frontmatter.description).toBe('First sentence here.');
  });
});

describe('block conversions', () => {
  it('demotes == headings one level and leaves ``` fences untouched', () => {
    const { body } = convert(['= T', '', '== Overview', '', '```', '|literal| table', '```'].join('\n'));
    expect(body).toContain('## Overview');
    expect(body).toContain('|literal| table');
  });

  it('converts [source] + ---- listings to fenced code', () => {
    const { body } = convert(['= T', '', '[source,toml]', '----', '[workspace.package]', 'version = "0.3"', '----'].join('\n'));
    expect(body).toContain('```toml\n[workspace.package]\nversion = "0.3"\n```');
  });

  it('converts |=== tables to markdown tables', () => {
    const { body } = convert(
      ['= T', '', '|===', '|Type |Phases', '|DKG |3 rounds', '|===' ].join('\n'),
    );
    expect(body).toContain('| Type | Phases |');
    expect(body).toContain('| --- | --- |');
    expect(body).toContain('| DKG | 3 rounds |');
  });

  it('skips [cols=…] attribute lines inside tables', () => {
    const { body } = convert(['= T', '', '|===', '[cols="1,1"]', '|A |B', '|===' ].join('\n'));
    expect(body).not.toContain('cols');
    expect(body).toContain('| A | B |');
  });
});

describe('inline macros', () => {
  it('rewrites relative spec links to site pages', () => {
    const { body } = convert('= T\n\nSee link:91-keyless-flow.adoc[Keyless flow] and link:22-threshold-session.adoc[].');
    expect(body).toContain('[Keyless flow](/specs/91-keyless-flow/)');
    expect(body).toContain('[22-threshold-session](/specs/22-threshold-session/)');
  });

  it('links blocked specs to GitHub and degrades unwritten specs to plain text', () => {
    const { body } = convert('= T\n\nSee link:80-cnml-deployment.adoc[CNML] and link:40-deployment-manifest.adoc[40 — Deployment manifest].');
    expect(body).toContain('[CNML](https://github.com/confium/specs/blob/main/specs/80-cnml-deployment.adoc)');
    expect(body).toContain('40 — Deployment manifest');
    expect(body).not.toContain('40-deployment-manifest.adoc)');
  });

  it('converts link: macros and bare https://…[label] macros', () => {
    const { body } = convert('= T\n\nlink:https://example.com/[Example] and https://example.com/x[the x page].');
    expect(body).toContain('[Example](https://example.com/)');
    expect(body).toContain('[the x page](https://example.com/x)');
  });

  it('embeds allowed diagrams, links out skipped ones', () => {
    const { body } = convert('= T\n\nimage::../images/async-session-lifecycle.svg[Async] and image::../images/cnml-tier-hierarchy.svg[CNML tiers].');
    expect(body).toContain('![Async](/specs/images/async-session-lifecycle.svg)');
    expect(body).toContain('[CNML tiers (SVG)](https://github.com/confium/specs/blob/main/images/cnml-tier-hierarchy.svg)');
  });
});

describe('serialization', () => {
  it('round-trips frontmatter as parseable YAML with required keys', () => {
    const out = serializeSpec(convert('= T: with "quotes"\n\nBody.'));
    const fm = out.match(/^---\n([\s\S]*?)\n---/)[1];
    expect(fm).toContain('title: "T: with \\"quotes\\""');
    expect(fm).toContain('upstream_path:');
    expect(fm).toContain('category:');
  });
});

describe('golden corpus (vendor/specs)', () => {
  it.skipIf(!existsSync(VENDOR_SPECS))(
    'every converted spec honors the site contract',
    () => {
      const adocs = readdirSync(VENDOR_SPECS).filter((f) => f.endsWith('.adoc'));
      expect(adocs.length).toBeGreaterThan(10);
      const resolve = testResolve();
      const ids = new Set(adocs.map((f) => f.replace(/\.adoc$/, '')));
      const fsResolve = {
        specHref: (leaf) => (ids.has(leaf) && !isBlockedSpec(`${leaf}.adoc`) ? `/specs/${leaf}/` : null),
        specStatus: (leaf) =>
          isBlockedSpec(`${leaf}.adoc`) ? 'blocked' : ids.has(leaf) ? 'page' : 'missing',
        imageHref: () => null,
        blobUrl: (path) => `https://github.com/confium/specs/blob/main/${path}`,
      };
      for (const f of adocs) {
        if (isBlockedSpec(f)) continue;
        const converted = convertSpec(readFileSync(join(VENDOR_SPECS, f), 'utf8'), f, fsResolve);
        const md = serializeSpec(converted);
        expect(converted.frontmatter.title, `${f}: title`).toBeTruthy();
        expect(converted.frontmatter.upstream_path, `${f}: upstream_path`).toBe(`specs/${f}`);
        expect(converted.frontmatter.category, `${f}: category`).toBeTruthy();
        expect(md, `${f}: OIML must not render`).not.toMatch(/oiml/i);
        expect(md, `${f}: gate language`).not.toMatch(/TODO|coming soon|planned|milestone|roadmap/i);
        for (const href of md.matchAll(/\]\(\/specs\/([^/)]+)\/?\)/g)) {
          expect(ids, `${f}: internal link ${href[1]}`).toContain(href[1].toLowerCase());
        }
      }
    },
  );
});
