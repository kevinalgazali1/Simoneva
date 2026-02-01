import Image from "next/image";

export default function MonitoringPage() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* HEADER */}
        <header className="bg-blue-900 shadow-lg">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3 text-white">
              <div className="w-12 h-12 flex items-center justify-center">
                <Image
                  src="/logo-sulteng.png"
                  alt="Logo Sulteng"
                  width={50}
                  height={50}
                  className="object-contain"
                />
              </div>
              <div>
                <div className="text-xs font-semibold">PEMERINTAH PROVINSI</div>
                <div className="text-sm font-bold">SULAWESI TENGAH</div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex gap-6 text-white text-sm">
              <a href="#" className="hover:text-yellow-400 transition">
                Profile
              </a>
              <a href="#" className="hover:text-yellow-400 transition">
                News
              </a>
              <a href="#" className="hover:text-yellow-400 transition">
                Dokumen Perencanaan
              </a>
              <a
                href="#"
                className="hover:text-yellow-400 transition font-bold"
              >
                Monitoring
              </a>
              <a href="#" className="hover:text-yellow-400 transition">
                Evaluasi
              </a>
            </nav>
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

        {/* MONITORING SECTION */}
        <section
          className="relative w-full py-20"
          style={{ height: 600, backgroundImage: "url('/bg.png')" }}
        >
          <div className="max-w-6xl mx-auto px-6">
            <div className="relative pt-4">
            {/* Badge MONITORING */}
            <div className="absolute -top-2 z-20">
              <div
                className="px-10 py-4 rounded-2xl shadow-xl backdrop-blur-xl border-4 border-white-900">
                <span className="font-extrabold text-blue-900 text-2xl tracking-wide">
                  MONITORING
                </span>
              </div>
            </div>
            <div className="relative rounded-3xl p-12 shadow-2xl overflow-hidden">
              {/* Background Gradient - Red to Blue blur effect */}
              <div className="absolute inset-0 z-0 overflow-hidden">
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
              <div className="absolute top-6 right-8 z-20">
                <button className="bg-white text-blue-700 border-2 border-blue-600 px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-50 transition-all shadow-md hover:shadow-lg">
                  Sebaran Wilayah
                </button>
              </div>

              {/* Content */}
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10 items-center pt-8 mt-12">
                {/* Logo Kota Palu */}
                <div className="flex justify-center md:justify-start"></div>

                {/* Buttons Grid */}
                <div className="space-y-4">
                  {/* Row 1 */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white py-3.5 px-6 rounded-full font-bold text-sm shadow-lg transition-all hover:shadow-xl hover:scale-105">
                      Bosda
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white py-3.5 px-6 rounded-full font-bold text-sm shadow-lg transition-all hover:shadow-xl hover:scale-105">
                      Biaya SPP
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white py-3.5 px-6 rounded-full font-bold text-sm shadow-lg transition-all hover:shadow-xl hover:scale-105">
                      Beasiswa
                    </button>
                  </div>

                  {/* Row 2 */}
                  <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-4">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white py-3.5 px-6 rounded-full font-bold text-sm shadow-lg transition-all hover:shadow-xl hover:scale-105">
                      Sarana & Prasaran
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white py-3.5 px-6 rounded-full font-bold text-sm shadow-lg transition-all hover:shadow-xl hover:scale-105">
                      Career Center
                    </button>
                  </div>

                  {/* Row 3 */}
                  <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-4">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white py-3.5 px-6 rounded-full font-bold text-sm shadow-lg transition-all hover:shadow-xl hover:scale-105">
                      Biaya Uji Kompetensi
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white py-3.5 px-6 rounded-full font-bold text-sm shadow-lg transition-all hover:shadow-xl hover:scale-105">
                      Vokasi
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer Text */}
              <p className="relative z-10 text-center text-sm text-gray-800 mt-10">
                Find answer in our{" "}
                <span className="font-bold text-black">HELP CENTER</span>
              </p>
            </div>
          </div>
          </div>
        </section>
      </div>
    </>
  );
}
