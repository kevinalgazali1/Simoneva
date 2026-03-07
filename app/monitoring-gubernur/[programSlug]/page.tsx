"use client";

import { useParams } from "next/navigation";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface SubProgram {
  id: number;
  namaSubProgram: string;
  slug: string;
  target: number;
  anggaran: string;
}

interface APIResponse {
  status: string;
  data: SubProgram[];
}

export default function ProgramKerjaPage() {
  const params = useParams();
  const slug = params.programSlug as string;
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [subPrograms, setSubPrograms] = useState<SubProgram[]>([]);
  const [programTitle, setProgramTitle] = useState("");

  const formatTitle = (slug: string) => {
    return slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("accessToken="))
          ?.split("=")[1];

        console.log("Fetching API:", slug);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API}/gubernur/program/${slug}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          },
        );

        console.log("Status:", res.status);
        const json: APIResponse = await res.json();

        if (json.status === "success") {
          setSubPrograms(json.data);
          setProgramTitle(formatTitle(slug));
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
    console.log("Slug:", slug);
  }, [slug]);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      document.cookie = "accessToken=; path=/; max-age=0";
      document.cookie = "refreshToken=; path=/; max-age=0";

      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      document.cookie = "accessToken=; path=/; max-age=0";
      document.cookie = "refreshToken=; path=/; max-age=0";
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 antialiased">
      {/* HEADER */}
      <Header onLogout={handleLogout} />

      {/* TITLE */}
      <section className="text-center py-8 sm:py-10 px-4 border-b border-gray-200 bg-white/70 backdrop-blur-md">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-900 tracking-tight">
          SIMONEVA BERANI
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-blue-800 mt-1">
          Sistem Informasi, Monitoring dan evaluasi 9 Program Kerja
        </p>

        <p className="text-xs sm:text-sm md:text-base text-blue-700 mt-1">
          <strong>BAPPEDA</strong> – Badan Perencanaan Pembangunan Daerah
          Provinsi Sulawesi Tengah
        </p>
      </section>

      {/* MONITORING SECTION */}
      <section
        className="relative w-full py-12 sm:py-20 bg-cover bg-center"
        style={{
          minHeight: "auto",
          backgroundImage: "url('/bg.png')",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 pb-16">
          <div
            className="
        relative
        bg-white/95 backdrop-blur-lg
        rounded-3xl
        shadow-2xl
        border border-gray-100
        p-6 sm:p-10
      "
          >
            {/* Header row: Badge + Kembali Button */}
            <div className="flex items-center justify-between mb-6 gap-4">
              <span
                className="
            inline-block
            px-5 py-2
            rounded-xl
            text-sm sm:text-base font-semibold
            text-blue-900
            bg-blue-50
            border border-blue-100 shadow-sm
          "
              >
                Monitoring Program {programTitle}
              </span>

              <button
                onClick={() => router.back()}
                className="
            flex items-center gap-2
            px-4 py-2
            bg-blue-900 hover:bg-blue-800
            text-white
            rounded-lg
            transition
            shadow-sm
            text-sm font-medium
          "
              >
                Kembali
              </button>
            </div>

            <div
              className="
          relative rounded-3xl
          p-6 sm:p-10
          shadow-xl sm:shadow-2xl
          overflow-hidden
          bg-white/95 backdrop-blur-md
        "
            >
              {/* Background blur */}
              <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl">
                <div
                  style={{
                    backgroundColor: "white",
                    backgroundImage: "url('/indo.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: "blur(18px)",
                    transform: "scale(1.05)",
                    width: "100%",
                    height: "100%",
                  }}
                />
              </div>

              {/* Content */}
              <div className="relative z-20">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-pulse text-blue-800 font-semibold">
                      Memuat data program...
                    </div>
                  </div>
                ) : !subPrograms || subPrograms.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 text-lg font-semibold">
                      No sub-programs available
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {subPrograms.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() =>
                          router.push(
                            `/monitoring-gubernur/${slug}/${sub.slug}`,
                          )
                        }
                        className="
                          group
                          w-full
                          flex items-center gap-4
                          bg-blue-800 hover:bg-blue-700
                          text-white
                          rounded-xl
                          px-5 py-4
                          shadow-sm hover:shadow-lg
                          transition-all duration-200
                          text-left
                        "
                      >
                        {/* Accent bar - only visible on hover */}
                        <span className="w-0 group-hover:w-1.5 h-6 rounded-full bg-yellow-400 shrink-0 transition-all duration-200 overflow-hidden" />
                        <span className="text-sm sm:text-base font-medium leading-snug">
                          {sub.namaSubProgram}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
