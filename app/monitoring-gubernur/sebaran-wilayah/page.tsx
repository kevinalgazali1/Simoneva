"use client";

import SimonevaMapClient from "@/components/SimonevaMapClient";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";

export default function SebaranWilayahPage() {
  const router = useRouter();
  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {}

    document.cookie = "accessToken=; path=/; max-age=0";
    document.cookie = "refreshToken=; path=/; max-age=0";
    router.push("/");
  };

  return (
    <div className="bg-[#bdc3c7] min-h-screen">
      <Header onLogout={handleLogout} />
      <h1
        className="text-4xl font-extrabold text-center text-[#153893]
                     tracking-widest uppercase my-6"
      >
        MONITORING
      </h1>
      <div className="p-6">
      <SimonevaMapClient />
      </div>
    </div>
  );
}
