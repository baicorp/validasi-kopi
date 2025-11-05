import Link from "next/link";

export default async function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <section>
        <div className="flex gap-3 mt-3">
          <Link href={`peserta-ujian`}>Peserta ujian</Link>
          <Link href={`hasil-ujian`}>Hasil ujian</Link>
        </div>
      </section>
      {children}
    </>
  );
}
