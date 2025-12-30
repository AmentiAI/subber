"use client"

import { useState, useRef, useEffect } from "react"
import { User, Camera, Save, X, Upload, Plus, Trash2, Edit2, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"
import { useWalletAuth } from "@/hooks/useWalletAuth"

interface PortfolioItem {
  id: string
  title: string
  description: string | null
  image: string | null
  link: string | null
  tags: string[] | null
  order: number
}

export default function ProfilePage() {
  const router = useRouter()
  const { connected, address, user: walletUser, getAuthHeaders, getAuthBody, refetchUser } = useWalletAuth()
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    location: "",
    website: "",
    profilePicture: "",
    bannerImage: "",
  })
  const [saving, setSaving] = useState(false)
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [editingPortfolio, setEditingPortfolio] = useState<string | null>(null)
  const [newPortfolio, setNewPortfolio] = useState({
    title: "",
    description: "",
    image: "",
    link: "",
    tags: [] as string[],
  })
  const [showAddPortfolio, setShowAddPortfolio] = useState(false)
  const profilePictureInputRef = useRef<HTMLInputElement>(null)
  const bannerImageInputRef = useRef<HTMLInputElement>(null)
  const portfolioImageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (walletUser) {
      setFormData({
        name: walletUser.name || "",
        bio: walletUser.bio || "",
        location: walletUser.location || "",
        website: walletUser.website || "",
        profilePicture: walletUser.profilePicture || "",
        bannerImage: walletUser.bannerImage || "",
      })
      if (walletUser.id) {
        fetchPortfolio(walletUser.id)
      }
    }
  }, [walletUser])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "profilePicture" | "bannerImage") => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData({ ...formData, [type]: reader.result as string })
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    fetchPortfolio()
  }, [])

  const fetchPortfolio = async (userId?: string) => {
    if (!userId && !walletUser?.id) return
    try {
      const userIdToUse = userId || walletUser?.id
      const res = await fetch(`/api/portfolio?userId=${userIdToUse}`)
      const data = await res.json()
      // Ensure data is always an array
      setPortfolio(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to fetch portfolio")
      setPortfolio([]) // Set to empty array on error
    }
  }

  const handleSave = async () => {
    if (!connected || !address) {
      alert("Please connect your wallet to save your profile")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(getAuthBody(formData)),
      })

      if (res.ok) {
        const result = await res.json()
        setEditing(false)
        // Refetch user data to get updated profile
        await refetchUser()
        // Also update local form data with saved values
        const updatedUser = await fetch("/api/auth/wallet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ walletAddress: address }),
        }).then(res => res.json())
        
        if (updatedUser.user) {
          setFormData({
            name: updatedUser.user.name || "",
            bio: updatedUser.user.bio || "",
            location: updatedUser.user.location || "",
            website: updatedUser.user.website || "",
            profilePicture: updatedUser.user.profilePicture || "",
            bannerImage: updatedUser.user.bannerImage || "",
          })
        }
        alert("Profile saved successfully!")
      } else {
        const errorData = await res.json()
        console.error("Profile save error:", errorData)
        alert(errorData.error || errorData.details || "Failed to save profile")
      }
    } catch (error: any) {
      console.error("Failed to save profile:", error)
      alert(`Failed to save profile: ${error.message || "Unknown error"}`)
    } finally {
      setSaving(false)
    }
  }

  const handlePortfolioImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      if (editingPortfolio) {
        setPortfolio(portfolio.map(item => 
          item.id === editingPortfolio 
            ? { ...item, image: reader.result as string }
            : item
        ))
      } else {
        setNewPortfolio({ ...newPortfolio, image: reader.result as string })
      }
    }
    reader.readAsDataURL(file)
  }

  const handleAddPortfolio = async () => {
    if (!connected || !address) {
      alert("Please connect your wallet to add portfolio items")
      return
    }

    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(getAuthBody({
          ...newPortfolio,
          tags: newPortfolio.tags.filter(t => t.trim() !== ""),
        })),
      })

      if (res.ok) {
        await fetchPortfolio()
        setNewPortfolio({ title: "", description: "", image: "", link: "", tags: [] })
        setShowAddPortfolio(false)
      }
    } catch (error) {
      console.error("Failed to add portfolio item")
    }
  }

  const handleUpdatePortfolio = async (id: string) => {
    if (!connected || !address) {
      alert("Please connect your wallet to update portfolio items")
      return
    }

    const item = portfolio.find(p => p.id === id)
    if (!item) return

    try {
      const res = await fetch(`/api/portfolio/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(getAuthBody({
          title: item.title,
          description: item.description,
          image: item.image,
          link: item.link,
          tags: item.tags,
        })),
      })

      if (res.ok) {
        setEditingPortfolio(null)
        await fetchPortfolio()
      }
    } catch (error) {
      console.error("Failed to update portfolio item")
    }
  }

  const handleDeletePortfolio = async (id: string) => {
    if (!connected || !address) {
      alert("Please connect your wallet to delete portfolio items")
      return
    }

    if (!confirm("Are you sure you want to delete this portfolio item?")) return

    try {
      const res = await fetch(`/api/portfolio/${id}`, {
        method: "DELETE",
        headers: {
          ...getAuthHeaders(),
        },
      })

      if (res.ok) {
        await fetchPortfolio()
      }
    } catch (error) {
      console.error("Failed to delete portfolio item")
    }
  }

  if (!connected) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-8 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Please connect your wallet to view your profile
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
        {/* Banner */}
        <div className="relative h-64 group">
          {formData.bannerImage ? (
            <img
              src={formData.bannerImage}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
          )}
          {editing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <label className="cursor-pointer px-4 py-2 bg-white rounded-lg hover:bg-slate-100 transition-colors flex items-center space-x-2">
                <Camera className="h-5 w-5 text-slate-900" />
                <span className="text-slate-900 font-medium">Change Banner</span>
                <input
                  ref={bannerImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "bannerImage")}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* Profile Section */}
        <div className="px-6 pb-6 -mt-20">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            {/* Profile Picture */}
            <div className="relative group">
              {formData.profilePicture ? (
                <img
                  src={formData.profilePicture}
                  alt="Profile"
                  className="w-32 h-32 rounded-2xl border-4 border-white dark:border-slate-800 shadow-xl object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-2xl border-4 border-white dark:border-slate-800 shadow-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                  A
                </div>
              )}
              {editing && (
                <label className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="h-6 w-6 text-white" />
                  <input
                    ref={profilePictureInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "profilePicture")}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Edit Button */}
            <div className="flex items-center space-x-3">
              {editing ? (
                <>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 font-semibold flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{saving ? "Saving..." : "Save"}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Name
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  placeholder="Your name"
                />
              ) : (
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {formData.name || "Anonymous"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Bio
              </label>
              {editing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 resize-none"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-slate-600 dark:text-slate-400">
                  {formData.bio || "No bio yet"}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Location
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    placeholder="City, Country"
                  />
                ) : (
                  <p className="text-slate-600 dark:text-slate-400">
                    {formData.location || "Not set"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Website
                </label>
                {editing ? (
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    placeholder="https://..."
                  />
                ) : (
                  <p className="text-slate-600 dark:text-slate-400">
                    {formData.website || "Not set"}
                  </p>
                )}
              </div>
            </div>

            {editing && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Profile Picture
                  </label>
                  <label className="block w-full px-4 py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer text-center">
                    <Upload className="h-5 w-5 text-slate-500 dark:text-slate-400 mx-auto mb-2" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Click to upload or drag and drop
                    </span>
                    <input
                      ref={profilePictureInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "profilePicture")}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Recommended: 400x400px square image (max 5MB)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Banner Image
                  </label>
                  <label className="block w-full px-4 py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer text-center">
                    <Upload className="h-5 w-5 text-slate-500 dark:text-slate-400 mx-auto mb-2" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Click to upload or drag and drop
                    </span>
                    <input
                      ref={bannerImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "bannerImage")}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Recommended: 1500x500px wide image (max 5MB)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Portfolio Section */}
      <div className="mt-8 bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Portfolio</h2>
          {editing && (
            <button
              onClick={() => setShowAddPortfolio(!showAddPortfolio)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Item</span>
            </button>
          )}
        </div>

        <div className="p-6">
          {showAddPortfolio && editing && (
            <div className="mb-6 p-4 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl bg-blue-50/50 dark:bg-blue-900/20">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Add Portfolio Item</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newPortfolio.title}
                    onChange={(e) => setNewPortfolio({ ...newPortfolio, title: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    placeholder="Project title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newPortfolio.description}
                    onChange={(e) => setNewPortfolio({ ...newPortfolio, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 resize-none"
                    placeholder="Describe your project..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Image
                  </label>
                  <label className="block w-full px-4 py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer text-center">
                    <Upload className="h-5 w-5 text-slate-500 dark:text-slate-400 mx-auto mb-2" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Click to upload image
                    </span>
                    <input
                      ref={portfolioImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePortfolioImageUpload}
                      className="hidden"
                    />
                  </label>
                  {newPortfolio.image && (
                    <img src={newPortfolio.image} alt="Preview" className="mt-2 w-full h-48 object-cover rounded-xl" />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Link
                  </label>
                  <input
                    type="url"
                    value={newPortfolio.link}
                    onChange={(e) => setNewPortfolio({ ...newPortfolio, link: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    placeholder="https://..."
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleAddPortfolio}
                    disabled={!newPortfolio.title}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 font-semibold"
                  >
                    Add Item
                  </button>
                  <button
                    onClick={() => {
                      setShowAddPortfolio(false)
                      setNewPortfolio({ title: "", description: "", image: "", link: "", tags: [] })
                    }}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {!Array.isArray(portfolio) || portfolio.length === 0 ? (
            <p className="text-center text-slate-500 dark:text-slate-400 py-8">
              No portfolio items yet. {editing && "Click 'Add Item' to get started!"}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolio.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {item.image && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      {editing && (
                        <div className="absolute top-2 right-2 flex space-x-2">
                          <button
                            onClick={() => setEditingPortfolio(editingPortfolio === item.id ? null : item.id)}
                            className="p-2 bg-white/90 dark:bg-slate-800/90 rounded-lg hover:bg-white dark:hover:bg-slate-800"
                          >
                            <Edit2 className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                          </button>
                          <button
                            onClick={() => handleDeletePortfolio(item.id)}
                            className="p-2 bg-red-500/90 rounded-lg hover:bg-red-600"
                          >
                            <Trash2 className="h-4 w-4 text-white" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                      {editingPortfolio === item.id ? (
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => setPortfolio(portfolio.map(p => p.id === item.id ? { ...p, title: e.target.value } : p))}
                          className="w-full px-2 py-1 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800"
                        />
                      ) : (
                        item.title
                      )}
                    </h3>
                    {editingPortfolio === item.id ? (
                      <textarea
                        value={item.description || ""}
                        onChange={(e) => setPortfolio(portfolio.map(p => p.id === item.id ? { ...p, description: e.target.value } : p))}
                        className="w-full px-2 py-1 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 mb-2"
                        rows={2}
                      />
                    ) : (
                      item.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">
                          {item.description}
                        </p>
                      )
                    )}
                    {editingPortfolio === item.id ? (
                      <input
                        type="url"
                        value={item.link || ""}
                        onChange={(e) => setPortfolio(portfolio.map(p => p.id === item.id ? { ...p, link: e.target.value } : p))}
                        className="w-full px-2 py-1 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 mb-2"
                        placeholder="https://..."
                      />
                    ) : (
                      item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <span>View Project</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )
                    )}
                    {editingPortfolio === item.id && (
                      <div className="mt-2 flex space-x-2">
                        <button
                          onClick={() => handleUpdatePortfolio(item.id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingPortfolio(null)
                            fetchPortfolio()
                          }}
                          className="px-3 py-1 border border-slate-300 dark:border-slate-700 rounded-lg text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
