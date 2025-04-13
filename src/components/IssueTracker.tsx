"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle, Clock, MessageSquare } from "lucide-react"

type Status = "Open" | "Resolved" | "Closed"

interface Reply {
  id: string
  content: string
  created_at: string
  sender_name: string
  isStaff: boolean
  avatar?: string
}

interface Issue {
  _id: string
  sender_id: string
  sender_accountId: string
  sender_name: string
  title: string
  description: string
  status: Status
  created_at: string
  updated_at: string
  replies?: Reply[]
}

interface ApiResponse {
  isSuccess: boolean
  message: string
  issueList: Issue[]
}

export default function IssueTracker() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [activeTab, setActiveTab] = useState<string>("all")
  const [replyText, setReplyText] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const { data } = await axios.get("https://air-quality-back-end-v2.vercel.app/issue")
        if (!data.isSuccess) {
          throw new Error(data.message || "Failed to fetch issues")
        }
        setIssues(data.issueList || [])
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || err.message)
        } else {
          setError(err instanceof Error ? err.message : "An unknown error occurred")
        }
        setIssues([])
      } finally {
        setLoading(false)
      }
    }

    fetchIssues()
  }, [])

  const filteredIssues = issues.filter(issue => 
    activeTab === "all" || issue.status.toLowerCase() === activeTab.toLowerCase()
  )

  const handleReply = async (issueId: string) => {
    if (!replyText[issueId]?.trim()) return

    const newReply = {
      id: `reply-${Date.now()}`,
      content: replyText[issueId],
      created_at: new Date().toISOString(),
      sender_name: "Support Staff",
      isStaff: true,
      avatar: undefined,
    }

    // try {
    //   setIssues(prev => prev.map(issue => 
    //     issue._id === issueId
    //       ? { ...issue, replies: [...(issue.replies || []), newReply] }
    //       : issue
    //   ))
    //   setReplyText(prev => ({ ...prev, [issueId]: "" }))

    //   await api.post(`/issue/${issueId}`, {
    //     replies: [...(issues.find(i => i._id === issueId)?.replies || []), newReply]
    //   })
    // } catch (err) {
    //   setError(axios.isAxiosError(err) 
    //     ? err.response?.data?.message || err.message 
    //     : "Failed to send reply")
    //   // Revert optimistic update
    //   setIssues(prev => prev.map(issue => 
    //     issue._id === issueId
    //       ? { 
    //           ...issue, 
    //           replies: issue.replies?.filter(r => r.id !== newReply.id) 
    //         }
    //       : issue
    //   ))
    // }
  }

  const updateStatus = async (issueId: string, newStatus: Status) => {
    try {
      setIssues(prev => prev.map(issue => 
        issue._id === issueId
          ? { ...issue, status: newStatus }
          : issue
      ));

      // API call
      await axios.post(`https://air-quality-back-end-v2.vercel.app/issue/${issueId}/status`, {
        status: newStatus
      });
    } catch (err) {
      setError(axios.isAxiosError(err) 
        ? err.response?.data?.message || err.message 
        : "Failed to update status");
      // Revert optimistic update
      setIssues(prev => prev.map(issue => 
        issue._id === issueId
          ? { ...issue, status: issues.find(i => i._id === issueId)?.status || "Open" }
          : issue
      ));
    }
  }

  const getStatusIcon = (status: Status) => {
    switch (status.toLowerCase()) {
      case "open": return <AlertCircle className="h-4 w-4" />
      case "resolved": return <CheckCircle className="h-4 w-4" />
      case "closed": return <Clock className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: Status) => {
    switch (status.toLowerCase()) {
      case "open": return "bg-red-100 text-red-800 hover:bg-red-200"
      case "resolved": return "bg-green-100 text-green-800 hover:bg-green-200"
      case "closed": return "bg-gray-100 text-gray-800 hover:bg-gray-200"
      default: return "bg-red-100 text-red-800 hover:bg-red-200"
    }
  }

  if (loading) return (
    <div className="container mx-auto py-6 font-geist">
      <h1 className="text-2xl font-bold mb-6">User Reported Issues</h1>
      <div className="flex justify-center items-center h-64">
        <p>Loading issues...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="container mx-auto py-6 font-geist">
      <h1 className="text-2xl font-bold mb-6">User Reported Issues</h1>
      <div className="text-red-500 p-4 border border-red-200 rounded bg-red-50">
        Error: {error}
      </div>
    </div>
  )

  return (
    <div className="container mx-auto py-6 font-geist">
      <h1 className="text-2xl font-bold mb-6">User Reported Issues</h1>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-6">
        {filteredIssues.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No issues found with the selected status.
            </CardContent>
          </Card>
        ) : (
          filteredIssues.reverse().map((issue) => (
            <Card key={issue._id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{issue.title}</CardTitle>
                    <CardDescription className="mt-1">
                      Reported by {issue.sender_name} on {issue.created_at}
                    </CardDescription>
                  </div>
                  <Badge className={`${getStatusColor(issue.status)} flex items-center gap-1`}>
                    {getStatusIcon(issue.status)}
                    {issue.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">{issue.description}</p>

                {issue.replies && issue.replies.length > 0 && (
                  <div className="mt-4 space-y-4">
                    <h3 className="text-sm font-medium flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      Replies
                    </h3>
                    {issue.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-3 pt-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={reply.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{reply.sender_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{reply.sender_name}</span>
                            {reply.isStaff && (
                              <Badge variant="outline" className="text-xs">
                                Staff
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {new Date(reply.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm mt-1">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col items-stretch gap-3 border-t pt-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateStatus(issue._id, "Open")}
                    disabled={issue.status === "Open"}
                    className="text-xs"
                  >
                    Mark as Open
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateStatus(issue._id, "Resolved")}
                    disabled={issue.status === "Resolved"}
                    className="text-xs"
                  >
                    Mark Resolved
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateStatus(issue._id, "Closed")}
                    disabled={issue.status === "Closed"}
                    className="text-xs"
                  >
                    Close Issue
                  </Button>
                </div>

                <div className="flex flex-col gap-2 w-full">
                  <Textarea
                    placeholder="Type your reply here..."
                    value={replyText[issue._id] || ""}
                    onChange={(e) => setReplyText({ ...replyText, [issue._id]: e.target.value })}
                    className="min-h-[80px]"
                  />
                  <Button
                    onClick={() => handleReply(issue._id)}
                    disabled={!replyText[issue._id]?.trim()}
                    className="self-end"
                  >
                    Send Reply
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}