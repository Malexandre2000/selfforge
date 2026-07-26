import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-ink-50 px-6 py-16">
      <SignIn />
    </div>
  );
}
