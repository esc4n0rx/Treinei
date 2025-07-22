import { GroupDetailsContent } from "@/components/group-details-content"

interface GroupDetailsPageProps {
  params: { id: string }
}

export default function GroupDetailsPage({ params }: GroupDetailsPageProps) {
  return <GroupDetailsContent id={params.id} />
}
