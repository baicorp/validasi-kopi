import Link from "next/link";
import { Button } from "./button";
import { Home } from "lucide-react";

export default function UserNotMatch({ username }: { username: string }) {
  return (
    <div className="h-[calc(100dvh-120px)] flex flex-col gap-4 justify-center items-center">
      <h1 className="text-8xl font-black font-mono">404</h1>
      <p>
        Anda masuk denga NIK{" "}
        <span className="font-bold font-mono">{username}</span>
      </p>
      <Button className="flex gap-2 items-center">
        <Home size={18} />
        <Link href={`/${username}`}>Halaman utama</Link>
      </Button>
    </div>
  );
}
