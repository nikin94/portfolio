import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useCarousel } from "./use-carousel";

describe("useCarousel", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("auto-advances on the interval and wraps around", () => {
    const { result } = renderHook(() =>
      useCarousel({ count: 3, intervalMs: 1000 }),
    );
    expect(result.current.index).toBe(0);
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.index).toBe(1);
    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.index).toBe(0);
  });

  it("stops auto-play while paused", () => {
    const { result } = renderHook(() =>
      useCarousel({ count: 3, intervalMs: 1000 }),
    );
    act(() => result.current.setPaused(true));
    act(() => vi.advanceTimersByTime(3000));
    expect(result.current.index).toBe(0);
  });

  it("does not auto-play when disabled or single-slide", () => {
    const { result } = renderHook(() =>
      useCarousel({ count: 1, intervalMs: 1000, enabled: true }),
    );
    act(() => vi.advanceTimersByTime(3000));
    expect(result.current.index).toBe(0);
  });

  it("wraps goTo around both ends", () => {
    const { result } = renderHook(() => useCarousel({ count: 3 }));
    act(() => result.current.goTo(3));
    expect(result.current.index).toBe(0);
    act(() => result.current.goTo(-1));
    expect(result.current.index).toBe(2);
    act(() => result.current.goTo(4));
    expect(result.current.index).toBe(1);
  });
});
