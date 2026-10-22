import type { Metadata } from "next";

export const metadata: Metadata = { title: "Panel de administración" };

export default function AdminDashboardPage() {
  return <h1 className="text-2xl font-heading font-semibold">Panel de administración</h1>;
}
