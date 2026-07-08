import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.mustChangePassword) {
    redirect("/first-login");
  }

  redirect("/dashboard");
}
