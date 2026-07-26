import { Outlet } from "react-router-dom";

import { EasterEggs } from "@/components/easter-eggs/easter-eggs";
import { AppProviders } from "@/providers";

/**
 * Outermost layout. Hosts the app-wide provider stack (theme, motion,
 * smooth scroll) so it persists across locale switches and navigations.
 */
const RootLayout = () => (
  <AppProviders>
    <Outlet />
    <EasterEggs />
  </AppProviders>
);

export default RootLayout;
