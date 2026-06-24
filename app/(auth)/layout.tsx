export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <div className="flex h-14 items-center border-b px-6">
        <span className="text-lg font-semibold">Kaizen Interviews</span>
      </div>
      <div className="flex flex-1">{children}</div>
    </div>
  );
}
