"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import BeasiswaSelect from "@/components/BeasiswaSelect";
import Link from "next/link";
import {
  Settings,
  ArrowUpRight,
  FileSpreadsheet,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Lock,
} from "lucide-react";

export default function BerandaStaff() {
  const [openModal, setOpenModal] = useState(false);
  const [openModalTambah, setOpenModalTambah] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 min-h-screen p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <input
            type="text"
            placeholder="Search Laporan dan Jalur Beasiswa . . ."
            className="w-96 rounded-xl border-2 border-blue-600
              bg-white px-5 py-2.5
              text-sm font-semibold text-[#245CCE]
              shadow-md outline-none
              placeholder:text-blue-400
              focus:ring-2 focus:ring-blue-300"
          />

          {/* Settings Link */}
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
        </div>

        {/* Title + Button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold text-[#245CCE]">Beasiswa</h1>

          <button
            onClick={() => setOpenModalTambah(true)}
            className="bg-[#245CCE] text-white border-2 border-[#245CCE] 
        px-4 py-2 rounded-xl hover:bg-white hover:text-[#245CCE] 
        transition-all duration-200"
          >
            Tambah Laporan
          </button>
        </div>

        {/* Card List */}
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="flex justify-between items-center bg-white p-4 border border-[#245CCE] rounded-xl shadow-[5px_5px_8px_rgba(0,0,0,0.3)]"
            >
              <div className="flex text-[#245CCE] gap-4 items-center">
                <FileSpreadsheet size={24} />
                <div className="flex-col">
                  <h3 className="font-bold text-lg">Laporan {item}</h3>
                  <p className="font-extrabold text-xs">Jalur masuk {item}</p>
                </div>
              </div>

              <button className="text-blue-600">
                <Link
                  href="/monitoring-staff/laporan"
                  className="flex items-center gap-2"
                >
                  Lihat Detail
                  <ArrowUpRight size={16} />
                </Link>
              </button>
            </div>
          ))}
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

      {/* Modal Tambah */}
      {openModalTambah && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl border border-gray-100">
            <h2 className="text-xl font-semibold mb-6 text-[#245CCE]">
              Tambah Laporan
            </h2>

            {/* Form */}
            <form className="space-y-5">
              {/* Nama Laporan */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-[#245CCE]">
                  Nama Laporan
                </label>
                <input
                  type="text"
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
                <BeasiswaSelect />
              </div>

              {/* Upload Excel */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-[#245CCE]">
                  Upload File Excel
                </label>

                <input
                  type="file"
                  accept=".xls,.xlsx"
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
