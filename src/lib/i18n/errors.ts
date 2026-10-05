// Errors whose message is shown to the person who caused them, in their language.
import { en } from "./dictionaries";
import { createTranslator, type Translator, type Vars } from "./translate";
import type { Messages } from "./messages";

type ErrorMessages = Messages["errors"];

/** Keys of the `errors` namespace that are messages (not groups like `statuses`). */
export type ErrorKey = { [K in keyof ErrorMessages]: ErrorMessages[K] extends string ? K : never }[keyof ErrorMessages];

/** One error message: a key in the `errors` namespace plus its placeholder values. */
export type ErrorInit = { key: ErrorKey; vars?: Vars };

/**
 * Placeholders whose values are ids translated through the dictionary: `{role}` is a role id
 * (`m.roles`), `{status}` a proposal or refund-attempt status (`m.errors.statuses`).
 */
function localizedVars(m: Messages, vars: Vars | undefined): Vars | undefined {
  if (!vars) return vars;
  const out: Vars = { ...vars };
  if (typeof out.role === "string" && out.role in m.roles) out.role = m.roles[out.role as keyof Messages["roles"]].label;
  if (typeof out.status === "string" && out.status in m.errors.statuses) out.status = m.errors.statuses[out.status as keyof ErrorMessages["statuses"]];
  return out;
}

/** One error message in the translator's language. */
export const errorText = (i18n: Translator, e: ErrorInit) => i18n.t(i18n.m.errors[e.key], localizedVars(i18n.m, e.vars));

const english = createTranslator("en", en);

/**
 * A user-facing error identified by a key in the `errors` namespace. `message` is the English
 * text (for logs and tests); `run()` in src/app/actions/result.ts renders it in the request's
 * language. `also` carries further messages shown after the first (e.g. every problem with a plan).
 */
export class UserError extends Error {
  readonly also: ErrorInit[];

  constructor(
    readonly key: ErrorKey,
    readonly vars?: Vars,
    also: ErrorInit[] = [],
  ) {
    super([{ key, vars }, ...also].map((e) => errorText(english, e)).join(" "));
    this.also = also;
  }

  /** Every message of the error, joined, in the translator's language. */
  render(i18n: Translator): string {
    return [{ key: this.key, vars: this.vars }, ...this.also].map((e) => errorText(i18n, e)).join(" ");
  }
}

/** Builds an error from a list of messages (first one leads). */
export function userErrorFrom<E extends UserError>(Kind: new (key: ErrorKey, vars?: Vars, also?: ErrorInit[]) => E, list: ErrorInit[]): E {
  const [first, ...rest] = list;
  return new Kind(first.key, first.vars, rest);
}
