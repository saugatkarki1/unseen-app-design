// Redirect: /portfolio → /profile (single page)
import { redirect } from "next/navigation"

export default function PortfolioRedirectPage() {
    redirect("/profile")
}
