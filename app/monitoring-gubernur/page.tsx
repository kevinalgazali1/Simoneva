"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Bell,
  Sparkles,
  TrendingUp,
  Plane,
  GraduationCap,
  Database,
  MapPin,
  Award,
  Baby,
} from "lucide-react";

interface ProgramItem {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const programs: ProgramItem[] = [
  {
    id: 1,
    title: "Bersih",
    description: "Bersih, Ekonomi Kerakyatan, Reformasi Birokrasi",
    icon: <Sparkles />,
  },
  {
    id: 2,
    title: "Ekonomi",
    description: "Akselerasi Pembangunan Infrastruktur",
    icon: <TrendingUp />,
  },
  {
    id: 3,
    title: "Reformasi",
    description: "Nautika, Aerotropolis, Ibu Kota Baru",
    icon: <Plane />,
  },
  {
    id: 4,
    title: "Akselerasi",
    description: "Cerdas, Ekonomi Hijau, Revolusi Mental",
    icon: <GraduationCap />,
  },
  {
    id: 5,
    title: "Nautika",
    description: "Ekspor, Digitalisasi, Anak Sehat",
    icon: <Database />,
  },
  {
    id: 6,
    title: "Ibu Kota Baru",
    description: "Riset, Data Satu, SDA",
    icon: <Database />,
  },
  {
    id: 7,
    title: "Cerdas",
    description: "Destinasi Wisata, Agrikultur",
    icon: <MapPin />,
  },
  {
    id: 8,
    title: "Ekonomi Hijau",
    description: "Akuntabilitas, Seni Budaya",
    icon: <Award />,
  },
  {
    id: 9,
    title: "Revolusi Mental",
    description: "Stunting Prevention",
    icon: <Baby />,
  },
];

export default function MonitoringGubernur() {
  const [activeIndex, setActiveIndex] = useState(4);
  const [isAnimating, setIsAnimating] = useState(false);

  const total = programs.length;
  const angleStep = 180 / (total - 1);

  const handleClick = (index: number) => {
    if (isAnimating || index === activeIndex) return;
    setIsAnimating(true);
    setActiveIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* HEADER */}
      <header className="bg-blue-900 shadow">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 text-white">
            <div className="w-11 h-11 flex items-center justify-center font-bold text-blue-900">
              <Image
                src="/logo-sulteng.png"
                alt="Logo Sulteng"
                width={50}
                height={50}
                className="object-contain"
              />
            </div>
            <div>
              <div className="text-xs">PEMERINTAH PROVINSI</div>
              <div className="text-sm font-bold">SULAWESI TENGAH</div>
            </div>
          </div>

          <Bell className="text-white" />
        </div>
      </header>

      {/* TITLE */}
      <section className="text-center py-12">
        <h1 className="text-5xl font-bold text-blue-900">SIMONEVA BERANI</h1>
        <p className="text-blue-800 mt-2">
          Sistem Informasi, Monitoring dan Evaluasi 9 Program Kerja
        </p>
        <p className="text-blue-700">
          <strong>BAPPEDA</strong> – Provinsi Sulawesi Tengah
        </p>
      </section>

      {/* SEMI CIRCLE CAROUSEL */}
      <section className="relative w-full" style={{ height: 600, backgroundImage: "url('/bg.png')" }}>
        {/* CENTER CONTENT */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl px-10 py-8 text-center max-w-lg">
            <h2 className="text-4xl font-bold text-blue-900 mb-3">
              {programs[activeIndex].title}
            </h2>
            <p className="text-gray-600 mb-6">
              {programs[activeIndex].description}
            </p>
            <button className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-full font-semibold transition">
              Lihat Detail
            </button>
          </div>
        </div>

        {/* ITEMS */}
        {programs.map((program, index) => {
          const relativeIndex = index - activeIndex;
          const angle = relativeIndex * angleStep * (Math.PI / 180);

          const radiusX = 42;
          const radiusY = 34;

          const x = 50 + radiusX * Math.sin(angle);
          const y = 50 - radiusY * Math.cos(angle);

          const isActive = index === activeIndex;
          const scale = isActive ? 1.3 : 0.95 - Math.abs(relativeIndex) * 0.05;

          return (
            <button
              key={program.id}
              onClick={() => handleClick(index)}
              disabled={isAnimating}
              className={`absolute w-20 h-20 md:w-24 md:h-24 rounded-full
                flex items-center justify-center shadow-lg
                transition-all duration-500 ease-in-out
                ${isActive ? "bg-blue-600 z-30" : "bg-gray-500 hover:bg-gray-600"}
              `}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: `translate(-50%, -50%) scale(${scale})`,
              }}
            >
              <div className="text-white flex flex-col items-center gap-1">
                {program.icon}
                <span className="text-xs font-bold">{program.id}</span>
              </div>
            </button>
          );
        })}

        {/* DECORATIVE ARC */}
        <div
          className="absolute left-1/2 top-6 
              border-gray-300 opacity-30
             pointer-events-none"
          style={{
            width: "84%",
            height: "68%",
            borderRadius: "100% 100% 0 0",
            transform: "translateX(-50%)",
            borderBottom: "none",
          }}
        />
      </section>
    </div>
  );
}
