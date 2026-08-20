import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { getErrorMessage } from "@/lib/api/client"
import { useCreateUser, useUpdateUser } from "@/features/users"
import type { Profile, Role, UserStatus } from "@/types"

const userSchema = (isEdit: boolean) =>
  z
    .object({
      fullName: z.string().min(1, "Full name is required"),
      employeeCode: z.string().min(1, "Employee code is required"),
      email: z.string().email("Enter a valid email").or(z.literal("")),
      password: z.string().min(6, "At least 6 characters").or(z.literal("")),
      role: z.enum(["admin", "employee"]),
      status: z.enum(["active", "inactive"]),
      department: z.string(),
      position: z.string(),
    })
    .superRefine((values, ctx) => {
      if (values.role === "admin") {
        if (!values.email) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["email"],
            message: "Email is required for admins",
          })
        }
        if (!isEdit && !values.password) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["password"],
            message: "Password is required for admins",
          })
        }
      }
    })

type UserFormValues = z.infer<ReturnType<typeof userSchema>>

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: Profile | null
}

export function UserFormDialog({
  open,
  onOpenChange,
  user,
}: UserFormDialogProps) {
  const isEdit = !!user
  const createMutation = useCreateUser()
  const updateMutation = useUpdateUser()

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema(isEdit)),
    defaultValues: {
      fullName: "",
      employeeCode: "",
      email: "",
      password: "",
      role: "employee",
      status: "active",
      department: "",
      position: "",
    },
  })

  const role = form.watch("role")

  useEffect(() => {
    if (open) {
      form.reset(
        user
          ? {
              fullName: user.fullName,
              employeeCode: user.employeeCode ?? "",
              email: user.email ?? "",
              password: "",
              role: user.role,
              status: user.status,
              department: user.department ?? "",
              position: user.position ?? "",
            }
          : {
              fullName: "",
              employeeCode: "",
              email: "",
              password: "",
              role: "employee",
              status: "active",
              department: "",
              position: "",
            },
      )
    }
  }, [open, user, form])

  const onSubmit = async (values: UserFormValues) => {
    const payload = {
      fullName: values.fullName,
      employeeCode: values.employeeCode,
      email: values.email || undefined,
      password: values.password || undefined,
      role: values.role as Role,
      status: values.status as UserStatus,
      department: values.department || undefined,
      position: values.position || undefined,
    }

    try {
      if (isEdit && user) {
        await updateMutation.mutateAsync({ id: user.id, payload })
        toast.success("User updated")
      } else {
        await createMutation.mutateAsync(payload)
        toast.success("User created")
      }
      onOpenChange(false)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const submitting = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit user" : "Create user"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the user's details."
              : "Add a new user to the system."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input placeholder="Nguyễn Văn A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="employeeCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee code</FormLabel>
                    <FormControl>
                      <Input placeholder="NV001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {role === "admin" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {isEdit ? null : (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder={isEdit ? "Leave blank to keep" : "••••••••"}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input placeholder="Engineering" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <FormControl>
                      <Input placeholder="Developer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                {isEdit ? "Save changes" : "Create user"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
