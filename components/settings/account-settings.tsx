// Create file: components/settings/account-settings.tsx

"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { useProfile, useDeleteAccount } from "@/hooks/use-profile"

export function AccountSettings() {
  const { user } = useUser()
  const { profile, isLoading, initializeProfile } = useProfile()
  const [isOpen, setIsOpen] = useState(false)
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount()

  useEffect(() => {
    initializeProfile()
  }, [initializeProfile])

  const handleAccountDelete = async () => {
    deleteAccount(undefined, {
      onSuccess: () => {
        setIsOpen(false)
        toast("Account scheduled for deletion. Your account and data will be deleted within 30 days.")
      },
      onError: () => {
        toast("Failed to delete account. Please try again later.")
      }
    })
  }

  if (isLoading) {
    return <div>Loading account settings...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Account</CardTitle>
          <CardDescription>
            Manage your account information and sign-in methods
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Name</p>
            <p className="text-sm text-muted-foreground">
              {user?.firstName} {user?.lastName}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Email</p>
            <p className="text-sm text-muted-foreground">
              {user?.emailAddresses[0]?.emailAddress}
            </p>
          </div>
          {profile && (
            <>
              <div className="space-y-1">
                <p className="text-sm font-medium">Unit System</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {profile.unit_system}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Member Since</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link href="/profile">
            <Button variant="outline">Edit Profile</Button>
          </Link>
          <Link href="/user/account">
            <Button>Manage Account</Button>
          </Link>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
          <CardDescription>
            Permanently delete your account and all of your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Once you delete your account, there is no going back. All of your data will be permanently removed.
            This includes your:
          </p>
          <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground">
            <li>Profile information</li>
            <li>Workout plans and history</li>
            <li>Progress check-ins</li>
            <li>Nutrition and macro data</li>
            <li>Notification preferences</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">Delete Account</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure you want to delete your account?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isDeleting}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleAccountDelete} disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Delete Account"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  )
}