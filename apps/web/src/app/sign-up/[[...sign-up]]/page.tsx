import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-ink-50 px-6 py-16">
      <SignUp />
    </div>
  );
}
