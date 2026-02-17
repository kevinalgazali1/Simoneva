"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import Header from "@/components/Header";
import KabupatenSelect from "@/components/KabupatenSelect";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { UsersIcon } from "@heroicons/react/24/solid";

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

interface MonitoringStats {
  status: string;
  msg: string;
  data: Array<{
    id: number;
    namaProgram: string;
    subPrograms: SubProgram[];
  }>;
}

export default function SubProgramPage() {
  const params = useParams();
  const router = useRouter();
  const programSlug = params?.programSlug?.toString();
  const subProgramSlug = params?.subProgramSlug?.toString();
  const [kabupaten, setKabupaten] = useState("");
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

  // Helper function to convert string to slug
  const toSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-"); // Replace multiple hyphens with single hyphen
  };

  useEffect(() => {
    if (!programSlug || !subProgramSlug) return;

    const fetchData = async () => {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("accessToken="))
          ?.split("=")[1];

        // Fetch detail data
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API}/gubernur/program/${programSlug}/${subProgramSlug}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
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
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          },
        );

        const statsJson: MonitoringStats = await statsRes.json();

        if (statsJson.status === "success") {
          // Find the current sub program from stats using better matching
          let foundSubProgram: SubProgram | null = null;

          // First, try to match by sub program name from the detail API
          if (json.subProgram) {
            for (const program of statsJson.data) {
              const subProgram = program.subPrograms.find(
                (sp) => sp.namaSubProgram === json.subProgram,
              );

              if (subProgram) {
                foundSubProgram = subProgram;
                console.log("Found by exact name match:", subProgram);
                break;
              }
            }
          }

          // If not found, try slug matching
          if (!foundSubProgram) {
            for (const program of statsJson.data) {
              const subProgram = program.subPrograms.find(
                (sp) =>
                  toSlug(sp.namaSubProgram) === subProgramSlug?.toLowerCase(),
              );

              if (subProgram) {
                foundSubProgram = subProgram;
                console.log("Found by slug match:", subProgram);
                break;
              }
            }
          }

          // Debug: Log if not found
          if (!foundSubProgram) {
            console.log("Sub program not found. Looking for:", subProgramSlug);
            console.log("Available sub programs:");
            statsJson.data.forEach((prog) => {
              prog.subPrograms.forEach((sp) => {
                console.log(
                  `- ${sp.namaSubProgram} (slug: ${toSlug(sp.namaSubProgram)})`,
                );
              });
            });
          }

          setMonitoringStats(foundSubProgram);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, [programSlug, subProgramSlug]);

  // Filter data berdasarkan kabupaten
  const filteredData = tableData.filter((item) =>
    kabupaten
      ? (item.kabupaten ?? "").toLowerCase().trim() ===
        kabupaten.toLowerCase().trim()
      : true,
  );

  // Format nominal ke Rupiah
  const formatRupiah = (nominal: string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(parseInt(nominal));
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

      document.cookie = "accessToken=; path=/; max-age=0";
      document.cookie = "refreshToken=; path=/; max-age=0";

      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
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
            {/* Target Fisik */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 md:p-6 text-white">
              <h3 className="text-xs md:text-sm font-semibold opacity-90 mb-2">
                Target Fisik
              </h3>
              <p className="text-2xl md:text-3xl font-bold">
                {monitoringStats.targetFisik.toLocaleString("id-ID")}
              </p>
            </div>

            {/* Realisasi Fisik */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-4 md:p-6 text-white">
              <h3 className="text-xs md:text-sm font-semibold opacity-90 mb-2">
                Realisasi Fisik
              </h3>
              <p className="text-2xl md:text-3xl font-bold">
                {monitoringStats.realisasiFisik.toLocaleString("id-ID")}
              </p>
              <p className="text-xs md:text-sm mt-1 opacity-90">
                Capaian: {monitoringStats.capaianFisik}
              </p>
            </div>

            {/* Pagu Anggaran */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-4 md:p-6 text-white">
              <h3 className="text-xs md:text-sm font-semibold opacity-90 mb-2">
                Pagu Anggaran
              </h3>
              <p className="text-lg md:text-xl font-bold break-words">
                {monitoringStats.paguAnggaran}
              </p>
            </div>

            {/* Serapan Anggaran */}
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

          {/* Detail Stats */}
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
                <div className="flex flex-col md:flex-row items-stretch md:items-center px-4 justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="border-2 border-blue-600 bg-white rounded-lg px-2 py-1 text-xs md:text-sm font-semibold text-blue-700 shadow-md whitespace-nowrap">
                      Tampilkan:
                    </span>

                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border-2 border-blue-600 bg-white rounded-lg px-3 py-1 text-xs md:text-sm font-semibold text-blue-700 shadow-md"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                  {/* filter kabupaten */}
                  <div className="w-full md:w-auto">
                    <KabupatenSelect
                      value={kabupaten}
                      onChange={(value) => {
                        setKabupaten(value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="relative z-10 mt-5">
                {/* ===== TOP TOTAL BAR ===== */}
                <div className="bg-blue-800 text-white px-4 md:px-6 py-4 md:py-5 flex items-center justify-center gap-3 md:gap-4">
                  <div className="bg-white/10 p-2 md:p-3 rounded-lg">
                    <UsersIcon className="h-5 w-5 md:h-7 md:w-7 text-white" />
                  </div>
                  <h2 className="text-base md:text-lg lg:text-xl font-semibold tracking-wide text-center">
                    TOTAL :{" "}
                    <span className="font-bold">
                      {loading ? "..." : `${programInfo.totalData} BEASISWA`}
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
                        {kabupaten
                          ? "Tidak ada data untuk kabupaten yang dipilih"
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
                                className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap"
                              >
                                {col.toLowerCase() === "nominal"
                                  ? formatRupiah(row[col])
                                  : col.toLowerCase().includes("tanggal")
                                    ? new Date(row[col]).toLocaleDateString(
                                        "id-ID",
                                        {
                                          day: "2-digit",
                                          month: "long",
                                          year: "numeric",
                                        },
                                      )
                                    : (row[col] ?? "-")}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
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
