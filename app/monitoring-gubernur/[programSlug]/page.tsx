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
        <div
          className="
          max-w-6xl mx-auto px-4 pb-16
          "
        >
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
            {/* Badge MONITORING */}
            <div className="absolute -top-6 sm:-top-2 left-1/3 sm:left-0 -translate-x-1/2 sm:translate-x-0 z-30">
              <div className="mb-6 text-center">
                <span
                  className="
                  inline-block
                  sm:px-6 sm:py-2
                  px-6 py-2
                  rounded-xl
                  text-sm sm:text-base md:text-lg font-semibold
                  text-blue-900
                  bg-blue-50
                  border border-blue-100 shadow-sm
                "
                >
                  Monitoring Program {programTitle}
                </span>
              </div>
            </div>

            <div
              className="relative rounded-3xl 
              p-6 sm:p-12 
              shadow-xl sm:shadow-2xl 
              overflow-hidden 
              bg-white/95 backdrop-blur-md"
            >
              {/* Background Gradient - Red to Blue blur effect */}
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
                  {/* Back Button */}
                  <div className="mb-6">
                    <button
                      onClick={() => router.back()}
                      className="
                      flex items-center gap-2
                      px-4 py-2
                      bg-red-500 hover:bg-red-600
                      text-white
                      rounded-lg
                      transition
                      shadow-sm
                    "
                    >
                      Kembali
                    </button>
                  </div>
                <div className="flex items-center justify-center">
                  {/* Buttons Grid */}
                  <div className="w-full">
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                            bg-white
                            border border-gray-200
                            hover:border-blue-300
                            rounded-2xl
                            p-5
                            shadow-sm hover:shadow-xl
                            transition-all duration-300 hover:-translate-y-1
                            text-center
                            "
                          >
                            <p className="font-semibold text-blue-900 group-hover:text-blue-700">
                              {sub.namaSubProgram}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Text */}
                <p
                  className="text-center text-xs sm:text-sm 
                  text-gray-700 mt-10 sm:mt-12 
                  tracking-wide px-4"
                >
                  Find answer in our{" "}
                  <span className="font-bold text-black">HELP CENTER</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
