"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { Menu } from "lucide-react";

export default function LaporanPage() {
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const data = [
    {
      nama: "Ahmad Fauzan",
      registrasi: "REG-001",
      alamat: "Makassar",
      nominal: "Rp 2.000.000",
      universitas: "Universitas Hasanuddin",
      kontak: "08123456789",
    },
    {
      nama: "Siti Rahma",
      registrasi: "REG-002",
      alamat: "Palu",
      nominal: "Rp 1.500.000",
      universitas: "Universitas Tadulako",
      kontak: "08234567890",
    },
  ];

  const filteredData = data.filter((item) =>
    `${item.nama} ${item.registrasi} ${item.universitas}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content */}
      <main className="lg:ml-72 bg-gray-100 p-4 sm:p-6 lg:p-8 overflow-y-auto min-h-screen">
        <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="text-[#245CCE] sm:hidden mb-4"
                >
                  <Menu size={26} />
                </button>
        <button
          onClick={() => router.back()}
          className="mb-4 px-4 py-2 rounded-lg 
        bg-blue-600 text-white font-semibold
        hover:bg-blue-700 transition"
        >
          Kembali
        </button>
        <h1 className="text-xl font-semibold mb-6 text-blue-700">
          Data Laporan
        </h1>

        <div className="absolute right-8 top-6 z-30 w-72">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari nama, registrasi, atau universitas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border-2 border-blue-600
              bg-white px-5 py-2.5
              text-sm font-semibold text-blue-700
              shadow-md outline-none
              placeholder:text-blue-400
              focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>

        <div className="rounded-xl shadow shadow-gray-300 p-4 overflow-x-auto border-2 border-blue-700">
          <table className="w-full border-collapse">
            <thead className="bg-blue-700 text-white">
              <tr className="text-left border-b-2">
                <th className="p-3">Nama</th>
                <th className="p-3">No. Registrasi</th>
                <th className="p-3">Alamat</th>
                <th className="p-3">Nominal</th>
                <th className="p-3">Universitas</th>
                <th className="p-3">Kontak</th>
              </tr>
            </thead>

            <tbody className="text-black">
              {filteredData.length > 0 ? (
                filteredData.map((item, i) => (
                  <tr
                    key={i}
                    className="hover:bg-blue-700 hover:text-white transition"
                  >
                    <td className="p-3">{item.nama}</td>
                    <td className="p-3">{item.registrasi}</td>
                    <td className="p-3">{item.alamat}</td>
                    <td className="p-3">{item.nominal}</td>
                    <td className="p-3">{item.universitas}</td>
                    <td className="p-3">{item.kontak}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center p-4">
                    Data tidak ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
