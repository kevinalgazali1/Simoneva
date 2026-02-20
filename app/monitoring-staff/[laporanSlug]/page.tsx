"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import toast from "react-hot-toast";
import { useParams, useSearchParams } from "next/navigation";
import { FileSpreadsheet, Menu } from "lucide-react";

interface Laporan {
  id: number;
  subProgramId: number;
  namaLaporan: string;
  jalur: string;
  diInputOleh: number;
  tanggalInput: string;
  buktiDukung: string;
  statusVerifikasi: string;
  catatanRevisi: string;
  diVerifikasiOleh: number;
  tanggalVerifikasi: string;
  subProgram?: {
    namaSubProgram: string;
    slug: string;
  };
  verifikator?: {
    username: string;
  };
}

export default function DaftarLaporanStaff() {
  const [openModalTambah, setOpenModalTambah] = useState(false);
  const [laporan, setLaporan] = useState<Laporan[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const params = useParams();
  const searchParams = useSearchParams();
  const subProgramIdParam = searchParams.get("subProgramId");
  const subProgramId = subProgramIdParam ? Number(subProgramIdParam) : null;
  const [searchQuery, setSearchQuery] = useState("");
  const slug =
    typeof params.laporanSlug === "string"
      ? params.laporanSlug
      : params.laporanSlug?.[0];
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Menunggu":
        return "bg-yellow-50 border-yellow-400";
      case "Ditolak":
        return "bg-red-50 border-red-400";
      case "Disetujui":
        return "bg-green-50 border-green-400";
      default:
        return "bg-white border-[#245CCE]";
    }
  };
  const getCookie = (name: string) => {
    const match = document.cookie.match(
      new RegExp("(^| )" + name + "=([^;]+)"),
    );
    return match ? match[2] : null;
  };

  const fetchData = async () => {
    try {
      const token = getCookie("accessToken");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/staff/jobdesk/${slug}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const json = await res.json();

      if (json.status === "success") {
        setLaporan(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [slug]);

  useEffect(() => {
    if (subProgramId !== 4) {
      setFormUpload((prev) => ({ ...prev, jalur: "" }));
    }
  }, [subProgramId]);

  const filteredLaporan = laporan.filter((item) => {
    const query = searchQuery.toLowerCase();

    const matchNama = item.namaLaporan
      ? item.namaLaporan.toLowerCase().includes(query)
      : false;

    const matchJalur = item.jalur
      ? item.jalur.toLowerCase().includes(query)
      : false;

    return matchNama || matchJalur;
  });

  const [formUpload, setFormUpload] = useState({
    namaLaporan: "",
    jalur: "",
    file: null as File | null,
  });

  const [uploading, setUploading] = useState(false);

  const handleChangeUpload = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;

    if (name === "file" && files) {
      setFormUpload({ ...formUpload, file: files[0] });
    } else {
      setFormUpload({ ...formUpload, [name]: value });
    }
  };

  const handleSubmitUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formUpload.file) {
      toast.error("File harus diupload");
      return;
    }

    if (uploading) return; // cegah double submit

    try {
      setUploading(true);

      const token = getCookie("accessToken");

      const formData = new FormData();
      formData.append("subProgramId", String(subProgramId));
      formData.append("namaLaporan", formUpload.namaLaporan);

      if (subProgramId === 4) {
        formData.append("jalur", formUpload.jalur);
      }

      formData.append("file", formUpload.file);

      const loadingToast = toast.loading("Sedang mengupload laporan...");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/staff/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Upload gagal");
      }

      toast.success("Laporan berhasil diupload", {
        id: loadingToast,
      });

      await fetchData();

      setOpenModalTambah(false);
      setFormUpload({
        namaLaporan: "",
        jalur: "",
        file: null,
      });
    } catch (err) {
      console.error(err);
      toast.error("Gagal upload laporan");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <main className="lg:ml-72 bg-gray-100 p-4 sm:p-6 lg:p-8 overflow-y-auto min-h-screen">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-[#245CCE] sm:hidden mb-4"
        >
          <Menu size={26} />
        </button>

        {/* Setting and Tambah */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end mb-6">
          <button
            onClick={() => setOpenModalTambah(true)}
            className="w-full sm:w-auto bg-[#245CCE] text-white border-2 border-[#245CCE]
            px-4 py-2 rounded-xl hover:bg-white hover:text-[#245CCE]
            transition"
          >
            Tambah Laporan
          </button>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center mb-6">
          <input
            type="text"
            placeholder="Search Laporan . . ."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-80 rounded-xl border-2 border-blue-600
            bg-white px-4 py-2 text-sm font-semibold text-[#245CCE]
            shadow outline-none placeholder:text-blue-400
            focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* Card List */}
        <div className="space-y-4 pb-10">
          {loading ? (
            <div className="flex items-center gap-2 text-[#245CCE]">
              <div className="h-4 w-4 border-2 border-[#245CCE] border-t-transparent rounded-full animate-spin "></div>
              <span className="text-sm font-semibold">Memuat data...</span>
            </div>
          ) : filteredLaporan.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-[#245CCE]">
              <FileSpreadsheet size={48} className="mb-4" />
              <h3 className="text-lg font-bold mb-1">Belum Ada Laporan</h3>
              <p className="text-sm font-medium opacity-70">
                Silakan tambahkan laporan terlebih dahulu.
              </p>
            </div>
          ) : (
            filteredLaporan.map((item) => (
              <Link
                key={item.id}
                href={`/monitoring-staff/${item.subProgram?.slug}/${item.id}`}
                className="block"
              >
                <div
                  className={`flex flex-col sm:flex-row sm:justify-between sm:items-center
                  p-4 border rounded-xl shadow-md
                  hover:shadow-[7px_7px_12px_rgba(0,0,0,0.35)]
                  hover:scale-[1.001] transition-all duration-300
                  ${getStatusColor(item.statusVerifikasi)}`}
                >
                  <div className="flex text-[#245CCE] gap-4 items-center">
                    <FileSpreadsheet size={24} />

                    <div>
                      <h3 className="font-bold text-lg">{item.namaLaporan}</h3>

                      <p className="font-extrabold text-xs">{item.jalur}</p>
                      <p className="font-semibold text-sm">
                        {item.statusVerifikasi}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>

      {/* Modal Tambah */}
      {openModalTambah && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl border border-gray-100">
            <h2 className="text-xl font-semibold mb-6 text-[#245CCE]">
              Tambah Laporan
            </h2>

            {/* Form */}
            <form className="space-y-5" onSubmit={handleSubmitUpload}>
              {/* Nama Laporan */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-[#245CCE]">
                  Nama Laporan
                </label>
                <input
                  type="text"
                  name="namaLaporan"
                  value={formUpload.namaLaporan}
                  onChange={handleChangeUpload}
                  placeholder="Masukkan nama laporan"
                  className="w-full border px-4 py-2.5 rounded-xl
                       placeholder:text-gray-400 text-black
                       focus:outline-none focus:ring-2 focus:ring-[#245CCE]/40"
                />
              </div>

              {/* Upload Excel */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-[#245CCE]">
                  Upload File Excel
                </label>

                <input
                  type="file"
                  name="file"
                  accept=".xls,.xlsx"
                  onChange={handleChangeUpload}
                  className="w-full border px-4 py-2.5 rounded-xl
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-lg file:border-0
                       file:bg-[#245CCE] file:text-white
                       hover:file:bg-blue-800 text-black"
                />
              </div>

              {/* Action Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setOpenModalTambah(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl
                       bg-red-700 text-white hover:bg-red-800
                       transition font-medium"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={uploading}
                  className={`flex-1 px-4 py-2.5 rounded-xl
                  transition font-medium flex items-center justify-center gap-2
                  ${
                    uploading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#245CCE] hover:bg-blue-800 text-white"
                  }`}
                >
                  {uploading && (
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  )}
                  {uploading ? "Mengupload..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
