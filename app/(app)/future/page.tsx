// Redirect: /future → /profile (single page with Future section)
import { redirect } from "next/navigation"

export default function FutureRedirectPage() {
  redirect("/profile")
}
