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
  UserCheck,
  Shield,
  Download,
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
          address: user.address || "N/A", // Keep as string
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
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300">
        <Clock className="w-3 h-3 mr-1" />
        PENDING REVIEW
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-teal-400 rounded-full animate-pulse mx-auto"></div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-700">Loading role requests...</p>
          <p className="mt-2 text-sm text-gray-500">Please wait while we fetch the pending applications</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-teal-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Venue Owner Applications
                  </h1>
                  <p className="mt-2 text-lg text-gray-600">Review and manage requests to become venue owners</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-teal-50 to-teal-100 px-6 py-3 rounded-xl border border-teal-200 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="w-5 h-5 text-teal-600" />
                    <span className="text-lg font-semibold text-teal-700">{filteredRequests.length}</span>
                    <span className="text-sm font-medium text-teal-600">Pending Reviews</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Stats */}
        <div className="bg-white rounded-2xl shadow-lg border border-teal-100 mb-8 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Applications</label>
                <div className="relative">
                  <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or company name..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-6">
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-teal-100 p-16 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No applications found</h3>
              <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                {searchTerm
                  ? "No applications match your search criteria. Try adjusting your search terms."
                  : "No pending venue owner applications have been submitted yet. New applications will appear here for review."}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 text-teal-600 hover:text-teal-700 font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-2xl shadow-lg border border-teal-100 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <img
                          src={
                            getOptimizedCloudinaryUrl(request?.requestData?.profileImg?.secure_url) ||
                            "/placeholder.svg?height=64&width=64" ||
                            "/placeholder.svg"
                          }
                          alt={request.requestData.name || "Profile"}
                          className="h-16 w-16 rounded-xl object-cover border-2 border-teal-100 shadow-sm"
                        />
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 border-2 border-white rounded-full flex items-center justify-center">
                          <Clock className="w-2.5 h-2.5 text-yellow-700" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{request.requestData.name || "N/A"}</h3>
                        <p className="text-gray-600 mt-1">{request.requestData.email || "N/A"}</p>
                        <div className="mt-2">{getStatusBadge(request.status)}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-50 to-teal-100 text-teal-700 rounded-xl hover:from-teal-100 hover:to-teal-200 transition-all duration-200 border border-teal-200 shadow-sm hover:shadow-md"
                    >
                      <Eye className="h-4 w-4" />
                      Review Application
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Building2 className="h-4 w-4 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{request.requestData.companyName || "N/A"}</p>
                        <p className="text-xs text-gray-500">Company</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Phone className="h-4 w-4 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{request.requestData.phone || "N/A"}</p>
                        <p className="text-xs text-gray-500">Phone</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <MapPin className="h-4 w-4 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {typeof request.requestData.address === "object"
                            ? [
                                request.requestData.address.street,
                                request.requestData.address.area,
                                request.requestData.address.city,
                                request.requestData.address.province,
                              ]
                                .filter(Boolean)
                                .join(", ") || "N/A"
                            : request.requestData.address || "N/A"}
                        </p>
                        <p className="text-xs text-gray-500">Location</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Calendar className="h-4 w-4 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {convertToDate(request.submittedAt) || "N/A"}
                        </p>
                        <p className="text-xs text-gray-500">Submitted</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => handleApprove(request.id)}
                      disabled={approveLoading}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="h-4 w-4" />
                      {approveLoading ? "Approving..." : "Approve Application"}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRequest(request)
                        setShowRejectModal(true)
                      }}
                      disabled={rejectLoading}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="h-4 w-4" />
                      {rejectLoading ? "Rejecting..." : "Reject Application"}
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-6xl shadow-2xl border border-teal-100 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Application Review</h3>
                    <p className="text-gray-600 mt-1">Comprehensive application details</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-2xl p-6 border border-teal-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-teal-600 rounded-lg">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">Personal Information</h4>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <User className="h-4 w-4 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{selectedRequest.requestData.name || "N/A"}</p>
                        <p className="text-sm text-gray-600 mt-1">Full Name</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Mail className="h-4 w-4 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{selectedRequest.requestData.email || "N/A"}</p>
                        <p className="text-sm text-gray-600 mt-1">Email Address</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Phone className="h-4 w-4 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{selectedRequest.requestData.phone || "N/A"}</p>
                        <p className="text-sm text-gray-600 mt-1">Phone Number</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <MapPin className="h-4 w-4 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{selectedRequest.requestData.address || "N/A"}</p>
                        <p className="text-sm text-gray-600 mt-1">Address</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business Information */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 border border-blue-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">Business Information</h4>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Building2 className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{selectedRequest.requestData.companyName || "N/A"}</p>
                        <p className="text-sm text-gray-600 mt-1">Company Name</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <CreditCard className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{selectedRequest.requestData.esewaId || "N/A"}</p>
                        <p className="text-sm text-gray-600 mt-1">eSewa ID</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div className="mt-8 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-6 border border-purple-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-600 rounded-lg">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Uploaded Documents</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-xl p-4 border border-purple-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <ImageIcon className="h-5 w-5 text-purple-600" />
                      <span className="font-medium text-gray-900">Profile Image</span>
                    </div>
                    <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                      <img
                        src={
                          getOptimizedCloudinaryUrl(selectedRequest?.requestData?.profileImg?.secure_url) ||
                          "/placeholder.svg?height=300&width=300" ||
                          "/placeholder.svg"
                        }
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-purple-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="h-5 w-5 text-purple-600" />
                      <span className="font-medium text-gray-900">Legal Document</span>
                    </div>
                    <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                      <img
                        src={
                          selectedRequest?.requestData?.legalDocImg?.secure_url ||
                          "/placeholder.svg?height=300&width=300" ||
                          "/placeholder.svg"
                        }
                        alt="Legal Document"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => handleApprove(selectedRequest.id)}
                  disabled={approveLoading}
                  className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
                >
                  <Check className="h-5 w-5" />
                  {approveLoading ? "Approving..." : "Approve Application"}
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={rejectLoading}
                  className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
                >
                  <X className="h-5 w-5" />
                  Reject Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-red-200">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-red-100 rounded-xl">
                  <X className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Reject Application</h3>
                  <p className="text-gray-600 mt-1">Provide feedback to the applicant</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 resize-none"
                  rows="5"
                  placeholder="Please provide a clear reason for rejecting this application. This will help the applicant understand what needs to be improved."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-2">This message will be sent to the applicant via email.</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleReject}
                  disabled={rejectLoading || !rejectReason.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <X className="h-4 w-4" />
                  {rejectLoading ? "Rejecting..." : "Reject Application"}
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(false)
                    setRejectReason("")
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminRoleRequests
