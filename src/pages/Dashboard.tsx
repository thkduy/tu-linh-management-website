import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, UserCheck, UserX } from "lucide-react"
import { listUsers } from "@/lib/api/users"
import { useAuth } from "@/features/auth"

export function DashboardPage() {
  const { profile } = useAuth()

  const { data, isLoading } = useQuery({
    queryKey: ["users", { page: 1, limit: 1 }],
    queryFn: () => listUsers({ page: 1, limit: 1 }),
    enabled: profile?.role === "admin",
  })

  const total = data?.pagination.total

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome{profile?.fullName ? `, ${profile.fullName}` : ""}
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your workspace.
        </p>
      </div>

      {profile?.role === "admin" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total users</CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{total ?? 0}</div>
              )}
              <p className="text-xs text-muted-foreground">
                All accounts in the system
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active users</CardTitle>
              <UserCheck className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">—</div>
              <p className="text-xs text-muted-foreground">
                Filter the users list for details
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive users</CardTitle>
              <UserX className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">—</div>
              <p className="text-xs text-muted-foreground">
                Filter the users list for details
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
            <CardDescription>
              You're signed in as an employee. Use the navigation to explore
              available sections.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {profile?.role === "admin" && (
        <Button asChild variant="outline">
          <Link to="/users">Manage users</Link>
        </Button>
      )}
    </div>
  )
}
