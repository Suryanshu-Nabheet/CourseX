"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import {
  UserButton,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  ClerkLoaded,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { BookOpen, LayoutDashboard } from "lucide-react";
import { SearchBar } from "@/components/shared/SearchBar";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-[#1E293B]">CourseX</span>
        </Link>

        <div className="hidden md:flex flex-1 max-w-lg mx-8">
          <Suspense
            fallback={
              <div className="h-10 w-full bg-gray-100 animate-pulse rounded-md" />
            }
          >
            <SearchBar />
          </Suspense>
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/courses">
            <Button variant="ghost">Browse Courses</Button>
          </Link>

          <ClerkLoaded>
            <SignedIn>
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Button>
                </Link>
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>

            <SignedOut>
              <div className="flex items-center space-x-2">
                <SignInButton mode="modal">
                  <Button variant="ghost">Sign In</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button>Get Started</Button>
                </SignUpButton>
              </div>
            </SignedOut>
          </ClerkLoaded>
        </div>
      </div>
    </nav>
  );
}
