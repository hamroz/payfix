"use client";

import { type ReactNode, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

const noop = () => () => {};

/**
 * Renders children into document.body. Use for fixed overlays (dialogs, sheets): a glass
 * ancestor's backdrop-filter makes it the containing block for fixed descendants, which
 * traps and clips them inside the card, and nested backdrop blurs can paint solid black.
 */
export function BodyPortal({ children }: { children: ReactNode }) {
  // True only in the browser, without a mount effect; the server renders nothing.
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  return mounted ? createPortal(children, document.body) : null;
}
