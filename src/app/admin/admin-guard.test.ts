import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// A layout's check doesn't protect its pages: Next can render a page segment on its own (an RSC
// request for a client that already has the layout). So every admin page must check by itself.
const CONSOLE = path.join(process.cwd(), "src/app/admin/(console)");

function pages(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return pages(full);
    return name === "page.tsx" ? [full] : [];
  });
}

describe("admin console pages", () => {
  it("each call requireAdmin() themselves, not only through the layout", () => {
    const found = pages(CONSOLE);
    expect(found.length).toBeGreaterThanOrEqual(6);
    for (const file of found) expect(readFileSync(file, "utf8"), path.relative(CONSOLE, file)).toMatch(/await requireAdmin\(\)/);
  });
});
