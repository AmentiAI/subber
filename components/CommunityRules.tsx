"use client"

import { useEffect, useState } from "react"
import { FileText, Edit2, Save, X } from "lucide-react"

interface CommunityRulesProps {
  communitySlug: string
}

interface Community {
  id: string
  name: string
  rules: string | null
  guidelines: string | null
}

export function CommunityRules({ communitySlug }: CommunityRulesProps) {
  const [community, setCommunity] = useState<Community | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [rules, setRules] = useState("")
  const [guidelines, setGuidelines] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/communities/${communitySlug}`)
      .then((res) => res.json())
      .then((data) => {
        setCommunity(data)
        setRules(data.rules || "")
        setGuidelines(data.guidelines || "")
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [communitySlug])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/communities/${communitySlug}/rules`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules, guidelines }),
      })

      if (res.ok) {
        setEditing(false)
        if (community) {
          setCommunity({ ...community, rules, guidelines })
        }
      }
    } catch (error) {
      console.error("Failed to save rules")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg rounded-xl border border-slate-200 dark:border-slate-700 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
        </div>
      </div>
    )
  }

  const hasRules = rules.trim() || guidelines.trim()

  return (
    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Community Rules & Guidelines</h2>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
          >
            <Edit2 className="h-4 w-4" />
            <span>Edit</span>
          </button>
        )}
      </div>

      <div className="p-6">
        {editing ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Community Rules
              </label>
              <textarea
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                rows={8}
                placeholder="Enter your community rules here. Be clear and specific about what is and isn't allowed..."
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Guidelines
              </label>
              <textarea
                value={guidelines}
                onChange={(e) => setGuidelines(e.target.value)}
                rows={6}
                placeholder="Enter community guidelines and best practices..."
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 resize-none"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setEditing(false)
                  setRules(community?.rules || "")
                  setGuidelines(community?.guidelines || "")
                }}
                className="px-5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-colors flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 font-semibold shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? "Saving..." : "Save"}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {hasRules ? (
              <>
                {rules.trim() && (
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center space-x-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
                      <span>Rules</span>
                    </h3>
                    <div className="prose dark:prose-invert max-w-none bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                      <pre className="whitespace-pre-wrap font-sans text-slate-700 dark:text-slate-300">
                        {rules}
                      </pre>
                    </div>
                  </div>
                )}

                {guidelines.trim() && (
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center space-x-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"></div>
                      <span>Guidelines</span>
                    </h3>
                    <div className="prose dark:prose-invert max-w-none bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                      <pre className="whitespace-pre-wrap font-sans text-slate-700 dark:text-slate-300">
                        {guidelines}
                      </pre>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  No rules set yet
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Community rules help maintain a healthy and respectful environment.
                </p>
                <button
                  onClick={() => setEditing(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Create Rules
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

