import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFormSubmit } from "@/hooks/useFormSubmit";

describe("useFormSubmit", () => {
  it("initialises in idle state", () => {
    const { result } = renderHook(() => useFormSubmit(async () => {}));
    expect(result.current.status).toBe("idle");
    expect(result.current.isIdle).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("transitions idle → loading → success on resolved action", async () => {
    const action = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useFormSubmit(action));

    await act(async () => {
      await result.current.submit({ foo: "bar" });
    });

    expect(action).toHaveBeenCalledOnce();
    expect(result.current.status).toBe("success");
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("transitions idle → loading → error on rejected action", async () => {
    const action = vi.fn().mockRejectedValue(new Error("Testfehler"));
    const { result } = renderHook(() => useFormSubmit(action));

    await act(async () => {
      await result.current.submit({});
    });

    expect(result.current.status).toBe("error");
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe("Testfehler");
  });

  it("falls back to generic message for non-Error rejections", async () => {
    const action = vi.fn().mockRejectedValue("string-error");
    const { result } = renderHook(() => useFormSubmit(action));

    await act(async () => {
      await result.current.submit({});
    });

    expect(result.current.error).toBe("Ein unerwarteter Fehler ist aufgetreten.");
  });

  it("resets to idle state when reset() is called", async () => {
    const action = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useFormSubmit(action));

    await act(async () => {
      await result.current.submit({});
    });

    expect(result.current.isSuccess).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe("idle");
    expect(result.current.isIdle).toBe(true);
  });

  it("passes submitted data correctly to action", async () => {
    const action = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useFormSubmit(action));
    const payload = { identifier: "test@test.de", password: "secret" };

    await act(async () => {
      await result.current.submit(payload);
    });

    expect(action).toHaveBeenCalledWith(payload);
  });
});
