// Redirect: /practice → /curriculum (Practice is a section, not a tab)
import { redirect } from "next/navigation"

export default function PracticeRedirectPage() {
  redirect("/curriculum")
}
