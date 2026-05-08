"use client";

import { useState, useCallback, useRef } from "react";

type Status = "idle" | "loading" | "success" | "error";

export interface UseFormSubmitReturn<T> {
  submit: (data: T) => Promise<void>;
  reset: () => void;
  status: Status;
  error: string | null;
  isIdle: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

/**
 * Generic form submission hook.
 * Wraps any async action with loading/success/error state management.
 * The action should throw an Error with a user-facing message on failure.
 *
 * @example
 * const { submit, isLoading, error } = useFormSubmit(async (data) => {
 *   const res = await fetch('/api/auth/login', { ... });
 *   if (!res.ok) throw new Error('Anmeldung fehlgeschlagen.');
 *   router.push('/');
 * });
 */
export function useFormSubmit<T>(
  action: (data: T) => Promise<void>
): UseFormSubmitReturn<T> {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  // Ref pattern keeps `submit` stable across renders without listing `action`
  // as a dependency — avoids re-creating the callback on every render cycle.
  const actionRef = useRef(action);
  actionRef.current = action;

  const submit = useCallback(async (data: T) => {
    setStatus("loading");
    setError(null);
    try {
      await actionRef.current(data);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error
          ? err.message
          : "Ein unerwarteter Fehler ist aufgetreten."
      );
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  return {
    submit,
    reset,
    status,
    error,
    isIdle: status === "idle",
    isLoading: status === "loading",
    isSuccess: status === "success",
    isError: status === "error",
  };
}
