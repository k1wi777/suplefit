import { AdminOnly } from "@/features/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminOnly>{children}</AdminOnly>;
}
