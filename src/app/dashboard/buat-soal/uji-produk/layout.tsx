import { validateSessionServer } from "@/actions/validateSession";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await validateSessionServer();

  return <section>{children}</section>;
}
