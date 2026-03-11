'use client';

import { Suspense } from "react";
import { useAuth } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CommunityHub from "@/components/CommunityHub";
import MemberLayout from "@/components/MemberLayout";

export default function CommunityPage() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return (
      <MemberLayout>
        <Suspense fallback={<div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary animate-spin rounded-full" /></div>}>
          <CommunityHub />
        </Suspense>
      </MemberLayout>
    );
  }

  return (
    <main className="min-h-screen bg-white pt-48 pb-40 px-6">
      <Navbar />
      <Suspense fallback={<div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary animate-spin rounded-full" /></div>}>
        <CommunityHub />
      </Suspense>
      <Footer />
    </main>
  );
}
