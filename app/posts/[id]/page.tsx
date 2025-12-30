"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { User, MessageSquare } from "lucide-react"
import { CommentsList } from "@/components/CommentsList"
import { CreateCommentForm } from "@/components/CreateCommentForm"
import { PostMessages } from "@/components/PostMessages"

interface Post {
  id: string
  title: string
  content: string
  createdAt: string
  author: {
    id: string
    name: string | null
    image: string | null
  }
  community: {
    id: string
    name: string
    slug: string
  }
}

export default function PostPage() {
  const params = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      // We'll need to create this API route
      fetch(`/api/posts/${params.id}`)
        .then((res) => res.json())
        .then((data) => {
          setPost(data)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Post not found
            </h1>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
      <div className="mb-4">
        <a
          href={`/communities/${post.community.slug}`}
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          ← Back to {post.community.name}
        </a>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {post.title}
        </h1>
        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <div className="flex items-center space-x-1">
            <User className="h-4 w-4" />
            <span>{post.author.name || "Anonymous"}</span>
          </div>
          <span>
            {formatDistanceToNow(new Date(post.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {post.content}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <MessageSquare className="h-6 w-6" />
          <span>Comments</span>
        </h2>
        <CreateCommentForm postId={post.id} />
      </div>

      <CommentsList postId={post.id} />

      {/* Messages Section */}
      <PostMessages postId={post.id} authorId={post.author.id} />
      </div>
    </div>
  )
}

