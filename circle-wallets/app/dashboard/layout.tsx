import { DashboardShell } from "@/app/dashboard/_components/DashboardShell";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    
      <DashboardShell>{children}</DashboardShell>
   
  );
}
