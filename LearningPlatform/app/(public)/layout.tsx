export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Force white text across public pages (both light and dark themes)
  return <div className="text-white">{children}</div>;
}
