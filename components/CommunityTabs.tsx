"use client"

import { useState } from "react"
import { MessageSquare, Users, BarChart3, FileText, Settings, UserPlus } from "lucide-react"
import { PostsList } from "./PostsList"
import { CreatePostForm } from "./CreatePostForm"
import { CommunityRules } from "./CommunityRules"
import { CommunityMembers } from "./CommunityMembers"
import { CommunityAnalytics } from "./CommunityAnalytics"
import { CommunityActivity } from "./CommunityActivity"

interface CommunityTabsProps {
  communitySlug: string
  isMember: boolean
}

type TabType = "posts" | "rules" | "members" | "activity" | "analytics"

export function CommunityTabs({ communitySlug, isMember }: CommunityTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("posts")

  const tabs = [
    { id: "posts" as TabType, label: "Posts", icon: MessageSquare },
    { id: "rules" as TabType, label: "Rules", icon: FileText },
    { id: "members" as TabType, label: "Members", icon: Users },
    { id: "activity" as TabType, label: "Activity", icon: UserPlus },
    { id: "analytics" as TabType, label: "Analytics", icon: BarChart3 },
  ]

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex items-center space-x-1 mb-6 bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg rounded-xl p-1 border border-slate-200 dark:border-slate-700 shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "posts" && (
          <div>
            {isMember && (
              <div className="mb-6">
                <CreatePostForm communitySlug={communitySlug} />
              </div>
            )}
            <PostsList communitySlug={communitySlug} />
          </div>
        )}

        {activeTab === "rules" && (
          <CommunityRules communitySlug={communitySlug} />
        )}

        {activeTab === "members" && (
          <CommunityMembers communitySlug={communitySlug} />
        )}

        {activeTab === "activity" && (
          <CommunityActivity communitySlug={communitySlug} />
        )}

        {activeTab === "analytics" && (
          <CommunityAnalytics communitySlug={communitySlug} />
        )}
      </div>
    </div>
  )
}

