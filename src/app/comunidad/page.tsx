'use client';

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
        <CommunityHub />
      </MemberLayout>
    );
  }

  return (
    <main className="min-h-screen bg-white pt-48 pb-40 px-6">
      <Navbar />
      <CommunityHub />
      <Footer />
    </main>
  );
}
