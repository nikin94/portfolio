import { Component, type ReactNode } from "react";

/**
 * Catches failures from the lazily-loaded WebGL cube — the three.js chunk failing
 * to download, or WebGL being unavailable / erroring on context creation — and
 * renders the static fallback in its place.
 *
 * On the happy path nothing is shown while the cube loads (the Suspense fallback
 * is empty), so the flat fallback never flashes; it only appears if the live cube
 * genuinely can't run. Error boundaries must be class components.
 */
export class CubeErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
