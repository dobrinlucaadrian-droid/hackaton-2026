// Any address that matches no page shows the friendly 404 page (not-found.tsx), in the page's language.
import { notFound } from "next/navigation";

export default function UnknownPage() {
  notFound();
}
