"use client";
import { useSession } from "next-auth/react";
import LogoStatic from "@/components/Logo.static"; 
import Link from 'next/link';

export default function AuthHeader() {
    const { data: session } = useSession();
    return (
        <>
          {/* Header */}
          <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <LogoStatic />
                <nav className="flex items-center space-x-4">
                  <Link 
                    href="/" 
                    className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
                  >
                    Home
                  </Link>
                  <Link 
                    href="/about" 
                    className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
                  >
                    About
                  </Link>
                  <Link 
                    href="/contact" 
                    className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
                  >
                    Contact
                  </Link>
                  {session ? (
                    <span className="text-gray-800 text-sm font-medium">
                      Hello, {session.user?.name ?? 'User'}
                    </span>
                  ) : null}
                </nav>
              </div>
            </div>
          </header>
        </>
    );
}

