"use client";

import Image from "next/image";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
          credentials: "include",
        },
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.msg || "Login gagal");
      }

      const data = await res.json();
      console.log("Login Response:", data);

      if (data.accessToken) {
        document.cookie = `accessToken=${data.accessToken}; path=/; max-age=${60 * 60 * 24}`;
      }

      const role = data.role;
      console.log("Role detected:", role);

      const roleRoutes: Record<string, string> = {
        Staff: "/monitoring-staff",
        "Kepala Dinas": "/monitoring-kadis",
        Gubernur: "/monitoring-gubernur",
      };

      const redirectPath = roleRoutes[role];

      if (redirectPath) {
        console.log("Redirecting to:", redirectPath);
        window.location.href = redirectPath;
      } else {
        toast.error("Role tidak dikenali: " + role);
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error(err instanceof Error ? err.message : "Login gagal");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* HEADER */}
      <header className="bg-blue-900 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-400 rounded-full flex items-center justify-center">
              <Image
                src="/logo-sulteng.png"
                alt="Logo Sulteng"
                width={50}
                height={50}
                className="object-contain"
              />
            </div>
            <div className="text-white">
              <div className="text-xs md:text-sm font-semibold">
                PEMERINTAH PROVINSI
              </div>
              <div className="text-base md:text-lg font-bold">
                SULAWESI TENGAH
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ==============================================
          MOBILE LAYOUT  (hidden on md+)
      ============================================== */}
      <main className="flex flex-col flex-1 md:hidden bg-white">

        {/* Hero section: title di depan, officials transparan di belakang */}
        <div className="relative overflow-hidden bg-white pt-10 px-6 min-h-64">

          {/* Officials — di belakang (z-0), bottom-aligned, opacity rendah */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-center items-end pointer-events-none z-0">
            <Image
              src="/gubernur.png"
              alt="Gubernur"
              width={155}
              height={210}
              className="object-contain opacity-[0.3]"
            />
            <Image
              src="/wakil-gubernur.png"
              alt="Wakil Gubernur"
              width={155}
              height={210}
              className="object-contain opacity-[0.3]"
            />
          </div>

          {/* Fade bawah agar menyatu dengan bg putih */}
          <div className="absolute bottom-0 left-0 right-0 h-16 z-10 pointer-events-none" />

          {/* Title — z-20, tampil di atas foto */}
          <div className="relative z-20 text-center">
            <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight">
              SIMONEVA
            </h1>
            <h2 className="text-2xl font-extrabold text-blue-900 tracking-widest">
              BERANI
            </h2>
            <p className="text-blue-700 mt-3 text-sm leading-relaxed">
              Sistem Informasi, Monitoring dan Evaluasi
              <br />9 Program Kerja
            </p>
            <p className="text-blue-500 mt-1 text-xs">
              <strong className="text-blue-900">BAPPEDA</strong> – Badan
              Perencanaan Pembangunan Daerah
              <br />
              Provinsi Sulawesi Tengah
            </p>
          </div>
        </div>

        {/* Login Card — biru navy solid */}
        <div className="flex-1 px-5 pb-8 bg-white">
          <div className="bg-blue-900 rounded-2xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-white text-center mb-6">
              Welcome Back
            </h2>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-blue-200 text-xs font-semibold mb-1 ml-1">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full px-4 py-3 rounded-xl bg-blue-800 border border-blue-600 text-white placeholder:text-blue-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none text-sm"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-blue-200 text-xs font-semibold mb-1 ml-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    className="w-full px-4 pr-12 py-3 rounded-xl bg-blue-800 border border-blue-600 text-white placeholder:text-blue-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 mt-2 bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 text-blue-900 text-base font-bold rounded-xl shadow-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? "Memproses..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* ==============================================
          DESKTOP LAYOUT  (hidden on mobile)
      ============================================== */}
      <main className="relative w-full flex-1 overflow-hidden hidden md:block">
        <div className="relative z-10 pt-16">
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-extrabold text-blue-900">
              SIMONEVA BERANI
            </h1>
            <p className="text-blue-800 mt-3 text-lg">
              Sistem Informasi, Monitoring dan Evaluasi 9 Program Kerja
            </p>
            <p className="text-blue-700 mt-1">
              <strong>BAPPEDA</strong> – Badan Perencanaan Pembangunan Daerah
              Provinsi Sulawesi Tengah
            </p>
          </div>

          {/* HERO OFFICIALS BACKGROUND */}
          <div className="relative w-screen min-h-[110vh] overflow-hidden">
            <div className="absolute inset-0 z-0">
              <Image
                src="/bg.png"
                alt="Background"
                fill
                priority
                className="object-cover"
              />
            </div>

            <div className="absolute inset-0 z-10">
              <Image
                src="/indo.png"
                alt="Indonesia Overlay"
                fill
                priority
                className="object-cover"
              />
            </div>

            <div className="absolute inset-0 z-20 flex justify-center items-end gap-16 pointer-events-none">
              <Image
                src="/gubernur.png"
                alt="Gubernur"
                width={550}
                height={550}
                className="object-contain"
              />
              <Image
                src="/wakil-gubernur.png"
                alt="Wakil Gubernur"
                width={550}
                height={550}
                className="object-contain"
              />
            </div>

            {/* LOGIN CARD */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 w-full max-w-md px-4">
              <div className="backdrop-blur-xs bg-white/20 border border-white/30 rounded-2xl shadow-2xl p-8">
                <h2 className="text-3xl font-bold text-blue-900 text-center mb-8">
                  Welcome Back
                </h2>

                <form onSubmit={handleLogin} className="space-y-5">
                  {/* Username */}
                  <div className="relative mb-6">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-full shadow">
                      Username
                    </span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="username"
                      className="w-full pl-28 pr-6 py-4 rounded-full bg-white/80 border border-gray-500 text-black placeholder:text-black focus:ring-2 focus:ring-blue-600 outline-none"
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className="relative mb-8">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 bg-yellow-400 text-blue-900 text-sm font-bold px-4 py-2 rounded-full shadow z-10">
                      Password
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="********"
                      className="w-full pl-32 pr-14 py-4 rounded-full bg-white/80 border border-gray-500 text-black placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-blue-600 transition-colors focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="mx-auto block px-14 py-3 bg-blue-700 hover:bg-blue-800 text-white text-lg font-semibold rounded-full shadow-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Memproses..." : "Login"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-blue-900 text-center text-sm text-white py-4">
        © 2026 Pemerintah Provinsi Sulawesi Tengah. All rights reserved.
      </footer>
    </div>
  );
}