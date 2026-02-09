import ChatWidget from "../components/ChatWidget";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <div className="fixed bottom-6 right-6 z-50">
        <ChatWidget />
      </div>
    </>
  );
}
