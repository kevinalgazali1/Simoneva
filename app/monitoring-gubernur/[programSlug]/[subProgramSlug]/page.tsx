"use client";

import Image from "next/image";
import { useState } from "react";
import { UsersIcon } from "@heroicons/react/24/solid";

const NAV_ITEMS = [
  "Profile",
  "News",
  "Dokumen Perencanaan",
  "Monitoring",
  "Evaluasi",
];

export default function SubProgramPage() {
  const [searchName, setSearchName] = useState("");

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* ================= HEADER ================= */}
      <header className="bg-blue-900 shadow-lg">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 text-white">
            <Image
              src="/logo-sulteng.png"
              alt="Logo Sulawesi Tengah"
              width={50}
              height={50}
              className="object-contain"
            />
            <div className="leading-tight">
              <p className="text-xs font-semibold">PEMERINTAH PROVINSI</p>
              <p className="text-sm font-bold">SULAWESI TENGAH</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-white">
            {NAV_ITEMS.map((item) => (
              <a
                key={item}
                href="#"
                className={`transition hover:text-yellow-400 ${
                  item === "Monitoring" ? "font-bold" : ""
                }`}
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* ================= TITLE ================= */}
      <section className="py-12 text-center">
        <h1 className="mb-3 text-5xl font-bold text-blue-900 md:text-6xl">
          SIMONEVA BERANI
        </h1>
        <p className="text-lg text-blue-800">
          Sistem Informasi, Monitoring dan Evaluasi 9 Program Kerja
        </p>
        <p className="mt-1 text-blue-700">
          <strong>BAPPEDA</strong> – Badan Perencanaan Pembangunan Daerah
          Provinsi Sulawesi Tengah
        </p>
      </section>

      {/* ================= MONITORING ================= */}
      <section
        className="relative w-full h-full py-20"
        style={{ backgroundImage: "url('/bg.png')" }}
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="relative pt-6">
            {/* Badge */}
            <div className="absolute -top-2 z-20">
              <div className="rounded-2xl border-4 border-white px-10 py-4 shadow-xl backdrop-blur-xl">
                <span className="text-2xl font-extrabold tracking-wide text-blue-900">
                  MONITORING
                </span>
              </div>
            </div>

            {/* Card */}
            <div className="relative overflow-hidden rounded-3xl pt-12 shadow-2xl bg-white">
              {/* Background Blur */}
              <div
                className="absolute inset-0 z-0 scale-110 blur-2xl"
                style={{
                  backgroundImage: "url('/indo.png')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />

              {/* ================= SEARCH NAMA ================= */}
              <div className="absolute right-8 top-6 z-30 w-72">
                <div className="relative">
                  {/* Input */}
                  <input
                    type="text"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder="Cari nama..."
                    className="
        w-full rounded-xl border-2 border-blue-600
        bg-white px-5 py-2.5
        text-sm font-semibold text-blue-700
        shadow-md outline-none
        placeholder:text-blue-400
        focus:ring-2 focus:ring-blue-300
      "
                  />

                  {/* Icon */}
                  <svg
                    className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35"
                    />
                    <circle cx="11" cy="11" r="7" />
                  </svg>
                </div>
              </div>

              {/* Content Section */}
              <div className="relative z-10 mt-10">
                {/* ===== TOP TOTAL BAR ===== */}
                <div className="bg-blue-800 text-white px-6 py-5 flex items-center justify-center gap-4">
                  <div className="bg-white/10 p-3 rounded-lg">
                    <UsersIcon className="h-7 w-7 text-white" />
                  </div>
                  <h2 className="text-lg md:text-xl font-semibold tracking-wide">
                    TOTAL : <span className="font-bold">1000 BEASISWA</span>
                  </h2>
                </div>

                {/* ===== TABLE ===== */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-white text-xs text-blue-900 uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4 text-left">Nama</th>
                        <th className="px-6 py-4 text-left">No. Registrasi</th>
                        <th className="px-6 py-4 text-left">Alamat</th>
                        <th className="px-6 py-4 text-left">Nominal</th>
                        <th className="px-6 py-4 text-left">Universitas</th>
                        <th className="px-6 py-4 text-left">Kontak</th>
                      </tr>
                    </thead>

                    <tbody className="bg-blue-900 divide-y divide-blue-700 text-white">
                      {[
                        {
                          nama: "Jefri Nichol",
                          reg: "22098477",
                          alamat: "Jl. Sawerigading",
                          nominal: "Rp.2.500.000",
                          univ: "Hasanuddin",
                          kontak: "08278809846",
                        },
                        {
                          nama: "Jefri Nichol",
                          reg: "22098477",
                          alamat: "Jl. Sawerigading",
                          nominal: "Rp.2.500.000",
                          univ: "Hasanuddin",
                          kontak: "08278809846",
                        },
                        {
                          nama: "Aan Syawaluddin",
                          reg: "22098477",
                          alamat: "Jl. Sawerigading",
                          nominal: "Rp.2.500.000",
                          univ: "Hasanuddin",
                          kontak: "08278809846",
                        },
                        {
                          nama: "Nama",
                          reg: "22098477",
                          alamat: "Jl. Sawerigading",
                          nominal: "Rp.2.500.000",
                          univ: "Hasanuddin",
                          kontak: "08278809846",
                        },
                      ].map((item, i) => (
                        <tr key={i} className="hover:bg-blue-800/70 transition">
                          <td className="px-6 py-4 font-medium">{item.nama}</td>
                          <td className="px-6 py-4">{item.reg}</td>
                          <td className="px-6 py-4">{item.alamat}</td>
                          <td className="px-6 py-4">{item.nominal}</td>
                          <td className="px-6 py-4">{item.univ}</td>
                          <td className="px-6 py-4">{item.kontak}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
