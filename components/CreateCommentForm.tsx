"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useWalletAuth } from "@/hooks/useWalletAuth"

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(1000),
})

type CommentForm = z.infer<typeof commentSchema>

interface CreateCommentFormProps {
  postId: string
}

export function CreateCommentForm({ postId }: CreateCommentFormProps) {
  const router = useRouter()
  const { connected, address, getAuthHeaders, getAuthBody } = useWalletAuth()
  const [error, setError] = useState("")
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommentForm>({
    resolver: zodResolver(commentSchema),
  })

  const onSubmit = async (data: CommentForm) => {
    if (!connected || !address) {
      setError("Please connect your wallet to comment")
      return
    }

    setError("")
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
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
      // Trigger a refresh by dispatching a custom event
      window.dispatchEvent(new Event('commentAdded'))
      router.refresh()
    } catch (err) {
      setError("Something went wrong. Please try again.")
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 space-y-4"
    >
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <textarea
          {...register("content")}
          rows={3}
          placeholder="Write a comment..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.content.message}
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Posting..." : "Post Comment"}
        </button>
      </div>
    </form>
  )
}

