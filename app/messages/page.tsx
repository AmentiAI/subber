"use client"

import { useEffect, useState, useRef } from "react"
import { MessageSquare, Send, User, Image as ImageIcon, X } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { useWalletAuth } from "@/hooks/useWalletAuth"

interface Conversation {
  id: string
  otherUser: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
  lastMessage: {
    content: string
    createdAt: string
  } | null
  unreadCount: number
}

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

export default function MessagesPage() {
  const searchParams = useSearchParams()
  const userId = searchParams.get("user")
  const { connected, address, user: walletUser, getAuthHeaders, getAuthBody } = useWalletAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(userId)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [messageImage, setMessageImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const imageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (connected && address) {
      fetch("/api/messages/conversations", {
        headers: getAuthHeaders(),
      })
        .then((res) => res.json())
        .then((data) => {
          setConversations(Array.isArray(data) ? data : [])
          setLoading(false)
        })
        .catch(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [connected, address])

  useEffect(() => {
    if (selectedConversation && connected && address) {
      fetch(`/api/messages/conversations/${selectedConversation}`, {
        headers: getAuthHeaders(),
      })
        .then((res) => res.json())
        .then((data) => setMessages(Array.isArray(data) ? data : []))
        .catch(() => setMessages([]))
    }
  }, [selectedConversation, connected, address])

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
    if ((!newMessage.trim() && !messageImage) || !selectedConversation) return

    try {
      const res = await fetch(`/api/messages/conversations/${selectedConversation}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage, image: messageImage }),
      })

      if (res.ok) {
        setNewMessage("")
        setMessageImage(null)
        // Refresh messages
        fetch(`/api/messages/conversations/${selectedConversation}`)
          .then((res) => res.json())
          .then((data) => setMessages(data))
      }
    } catch (error) {
      console.error("Failed to send message")
    }
  }

  if (!connected) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-8 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Please connect your wallet to view messages
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden h-[calc(100vh-8rem)] flex">
        {/* Conversations List */}
        <div className="w-80 border-r border-slate-200 dark:border-slate-700 flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-600 to-purple-600">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Messages</span>
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-slate-600 dark:text-slate-400">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No conversations yet</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                  className={`w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-200 dark:border-slate-700 ${
                    selectedConversation === conv.id ? "bg-blue-50 dark:bg-blue-900/20" : ""
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {(conv.otherUser.name || conv.otherUser.email)[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {conv.otherUser.name || "Anonymous"}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      {conv.lastMessage && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                          {conv.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => {
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
                        <p className={`text-xs mt-1 ${
                          isCurrentUser ? "text-white/70" : "text-slate-500"
                        }`}>
                          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="p-4 border-t border-slate-200 dark:border-slate-700">
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
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-600 dark:text-slate-400">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

