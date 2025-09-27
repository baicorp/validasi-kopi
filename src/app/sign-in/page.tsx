"use client";

import useSWR from "swr";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/authClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormEvent, useState, useEffect } from "react"; // Import useEffect

async function getSession() {
  return await authClient.getSession();
}

export default function Page() {
  const [isLoad, setIsLoad] = useState(false);
  const router = useRouter();

  const { data: session } = useSWR("session", getSession);

  useEffect(() => {
    if (session) {
      router.replace("/dashboard/produk");
    }
  }, [session, router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoad(true);

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!username.trim() || !password.trim()) {
      setIsLoad(false);
      toast.error("Username atau password tidak boleh kosong.");
      return;
    }

    try {
      const { error } = await authClient.signIn.username({
        username,
        password,
      });

      if (error) {
        toast.error("Username atau password salah.");
        return;
      }

      router.replace("/dashboard/produk");
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
      toast.error("Terjadi kesalahan, silakan coba lagi.");
    } finally {
      setIsLoad(false);
    }
  }

  // Add a loading state for the session check to prevent the form from flashing
  if (session === undefined) {
    return (
      <div className="flex justify-center items-center gap-2 text-muted-foreground h-dvh">
        <p>Loading</p>
        <LoaderCircle className="w-5 animate-spin" />
      </div>
    );
  }

  return (
    <section className="h-dvh grid place-items-center">
      <div>
        <div className="mb-6 ">
          <p className="text-xl font-semibold">Smart Validation Test.</p>
          <p className="text-muted-foreground text-sm">
            Silahkan masuk terlebih dahulu.
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" />
            </div>
            <Button type="submit" disabled={isLoad}>
              {isLoad ? (
                <>
                  <span>Loading</span>
                  <LoaderCircle className="animate-spin mr-2" />
                </>
              ) : (
                "Masuk"
              )}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
