import { Routes, Route } from "react-router-dom"
import { ProtectedRoute, AdminRoute } from "@/features/auth"
import { AppLayout } from "@/components/layout"
import { LoginPage } from "@/pages/Login"
import { DashboardPage } from "@/pages/Dashboard"
import { UsersListPage } from "@/pages/UsersList"
import { UserDetailPage } from "@/pages/UserDetail"
import { AccessDeniedPage } from "@/pages/AccessDenied"
import { NotFoundPage } from "@/pages/NotFound"

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />

          <Route element={<AdminRoute />}>
            <Route path="/users" element={<UsersListPage />} />
            <Route path="/users/:id" element={<UserDetailPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="/access-denied" element={<AccessDeniedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
