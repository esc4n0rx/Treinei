"use client"

import { use } from "react"
import { GroupDetailsContent } from "@/components/group-details-content"

interface GroupDetailsPageProps {
  params: Promise<{ id: string }>
}

export default function GroupDetailsPage({ params }: GroupDetailsPageProps) {
  const { id } = use(params)
  return <GroupDetailsContent id={id} />
}