export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="flex min-h-screen w-screen flex-col items-center justify-center">
        {children}
      </main>
    </>
  );
}
