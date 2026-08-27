/**
 * The site's neutrality policy, in one place: institutional-identity
 * content stays off www.confium.org. The CI quality gate enforces the
 * OIML half on dist/; this module keeps the fetch pipeline from ever
 * vendoring the rest of it into the build.
 */

// Software-docs files the public site must not render. cnml-profile
// documents the institutional certificate format; the page stays in
// the upstream repo.
export const BLOCKED_DOCS = ['cnml-profile.mdx'];

// Spec sources kept off the central site: the institutional CNML
// deployment spec stays in the specs repo (github.com/confium/specs),
// linked but never rendered here.
export const BLOCKED_SPECS = ['80-cnml-deployment.adoc'];

/** @param {string} name — vendored docs file name */
export function isBlockedDoc(name) {
  return BLOCKED_DOCS.includes(name);
}

/** @param {string} name — spec .adoc/.md file name */
export function isBlockedSpec(name) {
  return BLOCKED_SPECS.includes(name);
}

/**
 * Diagrams whose text carries the institutional label: the CI gate
 * greps every dist file (SVG included) for OIML, so these stay on
 * GitHub and are linked, not embedded.
 *
 * @param {string} svgText
 */
export function isNeutralitySvg(svgText) {
  return /oiml/i.test(svgText);
}
