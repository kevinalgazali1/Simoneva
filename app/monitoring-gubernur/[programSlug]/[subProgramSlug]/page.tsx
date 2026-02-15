"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import Image from "next/image";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { UsersIcon } from "@heroicons/react/24/solid";

const NAV_ITEMS = [
  "Profile",
  "News",
  "Dokumen Perencanaan",
  "Monitoring",
  "Evaluasi",
];

interface BeasiswaData {
  id: number;
  nama: string;
  registrasi: string;
  kampus: string;
  kabupaten: string;
  nominal: string;
  tanggalCair: string;
}

interface APIResponse {
  status: string;
  program: string;
  programSlug: string;
  subProgram: string;
  subProgramSlug: string;
  type: string;
  totalData: number;
  data: BeasiswaData[];
}

export default function SubProgramPage() {
  const params = useParams();
  const router = useRouter();
  const programSlug = params?.programSlug?.toString();
  const subProgramSlug = params?.subProgramSlug?.toString();

  const [searchName, setSearchName] = useState("");
  const [loading, setLoading] = useState(true);
  const [tableData, setTableData] = useState<any[]>([]);
  const [programInfo, setProgramInfo] = useState({
    program: "",
    subProgram: "",
    totalData: 0,
  });

  console.log(programSlug, subProgramSlug);
  console.log(process.env.NEXT_PUBLIC_BACKEND_API);

  useEffect(() => {
    if (!programSlug || !subProgramSlug) return;

    const fetchData = async () => {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("accessToken="))
          ?.split("=")[1];

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API}/gubernur/program/${programSlug}/${subProgramSlug}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          },
        );

        const json: APIResponse = await res.json();

        if (json.status === "success") {
          setTableData(json.data);
          setProgramInfo({
            program: json.program,
            subProgram: json.subProgram,
            totalData: json.totalData,
          });
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, [programSlug, subProgramSlug]);

  // Filter data berdasarkan search
  const filteredData = tableData.filter((item) =>
    item.nama.toLowerCase().includes(searchName.toLowerCase()),
  );

  // Format nominal ke Rupiah
  const formatRupiah = (nominal: string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(parseInt(nominal));
  };

  const tableColumns = tableData.length > 0 ? Object.keys(tableData[0]) : [];

  const formatCell = (value: any) => {
    if (!value) return "-";

    // nominal uang
    if (!isNaN(value) && value.toString().length >= 6) {
      return new Intl.NumberFormat("id-ID").format(value);
    }

    // tanggal
    if (Date.parse(value)) {
      return new Date(value).toLocaleDateString("id-ID");
    }

    return value.toString();
  };

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
      {/* ================= HEADER ================= */}
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

      {/* ================= TITLE ================= */}
      <section className="py-12 text-center">
        <h1 className="mb-3 text-5xl font-bold text-blue-900 md:text-6xl">
          SIMONEVA BERANI
        </h1>
        <p className="text-lg text-blue-800">
          Sistem Informasi, Monitoring dan Evaluasi 9 Program Kerja
        </p>
        <p className="mt-1 text-blue-700">
          <strong>BAPPEDA</strong> – Badan Perencanaan Pembangunan Daerah
          Provinsi Sulawesi Tengah
        </p>
      </section>

      {/* ================= PROGRAM INFO ================= */}
      {programInfo.program && (
        <section className="max-w-6xl mx-auto px-6 pb-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <h2 className="text-2xl font-bold text-blue-900 uppercase">
              {programInfo.program}
            </h2>
            <p className="text-lg text-blue-700 mt-2">
              {programInfo.subProgram}
            </p>
          </div>
        </section>
      )}

      {/* ================= MONITORING ================= */}
      <section
        className="relative w-full h-full py-20"
        style={{ backgroundImage: "url('/bg.png')" }}
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="relative pt-6">
            {/* Badge */}
            <div className="absolute -top-2 z-20">
              <div className="rounded-2xl border-4 border-white px-10 py-4 shadow-xl backdrop-blur-xl">
                <span className="text-2xl font-extrabold tracking-wide text-blue-900">
                  MONITORING
                </span>
              </div>
            </div>

            {/* Card */}
            <div className="relative overflow-hidden rounded-3xl pt-12 shadow-2xl bg-white">
              {/* Background Blur */}
              <div
                className="absolute inset-0 z-0 scale-110 blur-2xl"
                style={{
                  backgroundImage: "url('/indo.png')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />

              {/* ================= SEARCH NAMA ================= */}
              <div className="absolute right-8 top-6 z-30 w-72">
                <div className="relative">
                  {/* Input */}
                  <input
                    type="text"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder="Cari nama..."
                    className="
        w-full rounded-xl border-2 border-blue-600
        bg-white px-5 py-2.5
        text-sm font-semibold text-blue-700
        shadow-md outline-none
        placeholder:text-blue-400
        focus:ring-2 focus:ring-blue-300
      "
                  />

                  {/* Icon */}
                  <svg
                    className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35"
                    />
                    <circle cx="11" cy="11" r="7" />
                  </svg>
                </div>
              </div>

              {/* Content Section */}
              <div className="relative z-10 mt-10">
                {/* ===== TOP TOTAL BAR ===== */}
                <div className="bg-blue-800 text-white px-6 py-5 flex items-center justify-center gap-4">
                  <div className="bg-white/10 p-3 rounded-lg">
                    <UsersIcon className="h-7 w-7 text-white" />
                  </div>
                  <h2 className="text-lg md:text-xl font-semibold tracking-wide">
                    TOTAL :{" "}
                    <span className="font-bold">
                      {loading ? "..." : `${programInfo.totalData} BEASISWA`}
                    </span>
                  </h2>
                </div>

                {/* ===== TABLE ===== */}
                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="text-center py-12 text-gray-600">
                      <p className="text-lg font-semibold">Loading data...</p>
                    </div>
                  ) : filteredData.length === 0 ? (
                    <div className="text-center py-12 text-gray-600">
                      <p className="text-lg font-semibold">
                        {searchName
                          ? "Tidak ada data yang sesuai dengan pencarian"
                          : "Tidak ada data tersedia"}
                      </p>
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-white text-xs text-blue-900 uppercase tracking-wider">
                        <tr>
                          {tableColumns.map((col) => (
                            <th key={col} className="px-6 py-4 text-left">
                              {col.replace(/_/g, " ").toUpperCase()}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody className="bg-blue-900 divide-y divide-blue-700 text-white">
                        {tableData.map((row, i) => (
                          <tr key={i}>
                            {tableColumns.map((col) => (
                              <td key={col} className="px-6 py-4">
                                {col.toLowerCase() === "nominal"
                                  ? formatRupiah(row[col])
                                  : col.toLowerCase().includes("tanggal")
                                    ? new Date(row[col]).toLocaleDateString(
                                        "id-ID",
                                        {
                                          day: "2-digit",
                                          month: "long",
                                          year: "numeric",
                                        },
                                      )
                                    : (row[col] ?? "-")}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
