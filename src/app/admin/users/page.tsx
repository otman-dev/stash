"use client"
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useToast } from '@/components/ToastContext'

interface User {
  _id: string
  name: string
  email: string
  role: string
  image?: string
  createdAt: string
  hasInitializedCollections: boolean
  productCount?: number
  categoryCount?: number
}

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingUser, setDeletingUser] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch('/api/admin/users')
        if (!res.ok) throw new Error('Failed to fetch users')
        const data = await res.json()
        setUsers(data.users || [])
      } catch (err) {
        setError('Failed to load users')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      if (!res.ok) throw new Error('Failed to update role')
      
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u))
      showToast('User role updated successfully', 'success')
    } catch (err) {
      console.error('Error updating role:', err)
      showToast('Failed to update user role', 'error')
    }
  }

  const openDeleteModal = (user: User) => {
    setUserToDelete(user)
    setShowDeleteModal(true)
  }

  const closeDeleteModal = () => {
    setShowDeleteModal(false)
    setUserToDelete(null)
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return
    
    try {
      setDeletingUser(userToDelete._id)
      const res = await fetch(`/api/admin/users/${userToDelete._id}`, {
        method: 'DELETE',
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete user')
      }
      
      setUsers(users.filter(u => u._id !== userToDelete._id))
      showToast('User deleted successfully', 'success')
      closeDeleteModal()
    } catch (err: any) {
      console.error('Error deleting user:', err)
      showToast(err.message || 'Failed to delete user', 'error')
    } finally {
      setDeletingUser(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Users Management</h1>
        <p className="text-slate-500 mt-1">View and manage all registered users</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">User</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Email</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Role</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Products</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Categories</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Joined</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-medium">
                        {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <span className="font-medium text-slate-800">{user.name || 'No name'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {user.role || 'user'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{user.productCount ?? 0}</td>
                  <td className="px-6 py-4 text-slate-600">{user.categoryCount ?? 0}</td>
                  <td className="px-6 py-4 text-slate-500 text-sm">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <select
                        value={user.role || 'user'}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                      {user.email !== session?.user?.email && (
                        <button
                          onClick={() => openDeleteModal(user)}
                          disabled={deletingUser === user._id}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete user"
                        >
                          {deletingUser === user._id ? (
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {users.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No users found
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Delete User</h3>
                <p className="text-sm text-slate-500">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-slate-700 mb-3">
                Are you sure you want to delete <strong>{userToDelete.name || userToDelete.email}</strong>?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                <p className="font-medium mb-1">This will permanently delete:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>User account and profile</li>
                  <li>All products ({userToDelete.productCount ?? 0} items)</li>
                  <li>All categories ({userToDelete.categoryCount ?? 0} items)</li>
                  <li>All associated sessions and OAuth connections</li>
                </ul>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={closeDeleteModal}
                disabled={deletingUser !== null}
                className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={deletingUser !== null}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deletingUser ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete User'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
