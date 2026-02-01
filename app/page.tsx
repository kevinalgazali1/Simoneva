"use client";

import Image from "next/image";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ email, password });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* HEADER  */}
      <header className=" bg-blue-900 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
              {/* Logo placeholder */}
              <Image
                src="/logo-sulteng.png"
                alt="Logo Sulteng"
                width={50}
                height={50}
                className="object-contain"
              />
            </div>
            <div className="text-white">
              <div className="text-sm font-semibold">PEMERINTAH PROVINSI</div>
              <div className="text-lg font-bold">SULAWESI TENGAH</div>
            </div>
          </div>
        </div>
      </header>

      {/* HERO */}
      <main className="relative w-full flex-1 overflow-hidden">
        {/* Background Gelombang */}

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

            {/* 4️⃣ LOGIN CARD (TOP LAYER) */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 w-full max-w-md px-4">
              <div className="backdrop-blur-xs bg-white/20 border border-white/30 rounded-2xl shadow-2xl p-8">
                <h2 className="text-3xl font-bold text-blue-900 text-center mb-8">
                  Welcome Back
                </h2>

                <form onSubmit={handleLogin} className="space-y-5">
                  {/* Gmail */}
                  <div className="relative mb-6">
                    <span
                      className="absolute left-2 top-1/2 -translate-y-1/2
                           bg-blue-700 text-white text-sm font-semibold
                           px-4 py-2 rounded-full shadow"
                    >
                      Gmail
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="12345hg@gmail.com"
                      className="w-full pl-28 pr-6 py-4 rounded-full
                       bg-white/80 border border-gray-500
                       text-black placeholder:to-black
                       focus:ring-2 focus:ring-blue-600 outline-none"
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className="relative mb-8">
                    <span
                      className="absolute left-2 top-1/2 -translate-y-1/2
                           bg-yellow-400 text-blue-900 text-sm font-bold
                           px-4 py-2 rounded-full shadow"
                    >
                      Password
                    </span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="********"
                      className="w-full pl-32 pr-6 py-4 rounded-full
                       bg-white/80 border border-gray-500
                       text-black placeholder:to-black
                       focus:ring-2 focus:ring-blue-600 outline-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="mx-auto block px-14 py-3
                     bg-blue-700 hover:bg-blue-800
                     text-white text-lg font-semibold
                     rounded-full shadow-lg transition"
                  >
                    Login
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/*  FOOTER  */}
      <footer className="bg-blue-900 text-center text-sm text-white py-4">
        © 2026 Pemerintah Provinsi Sulawesi Tengah. All rights reserved.
      </footer>
    </div>
  );
}
