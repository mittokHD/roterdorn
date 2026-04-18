import { useState } from "react";

interface SubmitCommentPayload {
  name: string;
  text: string;
  website: string;
  rezensionId: string;
}

export function useCommentSubmit() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const submitComment = async (payload: SubmitCommentPayload) => {
    setStatus("loading");
    setError(null);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // Fallback Error Handling extrahieren
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Kommentar konnte nicht gesendet werden.");
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Ein unerwarteter Fehler ist aufgetreten.");
    }
  };

  const resetStatus = () => {
    setStatus("idle");
    setError(null);
  };

  return {
    status,
    error,
    submitComment,
    resetStatus,
    isIdle: status === "idle",
    isLoading: status === "loading",
    isSuccess: status === "success",
    isError: status === "error",
  };
}
