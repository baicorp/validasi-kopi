import Link from "next/link";
import { Button } from "./button";
import { Home } from "lucide-react";

export default function ErrorComp({ error }: { error: string | undefined }) {
  return (
    <div className="h-80 text-muted-foreground flex flex-col justify-center items-center">
      <div className="flex flex-col justify-center items-center gap-2">
        <span className="block">{error}</span>
      </div>
      <Button className="flex gap-2 items-center mt-2.5 w-full md:w-fit">
        <Home size={18} />
        <Link href={`/`}>Halaman utama</Link>
      </Button>
    </div>
  );
}
