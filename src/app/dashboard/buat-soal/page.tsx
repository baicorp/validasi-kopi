import { redirect } from "next/navigation";

export default function Page() {
  const isLoggedIn = true; // replace with real auth check

  if (!isLoggedIn) {
    redirect("/login");
  }

  redirect("/dashboard/produk");
}
