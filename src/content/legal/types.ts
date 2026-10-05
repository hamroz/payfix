// Shape of a legal document. Every language has the same documents with the same section ids,
// so links like /privacy#cookies work in any language.

/**
 * A paragraph or a bulleted list. Text may use `<b>…</b>` for emphasis and the `{contact}`
 * placeholder, which is rendered as a full sentence with the operator's contact details.
 */
export type Block = string | { list: string[] };

export type LegalSection = {
  /** Stable slug, identical in every language (used for anchors). */
  id: string;
  heading: string;
  blocks: Block[];
};

export type LegalDoc = {
  title: string;
  /** Meta description for search results and link previews. */
  description: string;
  /** ISO date (YYYY-MM-DD) of the English version this text matches. */
  updated: string;
  intro: Block[];
  sections: LegalSection[];
};
