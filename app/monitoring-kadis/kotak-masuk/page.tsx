"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { FileSpreadsheet, Menu } from "lucide-react";
import Swal from "sweetalert2";

interface Inputer {
  username: string;
  role: string;
  kontak: string;
}

interface SubProgram {
  namaSubProgram: string;
  slug: string;
}

interface LaporanInbox {
  id: number;
  subProgramId: number;
  namaLaporan: string;
  jalur: string;
  diInputOleh: number;
  tanggalInput: string;
  buktiDukung: string;
  statusVerifikasi: string;
  catatanRevisi: string | null;
  diVerifikasiOleh: number | null;
  tanggalVerifikasi: string | null;
  inputer: Inputer;
  subProgram: SubProgram;
}

interface ApiResponseInbox {
  status: string;
  data: LaporanInbox[];
}

export default function KotakMasuk() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [laporan, setLaporan] = useState<LaporanInbox[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ambil token dari cookie
  const getCookie = (name: string) => {
    const match = document.cookie.match(
      new RegExp("(^| )" + name + "=([^;]+)"),
    );
    return match ? match[2] : null;
  };

  const fetchInbox = async () => {
    try {
      const token = getCookie("accessToken");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/kadis/inbox`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const json: ApiResponseInbox = await res.json();

      if (json.status === "success") {
        setLaporan(json.data);
      }
    } catch (err) {
      console.error("Error inbox:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, []);

  const approveLaporan = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Prevent card click

    const result = await Swal.fire({
      title: "Konfirmasi Persetujuan",
      text: "Apakah sudah benar laporan ini ingin disetujui?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Setujui",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      const token = getCookie("accessToken");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/kadis/verifikasi/approve/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            catatan: "Data sudah valid, silahkan dilanjutkan.",
          }),
        },
      );

      const json = await res.json();

      if (json.status === "success") {
        Swal.fire("Berhasil", json.msg, "success");
        fetchInbox();
      } else {
        Swal.fire("Gagal", "Laporan tidak berhasil disetujui", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Terjadi kesalahan server", "error");
    }
  };

  const rejectLaporan = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Prevent card click

    const { value: catatan } = await Swal.fire({
      title: "Alasan Penolakan",
      input: "textarea",
      inputPlaceholder: "Masukkan alasan penolakan...",
      showCancelButton: true,
      confirmButtonText: "Tolak",
      cancelButtonText: "Batal",
    });

    if (!catatan) return;

    try {
      const token = getCookie("accessToken");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/kadis/verifikasi/reject/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ catatan }),
        },
      );

      const json = await res.json();

      if (json.status === "success") {
        Swal.fire("Berhasil", json.msg, "success");
        fetchInbox();
      } else {
        Swal.fire("Gagal", "Penolakan gagal", "error");
      }
    } catch {
      Swal.fire("Error", "Terjadi kesalahan server", "error");
    }
  };

  const handleCardClick = (id: number) => {
    router.push(`/monitoring-kadis/kotak-masuk/${id}`);
  };

  const formatTanggal = (tgl: string) =>
    new Date(tgl).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });

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
        <h1 className="text-xl font-bold text-[#245CCE] mb-6">
          Kotak Masuk Laporan
        </h1>

        {loading ? (
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="flex items-center gap-2 text-[#245CCE]">
              <div className="h-4 w-4 border-2 border-[#245CCE] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-semibold">Memuat laporan...</span>
            </div>
          </div>
        ) : laporan.length === 0 ? (
          <p className="text-gray-500 text-sm text-center mt-10">
            Belum ada laporan masuk
          </p>
        ) : (
          <div className="space-y-6">
            {laporan.map((item: LaporanInbox) => {
              const pending = item.statusVerifikasi === "Menunggu";

              return (
                <div
                  key={item.id}
                  onClick={() => handleCardClick(item.id)}
                  className={`rounded-2xl p-5 border transition cursor-pointer
          ${
            pending
              ? "bg-white border-[#245CCE] shadow-[6px_6px_10px_rgba(0,0,0,0.25)] hover:shadow-[8px_8px_15px_rgba(36,92,206,0.3)]"
              : "bg-gray-200 border-gray-400 shadow-inner hover:shadow-lg"
          }`}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    {/* Info laporan */}
                    <div className="flex gap-3 sm:gap-4 items-start sm:items-center text-[#245CCE]">
                      <FileSpreadsheet size={24} />

                      <div className="wrap-break-word">
                        <h3 className="font-bold text-base sm:text-lg leading-tight">
                          {item.namaLaporan}
                        </h3>

                        <p className="text-xs sm:text-sm text-gray-500">
                          Kontak Pengirim: {item.inputer.kontak}
                        </p>

                        <p className="text-xs sm:text-sm text-gray-500">
                          Masuk: {formatTanggal(item.tanggalInput)}
                        </p>

                        <p className="text-xs text-gray-400">
                          Status: {item.statusVerifikasi}
                        </p>
                      </div>
                    </div>

                    {/* Tombol */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                      <button
                        disabled={!pending}
                        onClick={(e) => approveLaporan(e, item.id)}
                        className={`px-4 py-2 rounded-lg text-white transition w-full sm:w-auto
                        ${
                          pending
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-gray-400 cursor-not-allowed"
                        }`}
                      >
                        Terima
                      </button>

                      <button
                        disabled={!pending}
                        onClick={(e) => rejectLaporan(e, item.id)}
                        className={`px-4 py-2 rounded-lg text-white transition w-full sm:w-auto
                    ${
                      pending
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                      >
                        Tolak
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}