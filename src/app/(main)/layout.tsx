import { MainSidebar } from "@/components/main-sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <MainSidebar />
      <main className="flex-1 bg-background p-4 md:p-8 lg:p-10">
        {children}
      </main>
    </div>
  );
}
