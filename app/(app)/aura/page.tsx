// Redirect: /aura → /profile (single page with Aura section)
import { redirect } from "next/navigation"

export default function AuraRedirectPage() {
  redirect("/profile")
}
