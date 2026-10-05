import type { PluralForms } from "../translate";
import type en from "./en";

/** Widens the English dictionary to the shape every language must match: same keys, any strings, any plural categories. */
type Widen<T> = T extends string ? string : T extends { other: string } ? PluralForms : { [K in keyof T]: Widen<T[K]> };

export type Messages = Widen<typeof en>;
export type Namespace = keyof Messages;
