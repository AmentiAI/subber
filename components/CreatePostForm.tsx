"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useWalletAuth } from "@/hooks/useWalletAuth"

const postSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().min(1, "Content is required").max(5000),
})

type PostForm = z.infer<typeof postSchema>

interface CreatePostFormProps {
  communitySlug: string
}

export function CreatePostForm({ communitySlug }: CreatePostFormProps) {
  const router = useRouter()
  const { connected, address, getAuthHeaders, getAuthBody } = useWalletAuth()
  const [error, setError] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PostForm>({
    resolver: zodResolver(postSchema),
  })

  const onSubmit = async (data: PostForm) => {
    if (!connected || !address) {
      setError("Please connect your wallet to create a post")
      return
    }

    setError("")
    try {
      const res = await fetch(`/api/communities/${communitySlug}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(getAuthBody(data)),
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.error || "Something went wrong")
        return
      }

      reset()
      setIsOpen(false)
      router.refresh()
    } catch (err) {
      setError("Something went wrong. Please try again.")
    }
  }

  if (!isOpen) {
    if (!connected) {
      return (
        <div className="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-xl text-center">
          <p>Please connect your wallet to create a post</p>
        </div>
      )
    }

    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full px-6 py-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 text-left transition-all"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">+</span>
          </div>
          <span className="font-medium">Create a new post...</span>
        </div>
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl p-6 space-y-4"
    >
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <input
          {...register("title")}
          type="text"
          placeholder="Post title"
          className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.title.message}
          </p>
        )}
      </div>

      <div>
        <textarea
          {...register("content")}
          rows={6}
          placeholder="What's on your mind?"
          className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 resize-none"
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.content.message}
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={() => {
            setIsOpen(false)
            reset()
          }}
          className="px-5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:transform-none"
        >
          {isSubmitting ? "Posting..." : "Post"}
        </button>
      </div>
    </form>
  )
}

