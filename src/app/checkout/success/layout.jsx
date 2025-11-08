import { Suspense } from "react"
export default function CheckoutSuccessLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
        <Suspense>
      {children}
      </Suspense>
    </div>
  )
}