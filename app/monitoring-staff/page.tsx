"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import BeasiswaSelect from "@/components/BeasiswaSelect";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Settings,
  ArrowUpRight,
  FileSpreadsheet,
  Eye,
  EyeOff,
  User,
  Phone,
  Lock,
  Menu,
} from "lucide-react";

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
  };
  verifikator?: {
    username: string;
  };
}

export default function BerandaStaff() {
  const [openModal, setOpenModal] = useState(false);
  const [openModalTambah, setOpenModalTambah] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [laporan, setLaporan] = useState<Laporan[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formSettings, setFormSettings] = useState({
    username: "",
    email: "",
    noHp: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const getCookie = (name: string) => {
    const match = document.cookie.match(
      new RegExp("(^| )" + name + "=([^;]+)"),
    );
    return match ? match[2] : null;
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi password baru
    if (
      formSettings.newPassword &&
      formSettings.newPassword !== formSettings.confirmPassword
    ) {
      alert("Password baru tidak cocok!");
      return;
    }

    console.log("Data yang akan disimpan:", formSettings);
    // Tambahkan logic simpan ke backend di sini

    setOpenModal(false);
  };

  const fetchLaporan = async () => {
    try {
      const token = getCookie("accessToken");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/staff/history`,
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
    fetchLaporan();
  }, []);

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

    try {
      setUploading(true);
      toast.loading("Uploading...", { id: "upload" });

      const token = getCookie("accessToken");

      const formData = new FormData();
      formData.append("jalur", formUpload.jalur);
      formData.append("namaLaporan", formUpload.namaLaporan);
      formData.append("file", formUpload.file);

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

      toast.success("Laporan berhasil diupload", { id: "upload" });

      await fetchLaporan();

      setOpenModalTambah(false);
      setFormUpload({
        namaLaporan: "",
        jalur: "",
        file: null,
      });
    } catch (err) {
      console.error(err);
      toast.error("Gagal upload laporan", {
        id: "upload",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-[#245CCE] sm:hidden mb-4"
        >
          <Menu size={26} />
        </button>

        {/* Setting and Tambah */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-6">

          <button
            onClick={() => setOpenModal(true)}
            className="flex items-center gap-2 bg-[#245CCE] text-white 
             px-4 py-2 rounded-xl 
             hover:bg-white hover:text-[#245CCE] 
             border-2 border-[#245CCE]
             transition-all duration-200
             shadow-sm hover:shadow-md"
          >
            <Settings size={18} />
            Setting
          </button>

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
            placeholder="Search Laporan dan Jalur Beasiswa . . ."
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
              <div className="h-4 w-4 border-2 border-[#245CCE] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-semibold">Memuat data...</span>
            </div>
          ) : laporan.length === 0 ? (
            <p>Tidak ada laporan</p>
          ) : (
            laporan.map((item) => (
              <Link
                key={item.id}
                href={`/monitoring-staff/laporan/${item.id}`}
                className="block"
              >
                <div
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center
                bg-white p-4 border border-[#245CCE] rounded-xl
                shadow-md hover:shadow-[7px_7px_12px_rgba(0,0,0,0.35)]
                hover:scale-[1.001]
                transition-all duration-300"
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

      {/* Modal Settings */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md relative shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-6 text-[#245CCE]">
              Pengaturan Akun
            </h2>

            <form onSubmit={handleSaveSettings} className="space-y-5">
              {/* Username */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formSettings.username}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        username: e.target.value,
                      })
                    }
                    placeholder="Masukkan username"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-300
                   text-black placeholder:text-gray-400
                   focus:outline-none focus:ring-2 focus:ring-[#245CCE]/40 focus:border-[#245CCE]"
                    required
                  />
                </div>
              </div>

              {/* Nomor HP */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Nomor HP
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formSettings.noHp}
                    onChange={(e) =>
                      setFormSettings({ ...formSettings, noHp: e.target.value })
                    }
                    placeholder="08xxxxxxxxxx"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-300
                   text-black placeholder:text-gray-400
                   focus:outline-none focus:ring-2 focus:ring-[#245CCE]/40 focus:border-[#245CCE]"
                    required
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 pt-4 mt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">
                  Ubah Password (Opsional)
                </h3>
              </div>

              {/* Password Lama */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Password Lama
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showOldPassword ? "text" : "password"}
                    value={formSettings.oldPassword}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        oldPassword: e.target.value,
                      })
                    }
                    placeholder="Masukkan password lama"
                    className="w-full pl-11 pr-12 py-2.5 rounded-xl border border-gray-300
                   text-black placeholder:text-gray-400
                   focus:outline-none focus:ring-2 focus:ring-[#245CCE]/40 focus:border-[#245CCE]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2
                   text-gray-500 hover:text-[#245CCE] transition-colors"
                  >
                    {showOldPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Baru */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Password Baru
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={formSettings.newPassword}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        newPassword: e.target.value,
                      })
                    }
                    placeholder="Masukkan password baru"
                    className="w-full pl-11 pr-12 py-2.5 rounded-xl border border-gray-300
                   text-black placeholder:text-gray-400
                   focus:outline-none focus:ring-2 focus:ring-[#245CCE]/40 focus:border-[#245CCE]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2
                   text-gray-500 hover:text-[#245CCE] transition-colors"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Konfirmasi Password Baru */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Konfirmasi Password Baru
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formSettings.confirmPassword}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Konfirmasi password baru"
                    className="w-full pl-11 pr-12 py-2.5 rounded-xl border border-gray-300
                   text-black placeholder:text-gray-400
                   focus:outline-none focus:ring-2 focus:ring-[#245CCE]/40 focus:border-[#245CCE]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2
                   text-gray-500 hover:text-[#245CCE] transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Password Match Indicator */}
                {formSettings.newPassword && formSettings.confirmPassword && (
                  <p
                    className={`text-xs mt-1 ${
                      formSettings.newPassword === formSettings.confirmPassword
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formSettings.newPassword === formSettings.confirmPassword
                      ? "✓ Password cocok"
                      : "✗ Password tidak cocok"}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-xl 
                 hover:bg-red-700 transition-colors font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#245CCE] text-white px-4 py-2.5 rounded-xl 
                 hover:bg-blue-700 transition-colors font-medium"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

              {/* Jalur Beasiswa */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-[#245CCE]">
                  Jalur Beasiswa
                </label>
                <BeasiswaSelect
                  value={formUpload.jalur}
                  onChange={(value) =>
                    setFormUpload((prev) => ({ ...prev, jalur: value }))
                  }
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
                  className="flex-1 px-4 py-2.5 rounded-xl
                       bg-[#245CCE] text-white hover:bg-blue-800
                       transition font-medium"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
