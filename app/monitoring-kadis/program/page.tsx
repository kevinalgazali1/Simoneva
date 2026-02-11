"use client";

import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import {
  ArrowUpRight,
  FileSpreadsheet,
} from "lucide-react";

export default function LaporanKadis() {

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 min-h-screen p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <input
            type="text"
            placeholder="Search Laporan dan Jalur Beasiswa . . ."
            className="w-96 rounded-xl border-2 border-blue-600
              bg-white px-5 py-2.5
              text-sm font-semibold text-[#245CCE]
              shadow-md outline-none
              placeholder:text-blue-400
              focus:ring-2 focus:ring-blue-300"
          />

        </div>

        {/* Card List */}
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="flex justify-between items-center bg-white p-4 border border-[#245CCE] rounded-xl shadow-[5px_5px_8px_rgba(0,0,0,0.3)]"
            >
              <div className="flex text-[#245CCE] gap-4 items-center">
                <FileSpreadsheet size={24} />
                <div className="flex-col">
                  <h3 className="font-bold text-lg">Laporan {item}</h3>
                  <p className="font-extrabold text-xs">Jalur masuk {item}</p>
                </div>
              </div>

              <button className="text-blue-600">
                <Link
                  href="/monitoring-kadis/program/laporan"
                  className="flex items-center gap-2"
                >
                  Lihat Detail
                  <ArrowUpRight size={16} />
                </Link>
              </button>
            </div>
          ))}
        </div>
      </main>

    </div>
  );
}
