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
  Calendar,
} from "lucide-react"
import { useQuery, useMutation } from "@apollo/client"
import { PENDING_ROLE_REQUESTS, APPROVE_ROLE_REQUEST, REJECT_ROLE_REQUEST } from "../Graphql/query/SueprAdmin"
import toast from "react-hot-toast"
import { convertToDate } from "../Functions/calc"
import getOptimizedCloudinaryUrl from "../Functions/OptimizedImageUrl"

const AdminRoleRequests = () => {
  const [filteredRequests, setFilteredRequests] = useState([])
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const { data, loading, refetch } = useQuery(PENDING_ROLE_REQUESTS)

  const [approveRoleChangeRequest, { loading: approveLoading }] = useMutation(APPROVE_ROLE_REQUEST)
  const [rejectRoleChangeRequest, { loading: rejectLoading }] = useMutation(REJECT_ROLE_REQUEST)

  // Transform API data to match UI structure
  const requests = useMemo(() => {
    return (data?.pendingVenueOwners || []).map((user) => {
      // Handle address as object or string
      let addressObj = { city: "", province: "", area: "", street: "" }
      if (typeof user.address === "object" && user.address !== null) {
        addressObj = user.address
      } else if (typeof user.address === "string") {
        addressObj = { ...addressObj, city: user.address }
      }
      return {
        id: user.id,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        requestData: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          profileImg: user?.profileImg,
          legalDocImg: user?.legalDocImg,
          address: addressObj,
          companyName: user.companyName || "",
          esewaId: user.esewaId,
        },
        status: "PENDING", // Since query only returns pending requests
        submittedAt: user.updatedAt,
        reviewedAt: user.updatedAt,
        rejectionReason: user.rejectionReason || null,
      }
    })
  }, [data])

  // Filter only by search term since all requests are pending
  useEffect(() => {
    let filtered = requests

    if (searchTerm) {
      filtered = filtered.filter(
        (request) =>
          request.requestData.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.requestData.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.requestData.companyName?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredRequests(filtered)
  }, [requests, searchTerm])

  const handleApprove = async (requestId) => {
    try {
      const { data } = await approveRoleChangeRequest({
        variables: { userId: requestId },
      })
      if (data?.approveRoleChangeRequest?.success) {
        toast.success("Request approved successfully!")
        refetch()
        setSelectedRequest(null)
      } else {
        toast.error(data?.approveRoleChangeRequest?.message || "Failed to approve request")
      }
    } catch (err) {
      toast.error("Error approving request")
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection")
      return
    }
    try {
      const { data } = await rejectRoleChangeRequest({
        variables: {
          userId: selectedRequest.id,
          rejectionReason: rejectReason,
        },
      })
      if (data?.rejectRoleChangeRequest?.success) {
        toast.success("Request rejected successfully!")
        refetch()
        setShowRejectModal(false)
        setRejectReason("")
        setSelectedRequest(null)
      } else {
        toast.error(data?.rejectRoleChangeRequest?.message || "Failed to reject request")
      }
    } catch (err) {
      toast.error("Error rejecting request")
    }
  }

  const getStatusBadge = (status) => {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <Clock className="w-3 h-3 mr-1" />
        PENDING
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading role requests...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Pending Role Requests</h1>
                <p className="mt-1 text-sm text-gray-500">Manage user requests to become venue owners</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-blue-50 px-3 py-2 rounded-lg">
                  <span className="text-sm font-medium text-blue-700">{filteredRequests.length} Pending</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Filter */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or company..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-6">
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
              <p className="text-gray-500">
                {searchTerm ? "Try adjusting your search criteria" : "No pending role requests have been submitted yet"}
              </p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={getOptimizedCloudinaryUrl(request?.requestData?.profileImg?.secure_url) || "/placeholder.svg"}
                        alt={request.requestData.name || "N/A"}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{request.requestData.name || "N/A"}</h3>
                        <p className="text-sm text-gray-500">{request.requestData.email || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(request.status)}
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Building2 className="h-4 w-4 mr-2" />
                      {request.requestData.companyName || "N/A"}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {request.requestData.phone || "N/A"}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {(request.requestData.address.city || "N/A") +
                        (request.requestData.address.province ? `, ${request.requestData.address.province}` : "")}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {convertToDate(request.submittedAt) || "N/A"}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleApprove(request.id)}
                      disabled={approveLoading}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      {approveLoading ? "Approving..." : "Approve"}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRequest(request)
                        setShowRejectModal(true)
                      }}
                      disabled={rejectLoading}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      <X className="h-4 w-4 mr-2" />
                      {rejectLoading ? "Rejecting..." : "Reject"}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Request Details Modal */}
      {selectedRequest && !showRejectModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Request Details</h3>
              <button onClick={() => setSelectedRequest(null)} className="text-gray-400 hover:text-gray-600">
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
                      <p className="text-sm font-medium text-gray-900">{selectedRequest.requestData.name || "N/A"}</p>
                      <p className="text-sm text-gray-500">Full Name</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedRequest.requestData.email || "N/A"}</p>
                      <p className="text-sm text-gray-500">Email Address</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedRequest.requestData.phone || "N/A"}</p>
                      <p className="text-sm text-gray-500">Phone Number</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {(selectedRequest.requestData.address.street || "") +
                          (selectedRequest.requestData.address.area
                            ? `, ${selectedRequest.requestData.address.area}`
                            : "") || "N/A"}
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {(selectedRequest.requestData.address.city || "") +
                          (selectedRequest.requestData.address.province
                            ? `, ${selectedRequest.requestData.address.province}`
                            : "") || "N/A"}
                      </p>
                      <p className="text-sm text-gray-500">Address</p>
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
                      <p className="text-sm font-medium text-gray-900">
                        {selectedRequest.requestData.companyName || "N/A"}
                      </p>
                      <p className="text-sm text-gray-500">Company Name</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedRequest.requestData.esewaId || "N/A"}
                      </p>
                      <p className="text-sm text-gray-500">Esewa ID</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* /* Documents */ }
                  <div className="mt-8">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Uploaded Documents</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center mb-2">
                      <ImageIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">Profile Image</span>
                      </div>
                      <img
                      src={getOptimizedCloudinaryUrl(selectedRequest?.requestData?.profileImg?.secure_url) || "/placeholder.svg"}
                      alt="Profile"
                      className="w-full h-48 object-contain rounded-lg border bg-gray-100"
                      />
                    </div>
                    <div>
                      <div className="flex items-center mb-2">
                      <FileText className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">Legal Document</span>
                      </div>
                      <img
                      src={selectedRequest?.requestData?.legalDocImg?.secure_url || "/placeholder.svg"}
                      alt="Legal Document"
                      className="w-full h-48 object-contain rounded-lg border bg-gray-100"
                      />
                    </div>
                    </div>
                  </div>

                  {/* Actions */}
            <div className="mt-8 flex space-x-3">
              <button
                onClick={() => handleApprove(selectedRequest.id)}
                disabled={approveLoading}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                <Check className="h-4 w-4 mr-2" />
                {approveLoading ? "Approving..." : "Approve Request"}
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={rejectLoading}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                <X className="h-4 w-4 mr-2" />
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Reject Request</h3>
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectReason("")
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">
                Please provide a reason for rejecting this request. This will be sent to the user.
              </p>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows="4"
                placeholder="Enter rejection reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleReject}
                disabled={rejectLoading}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                <X className="h-4 w-4 mr-2" />
                {rejectLoading ? "Rejecting..." : "Reject Request"}
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectReason("")
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

export default AdminRoleRequests
