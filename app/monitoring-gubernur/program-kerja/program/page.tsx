"use client";

import Image from "next/image";
import { useState } from "react";

const NAV_ITEMS = [
  "Profile",
  "News",
  "Dokumen Perencanaan",
  "Monitoring",
  "Evaluasi",
];

const PROGRAM_BUTTONS = [
  "Bosda",
  "Beasiswa",
  "Sarana & Prasarana",
  "Career Center",
  "Biaya SPP",
  "Biaya Uji Kompetensi",
  "Vokasi",
];

const WILAYAH = [
  "Palu",
  "Banggai",
  "Morowali",
  "Poso",
  "Donggala",
  "Tolitoli",
  "Buol",
  "Parigi Moutong",
  "Tojo Una-Una",
  "Sigi",
  "Banggai Kepulauan",
  "Banggai Laut",
  "Morowali Utara",
];

export default function ProgramPage() {
  const [openWilayah, setOpenWilayah] = useState(false);
  const [selectedWilayah, setSelectedWilayah] = useState("Pilih Wilayah");

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

              {/* Sebaran Wilayah */}
              <div className="absolute right-8 top-6 z-30">
                <div className="relative">
                  {/* Trigger Button */}
                  <button
                    onClick={() => setOpenWilayah(!openWilayah)}
                    className="
                    flex items-center gap-2
                    rounded-xl border-2 border-blue-600
                    bg-white px-6 py-2.5
                    text-sm font-semibold text-blue-700
                    shadow-md transition
                    hover:bg-[linear-gradient(90deg,#153893_0%,#245CCE_35%,#153893_61%,#245CCE_87%)] hover:text-white
                  "
                  >
                    {selectedWilayah}
                    <svg
                      className={`h-4 w-4 transition-transform ${
                        openWilayah ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Dropdown */}
                  {openWilayah && (
                    <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-blue-200 bg-white shadow-xl">
                      <ul className="max-h-64 overflow-y-auto text-sm">
                        {WILAYAH.map((item) => (
                          <li key={item}>
                            <button
                              onClick={() => {
                                setSelectedWilayah(item);
                                setOpenWilayah(false);
                              }}
                              className="
                                block w-full px-4 py-2 text-left
                                text-blue-700 transition
                                hover:bg-[linear-gradient(90deg,#153893_0%,#245CCE_35%,#153893_61%,#245CCE_87%)] hover:text-white
                              "
                            >
                              {item}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative z-20 mt-10 flex justify-end right-8">
                <div className="flex flex-row justify-center gap-2">
                  {PROGRAM_BUTTONS.map((item, index) => (
                    <button
                      key={index}
                      className="
                      group relative
                      rounded-full
                      border-2 border-blue-600
                      bg-white
                      px-5 py-2
                      text-sm font-semibold
                      text-blue-700
                      transition-all duration-300
                      hover:bg-[linear-gradient(90deg,#153893_0%,#245CCE_35%,#153893_61%,#245CCE_87%)]
                      hover:text-white
                      hover:shadow-lg
                    "
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Section */}
              <div className="relative z-10 mt-10 border-t-4 border-yellow-400">
                <div className="grid grid-cols-1 md:grid-cols-2 overflow-hidden">
                  {/* LEFT PANEL */}
                  <nav className="bg-blue-900 p-5">
                    <div className="space-y-1 text-sm text-white rounded-r-xl bg-[linear-gradient(90deg,#153893_0%,#245CCE_35%,#153893_61%,#245CCE_87%)]">
                      {[
                        "Mahasiswa Baru Jalur Afirmasi",
                        "Mahasiswa Baru Jalur Prestasi Akademik",
                        "Mahasiswa Baru Jalur Prestasi Non-Akademik",
                        "Mahasiswa Baru Jalur SNBP",
                        "Mahasiswa Baru Jalur SNBT",
                        "Mahasiswa Baru Jalur Ordal",
                      ].map((item, index) => (
                        <a
                          key={index}
                          href="#"
                          className="
                          relative block px-5 py-3
                          transition
                          overflow-hidden
                          text-white
                          hover:text-yellow-300
                          group
                        "
                        >
                          {item}
                          <span
                            className="
                            absolute left-3 right-3 bottom-0
                            h-px bg-white
                            transition
                            overflow-hidden
                            group-hover:bg-white/60
                          "
                          />
                        </a>
                      ))}
                    </div>
                  </nav>

                  {/* RIGHT PANEL */}
                  <div className="relative min-h-70">
                    {/* Background Image */}
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: "url('/contoh 1.png')" }}
                    />

                    {/* Blue Overlay */}
                    <div className="absolute inset-0 bg-blue-900/40" />

                    {/* Gradient Fade from Left */}
                    <div className="absolute inset-y-0 left-0 w-2/3 bg-linear-to-r from-blue-900 via-blue-900/85 to-transparent" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
