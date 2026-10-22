import type { Metadata } from "next";
import HomeClient from "./HomeClient";

// Keep the homepage canonical on the homepage only. A layout-level canonical
// would be inherited by routes that do not explicitly override it.
export const metadata: Metadata = {
  alternates: { canonical: "https://dustsweepertool.com/" },
};

export default function HomePage() {
  return <HomeClient />;
}
