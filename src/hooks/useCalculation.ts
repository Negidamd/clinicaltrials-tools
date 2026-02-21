"use client";

// ---------------------------------------------------------------------------
// useCalculation – hook to call the calculation API and manage state
// ---------------------------------------------------------------------------

import { useState, useCallback, useRef } from "react";
import type { CalculatorInput, CalculatorOutput } from "@/types/calculator";
import { API_CALCULATOR_PREFIX, CALCULATION_DEBOUNCE_MS } from "@/lib/constants";
import { validateCalculatorInput } from "@/lib/validators";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CalculationState {
  /** The most recent successful output. */
  result: CalculatorOutput | null;
  /** Whether a request is in-flight. */
  isLoading: boolean;
  /** User-facing error message (validation or server). */
  error: string | null;
  /** Granular field-level validation errors (path -> message). */
  fieldErrors: Record<string, string>;
  /** Timestamp of the last successful calculation. */
  lastCalculatedAt: Date | null;
}

export interface UseCalculationReturn extends CalculationState {
  /** Trigger a calculation with the given inputs. */
  calculate: (input: CalculatorInput) => Promise<CalculatorOutput | null>;
  /** Trigger a debounced calculation (useful for live-update on input change). */
  calculateDebounced: (input: CalculatorInput) => void;
  /** Reset the hook state to its initial values. */
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const INITIAL_STATE: CalculationState = {
  result: null,
  isLoading: false,
  error: null,
  fieldErrors: {},
  lastCalculatedAt: null,
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useCalculation(): UseCalculationReturn {
  const [state, setState] = useState<CalculationState>(INITIAL_STATE);

  // Ref for debounce timer so it persists across renders
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ref for aborting in-flight requests
  const abortRef = useRef<AbortController | null>(null);

  // -----------------------------------------------------------------------
  // Core calculate function
  // -----------------------------------------------------------------------
  const calculate = useCallback(
    async (input: CalculatorInput): Promise<CalculatorOutput | null> => {
      // --- Client-side validation first ---
      const validation = validateCalculatorInput(input.calculator, input);

      if (!validation.success) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of validation.error.issues) {
          const path = issue.path.join(".");
          if (path) {
            fieldErrors[path] = issue.message;
          }
        }

        const firstMessage =
          validation.error.issues[0]?.message ?? "Validation failed";

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: firstMessage,
          fieldErrors,
        }));
        return null;
      }

      // --- Abort any previous in-flight request ---
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        fieldErrors: {},
      }));

      try {
        const url = `${API_CALCULATOR_PREFIX}/${input.calculator}`;

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
          signal: controller.signal,
        });

        if (!response.ok) {
          // Try to parse a structured error from the API
          let message = `Calculation failed (${response.status})`;
          try {
            const body = await response.json();
            if (body?.error) {
              message = body.error;
            }
            if (body?.fieldErrors) {
              setState((prev) => ({
                ...prev,
                fieldErrors: body.fieldErrors,
              }));
            }
          } catch {
            // response body was not JSON; use generic message
          }
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: message,
          }));
          return null;
        }

        const result: CalculatorOutput = await response.json();

        setState({
          result,
          isLoading: false,
          error: null,
          fieldErrors: {},
          lastCalculatedAt: new Date(),
        });

        return result;
      } catch (err: unknown) {
        // Ignore aborted requests (new request superseded this one)
        if (err instanceof DOMException && err.name === "AbortError") {
          return null;
        }

        const message =
          err instanceof Error ? err.message : "An unexpected error occurred";

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: message,
          fieldErrors: {},
        }));
        return null;
      }
    },
    [],
  );

  // -----------------------------------------------------------------------
  // Debounced variant
  // -----------------------------------------------------------------------
  const calculateDebounced = useCallback(
    (input: CalculatorInput) => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = setTimeout(() => {
        calculate(input);
      }, CALCULATION_DEBOUNCE_MS);
    },
    [calculate],
  );

  // -----------------------------------------------------------------------
  // Reset
  // -----------------------------------------------------------------------
  const reset = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    setState(INITIAL_STATE);
  }, []);

  return {
    ...state,
    calculate,
    calculateDebounced,
    reset,
  };
}
