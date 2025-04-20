"use client"
import type React from "react"
import { useEffect, useState, useRef } from "react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CircleUserRound, Loader, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import axios from "axios"
import { useAuth } from "@/app/context/AuthContext"
import { toast } from "sonner"

type Message = { _id: string; message: string; sender: string; role: string; timestamp: string; avatarPath: string, date: string; __v?: number }

export function GroupChat() {
  const {userCred} = useAuth();
  const currentUser = { id: userCred?._id, name: userCred?.username, role: userCred?.role }

  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [sendLoading, setSendLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null)
  const hasInitialScroll = useRef(false)

  const scrollToBottom = () => scrollRef.current?.scrollIntoView({ behavior: "smooth" })

  const chatFormatDate = () => {
    const date = new Date();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };
  
  const chatFormatTime = () => {
    const time = new Date();
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).toLowerCase(); // to get "pm" instead of "PM"
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try { 
        const response = await axios.get("https://air-quality-back-end-v2.vercel.app/chat"); 
        setMessages(response.data)
      }
      catch (error) { 
        console.error("Error fetching messages:", error) 
        toast.error("Something went wrong...")
      }
      finally { 
        setIsLoading(false) 
      }
    }
    fetchMessages()
    const intervalId = setInterval(fetchMessages, 1000)
    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => { if (isLoading) return; if (!hasInitialScroll.current) { scrollToBottom(); hasInitialScroll.current = true } }, [isLoading])

    const handleSendMessage = async () => {
      if (!newMessage.trim()) return;
      
      setSendLoading(true);
      
      try {
        // Create message object
        const m = { 
          message: newMessage, 
          sender: currentUser.name, 
          role: currentUser.role,  
          avatarPath: userCred?.avatarPath,
          timestamp: chatFormatTime(), 
          date: chatFormatDate() 
        };
    
        // Send message to chat
        const { data } = await axios.post('https://air-quality-back-end-v2.vercel.app/chat', m);
        setMessages((prev) => [...prev, data]);
        
        // Get all device tokens
        const response = await axios.get('https://air-quality-back-end-v2.vercel.app/users/notifications/getNotifs');
        let tokens = response.data.allDeviceNotifs;

        
        // Send notification to remaining tokens if any exist
        if (tokens.length > 0) {
          await axios.post("https://air-quality-back-end-v2.vercel.app/expoToken/sendNotification", {
            to: tokens,
            title: "Air Guard Chat",
            body: `${currentUser.name}: ${newMessage}`,
            sound: "default"
          });
        }
    
        // Reset message input and UI
        setNewMessage("");
        setTimeout(scrollToBottom, 100);
        setSendLoading(false);
        
      } catch (error) { 
        console.error("Error sending message:", error);
        toast.error("Something went wrong...");
        setSendLoading(false);
      }
    }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage() } }

  return (
    <Card className="w-full font-geist">
      <CardHeader className="p-4 border-b"><div className="flex items-center space-x-2"><div className="font-medium">Forum</div></div></CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[600px] p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-[500px]">
              <Loader className="animate-spin h-6 w-6" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[500px] text-muted-foreground">
              <CircleUserRound className="h-10 w-10 mb-2" />
              <p className="text-lg font-medium">No messages yet</p>
              <p className="text-sm">Be the first to send a message!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <ChatMessage 
                  key={message._id || `message-${index}`} 
                  message={message} 
                  isCurrentUser={message.sender === currentUser.name} 
                />
              ))}
              <div ref={scrollRef} />
            </div>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 pt-2 border-t">
        <div className="flex w-full items-center space-x-2">
          <Input placeholder="Type your message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={handleKeyDown} className="flex-1" />
          <Button size="icon" onClick={handleSendMessage} disabled={newMessage.trim() === "" || isLoading}>
            {sendLoading ? (
              <Loader className="h-4 w-4" />
            ):(
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

function ChatMessage({ message, isCurrentUser }: { message: Message; isCurrentUser: boolean }) {
  const avatars = {
    koala: '/user-avatars/koala.png',
    beaver: '/user-avatars/beaver.png',
    dog: '/user-avatars/dog.png',
    kangaroo: '/user-avatars/kangaroo.png',
    platypus: '/user-avatars/platypus.png',
    lemur: '/user-avatars/lemur.png',
    default: '/user-avatars/lemur.png',
  };

  // Get the avatar path from the message or use default
  const avatarPath = message.avatarPath && avatars[message.avatarPath as keyof typeof avatars] 
    ? avatars[message.avatarPath as keyof typeof avatars] 
    : avatars.default;

  return (
    <div className={cn("flex items-start gap-2 max-w-[80%]", isCurrentUser ? "ml-auto flex-row-reverse" : "")}>
      {!isCurrentUser && (
        <Avatar className="h-8 w-8 mt-1">
          <img 
            src={avatarPath} 
            alt={message.sender} 
            className="h-full w-full object-cover"
            onError={(e) => {
              // Fallback to default avatar if image fails to load
              const img = e.target as HTMLImageElement;
              img.src = avatars.default;
            }}
          />
        </Avatar>
      )}
      <div>
        <div className={cn("rounded-lg p-3", isCurrentUser ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted rounded-tl-none")}>
          {!isCurrentUser && <div className="flex justify-between items-center mb-1"><p className="text-xs font-medium">{message.sender}</p><span className="text-xs text-muted-foreground ml-2">{message.role}</span></div>}
          <p className="text-sm">{message.message}</p>
        </div>
        <div className={cn("flex text-xs text-muted-foreground mt-1", isCurrentUser ? "justify-end" : "justify-start")}>
          <span>{message.timestamp}</span><span className="mx-1">•</span><span>{message.date}</span>
        </div>
      </div>
    </div>
  );
}