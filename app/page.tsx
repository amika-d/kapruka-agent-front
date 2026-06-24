import LeftSidebar from "../src/components/layout/LeftSidebar";
import NewChatScreen from "../src/components/chat/NewChatScreen";

export default function Home() {
  return (
    <>
      <div className="fixed inset-0 z-0 overflow-hidden bg-background pointer-events-none">
        <div className="noise-texture absolute inset-0"></div>
        {/* Light Leaks */}
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary/20 blur-[120px] rounded-full animate-leak"></div>
        <div className="absolute top-[40%] -right-[20%] w-[50%] h-[50%] bg-secondary/15 blur-[140px] rounded-full animate-leak" style={{ animationDelay: "2s" }}></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] bg-on-tertiary-container/30 blur-[100px] rounded-full animate-leak" style={{ animationDelay: "5s" }}></div>
      </div>

      <div className="relative z-10 flex h-screen overflow-hidden w-full">
        <LeftSidebar />
        <NewChatScreen />
      </div>
    </>
  );
}
