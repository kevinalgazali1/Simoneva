"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
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

  console.log("Slug params:", slug);
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
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* HEADER */}
      <header className="bg-blue-900 shadow">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 text-white">
            <Image
              src="/logo-sulteng.png"
              alt="Logo"
              width={50}
              height={50}
              className="object-contain"
            />

            <div>
              <div className="text-xs">PEMERINTAH PROVINSI</div>
              <div className="text-sm font-bold">SULAWESI TENGAH</div>
            </div>
          </div>

          {/* Button Logout */}
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* TITLE */}
      <section className="text-center py-12">
        <h1 className="text-5xl md:text-6xl font-bold text-blue-900 mb-3">
          SIMONEVA BERANI
        </h1>
        <p className="text-blue-800 text-lg mt-2">
          Sistem Informasi, Monitoring dan evaluasi 9 Program Kerja
        </p>
        <p className="text-blue-700 mt-1">
          <strong>BAPPEDA</strong> – Badan Perencanaan Pembangunan Daerah
          Provinsi Sulawesi Tengah
        </p>
      </section>

      {/* PROGRAM TITLE */}
      {programTitle && (
        <section className="max-w-6xl mx-auto px-6 pb-6">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <h2 className="text-4xl font-bold text-blue-900 uppercase">
              {programTitle}
            </h2>
          </div>
        </section>
      )}

      {/* MONITORING SECTION */}
      <section
        className="relative w-full py-20 bg-cover bg-center"
        style={{ minHeight: 600, backgroundImage: "url('/bg.png')" }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="relative pt-4">
            {/* Badge MONITORING */}
            <div className="absolute -top-2 left-0 z-30">
              <div className="px-10 py-4 rounded-2xl shadow-xl backdrop-blur-xl border-4 border-white bg-white/90">
                <span className="font-extrabold text-blue-900 text-2xl tracking-wide">
                  MONITORING
                </span>
              </div>
            </div>

            <div className="relative rounded-3xl p-12 shadow-2xl overflow-hidden bg-white/95">
              {/* Background Gradient - Red to Blue blur effect */}
              <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl">
                <div
                  style={{
                    backgroundColor: "white",
                    backgroundImage: "url('/indo.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: "blur(25px)",
                    transform: "scale(1.1)",
                    width: "100%",
                    height: "100%",
                  }}
                />
              </div>

              {/* Button Sebaran Wilayah */}
              <div className="absolute top-6 right-8 z-30">
                <button className="bg-white text-blue-700 border-2 border-blue-600 px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-50 transition-all shadow-md hover:shadow-lg">
                  Sebaran Wilayah
                </button>
              </div>

              {/* Content */}
              <div className="relative z-20 pt-16">
                <div className="flex items-center justify-center">
                  {/* Buttons Grid */}
                  <div className="w-full">
                    {loading ? (
                      <div className="text-center py-8">
                        <p className="text-gray-600 text-lg font-semibold">
                          Loading data...
                        </p>
                      </div>
                    ) : !subPrograms || subPrograms.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-600 text-lg font-semibold">
                          No sub-programs available
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {subPrograms.map((sub) => (
                          <button
                            key={sub.id}
                            className="bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-full font-bold text-sm shadow-lg transition-all hover:shadow-xl hover:scale-105 text-left"
                          >
                            {sub.namaSubProgram}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Text */}
                <p className="text-center text-sm text-gray-800 mt-12">
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
