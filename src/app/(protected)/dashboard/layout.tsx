import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@radix-ui/react-separator";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
