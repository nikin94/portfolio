import { Outlet } from "react-router-dom";

import { AppProviders } from "@/providers";

/**
 * Outermost layout. Hosts the app-wide provider stack (theme, motion,
 * smooth scroll) so it persists across locale switches and navigations.
 */
export default function RootLayout() {
  return (
    <AppProviders>
      <Outlet />
    </AppProviders>
  );
}
