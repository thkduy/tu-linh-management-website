import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ShieldX } from "lucide-react"

export function AccessDeniedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
      <ShieldX className="size-12 text-destructive" />
      <h1 className="text-2xl font-semibold">Access denied</h1>
      <p className="max-w-sm text-muted-foreground">
        You don't have permission to view this page. This area is restricted to
        administrators.
      </p>
      <Button asChild>
        <Link to="/">Back to dashboard</Link>
      </Button>
    </div>
  )
}
