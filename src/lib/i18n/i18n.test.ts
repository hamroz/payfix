import { describe, expect, it } from "vitest";
import { LOCALES, matchLocale } from "./config";
import { dictionaries } from "./dictionaries";
import { eventDisplayData, englishEvent } from "./english";
import { renderEvent } from "./events";
import { createTranslator } from "./translate";

const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}|<(\w+)>/g)].map((m) => m[0]).sort();

/** Every string leaf, keyed by path; plural objects flatten to their `other` form. */
function leaves(node: unknown, path = ""): Map<string, string> {
  const out = new Map<string, string>();
  if (typeof node === "string") out.set(path, node);
  else if (node && typeof node === "object") {
    if ("other" in node && typeof (node as { other: unknown }).other === "string") out.set(path, (node as { other: string }).other);
    else for (const [k, v] of Object.entries(node)) for (const [p, s] of leaves(v, `${path}.${k}`)) out.set(p, s);
  }
  return out;
}

describe("i18n", () => {
  it("picks the visitor's language from Accept-Language", () => {
    expect(matchLocale("de-DE,de;q=0.9,en;q=0.8")).toBe("de");
    expect(matchLocale("fr-FR,fr;q=0.9,pl;q=0.5")).toBe("pl");
    expect(matchLocale("zh-CN")).toBe("zh");
    expect(matchLocale("ja")).toBe("en");
    expect(matchLocale(undefined)).toBe("en");
  });

  it("uses each language's plural rules", () => {
    const forms = { one: "{count} счёт", few: "{count} счёта", many: "{count} счетов", other: "{count} счёта" };
    const { p } = createTranslator("ru", dictionaries.ru);
    expect([1, 3, 5, 21].map((n) => p(forms, n))).toEqual(["1 счёт", "3 счёта", "5 счетов", "21 счёт"]);
  });

  it.each(LOCALES.filter((l) => l !== "en"))("%s keeps every placeholder and tag of the English text", (locale) => {
    const en = leaves(dictionaries.en);
    const other = leaves(dictionaries[locale]);
    for (const [path, text] of en) expect([path, placeholders(other.get(path) ?? "")]).toEqual([path, placeholders(text)]);
  });

  it("renders events stored before they carried data in the viewer's language", () => {
    const message = englishEvent("invoice.created", { number: "INV-0001", customer: "Acme Robotics", amount: "$1,000.00" });
    const data = eventDisplayData("invoice.created", message, null);
    expect(data).toMatchObject({ number: "INV-0001", customer: "Acme Robotics", amount: "$1,000.00" });
    const de = createTranslator("de", dictionaries.de);
    expect(renderEvent(de, { type: "invoice.created", message, data })).not.toBe(message);
    expect(renderEvent(de, { type: "invoice.created", message, data })).toContain("INV-0001");
  });

  it("falls back to the stored English when an old message matches no template", () => {
    const e = { type: "invoice.created", message: "Something from an older version", data: null };
    expect(eventDisplayData(e.type, e.message, e.data)).toBeNull();
    expect(renderEvent(createTranslator("ru", dictionaries.ru), e)).toBe(e.message);
  });
});
