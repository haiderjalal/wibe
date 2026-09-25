import { AppNav } from "@/components/app/AppNav";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="min-h-svh pb-28 md:pb-12">
      <AppNav />
      {children}
    </div>
  );
}
