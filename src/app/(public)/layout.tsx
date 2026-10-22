export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <main className="flex-1 container mx-auto px-4 py-8">{children}</main>;
}
