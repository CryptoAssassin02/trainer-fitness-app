// Create file: app/(auth)/sign-up/page.tsx

import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div className="flex justify-center">
      <SignUp 
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