import { Suspense } from "react";
export default function ForgotPasswordPage({ children }) {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
      {children}
      </Suspense>
    </div>
  );
}
