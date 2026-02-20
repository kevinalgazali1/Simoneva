"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import Header from "@/components/Header";
import KabupatenSelect from "@/components/KabupatenSelect";
import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";

interface BeasiswaData {
  id: number;
  nama: string;
  registrasi: string;
  kampus: string;
  kabupaten: string;
  nominal: string;
  tanggalCair: string;
}

interface APIResponse {
  status: string;
  program: string;
  programSlug: string;
  subProgram: string;
  subProgramSlug: string;
  type: string;
  totalData: number;
  data: BeasiswaData[];
}

interface SubProgram {
  id: number;
  namaSubProgram: string;
  targetFisik: number;
  realisasiFisik: number;
  pendingFisik: number;
  capaianFisik: string;
  paguAnggaran: string;
  realisasiAnggaran: string;
  sisaAnggaran: string;
  serapanAnggaran: string;
}

interface RawSubProgram {
  id: number;
  "Nama Sub Program": string;
  "Target Fisik": number;
  "Realisasi Fisik": number;
  "Pending Fisik": number;
  "Capaian Fisik": string;
  "Pagu Anggaran": string;
  "Realisasi Anggaran": string;
  "Sisa Anggaran": string;
  "Serapan Anggaran": string;
}

interface RawProgram {
  id: number;
  "Nama Program": string;
  "Daftar Sub Program": RawSubProgram[];
}

interface MonitoringStatsResponse {
  status: string;
  msg: string;
  data: RawProgram[];
}

const normalizeWilayah = (text: string) => {
  return text
    .toLowerCase()
    .replace(/^kota\s+/i, "")
    .replace(/^kabupaten\s+/i, "")
    .replace(/[^a-z0-9]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const toSlug = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

// Slug dari sub program beasiswa utama
const BEASISWA_UTAMA_SLUG =
  "pemberian-beasiswa-dan-bantuan-biaya-pendidikan-bagi-mahasiswa-miskin-danatau-berprestasi";

export default function SubProgramPage() {
  const params = useParams();
  const router = useRouter();
  const programSlug = params?.programSlug?.toString();
  const subProgramSlug = params?.subProgramSlug?.toString();

  const [kabupaten, setKabupaten] = useState("");
  const [jalur, setJalur] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [tableData, setTableData] = useState<any[]>([]);
  const [programInfo, setProgramInfo] = useState({
    program: "",
    subProgram: "",
    totalData: 0,
  });
  const [monitoringStats, setMonitoringStats] = useState<SubProgram | null>(
    null,
  );

  const isBeasiswaUtama =
    subProgramSlug === BEASISWA_UTAMA_SLUG ||
    toSlug(programInfo.subProgram) === BEASISWA_UTAMA_SLUG;

  const jalurOptions = useMemo(() => {
    if (!isBeasiswaUtama || tableData.length === 0) return [];

    const unique = Array.from(
      new Set(
        tableData
          .map((item) => item["Jalur Pendaftaran"])
          .filter((v): v is string => typeof v === "string" && v.trim() !== ""),
      ),
    ).sort();

    return unique;
  }, [tableData, isBeasiswaUtama]);

  useEffect(() => {
    if (!programSlug || !subProgramSlug) return;

    const fetchData = async () => {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("accessToken="))
          ?.split("=")[1];

        // Fetch data tabel
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API}/gubernur/program/${programSlug}/${subProgramSlug}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          },
        );
        const json: APIResponse = await res.json();

        if (json.status === "success") {
          setTableData(json.data);
          setProgramInfo({
            program: json.program,
            subProgram: json.subProgram,
            totalData: json.totalData,
          });
        }

        // Fetch monitoring stats
        const statsRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API}/gubernur/monitoring/stats`,
          {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          },
        );
        const statsJson: MonitoringStatsResponse = await statsRes.json();

        if (statsJson.status === "success") {
          const normalizedStats: SubProgram[] = statsJson.data.flatMap(
            (program) =>
              program["Daftar Sub Program"].map((sp) => ({
                id: sp.id,
                namaSubProgram: sp["Nama Sub Program"],
                targetFisik: sp["Target Fisik"],
                realisasiFisik: sp["Realisasi Fisik"],
                pendingFisik: sp["Pending Fisik"],
                capaianFisik: sp["Capaian Fisik"],
                paguAnggaran: sp["Pagu Anggaran"],
                realisasiAnggaran: sp["Realisasi Anggaran"],
                sisaAnggaran: sp["Sisa Anggaran"],
                serapanAnggaran: sp["Serapan Anggaran"],
              })),
          );

          const found = normalizedStats.find(
            (sp) => toSlug(sp.namaSubProgram) === subProgramSlug?.toLowerCase(),
          );

          setMonitoringStats(found ?? null);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, [programSlug, subProgramSlug]);

  // Reset filter jalur jika bukan sub program beasiswa utama
  useEffect(() => {
    if (!isBeasiswaUtama) setJalur("");
  }, [isBeasiswaUtama]);

  // Filter data berdasarkan kabupaten dan jalur pendaftaran
  const filteredData = tableData.filter((item) => {
    const matchKabupaten = kabupaten
      ? normalizeWilayah(
          item["Kabupaten / Kota"] ??
            item["kabupatenKota"] ??
            item["kabupaten"] ??
            "",
        ) === normalizeWilayah(kabupaten)
      : true;

    // Gunakan exact match untuk jalur karena value-nya sudah tepat dari data
    const matchJalur =
      isBeasiswaUtama && jalur
        ? (item["Jalur Pendaftaran"] ?? "") === jalur
        : true;

    return matchKabupaten && matchJalur;
  });

  const formatRupiah = (value: string | number) => {
    let number: number;

    if (typeof value === "string") {
      const cleaned = value
        .replace(/rp/gi, "")
        .replace(/\./g, "")
        .replace(",", ".")
        .replace(/[^\d.-]/g, "")
        .trim();

      number = Number(cleaned);
    } else {
      number = value;
    }

    if (isNaN(number)) return String(value);

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  const isCurrencyColumn = (col: string) =>
    ["nominal", "realisasi"].some((keyword) =>
      col.toLowerCase().includes(keyword),
    );

  const isDateColumn = (col: string) =>
    ["tanggal", "tgl", "date"].some((keyword) =>
      col.toLowerCase().includes(keyword),
    );

  const formatCellValue = (col: string, value: any) => {
    if (!value && value !== 0) return "-";
    if (isCurrencyColumn(col)) return formatRupiah(String(value));
    if (isDateColumn(col)) {
      const date = new Date(value);
      if (isNaN(date.getTime())) return value;
      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    }
    return value;
  };

  const tableColumns =
    tableData.length > 0
      ? Object.keys(tableData[0]).filter((col) => col.toLowerCase() !== "id")
      : [];

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil(filteredData.length / pageSize);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      document.cookie = "accessToken=; path=/; max-age=0";
      document.cookie = "refreshToken=; path=/; max-age=0";
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* ================= HEADER ================= */}
      <Header onLogout={handleLogout} />

      {/* ================= TITLE ================= */}
      <section className="py-8 md:py-12 text-center px-4">
        <h1 className="mb-3 text-3xl md:text-5xl lg:text-6xl font-bold text-blue-900">
          SIMONEVA BERANI
        </h1>
        <p className="text-base md:text-lg text-blue-800">
          Sistem Informasi, Monitoring dan Evaluasi 9 Program Kerja
        </p>
        <p className="mt-1 text-sm md:text-base text-blue-700">
          <strong>BAPPEDA</strong> – Badan Perencanaan Pembangunan Daerah
          Provinsi Sulawesi Tengah
        </p>
      </section>

      {/* ================= PROGRAM INFO ================= */}
      {programInfo.program && (
        <section className="max-w-6xl mx-auto px-4 md:px-6 pb-6">
          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 text-center">
            <h2 className="text-xl md:text-2xl font-bold text-blue-900 uppercase">
              {programInfo.program}
            </h2>
            <p className="text-base md:text-lg text-blue-700 mt-2">
              {programInfo.subProgram}
            </p>
          </div>
        </section>
      )}

      {/* ================= MONITORING STATS CARDS ================= */}
      {monitoringStats && (
        <section className="max-w-6xl mx-auto px-4 md:px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 md:p-6 text-white">
              <h3 className="text-xs md:text-sm font-semibold opacity-90 mb-2">
                Target Fisik
              </h3>
              <p className="text-2xl md:text-3xl font-bold">
                {monitoringStats.targetFisik.toLocaleString("id-ID")}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-4 md:p-6 text-white">
              <h3 className="text-xs md:text-sm font-semibold opacity-90 mb-2">
                Realisasi Fisik
              </h3>
              <p className="text-2xl md:text-3xl font-bold">
                {monitoringStats.capaianFisik}
              </p>
              <p className="text-xs md:text-sm mt-1 opacity-90">
                Capaian:{" "}
                {monitoringStats.realisasiFisik.toLocaleString("id-ID")}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-4 md:p-6 text-white">
              <h3 className="text-xs md:text-sm font-semibold opacity-90 mb-2">
                Pagu Anggaran
              </h3>
              <p className="text-lg md:text-xl font-bold break-words">
                {monitoringStats.paguAnggaran}
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-4 md:p-6 text-white">
              <h3 className="text-xs md:text-sm font-semibold opacity-90 mb-2">
                Serapan Anggaran
              </h3>
              <p className="text-2xl md:text-3xl font-bold">
                {monitoringStats.serapanAnggaran}
              </p>
              <p className="text-xs md:text-sm mt-1 opacity-90">
                Realisasi: {monitoringStats.realisasiAnggaran}
              </p>
            </div>
          </div>

          <div className="mt-4 bg-white rounded-xl shadow-lg p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-l-4 border-yellow-500 pl-4">
                <h4 className="text-xs md:text-sm font-semibold text-gray-600 mb-1">
                  Pending Fisik
                </h4>
                <p className="text-xl md:text-2xl font-bold text-gray-800">
                  {monitoringStats.pendingFisik.toLocaleString("id-ID")}
                </p>
              </div>
              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="text-xs md:text-sm font-semibold text-gray-600 mb-1">
                  Sisa Anggaran
                </h4>
                <p className="text-lg md:text-xl font-bold text-gray-800 break-words">
                  {monitoringStats.sisaAnggaran}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ================= MONITORING TABLE ================= */}
      <section
        className="relative w-full h-full py-8 md:py-8"
        style={{ backgroundImage: "url('/bg.png')" }}
      >
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="relative pt-6">
            {/* Badge */}
            <div className="absolute -top-2 z-20 left-1/12 transform -translate-x-1 md:left-0 md:transform-none">
              <div className="rounded-2xl border-4 border-white px-6 md:px-10 py-3 md:py-4 shadow-xl backdrop-blur-xl">
                <span className="text-lg md:text-2xl font-extrabold tracking-wide text-blue-900">
                  DATA PENERIMA
                </span>
              </div>
            </div>

            {/* Card */}
            <div className="relative overflow-hidden rounded-3xl pt-12 md:pt-16 shadow-2xl bg-white">
              {/* Background Blur */}
              <div
                className="absolute inset-0 z-0 scale-110 blur-2xl"
                style={{
                  backgroundImage: "url('/indo.png')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />

              {/* ================= Filtering ================= */}
              <div className="relative z-20">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-4">
                  {/* LEFT - Page Size */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="border-2 border-blue-600 bg-white rounded-lg px-3 py-1 text-sm font-semibold text-blue-700 shadow-md whitespace-nowrap">
                      Tampilkan:
                    </span>

                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border-2 border-blue-600 bg-white rounded-lg px-3 py-1 text-sm font-semibold text-blue-700 shadow-md"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>

                  {/* RIGHT - Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                    {/* Kabupaten */}
                    <div className="w-full sm:w-64">
                      <KabupatenSelect
                        value={kabupaten}
                        onChange={(value) => {
                          setKabupaten(value);
                          setCurrentPage(1);
                        }}
                      />
                    </div>

                    {/* Jalur */}
                    {isBeasiswaUtama && jalurOptions.length > 0 && (
                      <div className="w-full sm:w-65">
                        <select
                          value={jalur}
                          onChange={(e) => {
                            setJalur(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="w-full rounded-xl border-2 border-blue-600
                          bg-white px-4 py-2.5 text-sm font-semibold text-[#245CCE]
                          shadow-md outline-none focus:ring-2 focus:ring-blue-300"
                        >
                          <option value="">Semua Jalur Pendaftaran</option>
                          {jalurOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="relative z-10 mt-5">
                {/* ===== TOP TOTAL BAR ===== */}
                <div className="bg-blue-800 text-white px-4 md:px-6 py-4 md:py-5 flex items-center justify-center gap-3 md:gap-4">
                  <h2 className="text-base md:text-lg lg:text-xl font-semibold tracking-wide text-center">
                    TOTAL :{" "}
                    <span className="font-bold">
                      {loading ? "..." : `${programInfo.totalData}`}
                    </span>
                  </h2>
                </div>

                {/* ===== TABLE ===== */}
                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="text-center py-12 text-gray-600">
                      <p className="text-base md:text-lg font-semibold">
                        Loading data...
                      </p>
                    </div>
                  ) : filteredData.length === 0 ? (
                    <div className="text-center py-12 text-gray-600">
                      <p className="text-base md:text-lg font-semibold">
                        {kabupaten || jalur
                          ? "Tidak ada data untuk filter yang dipilih"
                          : "Tidak ada data tersedia"}
                      </p>
                    </div>
                  ) : (
                    <table className="w-full text-xs md:text-sm">
                      <thead className="bg-white text-xs uppercase tracking-wider text-blue-900">
                        <tr>
                          {tableColumns.map((col) => (
                            <th
                              key={col}
                              className="px-3 md:px-6 py-3 md:py-4 text-left whitespace-nowrap"
                            >
                              {col.replace(/_/g, " ").toUpperCase()}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody className="bg-blue-900 divide-y divide-blue-700 text-white">
                        {paginatedData.map((row, i) => (
                          <tr key={i}>
                            {tableColumns.map((col) => (
                              <td
                                key={col}
                                className={`px-3 md:px-6 py-3 md:py-4 whitespace-nowrap ${
                                  isCurrencyColumn(col)
                                    ? "text-right font-semibold"
                                    : ""
                                }`}
                              >
                                {formatCellValue(col, row[col])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Pagination */}
                <div className="flex flex-row items-center justify-center gap-2 my-4 px-4">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="border-2 border-blue-600 bg-white rounded-lg px-2 sm:px-3 py-1 text-xs font-semibold text-blue-700 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Prev
                  </button>

                  <span className="text-center border-2 border-blue-600 bg-white rounded-lg px-2 sm:px-3 py-1 text-xs font-semibold text-blue-700 shadow-md whitespace-nowrap">
                    Hal {currentPage}/{totalPages || 1}
                  </span>

                  <button
                    onClick={() =>
                      setCurrentPage((p) =>
                        p * pageSize < filteredData.length ? p + 1 : p,
                      )
                    }
                    disabled={currentPage >= totalPages}
                    className="border-2 border-blue-600 bg-white rounded-lg px-2 sm:px-3 py-1 text-xs font-semibold text-blue-700 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
