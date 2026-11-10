import { Conversation } from "@/components/Conversation";

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Conversation sessionId={id} />;
}
