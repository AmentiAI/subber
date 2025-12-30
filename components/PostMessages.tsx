"use client"

import { useEffect, useState } from "react"
import { MessageSquare, Send, Image as ImageIcon, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useRef } from "react"
import { useWalletAuth } from "@/hooks/useWalletAuth"

interface Message {
  id: string
  content: string
  senderId: string
  createdAt: string
  image: string | null
  sender: {
    id: string
    name: string | null
  }
}

interface PostMessagesProps {
  postId: string
  authorId: string
}

export function PostMessages({ postId, authorId }: PostMessagesProps) {
  const { connected, address, user: walletUser, getAuthHeaders, getAuthBody } = useWalletAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [messageImage, setMessageImage] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (connected && walletUser?.id && authorId) {
      // Get or create conversation with post author
      fetch("/api/messages/conversations", {
        headers: getAuthHeaders(),
      })
        .then((res) => res.json())
        .then((conversations) => {
          const conv = conversations.find(
            (c: any) => c.otherUser?.id === authorId
          )
          if (conv) {
            setConversationId(conv.id)
            fetchMessages(conv.id)
          } else {
            // Create new conversation
            fetch("/api/messages/conversations", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
              },
              body: JSON.stringify(getAuthBody({ userId: authorId })),
            })
              .then((res) => res.json())
              .then((data) => {
                if (data.id) {
                  setConversationId(data.id)
                  fetchMessages(data.id)
                }
              })
              .catch(() => {})
          }
        })
        .catch(() => {})
    }
  }, [connected, walletUser?.id, authorId])

  const fetchMessages = (convId: string) => {
    fetch(`/api/messages/conversations/${convId}`, {
      headers: getAuthHeaders(),
    })
      .then((res) => res.json())
      .then((data) => setMessages(Array.isArray(data) ? data : []))
      .catch(() => setMessages([]))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setMessageImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSend = async () => {
    if (!connected || !address) {
      alert("Please connect your wallet to send messages")
      return
    }

    if ((!newMessage.trim() && !messageImage) || !conversationId) return

    try {
      const res = await fetch(`/api/messages/conversations/${conversationId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(getAuthBody({ content: newMessage, image: messageImage })),
      })

      if (res.ok) {
        setNewMessage("")
        setMessageImage(null)
        fetchMessages(conversationId)
      }
    } catch (error) {
      console.error("Failed to send message")
    }
  }

  if (!connected || !address) {
    return (
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden mt-8 p-6 text-center">
        <p className="text-slate-600 dark:text-slate-400">
          Please connect your wallet to message the post author
        </p>
      </div>
    )
  }

  if (!conversationId) {
    return null
  }

  return (
    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden mt-8">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <div className="flex items-center space-x-3">
          <MessageSquare className="h-5 w-5 text-white" />
          <h2 className="text-xl font-bold text-white">Messages</h2>
        </div>
      </div>

      <div className="p-6">
        {/* Messages List */}
        <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-slate-600 dark:text-slate-400">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No messages yet. Start a conversation!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isCurrentUser = message.senderId === walletUser?.id
              return (
                <div
                  key={message.id}
                  className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-md px-4 py-2 rounded-xl ${
                      isCurrentUser
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    }`}
                  >
                    {message.image && (
                      <div className="mb-2 rounded-lg overflow-hidden">
                        <img
                          src={message.image}
                          alt="Message attachment"
                          className="max-w-full h-auto rounded-lg"
                        />
                      </div>
                    )}
                    {message.content && <p>{message.content}</p>}
                    <p
                      className={`text-xs mt-1 ${
                        isCurrentUser ? "text-white/70" : "text-slate-500"
                      }`}
                    >
                      {formatDistanceToNow(new Date(message.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Message Input */}
        {messageImage && (
          <div className="mb-3 relative inline-block">
            <img
              src={messageImage}
              alt="Preview"
              className="max-w-xs h-32 object-cover rounded-lg"
            />
            <button
              onClick={() => setMessageImage(null)}
              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => imageInputRef.current?.click()}
            className="p-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
            title="Add image"
          >
            <ImageIcon className="h-5 w-5" />
          </button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

