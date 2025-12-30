import Link from "next/link"
import { CommunitiesList } from "@/components/CommunitiesList"
import { TrendingUp, Users, MessageSquare, Sparkles } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            <span>Next-Gen Community Platform</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Welcome to Subber
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
            Connect with communities that matter to you. Build, share, and grow together.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/communities/new"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              Create Your Community
            </Link>
            <Link
              href="/trending"
              className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 shadow-md hover:shadow-lg transition-all"
            >
              Explore Trending
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">Active</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Communities</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">Growing</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Discussions</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                <TrendingUp className="h-6 w-6 text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">Thriving</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Communities</p>
              </div>
            </div>
          </div>
        </div>

        {/* Communities List */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Discover Communities
            </h2>
            <Link
              href="/trending"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center space-x-1"
            >
              <span>View All</span>
              <TrendingUp className="h-4 w-4" />
            </Link>
          </div>
          
          <CommunitiesList />
        </div>
      </div>
    </div>
  )
}
