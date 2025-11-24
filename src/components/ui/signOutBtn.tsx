"use client";

import { toast } from "sonner";
import { useState } from "react";
import { Button } from "./button";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/authClient";
import { LoaderCircle, LogOut } from "lucide-react";

export default function SignOutButton() {
  const [isLoad, setIsLoad] = useState(false);
  const router = useRouter();

  return (
    <Button
      disabled={isLoad}
      className="flex gap-3 hover:border cursor-pointer w-full"
      onClick={async () => {
        await authClient.signOut({
          fetchOptions: {
            onRequest: () => setIsLoad(true),
            onSuccess: () => {
              setIsLoad(false);
              router.replace("/sign-in");
            },
            onError: (ctx) => {
              setIsLoad(false);
              toast.error(ctx.error.message);
            },
          },
        });
      }}
    >
      <LogOut />
      <span>Keluar</span>
      {isLoad && <LoaderCircle className="animate-spin" />}
    </Button>
  );
}
