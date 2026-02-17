"use client";

import { useEffect, useState, useRef } from "react";
import Header from "@/components/Header";
import {
  Sparkles,
  TrendingUp,
  Plane,
  GraduationCap,
  Database,
  MapPin,
  Award,
  Baby,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/* ================= API INTERFACE ================= */

interface ProgramAPI {
  id: number;
  namaProgram: string;
  slug: string;
  deskripsi: string;
}

interface Program extends ProgramAPI {
  icon: React.ReactNode;
}

interface APIResponse {
  status: string;
  data: ProgramAPI[];
}

/* ================= ICON MAPPING ================= */

const getProgramIcon = (nama: string) => {
  const key = nama.toLowerCase();

  if (key.includes("cerdas")) return <GraduationCap />;
  if (key.includes("sehat")) return <Baby />;
  if (key.includes("sejahtera")) return <TrendingUp />;
  if (key.includes("menyala")) return <Database />;
  if (key.includes("lancar")) return <Plane />;
  if (key.includes("makmur")) return <MapPin />;
  if (key.includes("berkah")) return <Award />;
  if (key.includes("harmoni")) return <Sparkles />;
  if (key.includes("integritas")) return <Database />;

  return <Sparkles />;
};

export default function MonitoringGubernur() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const total = programs.length;
  const angleStep = total > 1 ? 180 / (total - 1) : 0;

  /* ================= FETCH API ================= */

  useEffect(() => {
    const fetchProgram = async () => {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("accessToken="))
        ?.split("=")[1];

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/gubernur/program`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        },
      );

      const json: APIResponse = await res.json();
      if (json.status === "success") {
        const programsWithIcons: Program[] = json.data.map((p) => ({
          ...p,
          icon: getProgramIcon(p.namaProgram),
        }));
        setPrograms(programsWithIcons);
      }
    };

    fetchProgram();
  }, []);

  /* ================= MOBILE DETECTOR & MENU HANDLER ================= */

  useEffect(() => {
    const checkScreen = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Auto-close menu when switching to desktop
      if (!mobile) {
        setMenuOpen(false);
      }
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  /* ================= AUTO CENTER MOBILE ================= */

  useEffect(() => {
    if (!isMobile || !carouselRef.current) return;

    const container = carouselRef.current;
    const activeItem = container.children[activeIndex] as HTMLElement;

    if (!activeItem) return;

    activeItem.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeIndex, isMobile]);

  /* ================= CAROUSEL HANDLER ================= */

  const handleClick = (index: number) => {
    if (isAnimating || index === activeIndex) return;

    setIsAnimating(true);
    setActiveIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

  /* ================= LOGOUT ================= */

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {}

    document.cookie = "accessToken=; path=/; max-age=0";
    document.cookie = "refreshToken=; path=/; max-age=0";
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* HEADER */}
      <Header onLogout={handleLogout} />

      {/* TITLE */}
      <section className="text-center py-8">
        <h1 className="text-5xl font-bold text-blue-900">SIMONEVA BERANI</h1>
        <p className="text-blue-800 mt-2">
          Sistem Informasi Monitoring dan Evaluasi Program Kerja
        </p>
        <p className="text-blue-700">
          <strong>BAPPEDA</strong> – Provinsi Sulawesi Tengah
        </p>
      </section>

      {/* MAIN SECTION */}
      <section
        className="relative w-full"
        style={{ height: 600, backgroundImage: "url('/bg.png')" }}
      >
        {/* ===== MOBILE CAROUSEL (ATAS CARD) ===== */}
        {isMobile && (
          <div className="w-full overflow-x-auto px-4 py-4 m-4">
            <div
              ref={carouselRef}
              className="flex gap-6 w-max mx-auto pb-6
              px-[35vw]
              snap-x snap-mandatory scroll-smooth"
            >
              {programs.map((program, index) => {
                const isActive = index === activeIndex;

                return (
                  <button
                    key={program.id}
                    onClick={() => setActiveIndex(index)}
                    className={`min-w-50 h-50 rounded-full
                    flex items-center justify-center shadow-lg
                    snap-center transition-all duration-300
                    ${isActive ? "bg-blue-600 scale-110" : "bg-gray-500"}`}
                  >
                    <div className="text-white flex flex-col items-center gap-2 px-4 py-4">
                      {program.icon}
                      <span className="text-base font-bold">{program.id}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== CARD DETAIL ===== */}
        {programs.length > 0 && (
          <div
            className={`${
              isMobile
                ? "relative mt-4 px-4 h-fit"
                : "absolute top-1/3 left-1/2 -translate-x-1/2"
            } z-20`}
          >
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl px-10 py-8 text-center max-w-lg mx-auto">
              <h2 className="text-4xl font-bold text-blue-900 mb-3">
                {programs[activeIndex]?.namaProgram}
              </h2>

              <p className="text-gray-600 mb-6">
                {programs[activeIndex]?.deskripsi}
              </p>

              <Link href={`/monitoring-gubernur/${programs[activeIndex].slug}`}>
                <button className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-full font-semibold">
                  Lihat Detail
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* ===== DESKTOP ARC ===== */}
        {!isMobile &&
          programs.map((program, index) => {
            const relativeIndex = index - activeIndex;
            const angle = relativeIndex * angleStep * (Math.PI / 100);

            const radiusX = 30;
            const radiusY = 40;

            const x = 50 + radiusX * Math.sin(angle);
            const y = 50 - radiusY * Math.cos(angle);

            const isActive = index === activeIndex;
            const scale = isActive
              ? 1.3
              : 0.95 - Math.abs(relativeIndex) * 0.05;

            return (
              <button
                key={program.id}
                onClick={() => handleClick(index)}
                disabled={isAnimating}
                className={`absolute w-28 h-28 rounded-full flex items-center
                justify-center shadow-lg transition-all duration-500
                ${
                  isActive
                    ? "bg-blue-600 z-30"
                    : "bg-gray-500 hover:bg-gray-600"
                }`}
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
      </section>
    </div>
  );
}