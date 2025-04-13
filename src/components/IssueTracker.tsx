"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle, Clock, MessageSquare } from "lucide-react"

type Status = "open" | "resolved" | "closed"

interface Issue {
  id: string
  title: string
  description: string
  status: Status
  createdAt: string
  updatedAt: string
  user: {
    name: string
    email: string
    avatar?: string
  }
  replies: Reply[]
}

interface Reply {
  id: string
  content: string
  createdAt: string
  user: {
    name: string
    isStaff: boolean
    avatar?: string
  }
}

export default function IssueTracker() {
  const [issues, setIssues] = useState<Issue[]>(mockIssues)
  const [activeTab, setActiveTab] = useState<string>("all")
  const [replyText, setReplyText] = useState<Record<string, string>>({})

  const filteredIssues = activeTab === "all" ? issues : issues.filter((issue) => issue.status === activeTab)

  const handleReply = (issueId: string) => {
    if (!replyText[issueId]?.trim()) return

    const updatedIssues = issues.map((issue) => {
      if (issue.id === issueId) {
        return {
          ...issue,
          replies: [
            ...issue.replies,
            {
              id: `reply-${Date.now()}`,
              content: replyText[issueId],
              createdAt: new Date().toISOString(),
              user: {
                name: "Support Staff",
                isStaff: true,
                avatar: undefined,
              },
            },
          ],
        }
      }
      return issue
    })

    setIssues(updatedIssues)
    setReplyText({ ...replyText, [issueId]: "" })
  }

  const updateStatus = (issueId: string, newStatus: Status) => {
    const updatedIssues = issues.map((issue) => {
      if (issue.id === issueId) {
        return {
          ...issue,
          status: newStatus,
          updatedAt: new Date().toISOString(),
        }
      }
      return issue
    })
    setIssues(updatedIssues)
  }

  const getStatusIcon = (status: Status) => {
    switch (status) {
      case "open":
        return <AlertCircle className="h-4 w-4" />
      case "resolved":
        return <CheckCircle className="h-4 w-4" />
      case "closed":
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: Status) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      case "resolved":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "closed":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

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
          filteredIssues.map((issue) => (
            <Card key={issue.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{issue.title}</CardTitle>
                    <CardDescription className="mt-1">
                      Reported by {issue.user.name} on {new Date(issue.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge className={`${getStatusColor(issue.status)} flex items-center gap-1`}>
                    {getStatusIcon(issue.status)}
                    {issue.status.charAt(0).toUpperCase() + issue.status.slice(1).replace("-", " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">{issue.description}</p>

                {issue.replies.length > 0 && (
                  <div className="mt-4 space-y-4">
                    <h3 className="text-sm font-medium flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      Replies
                    </h3>
                    {issue.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-3 pt-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={reply.user.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{reply.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{reply.user.name}</span>
                            {reply.user.isStaff && (
                              <Badge variant="outline" className="text-xs">
                                Staff
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {new Date(reply.createdAt).toLocaleString()}
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
                    onClick={() => updateStatus(issue.id, "open")}
                    disabled={issue.status === "open"}
                    className="text-xs"
                  >
                    Mark as Open
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateStatus(issue.id, "resolved")}
                    disabled={issue.status === "resolved"}
                    className="text-xs"
                  >
                    Mark Resolved
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateStatus(issue.id, "closed")}
                    disabled={issue.status === "closed"}
                    className="text-xs"
                  >
                    Close Issue
                  </Button>
                </div>

                <div className="flex flex-col gap-2 w-full">
                  <Textarea
                    placeholder="Type your reply here..."
                    value={replyText[issue.id] || ""}
                    onChange={(e) => setReplyText({ ...replyText, [issue.id]: e.target.value })}
                    className="min-h-[80px]"
                  />
                  <Button
                    onClick={() => handleReply(issue.id)}
                    disabled={!replyText[issue.id]?.trim()}
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

// Mock data for demonstration
const mockIssues: Issue[] = [
  {
    id: "issue-1",
    title: "Login page not working on mobile devices",
    description:
      "I'm trying to log in using my iPhone but the login button doesn't respond when I tap it. This started happening after the latest update.",
    status: "open",
    createdAt: "2023-04-10T08:30:00Z",
    updatedAt: "2023-04-10T08:30:00Z",
    user: {
      name: "John Smith",
      email: "john.smith@example.com",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    replies: [],
  },
  {
    id: "issue-2",
    title: "Payment processing error",
    description:
      "I'm getting an error message when trying to complete my purchase. The error says 'Payment could not be processed at this time'. I've tried multiple cards.",
    status: "resolved",
    createdAt: "2023-04-09T14:20:00Z",
    updatedAt: "2023-04-10T09:15:00Z",
    user: {
      name: "Emily Johnson",
      email: "emily.j@example.com",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    replies: [
      {
        id: "reply-1",
        content:
          "Thank you for reporting this issue. Our team has resolved the payment processing system issue. Please try again and let us know if you encounter any problems.",
        createdAt: "2023-04-09T15:45:00Z",
        user: {
          name: "Support Team",
          isStaff: true,
          avatar: "/placeholder.svg?height=32&width=32",
        },
      },
      {
        id: "reply-2",
        content: "It works perfectly now. Thank you for the quick resolution!",
        createdAt: "2023-04-09T16:10:00Z",
        user: {
          name: "Emily Johnson",
          isStaff: false,
          avatar: "/placeholder.svg?height=32&width=32",
        },
      },
    ],
  },
  {
    id: "issue-3",
    title: "Missing images in product gallery",
    description:
      "The product images are not loading in the gallery section of your website. I've tried different browsers and devices.",
    status: "resolved",
    createdAt: "2023-04-08T11:05:00Z",
    updatedAt: "2023-04-10T13:40:00Z",
    user: {
      name: "Michael Brown",
      email: "m.brown@example.com",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    replies: [
      {
        id: "reply-3",
        content:
          "We've identified the issue with our image CDN and have deployed a fix. Could you please check if the images are loading correctly now?",
        createdAt: "2023-04-08T14:30:00Z",
        user: {
          name: "Technical Support",
          isStaff: true,
          avatar: "/placeholder.svg?height=32&width=32",
        },
      },
      {
        id: "reply-4",
        content: "Yes, the images are now loading properly. Thank you for the quick fix!",
        createdAt: "2023-04-08T15:20:00Z",
        user: {
          name: "Michael Brown",
          isStaff: false,
          avatar: "/placeholder.svg?height=32&width=32",
        },
      },
    ],
  },
  {
    id: "issue-4",
    title: "Account verification email not received",
    description:
      "I signed up 2 hours ago but haven't received the verification email yet. I've checked my spam folder too.",
    status: "closed",
    createdAt: "2023-04-07T09:45:00Z",
    updatedAt: "2023-04-07T12:30:00Z",
    user: {
      name: "Sarah Wilson",
      email: "sarah.w@example.com",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    replies: [
      {
        id: "reply-5",
        content:
          "I've manually verified your account. You should be able to log in now. We're also investigating why the verification email wasn't sent.",
        createdAt: "2023-04-07T10:30:00Z",
        user: {
          name: "Account Support",
          isStaff: true,
          avatar: "/placeholder.svg?height=32&width=32",
        },
      },
      {
        id: "reply-6",
        content: "Thank you! I can log in now.",
        createdAt: "2023-04-07T11:15:00Z",
        user: {
          name: "Sarah Wilson",
          isStaff: false,
          avatar: "/placeholder.svg?height=32&width=32",
        },
      },
    ],
  },
]
