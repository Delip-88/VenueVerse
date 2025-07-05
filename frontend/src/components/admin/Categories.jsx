"use client"

import { useState } from "react"
import { Plus, Edit3, Trash2, Save, X, Search, Tag, AlertCircle, Check, Grid3X3, Filter, Download } from "lucide-react"
import toast from "react-hot-toast"
import { useQuery, useMutation } from "@apollo/client"
import { GET_CATEGORIES } from "../Graphql/query/AdminQuery"
import { REMOVE_CATEGORY, EDIT_CATEGORY, ADD_CATEGORY } from "../Graphql/mutations/Admin"

const AddCategoriesPage = () => {
  // Apollo hooks
  const { data, loading, refetch } = useQuery(GET_CATEGORIES)
  const [addCategoryMutation] = useMutation(ADD_CATEGORY)
  const [editCategoryMutation] = useMutation(EDIT_CATEGORY)
  const [removeCategoryMutation] = useMutation(REMOVE_CATEGORY)

  // Use categories from server, fallback to [] if not loaded
  const categories = data?.categories?.categories || []

  const [searchTerm, setSearchTerm] = useState("")
  const [newCategory, setNewCategory] = useState("")
  const [editingIndex, setEditingIndex] = useState(null)
  const [editingValue, setEditingValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState(null)
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState([])

  // Filter categories based on search term
  const filteredCategories = categories.filter((category) =>
    category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Format category for display
  const formatCategory = (category) => {
    return category
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ")
  }

  // Handle adding new category
  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast.error("Category name cannot be empty")
      return
    }

    const formattedCategory = newCategory.trim().toUpperCase().replace(/\s+/g, "_")

    if (categories.includes(formattedCategory)) {
      toast.error("Category already exists")
      return
    }

    setIsLoading(true)
    try {
      await addCategoryMutation({ variables: { category: formattedCategory } })
      setNewCategory("")
      toast.success("Category added successfully!")
      refetch()
    } catch (error) {
      toast.error("Failed to add category")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle editing category
  const handleEditCategory = (index, category) => {
    setEditingIndex(index)
    setEditingValue(formatCategory(category))
  }

  // Handle saving edited category
  const handleSaveEdit = async (index) => {
    if (!editingValue.trim()) {
      toast.error("Category name cannot be empty")
      return
    }

    const formattedCategory = editingValue.trim().toUpperCase().replace(/\s+/g, "_")
    const originalCategory = categories[index]

    if (formattedCategory === originalCategory) {
      setEditingIndex(null)
      setEditingValue("")
      return
    }

    if (categories.includes(formattedCategory)) {
      toast.error("Category already exists")
      return
    }

    setIsLoading(true)
    try {
      await editCategoryMutation({
        variables: {
          oldCategory: originalCategory,
          newCategory: formattedCategory,
        },
      })
      setEditingIndex(null)
      setEditingValue("")
      toast.success("Category updated successfully!")
      refetch()
    } catch (error) {
      toast.error("Failed to update category")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle deleting category
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return

    setIsLoading(true)
    try {
      await removeCategoryMutation({ variables: { category: categoryToDelete.category } })
      setShowDeleteModal(false)
      setCategoryToDelete(null)
      toast.success("Category deleted successfully!")
      refetch()
    } catch (error) {
      toast.error("Failed to delete category")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle bulk selection
  const handleSelectCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  // Handle select all
  const handleSelectAll = () => {
    if (selectedCategories.length === filteredCategories.length) {
      setSelectedCategories([])
    } else {
      setSelectedCategories([...filteredCategories])
    }
  }

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedCategories.length === 0) {
      toast.error("No categories selected")
      return
    }

    setIsLoading(true)
    try {
      // Await all deletions in parallel
      await Promise.all(
        selectedCategories.map((category) =>
          removeCategoryMutation({ variables: { category } })
        )
      )
      setSelectedCategories([])
      setShowBulkActions(false)
      toast.success(`${selectedCategories.length} categories deleted successfully!`)
      await refetch() // Ensure UI updates after all deletions
    } catch (error) {
      toast.error("Failed to delete categories")
    } finally {
      setIsLoading(false)
    }
  }

  // Export categories to CSV
  const handleExport = () => {
    const csvContent = ["Category,Formatted Name", ...categories.map((cat) => `${cat},${formatCategory(cat)}`)].join(
      "\n",
    )

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `venue_categories_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Categories exported successfully!")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl p-3">
                  <Tag className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                    Manage Categories
                  </h1>
                  <p className="text-gray-600 mt-1">Add, edit, and organize venue categories for your platform</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleExport}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
                <button
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg ${
                    showBulkActions
                      ? "bg-gradient-to-r from-red-500 to-red-600 text-white"
                      : "bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700"
                  }`}
                >
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  {showBulkActions ? "Cancel" : "Bulk Actions"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Categories</p>
                <p className="text-3xl font-bold text-gray-900">{categories.length}</p>
              </div>
              <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg p-3">
                <Tag className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Filtered Results</p>
                <p className="text-3xl font-bold text-gray-900">{filteredCategories.length}</p>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3">
                <Filter className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Selected</p>
                <p className="text-3xl font-bold text-gray-900">{selectedCategories.length}</p>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-3">
                <Check className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Add New Category */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Plus className="h-5 w-5 mr-2 text-teal-600" />
            Add New Category
          </h2>
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Enter category name (e.g., Wedding Hall, Conference Room)"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddCategory()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors duration-200"
              />
            </div>
            <button
              onClick={handleAddCategory}
              disabled={isLoading || !newCategory.trim()}
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </div>
              ) : (
                <div className="flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Search and Bulk Actions */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors duration-200"
              />
            </div>

            {showBulkActions && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSelectAll}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  {selectedCategories.length === filteredCategories.length ? "Deselect All" : "Select All"}
                </button>
                {selectedCategories.length > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    disabled={isLoading}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2 inline" />
                    Delete Selected ({selectedCategories.length})
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Categories List */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Tag className="h-5 w-5 mr-2 text-teal-600" />
              Categories ({filteredCategories.length})
            </h2>
          </div>

          {filteredCategories.length === 0 ? (
            <div className="p-12 text-center">
              <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
              <p className="text-gray-500">
                {searchTerm ? "Try adjusting your search criteria" : "Start by adding your first category"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredCategories.map((category, index) => {
                const originalIndex = categories.indexOf(category)
                const isEditing = editingIndex === originalIndex
                const isSelected = selectedCategories.includes(category)

                return (
                  <div
                    key={category}
                    className={`p-6 hover:bg-gray-50 transition-colors duration-200 ${
                      isSelected ? "bg-teal-50 border-l-4 border-teal-500" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        {showBulkActions && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectCategory(category)}
                            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                          />
                        )}

                        <div className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg p-2">
                          <Tag className="h-5 w-5 text-white" />
                        </div>

                        <div className="flex-1">
                          {isEditing ? (
                            <div className="flex items-center space-x-3">
                              <input
                                type="text"
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && handleSaveEdit(originalIndex)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveEdit(originalIndex)}
                                disabled={isLoading}
                                className="p-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200"
                              >
                                <Save className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingIndex(null)
                                  setEditingValue("")
                                }}
                                className="p-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">{formatCategory(category)}</h3>
                              <p className="text-sm text-gray-500 mt-1">System ID: {category}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {!isEditing && !showBulkActions && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditCategory(originalIndex, category)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            title="Edit category"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setCategoryToDelete({ category, index: originalIndex })
                              setShowDeleteModal(true)
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            title="Delete category"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && categoryToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-2 mr-3">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Category</h3>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the category "
              <span className="font-medium text-gray-900">{formatCategory(categoryToDelete.category)}</span>
              "? This action cannot be undone.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={handleDeleteCategory}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </div>
                ) : (
                  "Delete"
                )}
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setCategoryToDelete(null)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
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

export default AddCategoriesPage
