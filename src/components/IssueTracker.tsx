"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, Clock, Loader, Edit, X, BadgeAlertIcon } from "lucide-react"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from "./ui/dialog"
import DeleteModal from "./modals/DeleteModal"

type Status = "Pending" | "Resolved" | "Closed"

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
  email: string
  title: string
  description: string
  status: Status
  created_at: string
  updated_at: string
  comment?: string
  replies?: Reply[]
}

interface ApiResponse {
  isSuccess: boolean
  message: string
  issueList: Issue[]
}

export default function IssueTracker() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [activeTab, setActiveTab] = useState<string>("pending")
  const [commentText, setCommentText] = useState<Record<string, string>>({})
  const [originalCommentText, setOriginalCommentText] = useState<Record<string, string>>({})
  const [editingComments, setEditingComments] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [showDelete, setShowDelete] = useState(false);
  const [error, setError] = useState<string | null>(null)

  const fetchIssues = async () => {
    try {
      const { data } = await axios.get("https://air-quality-back-end-v2.vercel.app/issue")
      if (!data.isSuccess) {
        throw new Error(data.message || "Failed to fetch issues")
      }
      setIssues(data.issueList || [])
      // Initialize comment text with existing comments
      const initialComments = data.issueList.reduce((acc: Record<string, string>, issue: Issue) => {
        if (issue.comment) {
          acc[issue._id] = issue.comment
        }
        return acc
      }, {})
      setCommentText(initialComments)
      setOriginalCommentText(initialComments)
      // Initialize all comments as not being edited
      setEditingComments(data.issueList.reduce((acc: Record<string, boolean>, issue: Issue) => {
        acc[issue._id] = false
        return acc
      }, {}))
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

  useEffect(() => {
    fetchIssues()
  }, [])

  const filteredIssues = issues.filter(issue => 
    activeTab === "all" || issue.status.toLowerCase() === activeTab.toLowerCase()
  )

  const handleComment = async (issueId: string) => {
    if (!commentText[issueId]?.trim()) return;
  
    try {
      // Optimistic update
      setIssues(prev => prev.map(issue => 
        issue._id === issueId
          ? { ...issue, comment: commentText[issueId] }
          : issue
      ));
  
      // Save the original comment in case we need to revert
      setOriginalCommentText(prev => ({
        ...prev,
        [issueId]: commentText[issueId]
      }));
  
      // API call
      await axios.post(`https://air-quality-back-end-v2.vercel.app/issue/${issueId}/comment`, {
        comment: commentText[issueId]
      });
  
      // Disable editing after submission
      setEditingComments(prev => ({
        ...prev,
        [issueId]: false
      }));
  
    } catch (err) {
      setError(
        axios.isAxiosError(err) 
          ? err.response?.data?.message || err.message 
          : "Failed to add comment"
      );
      // Revert optimistic update
      setIssues(prev => prev.map(issue => 
        issue._id === issueId
          ? { ...issue, comment: issues.find(i => i._id === issueId)?.comment || "" }
          : issue
      ));
      // Revert comment text to original
      setCommentText(prev => ({
        ...prev,
        [issueId]: originalCommentText[issueId] || ""
      }));
    }
  }

  const handleEditComment = (issueId: string) => {
    setEditingComments(prev => ({
      ...prev,
      [issueId]: true
    }));
  }

  const handleCancelEdit = (issueId: string) => {
    setEditingComments(prev => ({
      ...prev,
      [issueId]: false
    }));
    // Revert to original comment
    setCommentText(prev => ({
      ...prev,
      [issueId]: originalCommentText[issueId] || ""
    }));
  }

  const updateStatus = async (issueId: string, newStatus: Status) => {
    try {
      const issueToUpdate = issues.find(issue => issue._id === issueId);
      if (!issueToUpdate) return;

      setIssues(prev => prev.map(issue => 
        issue._id === issueId
          ? { ...issue, status: newStatus }
          : issue
      ));

      await axios.post(`https://air-quality-back-end-v2.vercel.app/issue/${issueId}/status`, {
        status: newStatus
      });

      // Only send email if email exists
      if (issueToUpdate.email) {
        const emailData = {
          to: issueToUpdate.email,
          subject: `Your issue status has been updated to ${newStatus}`,
          html: `
            <p>Dear ${issueToUpdate.sender_name},</p>
            <p>The status of your issue "${issueToUpdate.title}" has been updated to <strong>${newStatus}</strong>.</p>
            <p>If you have any questions, please reply to this email.</p>
            <p>Best regards,</p>
            <p>The Support Team</p>
          `
        };

        await axios.post('https://air-quality-back-end-v2.vercel.app/email/send', emailData);
      }

    } catch (err) {
      setError(axios.isAxiosError(err) 
        ? err.response?.data?.message || err.message 
        : "Failed to update status");
      setIssues(prev => prev.map(issue => 
        issue._id === issueId
          ? { ...issue, status: issues.find(i => i._id === issueId)?.status || "Pending" }
          : issue
      ));
    }
  }

  const deleteIssue = async (issueId: string) => {
    setLoading(true);
    try {
      await axios.post(`https://air-quality-back-end-v2.vercel.app/issue/${issueId}/delete`);
      fetchIssues();
      setShowDelete(false);
      setLoading(false);
    } catch (error) {
      console.error("Error deleting issue", error)
      setLoading(false);
    }
  }

  const getStatusIcon = (status: Status) => {
    switch (status.toLowerCase()) {
      case "pending": return <Loader className="h-4 w-4" />
      case "resolved": return <CheckCircle className="h-4 w-4" />
      case "closed": return <Clock className="h-4 w-4" />
      default: return <Loader className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: Status) => {
    switch (status.toLowerCase()) {
      case "pending": return "bg-red-100 text-red-800 hover:bg-red-200"
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
          <TabsTrigger value="pending">Pending</TabsTrigger>
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
            <Card key={issue._id} className="overflow-hidden bg-[var(--gray-counter)]">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{issue.title}</CardTitle>
                    <CardDescription className="mt-1">
                      Reported by {issue.sender_name} on {issue.created_at}
                    </CardDescription>
                    <span className="text-xs opacity-50">{issue.email}</span>
                  </div>
                  <Badge className={`${getStatusColor(issue.status)} flex items-center gap-1`}>
                    {getStatusIcon(issue.status)}
                    {issue.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">{issue.description}</p>
                
                {/* Display existing comment if any
                {issue.comment && !editingComments[issue._id] && (
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Your Comment</span>
                    </div>
                    <p className="text-sm">{issue.comment}</p>
                  </div>
                )} */}
              </CardContent>
              <CardFooter className="flex flex-col items-stretch gap-3 border-t pt-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateStatus(issue._id, "Pending")}
                    disabled={issue.status === "Pending"}
                    className="text-xs"
                  >
                    Mark as Pending
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
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Comment</h4>
                    {issue.comment && !editingComments[issue._id] && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditComment(issue._id)}
                        className="text-xs h-6"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                  
                  <Textarea
                    placeholder="Type your comment here..."
                    value={commentText[issue._id] || ""}
                    onChange={(e) => setCommentText({ ...commentText, [issue._id]: e.target.value })}
                    className="min-h-[80px]"
                    disabled={!!issue.comment && !editingComments[issue._id]}
                  />
                  
                  <div className="flex gap-2 self-end">
                    {editingComments[issue._id] && (
                      <Button
                        variant="outline"
                        onClick={() => handleCancelEdit(issue._id)}
                        className="text-xs"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Cancel
                      </Button>
                    )}
                    <Button
                      onClick={() => handleComment(issue._id)}
                      disabled={!commentText[issue._id]?.trim() || 
                        (!!issue.comment && !editingComments[issue._id])}
                      className="text-xs"
                    >
                      {issue.comment && !editingComments[issue._id] ? "Save Comment" : "Save Comment"}
                    </Button>
                  </div>
                </div>
                
                {issue.status === 'Closed' &&
                  <DeleteModal 
                    title={`Delete this issue?`}
                    description={`Are you sure you want to delete this issue? This action will delete their concern.`}
                    open={showDelete}
                    setOpen={setShowDelete}
                    onClick={() => deleteIssue(issue._id)}
                    loading={loading}
                  />
                }
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}