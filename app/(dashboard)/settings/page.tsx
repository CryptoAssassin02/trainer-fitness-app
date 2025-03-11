// Create file: app/(dashboard)/settings/page.tsx

import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExportImportSettings } from "@/components/settings/export-import-settings"
import { NotificationSettings } from "@/components/settings/notification-settings"
import { AccountSettings } from "@/components/settings/account-settings"

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-4 p-0 md:p-4">
      <div className="space-y-0.5">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      <Separator className="my-6" />
      
      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="export">Export/Import</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <AccountSettings />
        </TabsContent>
        
        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>
        
        <TabsContent value="export">
          <ExportImportSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}