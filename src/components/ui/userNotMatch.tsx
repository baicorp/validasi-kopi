import Link from "next/link";

export default function UserNotMatch({ username }: { username: string }) {
  return (
    <div className="h-dvh flex flex-col gap-4 justify-center items-center">
      <h1 className="text-2xl font-bold">404</h1>
      <p>Anda masuk denga NIK {username}</p>
      <Link href={`/${username}`}>Kembali</Link>
    </div>
  );
}
