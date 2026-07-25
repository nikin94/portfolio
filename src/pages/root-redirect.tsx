import { Navigate } from "react-router-dom";
import { Head } from "vite-react-ssg";

import { defaultLocale } from "@/i18n/locales";

/**
 * The bare `/` route redirects to the default locale. `Navigate` handles the
 * client; the `<meta http-equiv="refresh">` covers no-JS visitors and crawlers
 * hitting the prerendered `/index.html`.
 *
 * A locale detector (Accept-Language / stored preference) can replace the fixed
 * default later without touching the routing shape.
 */
export default function RootRedirect() {
  const target = `/${defaultLocale}`;
  return (
    <>
      <Head>
        <meta httpEquiv="refresh" content={`0; url=${target}`} />
        <link rel="canonical" href={target} />
      </Head>
      <Navigate to={target} replace />
    </>
  );
}
