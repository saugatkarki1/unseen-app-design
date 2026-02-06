// Redirect: /learn → /curriculum (merged into single page)
import { redirect } from "next/navigation"

export default function LearnRedirectPage() {
  redirect("/curriculum")
}
