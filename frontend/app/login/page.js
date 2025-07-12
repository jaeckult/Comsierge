"use client";
import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SessionProvider } from "next-auth/react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <h1 className="text-3xl font-bold mb-6">Sign in to Comsierge</h1>
      <button
        onClick={() => signIn("google")}
        className="bg-white text-black px-6 py-2 rounded shadow hover:bg-gray-200 font-semibold"
      >
        Sign in with Google
      </button>
    </div>
  );
} 