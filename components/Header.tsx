"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface HeaderProps {
  onLogout: () => void;
}

export default function Header({ onLogout }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (!mobile) setMenuOpen(false);
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  return (
    <header className="bg-blue-900 shadow relative">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* LOGO */}
        <div className="flex items-center gap-3 text-white">
          <Image src="/logo-sulteng.png" alt="Logo" width={50} height={50} />
          <div>
            <div className="text-xs">PEMERINTAH PROVINSI</div>
            <div className="text-sm font-bold">SULAWESI TENGAH</div>
          </div>
        </div>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex gap-2">

          <Link href="/monitoring-gubernur/sebaran-wilayah">
            <button className="block w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">
              Sebaran Wilayah
            </button>
          </Link>

          <Link href="/monitoring-gubernur">
            <button className="block w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">
              Monitoring
            </button>
          </Link>

          <Link href="/monitoring-gubernur/ranking-opd">
            <button className="block w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">
              Ranking OPD
            </button>
          </Link>
          
          <button
            onClick={onLogout}
            className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Logout
          </button>
        </div>

        {/* MOBILE TOGGLE */}
        <button
          className="sm:hidden text-white text-2xl"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* MOBILE DROPDOWN */}
      {menuOpen && isMobile && (
        <div className="md:hidden bg-blue-800 px-6 py-4 space-y-2">
          <button className="block w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">
            Monitoring
          </button>
          <button className="block w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">
            Ranking OPD
          </button>
          <button
            onClick={onLogout}
            className="block w-full bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
