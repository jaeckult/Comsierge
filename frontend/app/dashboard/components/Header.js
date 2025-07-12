"use client";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();
  return (
    <header className="flex justify-end items-center mb-8">
      {session ? (
        <>
          <span className="mr-4 text-gray-300">{session.user?.name || session.user?.email}</span>
          <button
            className="bg-white text-black px-4 py-1 rounded hover:bg-gray-200 font-semibold"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            Logout
          </button>
        </>
      ) : null}
    </header>
  );
} 