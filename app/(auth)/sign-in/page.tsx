// Create file: app/(auth)/sign-in/page.tsx

import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="flex justify-center">
      <SignIn 
        appearance={{
          elements: {
            rootBox: "mx-auto w-full",
            card: "shadow-none",
          }
        }}
      />
    </div>
  )
}