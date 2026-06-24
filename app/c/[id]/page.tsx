import ChatInterface from "@/src/components/ChatInterface";
import LeftSidebar from "@/src/components/layout/LeftSidebar";

export default async function ChatPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const chatId = resolvedParams.id;
  const initialQuery = resolvedSearchParams.q;

  return (
    <>
      <div className="fixed inset-0 z-0 overflow-hidden bg-background pointer-events-none">
        <div className="noise-texture absolute inset-0"></div>
      </div>

      <div className="relative z-10 flex h-screen overflow-hidden w-full">
        <LeftSidebar />
        <ChatInterface chatId={chatId} initialQuery={initialQuery} />
      </div>
    </>
  );
}
