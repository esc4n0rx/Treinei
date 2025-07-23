"use client"

import { ManageGroupContent } from "@/components/manage-group-content"

interface ManageGroupPageProps {
  params: { id: string }
}

export default function ManageGroupPage({ params }: ManageGroupPageProps) {
  return <ManageGroupContent id={params.id} />
}