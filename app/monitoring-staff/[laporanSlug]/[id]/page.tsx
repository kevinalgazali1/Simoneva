"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { Menu } from "lucide-react";
import KabupatenSelect from "@/components/KabupatenSelect";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/* ===== INTERFACE ===== */

interface LaporanHeader {
  id: number;
  namaLaporan: string;
  subProgram: string;
  jalur: string;
  status: string;
  catatanRevisi: string;
  verifikator: string;
  tanggalInput: string;
  tanggalVerifikasi: string;
  buktiDukung: string;
  tipe: string;
}

interface LaporanItem {
  id: number;
  dataRealisasiId: number;
  namaPenerima: string;
  noRegistrasi: string;
  alamat: string;
  kabupatenKota: string;
  institusiTujuan: string;
  nominal: string;
  kontakPenerima: string;
}

interface LaporanResponse {
  header: LaporanHeader;
  items: LaporanItem[];
}

export default function LaporanPage() {
  const [laporan, setLaporan] = useState<LaporanResponse | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const params = useParams();
  const router = useRouter();
  const [kabupaten, setKabupaten] = useState("");

  useEffect(() => {
    setCurrentPage(1);
  }, [kabupaten]);

  const slug =
    typeof params.laporanSlug === "string"
      ? params.laporanSlug
      : params.laporanSlug?.[0];

  const id = typeof params.id === "string" ? params.id : params.id?.[0];

  /* ===== GET COOKIE TOKEN ===== */

  const getCookie = (name: string) => {
    const match = document.cookie.match(
      new RegExp("(^| )" + name + "=([^;]+)"),
    );
    return match ? match[2] : null;
  };
  console.log("Slug:", slug);
  console.log("ID:", id);

  /* ===== FETCH DATA ===== */

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = getCookie("accessToken");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API}/staff/jobdesk/${slug}/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const json = await res.json();
        setLaporan(json.data);
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

  /* ===== DATA TABLE ===== */

  const items = laporan.items;

  const columns =
    items.length > 0
      ? Object.keys(items[0]).filter(
          (key) => key !== "id" && key !== "dataRealisasiId",
        )
      : [];

  const filteredData = items.filter((item) =>
    kabupaten
      ? item.kabupatenKota?.toLowerCase().trim() ===
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
          if (col === "nominal") {
            obj[formatColumn(col)] = formatRupiah(
              item[col as keyof LaporanItem] as string,
            );
          } else {
            obj[formatColumn(col)] = item[col as keyof LaporanItem] ?? "";
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

    saveAs(blob, `${laporan?.header.namaLaporan || "laporan"}.xlsx`);
  };

  const formatColumn = (text: string) =>
    text
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/^./, (s) => s.toUpperCase());

  const formatRupiah = (value: string | number) => {
    const number =
      typeof value === "string"
        ? parseFloat(value.replace(/[^\d.-]/g, ""))
        : value;

    if (isNaN(number)) return value;

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

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

        <button
          onClick={() => router.back()}
          className="hidden sm:inline-block mb-4 border-2 border-blue-600
        bg-white rounded-xl px-4 py-2 text-sm font-semibold
        text-[#245CCE] shadow-md hover:bg-blue-800 transition hover:text-white"
        >
          Kembali
        </button>

        <h1 className="text-lg sm:text-xl font-semibold mb-4 text-blue-700">
          {laporan.header.namaLaporan}
        </h1>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          {/* Search */}
          <KabupatenSelect value={kabupaten} onChange={setKabupaten} />

          <button
            onClick={exportExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-xl
  shadow-md hover:bg-green-700 transition font-semibold text-sm"
          >
            Download Excel
          </button>
        </div>
        {/* Filter */}
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
        <div className="rounded-xl shadow p-4 border-2 border-blue-700">
          {loading && (
            <div className="flex items-center gap-2 mb-3 text-[#245CCE]">
              <div className="h-4 w-4 border-2 border-[#245CCE] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-semibold">Memuat data...</span>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-175 w-full border-collapse">
              <thead className="bg-blue-700 text-white">
                <tr>
                  {columns.map((col) => (
                    <th key={col} className="p-2 sm:p-3 text-left capitalize">
                      {formatColumn(col)}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {paginatedData.map((item, i) => (
                  <tr
                    key={i}
                    className="text-black hover:bg-blue-700 hover:text-white transition"
                  >
                    {columns.map((col) => (
                      <td key={col} className="p-2 sm:p-3 whitespace-nowrap">
                        {col === "nominal"
                          ? formatRupiah(
                              item[col as keyof LaporanItem] as string,
                            )
                          : item[col as keyof LaporanItem]}
                      </td>
                    ))}
                  </tr>
                ))}
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
              Halaman {currentPage}
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
