import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, Pencil, UserX, UserCheck } from "lucide-react"
import { useUser, useUpdateUserStatus } from "@/features/users"
import { UserFormDialog } from "@/features/users/user-form-dialog"
import { getErrorMessage } from "@/lib/api/client"
import type { UserStatus } from "@/types"

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || "—"}</p>
    </div>
  )
}

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: user, isLoading, isError, error } = useUser(id)
  const statusMutation = useUpdateUserStatus()

  const [editOpen, setEditOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const toggleStatus = async () => {
    if (!user) return
    const newStatus: UserStatus =
      user.status === "active" ? "inactive" : "active"
    try {
      await statusMutation.mutateAsync({
        id: user.id,
        payload: { status: newStatus },
      })
      toast.success(
        newStatus === "active" ? "User activated" : "User deactivated",
      )
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setConfirmOpen(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-5 w-1/2" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isError || !user) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/users")}>
          <ArrowLeft className="mr-2 size-4" />
          Back to users
        </Button>
        <Card>
          <CardContent className="p-6 text-destructive">
            {getErrorMessage(error)}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/users")}>
          <ArrowLeft className="mr-2 size-4" />
          Back to users
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 size-4" />
            Edit
          </Button>
          <Button
            variant={user.status === "active" ? "destructive" : "default"}
            onClick={() => setConfirmOpen(true)}
          >
            {user.status === "active" ? (
              <>
                <UserX className="mr-2 size-4" />
                Deactivate
              </>
            ) : (
              <>
                <UserCheck className="mr-2 size-4" />
                Activate
              </>
            )}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{user.fullName}</CardTitle>
          <div className="flex gap-2">
            <Badge variant={user.role === "admin" ? "default" : "secondary"}>
              {user.role}
            </Badge>
            <Badge variant={user.status === "active" ? "default" : "outline"}>
              {user.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <Field label="Email" value={user.email ?? ""} />
          <Field label="Employee code" value={user.employeeCode ?? ""} />
          <Field label="Department" value={user.department ?? ""} />
          <Field label="Position" value={user.position ?? ""} />
          <Field
            label="Created"
            value={user.createdAt ? new Date(user.createdAt).toLocaleString() : ""}
          />
          <Field
            label="Updated"
            value={user.updatedAt ? new Date(user.updatedAt).toLocaleString() : ""}
          />
        </CardContent>
      </Card>

      <UserFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        user={user}
      />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {user.status === "active" ? "Deactivate" : "Activate"} user?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {user.status === "active"
                ? `This will deactivate ${user.fullName}. They will no longer be able to sign in.`
                : `This will activate ${user.fullName}. They will be able to sign in again.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={toggleStatus}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
