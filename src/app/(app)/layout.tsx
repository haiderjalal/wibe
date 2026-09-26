import { AppNav } from "@/components/app/AppNav";
import { getMemberProfile } from "@/lib/supabase/profile";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const profile = await getMemberProfile();
  return (
    <div className="min-h-svh pb-28 md:pb-12">
      <AppNav account={profile && { name: profile.displayName, avatarUrl: profile.avatarUrl }} />
      {children}
    </div>
  );
}
