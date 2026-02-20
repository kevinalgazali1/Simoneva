"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { Menu, FileSpreadsheet } from "lucide-react";
import KabupatenSelect from "@/components/KabupatenSelect";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface ProgramData {
  id: number;
  dataRealisasiId: number;
  namaPenerima: string;
  noRegistrasi: string;
  alamat: string;
  kabupaten: string;
  kabupatenKota: string;
  institusiTujuan: string;
  nominal: string;
  kontakPenerima: string;
  tanggalCair: string;
}

interface ProgramResponse {
  status: string;
  program: string;
  subProgram: string;
  target: number;
  anggaran: string;
  totalRealisasi: number;
  data: ProgramData[];
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

export default function ProgramDetailPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [programData, setProgramData] = useState<ProgramData[]>([]);
  const [programInfo, setProgramInfo] = useState<{
    program: string;
    subProgram: string;
    target: number;
    anggaran: string;
    totalRealisasi: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState<string[]>([]);
  const [kabupaten, setKabupaten] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const getCookie = (name: string) => {
    const match = document.cookie.match(
      new RegExp("(^| )" + name + "=([^;]+)"),
    );
    return match ? match[2] : null;
  };

  // Reset ke halaman 1 ketika filter kabupaten berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [kabupaten]);

  // Fungsi untuk format column name (sama seperti di LaporanPage)
  const formatColumn = (text: string) =>
    text
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/^./, (s) => s.toUpperCase());

  // Format Rupiah - ubah return type menjadi string
  const formatRupiah = (value: string | number): string => {
    const number =
      typeof value === "string"
        ? parseFloat(value.replace(/[^\d.-]/g, ""))
        : value;

    if (isNaN(number)) return String(value); // Ubah ini menjadi String(value)

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

  // Format Tanggal - sudah benar, return string
  const formatTanggal = (value: string): string => {
    if (!value) return "-";

    try {
      const date = new Date(value);

      // Cek apakah tanggal valid
      if (isNaN(date.getTime())) return value;

      // Format: DD/MM/YYYY
      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      return value;
    }
  };

  // Fungsi untuk cek apakah kolom adalah tanggal
  const isDateColumn = (columnName: string): boolean => {
    const dateKeywords = [
      "tanggal",
      "date",
      "tgl",
      "waktu",
      "time",
      "createdAt",
      "updatedAt",
    ];
    return dateKeywords.some((keyword) =>
      columnName.toLowerCase().includes(keyword.toLowerCase()),
    );
  };

  // Fungsi untuk format value berdasarkan tipe kolom
  const formatCellValue = (
    columnName: string,
    value: string | number | null | undefined,
  ): string => {
    if (!value && value !== 0) return "-";

    // Gunakan isCurrencyColumn
    if (isCurrencyColumn(columnName)) {
      return formatRupiah(value);
    }

    if (isDateColumn(columnName)) {
      return formatTanggal(String(value));
    }

    return String(value);
  };

  useEffect(() => {
    const fetchProgramDetail = async () => {
      try {
        const token = getCookie("accessToken");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API}/kadis/jobdesk/${slug}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const json: ProgramResponse = await res.json();

        if (json.status === "success") {
          setProgramData(json.data);
          setProgramInfo({
            program: json.program,
            subProgram: json.subProgram,
            target: json.target,
            anggaran: json.anggaran,
            totalRealisasi: json.totalRealisasi,
          });

          // Generate columns dari data pertama (sama seperti LaporanPage)
          if (json.data.length > 0) {
            const cols = Object.keys(json.data[0]).filter(
              (key) => key !== "id" && key !== "dataRealisasiId",
            );
            setColumns(cols);
          }
        }
      } catch (err) {
        console.error("Error fetch program detail:", err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProgramDetail();
    }
  }, [slug]);

  // Filter data berdasarkan kabupaten
  const filteredData = programData.filter((item) =>
    kabupaten
      ? normalizeWilayah(item.kabupatenKota ?? item.kabupaten ?? "") ===
        normalizeWilayah(kabupaten)
      : true,
  );

  // Export ke Excel
  const exportExcel = () => {
    if (!filteredData.length) {
      alert("Data kosong, tidak bisa export.");
      return;
    }

    const dataExport: Record<string, string | number>[] = filteredData.map(
      (item) => {
        const obj: Record<string, string | number> = {};

        columns.forEach((col) => {
          const value = item[col as keyof ProgramData];

          // Format berdasarkan tipe kolom
          if (col.toLowerCase().includes("nominal")) {
            obj[formatColumn(col)] = formatRupiah(value as string);
          } else if (isDateColumn(col)) {
            obj[formatColumn(col)] = formatTanggal(value as string);
          } else {
            obj[formatColumn(col)] = value ?? "";
          }
        });

        return obj;
      },
    );

    const worksheet = XLSX.utils.json_to_sheet(dataExport);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(
      blob,
      `${programInfo?.subProgram || "program"}_${new Date().getTime()}.xlsx`,
    );
  };

  // Pagination
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil(filteredData.length / pageSize);

  return (
    <div className="min-h-screen">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="lg:ml-72 bg-gray-100 p-4 sm:p-6 lg:p-8 overflow-y-auto min-h-screen">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-[#245CCE] sm:hidden mb-4"
        >
          <Menu size={26} />
        </button>

        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex items-center gap-2 text-[#245CCE]">
              <div className="h-5 w-5 border-2 border-[#245CCE] border-t-transparent rounded-full animate-spin"></div>
              <span className="font-semibold">Memuat data...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Tombol Kembali Mobile */}
            <button
              onClick={() => router.back()}
              className="fixed bottom-5 left-5 z-50
              bg-blue-700 text-white
              px-4 py-3 rounded-full shadow-lg
              hover:bg-blue-800 transition
              sm:hidden"
            >
              ←
            </button>

            {/* Tombol Kembali Desktop */}
            <button
              onClick={() => router.back()}
              className="hidden sm:inline-block mb-4 border-2 border-blue-600
              bg-white rounded-xl px-4 py-2 text-sm font-semibold
              text-[#245CCE] shadow-md hover:bg-blue-800 transition hover:text-white"
            >
              Kembali
            </button>

            {/* Program Info Card */}
            {programInfo && (
              <div className="bg-white border-2 border-[#245CCE] rounded-2xl p-6 mb-6 shadow-lg">
                <div className="flex items-start gap-3 mb-4">
                  <div className="bg-[#245CCE] p-3 rounded-xl">
                    <FileSpreadsheet size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-lg sm:text-xl font-semibold text-blue-700 mb-1">
                      {programInfo.subProgram}
                    </h1>
                    <p className="text-gray-600 text-sm">
                      Program: {programInfo.program}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-600 mb-1">Target</p>
                    <p className="text-lg font-bold text-[#245CCE]">
                      {programInfo.target.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-600 mb-1">
                      Total Realisasi
                    </p>
                    <p className="text-lg font-bold text-green-600">
                      {programInfo.totalRealisasi.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-600 mb-1">Anggaran</p>
                    <p className="text-lg font-bold text-orange-600">
                      Rp {Number(programInfo.anggaran).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Filter dan Download */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              {/* Dropdown Kabupaten */}
              <KabupatenSelect value={kabupaten} onChange={setKabupaten} />

              {/* Download Excel */}
              <button
                onClick={exportExcel}
                className="bg-green-600 text-white px-4 py-2 rounded-xl
                shadow-md hover:bg-green-700 transition font-semibold text-sm"
              >
                Download Excel
              </button>
            </div>

            {/* Page Size Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
              <span className="border-2 border-blue-600 bg-white rounded-lg px-2 py-1 text-sm font-semibold text-[#245CCE] shadow-md">
                Tampilkan:
              </span>

              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border-2 border-blue-600 bg-white rounded-lg px-3 py-1 text-sm font-semibold text-[#245CCE]
                shadow-md outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Table */}
            <div className="rounded-xl shadow shadow-gray-300 p-4 border-2 border-blue-700">
              {loading && (
                <div className="flex items-center gap-2 mb-3 text-[#245CCE]">
                  <div className="h-4 w-4 border-2 border-[#245CCE] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-semibold">Memuat data...</span>
                </div>
              )}
              <div className="overflow-x-auto overflow-y-auto max-h-125">
                <table className="w-full border-collapse">
                  <thead className="bg-blue-700 text-white text-center sticky top-0 z-10">
                    <tr className="border-b-2">
                      {columns.map((col) => (
                        <th key={col} className="p-3 capitalize">
                          {formatColumn(col)}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="text-black text-center">
                    {paginatedData.length > 0 ? (
                      paginatedData.map((item, i) => (
                        <tr
                          key={item.id}
                          className="hover:bg-blue-700 hover:text-white transition"
                        >
                          {columns.map((col) => (
                            <td key={col} className="p-3">
                              {formatCellValue(
                                col,
                                item[col as keyof ProgramData],
                              )}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={columns.length}
                          className="text-center p-4"
                        >
                          Data tidak ditemukan
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="border-2 border-blue-600 bg-white rounded-lg px-3 py-1 text-sm font-semibold text-[#245CCE] shadow-md"
                >
                  Prev
                </button>

                <span className="border-2 border-blue-600 bg-white rounded-lg px-3 py-1 text-sm font-semibold text-[#245CCE] shadow-md">
                  Halaman {currentPage} /{totalPages || 1}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((p) =>
                      p * pageSize < filteredData.length ? p + 1 : p,
                    )
                  }
                  className="border-2 border-blue-600 bg-white rounded-lg px-3 py-1 text-sm font-semibold text-[#245CCE] shadow-md"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
