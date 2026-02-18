"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { Menu, FileSpreadsheet } from "lucide-react";
import KabupatenSelect from "@/components/KabupatenSelect";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/* ===== INTERFACE ===== */

interface LaporanHeader {
  id: number;
  namaLaporan: string;
  program: string;
  jalur: string;
  status: string;
  tanggalInput: string;
  tanggalVerifikasi: string;
  pengirim: string;
  kontakPengirim: string;
  verifikator: string;
  catatanRevisi: string;
  buktiDukung: string;
  tipe: string;
}

interface LaporanItem {
  id: number;
  dataRealisasiId: number;
  [key: string]: string | number; // Dynamic fields
}

interface LaporanResponse {
  status: string;
  data: {
    header: LaporanHeader;
    items: LaporanItem[];
  };
}

export default function DetailKotakMasukPage() {
  const [laporan, setLaporan] = useState<LaporanResponse["data"] | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [kabupaten, setKabupaten] = useState("");
  const [columns, setColumns] = useState<string[]>([]);

  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : params.id?.[0];

  useEffect(() => {
    setCurrentPage(1);
  }, [kabupaten]);

  /* ===== GET COOKIE TOKEN ===== */

  const getCookie = (name: string) => {
    const match = document.cookie.match(
      new RegExp("(^| )" + name + "=([^;]+)"),
    );
    return match ? match[2] : null;
  };

  /* ===== FETCH DATA ===== */

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = getCookie("accessToken");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API}/kadis/laporan/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const json: LaporanResponse = await res.json();

        if (json.status === "success") {
          setLaporan(json.data);

          // Generate columns dari data pertama
          if (json.data.items.length > 0) {
            const cols = Object.keys(json.data.items[0]).filter(
              (key) => key !== "id" && key !== "dataRealisasiId",
            );
            setColumns(cols);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (!laporan) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="w-full max-w-4xl p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-300 rounded w-1/3"></div>
            <div className="h-10 bg-gray-300 rounded"></div>
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ===== HELPER FUNCTIONS ===== */

  const formatColumn = (text: string) =>
    text
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/^./, (s) => s.toUpperCase());

  const formatRupiah = (value: string | number): string => {
    const number =
      typeof value === "string"
        ? parseFloat(value.replace(/[^\d.-]/g, ""))
        : value;

    if (isNaN(number)) return String(value);

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  const formatTanggal = (value: string): string => {
    if (!value || value === "-") return "-";

    try {
      const date = new Date(value);

      if (isNaN(date.getTime())) return value;

      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      return value;
    }
  };

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

  const formatCellValue = (
    columnName: string,
    value: string | number | null | undefined,
  ): string => {
    if (!value && value !== 0) return "-";

    if (columnName.toLowerCase().includes("nominal")) {
      return formatRupiah(value);
    }

    if (isDateColumn(columnName)) {
      return formatTanggal(String(value));
    }

    return String(value);
  };

  /* ===== DATA TABLE ===== */

  const items = laporan.items;

  const filteredData = items.filter((item) =>
    kabupaten
      ? item.kabupatenKota &&
        String(item.kabupatenKota).toLowerCase().trim() ===
          kabupaten.toLowerCase().trim()
      : true,
  );

  const exportExcel = () => {
    if (!filteredData.length) {
      alert("Data kosong, tidak bisa export.");
      return;
    }

    const dataExport: Record<string, string | number>[] = filteredData.map(
      (item) => {
        const obj: Record<string, string | number> = {};

        columns.forEach((col) => {
          const value = item[col];

          if (col.toLowerCase().includes("nominal")) {
            obj[formatColumn(col)] = formatRupiah(value as string);
          } else if (isDateColumn(col)) {
            obj[formatColumn(col)] = formatTanggal(String(value));
          } else {
            obj[formatColumn(col)] =
              value !== null && value !== undefined ? String(value) : "";
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

    saveAs(blob, `${laporan.header.namaLaporan || "laporan"}.xlsx`);
  };

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil(filteredData.length / pageSize);

  return (
    <div className="min-h-screen">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="lg:ml-72 bg-gray-100 p-4 sm:p-6 lg:p-8 overflow-y-auto min-h-screen">
        {/* Toggle Sidebar Mobile */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-[#245CCE] sm:hidden mb-4"
        >
          <Menu size={26} />
        </button>

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

        {/* Header Info Card */}
        <div className="bg-white border-2 border-[#245CCE] rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex items-start gap-3 mb-4">
            <div className="bg-[#245CCE] p-3 rounded-xl">
              <FileSpreadsheet size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl font-semibold text-blue-700 mb-1">
                {laporan.header.namaLaporan}
              </h1>
              <p className="text-gray-600 text-sm">
                Program: {laporan.header.program}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div className="bg-blue-50 p-4 rounded-xl">
              <p className="text-xs text-gray-600 mb-1">Status</p>
              <p className="text-lg font-bold text-[#245CCE]">
                {laporan.header.status}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-xl">
              <p className="text-xs text-gray-600 mb-1">Pengirim</p>
              <p className="text-lg font-bold text-green-600">
                {laporan.header.pengirim}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl">
              <p className="text-xs text-gray-600 mb-1">Kontak Pengirim</p>
              <p className="text-lg font-bold text-[#245CCE]">
                {laporan.header.kontakPengirim}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-xl">
              <p className="text-xs text-gray-600 mb-1">Tanggal Input</p>
              <p className="text-lg font-bold text-green-600">
                {formatTanggal(laporan.header.tanggalInput)}
              </p>
            </div>
          </div>
        </div>

        {/* Filter dan Download */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <KabupatenSelect value={kabupaten} onChange={setKabupaten} />

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
              <thead className="bg-blue-700 text-white sticky top-0 z-10">
                <tr className="text-center border-b-2">
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
                          {formatCellValue(col, item[col])}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="text-center p-4">
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
              Halaman {currentPage} / {totalPages}
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
      </main>
    </div>
  );
}
