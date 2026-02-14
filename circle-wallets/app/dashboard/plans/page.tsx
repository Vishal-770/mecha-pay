import { redirect } from "next/navigation";

export default function LegacyPlansRedirectPage() {
  redirect("/dashboard/marketplace");
}
