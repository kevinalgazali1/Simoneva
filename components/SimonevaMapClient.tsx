"use client";

import dynamic from "next/dynamic";

const SimonevaMap = dynamic(
  () => import("@/components/SimonevaMap"),
  { ssr: false, loading: () => <p>Memuat peta...</p> }
);

export default function SimonevaMapClient() {
  return <SimonevaMap />;
}
