"use client";

import { useEffect } from "react";
import React from "react";
import * as ReactDOM from "react-dom";

/**
 * Runs axe-core accessibility checks in development when NEXT_PUBLIC_A11Y_AXE=1.
 * Logs violations to the console. No-op in production or when env is unset (reduces console noise).
 */
export function AxeReporter() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (process.env.NEXT_PUBLIC_A11Y_AXE !== "1" && process.env.NEXT_PUBLIC_A11Y_AXE !== "true") return;

    let cancelled = false;

    (async () => {
      try {
        const axe = await import("@axe-core/react");
        if (cancelled || typeof document === "undefined") return;
        axe.default(React, ReactDOM, 1000);
      } catch (err) {
        if (!cancelled) {
          console.warn("[a11y] axe-core/react failed to load:", err);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
