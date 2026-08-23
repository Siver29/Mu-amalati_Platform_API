import { Routes, Route } from 'react-router-dom'

import AdminDashboard from './pages/AdminDashboard'
import Login from './pages/Login'
import EmployeeDashboard from './pages/EmployeeDashboard'
import ManagerDashboard from './pages/ManagerDashboard'

import ProtectedRoute from './components/ProtectRoute'
import RoleRoute from './components/RoleRoute'
import MainLayout from './layouts/MainLayout'

import Transactions from './pages/Transactions'
import CreateTransaction from './pages/CreateTransaction'
import TransactionDetails from './pages/TransactionDetails'
import EditTransaction from './pages/EditTransaction'

import Notifications from './pages/Notifications'
import Profile from './pages/Profile'

import { useAuth } from './context/AuthContext'

import Users from './pages/Users'
import CreateUser from './pages/CreateUser'
import EditUser from './pages/EditUser'

import Departments from './pages/Departments'
import CreateDepartment from './pages/CreateDepartment'
import EditDepartment from './pages/EditDepartment'

import TransactionTypes from './pages/TransactionTypes'
import CreateTransactionType from './pages/CreateTransactionType'

import WorkflowManagement from './pages/WorkflowManagement'
import TransactionTypeFields from './pages/TransactionTypeFields'
import EditTransactionType from './pages/EditTransactionType'
// --------------------------------------------------
// Dashboard Router
// --------------------------------------------------

function DashboardRouter() {
  const { user } = useAuth()

  if (user?.role === 'admin') {
    return <AdminDashboard />
  }

  if (user?.role === 'manager') {
    return <ManagerDashboard />
  }

  return <EmployeeDashboard />
}

// --------------------------------------------------
// App
// --------------------------------------------------

function App() {
  return (
    <Routes>

      {/* ==================================================
          Public
          ================================================== */}

      <Route
        path="/login"
        element={<Login />}
      />

      {/* ==================================================
          Protected
          ================================================== */}

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >

        {/* ==================================================
            Dashboard
            ================================================== */}

        <Route
          path="/dashboard"
          element={<DashboardRouter />}
        />

        {/* ==================================================
            Notifications
            ================================================== */}

        <Route
          path="/notifications"
          element={<Notifications />}
        />

        {/* ==================================================
            Profile
            ================================================== */}

        <Route
          path="/profile"
          element={<Profile />}
        />

        {/* ==================================================
            Transactions
            ================================================== */}

        <Route
          path="/transactions"
          element={<Transactions />}
        />

        <Route
          path="/transactions/create"
          element={<CreateTransaction />}
        />

        <Route
          path="/transactions/:id"
          element={<TransactionDetails />}
        />

        <Route
          path="/transactions/:id/edit"
          element={<EditTransaction />}
        />

        {/* ==================================================
            Admin Routes
            ================================================== */}

        <Route
          path="/users"
          element={
            <RoleRoute roles={['admin']}>
              <Users />
            </RoleRoute>
          }
        />

        <Route
          path="/users/create"
          element={
            <RoleRoute roles={['admin']}>
              <CreateUser />
            </RoleRoute>
          }
        />

        <Route
          path="/users/:id/edit"
          element={
            <RoleRoute roles={['admin']}>
              <EditUser />
            </RoleRoute>
          }
        />

        <Route
          path="/departments"
          element={
            <RoleRoute roles={['admin']}>
              <Departments />
            </RoleRoute>
          }
        />

        <Route
          path="/departments/create"
          element={
            <RoleRoute roles={['admin']}>
              <CreateDepartment />
            </RoleRoute>
          }
        />

        <Route
          path="/departments/:id/edit"
          element={
            <RoleRoute roles={['admin']}>
              <EditDepartment />
            </RoleRoute>
          }
        />

        <Route
          path="/transaction-types"
          element={
            <RoleRoute roles={['admin']}>
              <TransactionTypes />
            </RoleRoute>
          }
        />

        <Route
          path="/transaction-types/create"
          element={
            <RoleRoute roles={['admin']}>
              <CreateTransactionType />
            </RoleRoute>
          }
        />
        <Route
  path="/transaction-types/:id/edit"
  element={
    <RoleRoute roles={['admin']}>
      <EditTransactionType />
    </RoleRoute>
  }
/>
        <Route
          path="/transaction-types/:id/workflow"
          element={
            <RoleRoute roles={['admin']}>
              <WorkflowManagement />
            </RoleRoute>
          }
        />

        <Route
          path="/transaction-types/:id/fields"
          element={
            <RoleRoute roles={['admin']}>
              <TransactionTypeFields />
            </RoleRoute>
          }
        />

      </Route>

    </Routes>
  )
}

export default App