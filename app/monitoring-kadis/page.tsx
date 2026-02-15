"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import {
  Settings,
  FileSpreadsheet,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Lock,
  Menu,
} from "lucide-react";

interface SubProgramKerja {
  id: number;
  namaSubProgram: string;
  slug: string;
  target: number;
  anggaran: string;
  persentaseTarget: string;
  persentaseAnggaran: string;
  realisasiAnggaran: number;
  realisasiTarget: number;
}

interface JobdeskResponse {
  status: string;
  data: {
    programKerja: {
      id: number;
      namaProgram: string;
      slug: string;
      deskripsiProgram: string;
    };
    subPrograms: SubProgramKerja[];
  };
}

export default function BerandaKadis() {
  const [openModal, setOpenModal] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [subPrograms, setSubPrograms] = useState<SubProgramKerja[]>([]);
  const [loading, setLoading] = useState(true);
  const [formSettings, setFormSettings] = useState({
    username: "",
    email: "",
    noHp: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      formSettings.newPassword &&
      formSettings.newPassword !== formSettings.confirmPassword
    ) {
      alert("Password baru tidak cocok!");
      return;
    }

    console.log("Data yang akan disimpan:", formSettings);
    setOpenModal(false);
  };

  const getCookie = (name: string) => {
    const match = document.cookie.match(
      new RegExp("(^| )" + name + "=([^;]+)"),
    );
    return match ? match[2] : null;
  };

  useEffect(() => {
    const fetchJobdesk = async () => {
      try {
        const token = getCookie("accessToken");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API}/kadis/jobdesk`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const json: JobdeskResponse = await res.json();

        if (json.status === "success") {
          setSubPrograms(json.data.subPrograms);
        }
      } catch (err) {
        console.error("Error fetch jobdesk:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobdesk();
  }, []);

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
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-2 text-[#245CCE]">
              <div className="h-5 w-5 border-2 border-[#245CCE] border-t-transparent rounded-full animate-spin"></div>
              <span className="font-semibold">Memuat data subprogram...</span>
            </div>
          </div>
        ) : (
          <>
            <div className="items-center mb-8">
              <button
                onClick={() => setOpenModal(true)}
                className="flex items-center gap-2 bg-[#245CCE] text-white px-4 py-2 rounded-xl
          hover:bg-white hover:text-[#245CCE]
          border-2 border-[#245CCE]
          transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Settings size={18} />
                Setting
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {subPrograms.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-12">
                  <FileSpreadsheet size={64} className="text-gray-300 mb-4" />
                  <p className="text-gray-500 text-base font-medium">
                    Data subprogram belum tersedia.
                  </p>
                </div>
              ) : (
                subPrograms.map((item) => {
                  const parsePercentage = (percentStr: string) => {
                    return parseFloat(percentStr.replace("%", "")) || 0;
                  };

                  const persentaseTargetNum = parsePercentage(
                    item.persentaseTarget,
                  );
                  const persentaseAnggaranNum = parsePercentage(
                    item.persentaseAnggaran,
                  );

                  return (
                    <Link
                      key={item.id}
                      href={`/monitoring-kadis/${item.slug}`}
                      className="bg-white border-2 border-[#245CCE] rounded-2xl p-6 
                      shadow-[4px_4px_12px_rgba(36,92,206,0.15)] 
                      hover:shadow-[8px_8px_20px_rgba(36,92,206,0.25)]
                      transition-all duration-300 hover:scale-[1.02]
                      hover:-translate-y-1 group block cursor-pointer"
                    >
                      <div className="flex gap-3 items-start mb-4 pb-4 border-b border-gray-100">
                        <div
                          className="bg-linear-to-br from-[#245CCE] to-[#1a4ba8] p-3 rounded-xl 
                          group-hover:scale-110 transition-transform duration-300"
                        >
                          <FileSpreadsheet size={24} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-base text-[#245CCE] leading-tight line-clamp-2">
                            {item.namaSubProgram}
                          </h3>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 font-medium">
                            Target
                          </span>
                          <span className="text-sm font-bold text-[#245CCE]">
                            {item.target.toLocaleString("id-ID")}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 font-medium">
                            Realisasi
                          </span>
                          <span className="text-sm font-bold text-green-600">
                            {item.realisasiTarget.toLocaleString("id-ID")}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 font-medium">
                            Anggaran
                          </span>
                          <span className="text-sm font-bold text-[#245CCE]">
                            Rp {Number(item.anggaran).toLocaleString("id-ID")}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 font-medium">
                            Terpakai
                          </span>
                          <span className="text-sm font-bold text-orange-600">
                            Rp{" "}
                            {Number(item.realisasiAnggaran).toLocaleString(
                              "id-ID",
                            )}
                          </span>
                        </div>

                        <div className="border-t border-gray-100 my-3"></div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-600 font-medium">
                              Persentase Target
                            </span>
                            <span
                              className={`text-xs font-bold ${
                                persentaseTargetNum < 30
                                  ? "text-red-600"
                                  : persentaseTargetNum < 70
                                    ? "text-yellow-600"
                                    : "text-green-600"
                              }`}
                            >
                              {item.persentaseTarget}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden shadow-inner">
                            <div
                              className={`h-2.5 rounded-full transition-all duration-700 ease-out shadow-sm ${
                                persentaseTargetNum < 30
                                  ? "bg-linear-to-r from-red-400 via-red-500 to-red-600"
                                  : persentaseTargetNum < 70
                                    ? "bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-600"
                                    : "bg-linear-to-r from-green-400 via-green-500 to-green-600"
                              }`}
                              style={{
                                width: `${Math.min(persentaseTargetNum, 100)}%`,
                              }}
                            >
                              <div className="h-full w-full rounded-full bg-linear-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-600 font-medium">
                              Persentase Anggaran
                            </span>
                            <span
                              className={`text-xs font-bold ${
                                persentaseAnggaranNum < 30
                                  ? "text-red-600"
                                  : persentaseAnggaranNum < 70
                                    ? "text-yellow-600"
                                    : "text-green-600"
                              }`}
                            >
                              {item.persentaseAnggaran}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden shadow-inner">
                            <div
                              className={`h-2.5 rounded-full transition-all duration-700 ease-out shadow-sm ${
                                persentaseAnggaranNum < 30
                                  ? "bg-linear-to-r from-red-400 via-red-500 to-red-600"
                                  : persentaseAnggaranNum < 70
                                    ? "bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-600"
                                    : "bg-linear-to-r from-green-400 via-green-500 to-green-600"
                              }`}
                              style={{
                                width: `${Math.min(persentaseAnggaranNum, 100)}%`,
                              }}
                            >
                              <div className="h-full w-full rounded-full bg-linear-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </>
        )}
      </main>

      {/* Modal Settings - sama seperti sebelumnya */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md relative shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-6 text-[#245CCE]">
              Pengaturan Akun
            </h2>

            <form onSubmit={handleSaveSettings} className="space-y-5">
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

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formSettings.email}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        email: e.target.value,
                      })
                    }
                    placeholder="contoh@email.com"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-300
                   text-black placeholder:text-gray-400
                   focus:outline-none focus:ring-2 focus:ring-[#245CCE]/40 focus:border-[#245CCE]"
                    required
                  />
                </div>
              </div>

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

              <div className="border-t border-gray-200 pt-4 mt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">
                  Ubah Password (Opsional)
                </h3>
              </div>

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
    </div>
  );
}