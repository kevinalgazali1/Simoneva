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
    subProgramKerja: SubProgramKerja;
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
          setSubPrograms([json.data.subProgramKerja]);
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
    <div className="flex">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 min-h-screen p-8">
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
            {/* Header */}
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

            {/* Card List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {subPrograms.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  Data subprogram belum tersedia.
                </p>
              ) : (
                subPrograms.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-[#245CCE] rounded-2xl p-5 shadow-[6px_6px_10px_rgba(0,0,0,0.25)] hover:shadow-[8px_8px_14px_rgba(0,0,0,0.3)] transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className="flex gap-4 text-[#245CCE] mb-3 items-center">
                      <FileSpreadsheet size={26} />
                      <h3 className="font-bold text-lg">
                        {item.namaSubProgram}
                      </h3>
                    </div>

                    <p className="text-[#245CCE]">
                      <strong>Target:</strong> {item.target}
                    </p>
                    <p className="text-[#245CCE]">
                      <strong>Anggaran:</strong> Rp{" "}
                      {Number(item.anggaran).toLocaleString("id-ID")}
                    </p>
                  </div>
                ))
              )}
            </div>
          </>
        )}
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

              {/* Email */}
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
    </div>
  );
}
