"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

interface RankingOPD {
  peringkat: number;
  namaDinas: string;
  paguAnggaran: string;
  totalRealisasi: string;
  persentase: number;
  persentaseString: string;
}

interface APIResponse {
  status: string;
  msg: string;
  data: RankingOPD[];
}

export default function RankingOpdPage() {
  const [ranking, setRanking] = useState<RankingOPD[]>([]);
  const [loading, setLoading] = useState(true);
    const router = useRouter();

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("accessToken="))
          ?.split("=")[1];

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API}/gubernur/rangking-opd`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          }
        );

        const json: APIResponse = await res.json();

        if (json.status === "success") {
            console.log("Ranking:", json.data);
          setRanking(json.data);
        }
      } catch (err) {
        console.error("Fetch ranking error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, []);

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
    <main className="min-h-screen bg-gray-50">
        <Header onLogout={handleLogout} />
      <div className="px-4 py-4 sm:px-16 sm:py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-900">
          Evaluasi Rapor Kinerja & Capaian
        </h1>
        <p className="text-blue-700 mt-2">
          Ringkasan real-time ranking OPD dan realisasi anggaran tingkat Provinsi
        </p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-md border border-blue-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-blue-900">
            TOP Ranking OPD
          </h2>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-10 text-blue-800 font-semibold">
            Memuat data ranking...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-center">
                <tr className="bg-blue-900 text-white">
                  <th className="p-3">Peringkat</th>
                  <th className="p-3">OPD</th>
                  <th className="p-3">Pagu Anggaran</th>
                  <th className="p-3">Realisasi</th>
                  <th className="p-3">Persentase</th>
                </tr>
              </thead>

              <tbody className="text-blue-700 text-center">
                {ranking.map((item) => (
                  <tr
                    key={item.peringkat}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-3 font-semibold text-blue-800">
                      {item.peringkat}
                    </td>

                    <td className="p-3 font-semibold text-blue-900">
                      {item.namaDinas}
                    </td>

                    <td className="p-3">{item.paguAnggaran}</td>

                    <td className="p-3">{item.totalRealisasi}</td>

                    <td className="p-3 font-semibold text-green-600">
                      {item.persentaseString}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>
    </main>
  );
}
