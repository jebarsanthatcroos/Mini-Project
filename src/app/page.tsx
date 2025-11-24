import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function HomePage() {
  return (
    <>
    <Navbar />
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to NextAuth App</h1>
        <p className="text-xl mb-8">A complete authentication solution with Next.js</p>
        <div className="space-x-4">
          <Link 
            href="/auth/signin" 
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg"
          >
            Sign In
          </Link>
          <Link 
            href="/auth/signup" 
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}