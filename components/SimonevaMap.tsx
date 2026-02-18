"use client";
import { useEffect, useRef, useState } from "react";
import type VectorLayer from "ol/layer/Vector";
import type Map from "ol/Map";
import Feature from "ol/Feature";
import Overlay from "ol/Overlay";

interface DetailProgram {
  namaProgram: string;
  totalPenerima: number;
  anggaran: string;
  totalRealisasi: string;
  persentase: number;
  persentaseString: string;
}

interface MonitoringWilayah {
  namaKabupaten: string;
  totalPenerima: number;
  totalRealisasi: string;
  detailProgram: DetailProgram[];
}

interface MapWithData extends Map {
  _dataWilayah?: MonitoringWilayah[];
}

interface ApiResponse {
  status: string;
  msg: string;
  data: MonitoringWilayah[];
}

const NAMA_PROG = [
  "Berani Cerdas",
  "Berani Sehat",
  "Berani Sejahtera",
  "Berani Menyala",
  "Berani Lancar",
  "Berani Makmur",
  "Berani Berkah",
  "Berani Harmoni",
  "Berani Berintegritas",
];

// Normalisasi nama kabupaten dari API agar cocok dengan GeoJSON
function normalizeNama(nama: string): string {
  const map: Record<string, string> = {
    BANGGAI: "Kabupaten Banggai",
    "BANGGAI KEPULAUAN": "Kabupaten Banggai Kepulauan",
    "BANGGAI LAUT": "Kabupaten Banggai Laut",
    BUOL: "Kabupaten Buol",
    DONGGALA: "Kabupaten Donggala",
    MOROWALI: "Kabupaten Morowali",
    "MOROWALI UTARA": "Kabupaten Morowali Utara",
    PALU: "Kota Palu",
    "PARIGI MOUTONG": "Kabupaten Parigi Moutong",
    POSO: "Kabupaten Poso",
    SIGI: "Kabupaten Sigi",
    "TOJO UNA-UNA": "Kabupaten Tojo Una Una",
    TOLITOLI: "Kabupaten Toli Toli",
  };
  return map[nama.toUpperCase()] ?? nama;
}

export default function SimonevaMap() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<Map | null>(null);
  const layerRef = useRef<VectorLayer | null>(null);
  const highlightLayerRef = useRef<VectorLayer | null>(null);
  const overlayRef = useRef<Overlay | null>(null);

  const [selected, setSelected] = useState<
    (MonitoringWilayah & { namaDisplay: string }) | null
  >(null);
  const [dataWilayah, setDataWilayah] = useState<MonitoringWilayah[]>([]);
  const [geoData, setGeoData] = useState(null);

  // 1. Fetch data dari API Backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // ambil token dari cookie
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("accessToken="))
          ?.split("=")[1];

        if (!token) {
          console.warn("Token tidak ditemukan");
          return;
        }

        const res = await fetch(
          "https://simoneva.cloud/api/gubernur/monitoring/wilayah",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          },
        );

        console.log("STATUS:", res.status);

        const json: ApiResponse = await res.json();
        console.log("DATA API:", json);

        // filter data provinsi
        const filtered = Array.isArray(json.data)
          ? json.data.filter((d) => !d.namaKabupaten.includes("TOTAL PROVINSI"))
          : [];

        setDataWilayah(filtered);
      } catch (err) {
        console.error("Gagal fetch data wilayah:", err);
      }
    };

    fetchData();
  }, []);

  // 2. Load GeoJSON
  useEffect(() => {
    fetch("/data/SIMONEVABERANI.geojson")
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((err) => console.error("Gagal load GeoJSON:", err));
  }, []);

  // 3. Init OpenLayers setelah GeoJSON siap
  useEffect(() => {
    if (!mapRef.current || !geoData) return;
    if (mapInstance.current) return;

    import("ol").then(async () => {
      const { Map, View } = await import("ol");
      const { Vector: VectorLayer } = await import("ol/layer");
      const { Vector: VectorSource } = await import("ol/source");
      const { GeoJSON } = await import("ol/format");
      const { Style, Fill, Stroke } = await import("ol/style");
      const { fromLonLat } = await import("ol/proj");
      const { Overlay } = await import("ol");
      const TileLayer = (await import("ol/layer/Tile")).default;
      const OSM = (await import("ol/source/OSM")).default;

      const COLORS: Record<string, string> = {
        "Kabupaten Banggai": "rgba(247,251,255,1.0)",
        "Kabupaten Banggai Kepulauan": "rgba(232,242,250,1.0)",
        "Kabupaten Banggai Laut": "rgba(218,232,246,1.0)",
        "Kabupaten Buol": "rgba(203,223,241,1.0)",
        "Kabupaten Donggala": "rgba(183,213,234,1.0)",
        "Kabupaten Morowali": "rgba(160,203,226,1.0)",
        "Kabupaten Morowali Utara": "rgba(130,187,219,1.0)",
        "Kabupaten Parigi Moutong": "rgba(101,170,212,1.0)",
        "Kabupaten Poso": "rgba(77,153,202,1.0)",
        "Kabupaten Sigi": "rgba(55,135,192,1.0)",
        "Kabupaten Tojo Una Una": "rgba(36,116,182,1.0)",
        "Kabupaten Toli Toli": "rgba(19,95,167,1.0)",
        "Kota Palu": "rgba(8,73,145,1.0)",
      };

      const format = new GeoJSON();
      const features = format.readFeatures(geoData, {
        dataProjection: "EPSG:4326",
        featureProjection: "EPSG:3857",
      });

      const source = new VectorSource({ features });

      const vectorLayer = new VectorLayer({
        source,
        style: (feature) =>
          new Style({
            stroke: new Stroke({ color: "rgba(35,35,35,1.0)", width: 0.988 }),
            fill: new Fill({
              color: COLORS[feature.get("nama")] || "rgba(8,48,107,1.0)",
            }),
          }),
      });
      layerRef.current = vectorLayer;

      const highlightSource = new VectorSource();
      const highlightLayer = new VectorLayer({
        source: highlightSource,
        style: new Style({
          stroke: new Stroke({ color: "#F68048", width: 6 }),
          fill: new Fill({ color: "rgba(246,128,72,0.2)" }),
        }),
        zIndex: 9999,
      });
      highlightLayerRef.current = highlightLayer;

      const popupEl = document.getElementById("ol-popup");
      if (!popupEl) return;

      const popup = new Overlay({
        element: popupEl,
        offset: [0, -10],
      });
      overlayRef.current = popup;

      if (!mapRef.current) return;
      const map = new Map({
        target: mapRef.current,
        layers: [
          new TileLayer({ source: new OSM() }),
          vectorLayer,
          highlightLayer,
        ],
        overlays: [popup],
        view: new View({ center: fromLonLat([120.0, -1.4]), zoom: 7 }),
      });
      mapInstance.current = map;

      const extent = source.getExtent();
      if (extent) {
        map.getView().fit(extent, {
          size: map.getSize(),
          padding: [50, 50, 50, 50],
          duration: 1000,
        });
      }

      // Hover
      map.on("pointermove", (evt) => {
        if (evt.dragging) return;
        const feature = map.forEachFeatureAtPixel(
          map.getEventPixel(evt.originalEvent),
          (f) => f,
        );
        map.getTargetElement().style.cursor = feature ? "pointer" : "";
        const popupContent = document.getElementById("ol-popup-content");
        if (popupContent && feature) {
          popupContent.innerHTML = `
            <div style="text-align:center;font-size:12px;color:#153893">
              <strong>${feature.get("nama")}</strong>
            </div>`;
          popup.setPosition(evt.coordinate);
          popupEl.style.display = "block";
        } else {
          popupEl.style.display = "none";
        }
      });

      // Klik — ambil data dari dataWilayah via closure tidak bisa langsung,
      // jadi kita simpan ref ke dataWilayah
      map.on("singleclick", (evt) => {
        highlightSource.clear();
        map.forEachFeatureAtPixel(evt.pixel, (feat) => {
          highlightSource.addFeature(feat as Feature);
          const namaGeo: string = feat.get("nama") ?? "";

          // Cari data API berdasarkan normalisasi nama
          const apiEntry = (map as MapWithData)._dataWilayah?.find(
            (d: MonitoringWilayah) =>
              normalizeNama(d.namaKabupaten) === namaGeo,
          );

          setSelected(
            apiEntry
              ? { ...apiEntry, namaDisplay: namaGeo }
              : {
                  namaKabupaten: namaGeo,
                  namaDisplay: namaGeo,
                  totalPenerima: 0,
                  totalRealisasi: "Rp 0",
                  detailProgram: NAMA_PROG.map((namaProgram) => ({
                    namaProgram,
                    totalPenerima: 0,
                    anggaran: "-",
                    totalRealisasi: "Rp 0",
                    persentase: 0,
                    persentaseString: "0%",
                  })),
                },
          );

          const geom = feat.getGeometry();
          if (!geom) return;

          map.getView().fit(geom.getExtent(), {
            padding: [100, 100, 100, 100],
            duration: 1000,
          });
        });
      });
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.setTarget(undefined);
        mapInstance.current = null;
      }
    };
  }, [geoData]);

  // Update referensi dataWilayah di instance map agar event handler bisa akses
  useEffect(() => {
    if (mapInstance.current) {
      (mapInstance.current as MapWithData)._dataWilayah = dataWilayah;
    }
  }, [dataWilayah]);

  const focusWilayahFromList = (w: MonitoringWilayah) => {
    if (!mapInstance.current || !layerRef.current || !highlightLayerRef.current)
      return;

    const namaGeo = normalizeNama(w.namaKabupaten);
    const source = layerRef.current.getSource();
    const highlightSource = highlightLayerRef.current.getSource();

    if (!source || !highlightSource) return;

    highlightSource.clear();

    source.getFeatures().forEach((feat) => {
      if (feat.get("nama") === namaGeo) {
        highlightSource.addFeature(feat);

        const geom = feat.getGeometry();
        if (!geom || !mapInstance.current) return;

        mapInstance.current.getView().fit(geom.getExtent(), {
          padding: [100, 100, 100, 100],
          duration: 1000,
        });
      }
    });

    setSelected({ ...w, namaDisplay: namaGeo });
  };

  const resetDashboard = () => {
    setSelected(null);

    if (highlightLayerRef.current) {
      highlightLayerRef.current.getSource()?.clear();
    }

    if (mapInstance.current && layerRef.current) {
      const source = layerRef.current.getSource();
      const extent = source?.getExtent();

      if (extent && mapInstance.current) {
        mapInstance.current.getView().fit(extent, {
          padding: [50, 50, 50, 50],
          duration: 800,
        });
      }
    }
  };

  const formatColor = (val: number) =>
    val > 70 ? "#2ecc71" : val > 40 ? "#f1c40f" : "#e74c3c";

  return (
    <div className="flex gap-6 h-[85vh]">
      {/* PETA */}
      <div className="flex-[1.5] rounded-3xl overflow-hidden relative bg-white shadow">
        <div ref={mapRef} className="w-full h-full" />
        <div
          id="ol-popup"
          className="absolute bg-white px-3 py-2 rounded-xl shadow-md border-b-4 border-[#153893] pointer-events-none"
          style={{ display: "none" }}
        >
          <div id="ol-popup-content" />
        </div>
      </div>

      {/* PANEL TENGAH */}
      <div className="flex-1 bg-white/30 rounded-3xl p-6 overflow-y-auto flex flex-col">
        {!selected ? (
          <div className="text-center mt-8">
            <img src="/images/logo_sulteng.png" className="w-36 mx-auto mb-4" />
            <h2 className="text-[#153893] font-bold text-xl">
              SULAWESI TENGAH
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Pilih wilayah pada peta untuk melihat detail 9 Program Berani
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            <button
              onClick={resetDashboard}
              className="mb-4 self-start bg-[#FCF150] text-[#153893] font-bold text-xs px-4 py-2 rounded-full hover:bg-[#153893] hover:text-white transition-all"
            >
              KEMBALI KE RINGKASAN
            </button>

            <div className="text-center mb-4">
              <h2 className="text-[#153893] font-bold text-lg uppercase">
                {selected.namaDisplay}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Total Penerima:{" "}
                <span className="font-bold text-[#153893]">
                  {selected.totalPenerima}
                </span>
              </p>
              <p className="text-sm text-gray-500">
                Total Realisasi:{" "}
                <span className="font-bold text-[#153893]">
                  {selected.totalRealisasi}
                </span>
              </p>
            </div>

            {selected.detailProgram.map((prog, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-[#153893] font-bold text-sm">
                    {prog.namaProgram}
                  </span>
                  <span className="text-[#153893] font-bold text-sm">
                    {prog.persentaseString}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-2">
                  {prog.totalPenerima} penerima · {prog.totalRealisasi}
                </p>
                <div className="bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(prog.persentase * 100, 100)}%`,
                      background: formatColor(prog.persentase * 100),
                      minWidth: prog.persentase > 0 ? "4px" : "0",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PANEL KANAN - DAFTAR WILAYAH */}
      <div className="flex-1 bg-white/30 rounded-3xl p-4 flex flex-col">
        <h3 className="text-[#153893] font-bold text-center text-lg mb-4 tracking-wider">
          DAFTAR WILAYAH
        </h3>
        <div className="flex-1 overflow-y-auto space-y-3 px-2">
          {!dataWilayah || dataWilayah.length === 0 ? (
            <p className="text-center text-gray-400 text-sm mt-4">
              Memuat data...
            </p>
          ) : (
            dataWilayah.map((w, idx) => {
              const avgPersen =
                w.detailProgram.reduce((a, b) => a + b.persentase, 0) /
                w.detailProgram.length;
              const avgDisplay = (avgPersen * 100).toFixed(3);
              return (
                <div
                  key={idx}
                  onClick={() => focusWilayahFromList(w)}
                  className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all border border-transparent hover:border-[#245CCE]"
                >
                  <div className="flex justify-between mb-1">
                    <span className="text-[#153893] font-bold text-xs uppercase">
                      {w.namaKabupaten}
                    </span>
                    <span className="text-[#153893] font-bold text-xs">
                      {avgDisplay}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">
                    {w.totalRealisasi}
                  </p>
                  <div className="bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#153893] transition-all"
                      style={{
                        width: `${Math.min(avgPersen * 10000, 100)}%`,
                        minWidth: avgPersen > 0 ? "4px" : "0",
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
