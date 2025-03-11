"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { format, formatDistanceToNow } from "date-fns"
import { Bell, Check, Trash2 } from "lucide-react"
import { useNotifications } from "@/hooks/use-notifications"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export function NotificationsDropdown() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)

  // Handle marking a notification as read
  const handleMarkAsRead = async (id: string) => {
    await markAsRead.mutateAsync(id)
  }

  // Handle marking all notifications as read
  const handleMarkAllAsRead = async () => {
    await markAllAsRead.mutateAsync()
    setIsOpen(false)
  }

  // Handle deleting a notification
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await deleteNotification.mutateAsync(id)
  }
  
  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'workout':
        return <span className="flex h-2 w-2 rounded-full bg-blue-500" />
      case 'progress':
        return <span className="flex h-2 w-2 rounded-full bg-green-500" />
      case 'macro':
        return <span className="flex h-2 w-2 rounded-full bg-yellow-500" />
      case 'system':
        return <span className="flex h-2 w-2 rounded-full bg-red-500" />
      default:
        return <span className="flex h-2 w-2 rounded-full bg-gray-500" />
    }
  }

  return (
    <DropdownMenu onOpenChange={setIsOpen} open={isOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Notifications</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-4">
          <h3 className="font-medium">Notifications</h3>
          {notifications && notifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto px-2 py-1 text-xs"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-[300px] overflow-y-auto">
          {!notifications || notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "flex cursor-pointer flex-col items-start p-4 text-left",
                  !notification.is_read && "bg-muted/50"
                )}
                onClick={() => notification.id && handleMarkAsRead(notification.id)}
              >
                <div className="mb-1 flex w-full items-start justify-between">
                  <div className="flex items-center">
                    <div className="mr-2 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <span className="font-medium">{notification.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {!notification.is_read && notification.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMarkAsRead(notification.id!)
                        }}
                      >
                        <Check className="h-4 w-4" />
                        <span className="sr-only">Mark as read</span>
                      </Button>
                    )}
                    {notification.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={(e) => notification.id && handleDelete(notification.id, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {notification.message}
                </p>
                <div className="mt-2 flex w-full items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {notification.created_at && 
                      formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </span>
                  {notification.link && (
                    <Link 
                      href={notification.link} 
                      className="text-xs font-medium text-primary"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Details
                    </Link>
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 