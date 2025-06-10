"use client"

import { useState, useEffect, useMemo } from "react"
import {
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  ImageIcon,
  CreditCard,
  Check,
  X,
  Eye,
  Clock,
  AlertCircle,
  Search,
  Filter,
  ChevronDown,
  Calendar,
  Users,
  Shield,
  Edit,
  Trash2,
  MoreHorizontal,
} from "lucide-react"
import { useQuery, useMutation } from "@apollo/client"

import toast from "react-hot-toast"
import { convertToDate } from "../Functions/calc"
import { GET_ALL_USERS } from "../Graphql/query/SueprAdmin"
import { DELETE_USER } from "../Graphql/mutations/Admin"

const AdminUsers = () => {
  const [filteredUsers, setFilteredUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [editFormData, setEditFormData] = useState({})

  const { data, loading, refetch } = useQuery(GET_ALL_USERS)
  const [deleteUser, { loading: deleteLoading }] = useMutation(DELETE_USER)

  // Transform and organize user data
  const users = useMemo(() => {
    return (data?.users || []).map((user) => {
      // Handle address as object or string
      let addressObj = { city: "", province: "", area: "", street: "" }
      if (typeof user.address === "object" && user.address !== null) {
        addressObj = user.address
      } else if (typeof user.address === "string") {
        addressObj = { ...addressObj, city: user.address }
      }

      return {
        ...user,
        address: addressObj,
        displayAddress:
          typeof user.address === "string"
            ? user.address
            : `${addressObj.city || ""}${addressObj.province ? `, ${addressObj.province}` : ""}`.trim() || "N/A",
      }
    })
  }, [data])

  // Filter users based on search term, role, and status
  useEffect(() => {
    let filtered = users

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone?.includes(searchTerm),
      )
    }

    // Filter by role
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    // Filter by approval status
    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.roleApprovalStatus === statusFilter)
    }

    setFilteredUsers(filtered)
  }, [users, searchTerm, roleFilter, statusFilter])

  // Get user statistics
  const userStats = useMemo(() => {
    const total = users.length
    const venueOwners = users.filter((u) => u.role === "VenueOwner").length
    const customers = users.filter((u) => u.role === "Customer").length
    const pending = users.filter((u) => u.roleApprovalStatus === "PENDING").length
    const approved = users.filter((u) => u.roleApprovalStatus === "APPROVED").length

    return { total, venueOwners, customers, pending, approved }
  }, [users])

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setEditFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "Customer",
      companyName: user.companyName || "",
      esewaId: user.esewaId || "",
      address: user.displayAddress || "",
    })
    setShowEditModal(true)
  }

  const handleUpdateUser = async () => {
    // Update user logic here
  }

  const handleDeleteUser = async () => {
    try {
      const { data } = await deleteUser({
        variables: { userId: selectedUser.id },
      })
      if (data?.deleteUser?.success) {
        toast.success("User deleted successfully!")
        refetch()
        setShowDeleteModal(false)
        setSelectedUser(null)
      } else {
        toast.error(data?.deleteUser?.message || "Failed to delete user")
      }
    } catch (err) {
      toast.error("Error deleting user")
    }
  }

  const getRoleBadge = (role) => {
    const roleConfig = {
      VenueOwner: { color: "bg-purple-100 text-purple-800", icon: Building2 },
      Customer: { color: "bg-blue-100 text-blue-800", icon: User },
      Admin: { color: "bg-red-100 text-red-800", icon: Shield },
    }

    const config = roleConfig[role] || roleConfig.Customer
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {role}
      </span>
    )
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      APPROVED: { color: "bg-green-100 text-green-800", icon: Check },
      REJECTED: { color: "bg-red-100 text-red-800", icon: X },
    }

    const config = statusConfig[status] || statusConfig.PENDING
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="mt-1 text-sm text-gray-500">Manage all users and their details</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 px-3 py-2 rounded-lg text-center">
                    <div className="text-lg font-bold text-blue-700">{userStats.total}</div>
                    <div className="text-xs text-blue-600">Total Users</div>
                  </div>
                  <div className="bg-purple-50 px-3 py-2 rounded-lg text-center">
                    <div className="text-lg font-bold text-purple-700">{userStats.venueOwners}</div>
                    <div className="text-xs text-purple-600">Venue Owners</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, company, or phone..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="sm:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <select
                  className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="Customer">Customer</option>
                  <option value="VenueOwner">Venue Owner</option>
                  <option value="Admin">Admin</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>
            <div className="sm:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <select
                  className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-6">
          {filteredUsers.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-500">
                {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "No users have been registered yet"}
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={user?.profileImg?.secure_url || "/placeholder.svg?height=48&width=48"}
                        alt={user.name || "User"}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{user.name || "N/A"}</h3>
                        <p className="text-sm text-gray-500">{user.email || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getRoleBadge(user.role)}
                      {user.roleApprovalStatus && getStatusBadge(user.roleApprovalStatus)}
                      <div className="relative">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Building2 className="h-4 w-4 mr-2" />
                      {user.companyName || "N/A"}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {user.phone || "N/A"}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {user.displayAddress}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {convertToDate(user.createdAt) || "N/A"}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </button>
                    <button
                      onClick={() => handleEditUser(user)}
                      className="inline-flex items-center px-3 py-1.5 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(user)
                        setShowDeleteModal(true)
                      }}
                      className="inline-flex items-center px-3 py-1.5 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && !showEditModal && !showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">User Details</h3>
              <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Personal Information</h4>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedUser.name || "N/A"}</p>
                      <p className="text-sm text-gray-500">Full Name</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedUser.email || "N/A"}</p>
                      <p className="text-sm text-gray-500">Email Address</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedUser.phone || "N/A"}</p>
                      <p className="text-sm text-gray-500">Phone Number</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedUser.displayAddress}</p>
                      <p className="text-sm text-gray-500">Address</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <div className="flex items-center space-x-2">
                        {getRoleBadge(selectedUser.role)}
                        {selectedUser.roleApprovalStatus && getStatusBadge(selectedUser.roleApprovalStatus)}
                      </div>
                      <p className="text-sm text-gray-500">Role & Status</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Business Information</h4>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Building2 className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedUser.companyName || "N/A"}</p>
                      <p className="text-sm text-gray-500">Company Name</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedUser.esewaId || "N/A"}</p>
                      <p className="text-sm text-gray-500">Esewa ID</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {convertToDate(selectedUser.createdAt) || "N/A"}
                      </p>
                      <p className="text-sm text-gray-500">Member Since</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {convertToDate(selectedUser.updatedAt) || "N/A"}
                      </p>
                      <p className="text-sm text-gray-500">Last Updated</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents */}
            {(selectedUser.profileImg || selectedUser.legalDocImg) && (
              <div className="mt-8">
                <h4 className="text-md font-medium text-gray-900 mb-4">Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedUser.profileImg && (
                    <div>
                      <div className="flex items-center mb-2">
                        <ImageIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">Profile Image</span>
                      </div>
                      <img
                        src={selectedUser.profileImg.secure_url || "/placeholder.svg"}
                        alt="Profile"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                  {selectedUser.legalDocImg && (
                    <div>
                      <div className="flex items-center mb-2">
                        <FileText className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">Legal Document</span>
                      </div>
                      <img
                        src={selectedUser.legalDocImg.secure_url || "/placeholder.svg"}
                        alt="Legal Document"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Edit User</h3>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditFormData({})
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={editFormData.name || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={editFormData.email || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={editFormData.phone || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={editFormData.role || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  >
                    <option value="Customer">Customer</option>
                    <option value="VenueOwner">Venue Owner</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={editFormData.companyName || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, companyName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Esewa ID</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={editFormData.esewaId || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, esewaId: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={editFormData.address || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleUpdateUser}
                disabled={false}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Update User
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditFormData({})
                }}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Delete User</h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedUser(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-center mb-3">
                <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
                <p className="text-sm text-gray-600">
                  Are you sure you want to delete this user? This action cannot be undone.
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-900">{selectedUser?.name}</p>
                <p className="text-sm text-gray-500">{selectedUser?.email}</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleDeleteUser}
                disabled={deleteLoading}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {deleteLoading ? "Deleting..." : "Delete User"}
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedUser(null)
                }}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers
