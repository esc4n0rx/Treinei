"use client"

import { UserProfileContent } from "@/components/user-profile-content";

interface UserProfilePageProps {
  params: { id: string };
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  return <UserProfileContent userId={params.id} />;
}