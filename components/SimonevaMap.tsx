"use client";
import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import type VectorLayer from "ol/layer/Vector";
import type Map from "ol/Map";
import Feature from "ol/Feature";

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
  persentaseTotal: number;
  persentaseTotalString: string;
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

// ─── Module-level singletons (created once, survive re-renders) ──────────────
// We create these outside React so they are guaranteed to exist before any
// callback ref or useEffect fires.
let _mapEl: HTMLDivElement | null = null;
let _popupEl: HTMLDivElement | null = null;
let _popupContent: HTMLDivElement | null = null;

function getMapEl(): HTMLDivElement {
  if (!_mapEl) {
    _mapEl = document.createElement("div");
    _mapEl.style.cssText = "width:100%;height:100%;";

    _popupContent = document.createElement("div");
    _popupEl = document.createElement("div");
    _popupEl.style.cssText =
      "position:absolute;background:#fff;padding:6px 12px;border-radius:12px;" +
      "box-shadow:0 2px 8px rgba(0,0,0,.18);border-bottom:4px solid #153893;" +
      "pointer-events:none;display:none;z-index:100;white-space:nowrap;";
    _popupEl.appendChild(_popupContent);
    _mapEl.appendChild(_popupEl);
  }
  return _mapEl;
}

export default function SimonevaMap() {
  // Active slot — whichever div is currently rendered and visible
  const activeSlotRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<Map | null>(null);
  const layerRef = useRef<VectorLayer | null>(null);
  const highlightLayerRef = useRef<VectorLayer | null>(null);

  const [selected, setSelected] = useState<(MonitoringWilayah & { namaDisplay: string }) | null>(null);
  const [dataWilayah, setDataWilayah] = useState<MonitoringWilayah[]>([]);
  const [geoData, setGeoData] = useState<unknown>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<"detail" | "list">("list");

  // ─── Responsive detection ─────────────────────────────────────────────────
  useLayoutEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // ─── Attach mapEl to slot ─────────────────────────────────────────────────
  // useLayoutEffect so it runs synchronously after DOM mutation, before paint
  const attachMap = useCallback((slot: HTMLDivElement | null) => {
    activeSlotRef.current = slot;
    if (!slot) return;
    const mapEl = getMapEl(); // guaranteed non-null
    if (!slot.contains(mapEl)) {
      slot.appendChild(mapEl);
      // Tell OL to recalculate its size after DOM reflow
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          mapInstance.current?.updateSize();
        });
      });
    }
  }, []);

  // Callback ref that fires whenever the slot div mounts/unmounts
  const slotCallbackRef = useCallback(
    (node: HTMLDivElement | null) => {
      attachMap(node);
    },
    [attachMap]
  );

  // When isMobile changes, React will unmount one layout and mount the other.
  // The new slot's callback ref will fire automatically. But we also guard
  // here in case the ref was already set before isMobile changed.
  useLayoutEffect(() => {
    attachMap(activeSlotRef.current);
  }, [isMobile, attachMap]);

  // ─── Fetch API ────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const token = document.cookie
          .split("; ")
          .find((r) => r.startsWith("accessToken="))
          ?.split("=")[1];
        if (!token) return;
        const res = await fetch(
          "https://simoneva.cloud/api/gubernur/monitoring/wilayah",
          { headers: { Authorization: `Bearer ${token}` }, credentials: "include" }
        );
        const json: ApiResponse = await res.json();
        const filtered = Array.isArray(json.data)
          ? json.data.filter((d) => !d.namaKabupaten.includes("TOTAL PROVINSI"))
          : [];
        setDataWilayah(filtered);
      } catch (err) {
        console.error("Gagal fetch data wilayah:", err);
      }
    })();
  }, []);

  // ─── Load GeoJSON ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/data/SIMONEVABERANI.geojson")
      .then((r) => r.json())
      .then(setGeoData)
      .catch(console.error);
  }, []);

  // ─── Init OpenLayers (once, when geoData is ready) ───────────────────────
  useEffect(() => {
    if (!geoData || mapInstance.current) return;

    const mapEl = getMapEl();
    const popupEl = _popupEl!;
    const popupContent = _popupContent!;

    (async () => {
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

      const features = new GeoJSON().readFeatures(geoData, {
        dataProjection: "EPSG:4326",
        featureProjection: "EPSG:3857",
      });
      const source = new VectorSource({ features });

      const vectorLayer = new VectorLayer({
        source,
        style: (f) =>
          new Style({
            stroke: new Stroke({ color: "rgba(35,35,35,1.0)", width: 0.988 }),
            fill: new Fill({ color: COLORS[f.get("nama")] || "rgba(8,48,107,1.0)" }),
          }),
      });
      layerRef.current = vectorLayer;

      const highlightSrc = new VectorSource();
      const highlightLayer = new VectorLayer({
        source: highlightSrc,
        style: new Style({
          stroke: new Stroke({ color: "#F68048", width: 6 }),
          fill: new Fill({ color: "rgba(246,128,72,0.2)" }),
        }),
        zIndex: 9999,
      });
      highlightLayerRef.current = highlightLayer;

      const popup = new Overlay({ element: popupEl, offset: [0, -10] });

      const map = new Map({
        target: mapEl,
        layers: [new TileLayer({ source: new OSM() }), vectorLayer, highlightLayer],
        overlays: [popup],
        view: new View({ center: fromLonLat([120.0, -1.4]), zoom: 7 }),
      });
      mapInstance.current = map;

      const extent = source.getExtent();
      if (extent) {
        map.getView().fit(extent, { size: map.getSize(), padding: [50, 50, 50, 50], duration: 1000 });
      }

      map.on("pointermove", (evt) => {
        if (evt.dragging) return;
        const feat = map.forEachFeatureAtPixel(map.getEventPixel(evt.originalEvent), (f) => f);
        (map.getTargetElement() as HTMLElement).style.cursor = feat ? "pointer" : "";
        if (feat) {
          popupContent.innerHTML = `<div style="text-align:center;font-size:12px;color:#153893"><strong>${feat.get("nama")}</strong></div>`;
          popup.setPosition(evt.coordinate);
          popupEl.style.display = "block";
        } else {
          popupEl.style.display = "none";
        }
      });

      map.on("singleclick", (evt) => {
        highlightSrc.clear();
        map.forEachFeatureAtPixel(evt.pixel, (feat) => {
          highlightSrc.addFeature(feat as Feature);
          const namaGeo: string = feat.get("nama") ?? "";
          const apiEntry = (map as MapWithData)._dataWilayah?.find(
            (d) => normalizeNama(d.namaKabupaten) === namaGeo
          );
          const entry = apiEntry
            ? { ...apiEntry, namaDisplay: namaGeo }
            : {
                namaKabupaten: namaGeo,
                namaDisplay: namaGeo,
                totalPenerima: 0,
                totalRealisasi: "Rp 0",
                persentaseTotal: 0,
                persentaseTotalString: "0%",
                detailProgram: NAMA_PROG.map((namaProgram) => ({
                  namaProgram, totalPenerima: 0, anggaran: "-",
                  totalRealisasi: "Rp 0", persentase: 0, persentaseString: "0%",
                })),
              };
          setSelected(entry);
          setBottomSheetOpen(true);
          setMobileTab("detail");
          const geom = feat.getGeometry();
          if (geom) map.getView().fit(geom.getExtent(), { padding: [100, 100, 100, 100], duration: 1000 });
        });
      });
    })();
  }, [geoData]);

  useEffect(() => {
    if (mapInstance.current) (mapInstance.current as MapWithData)._dataWilayah = dataWilayah;
  }, [dataWilayah]);

  // ─── Actions ──────────────────────────────────────────────────────────────
  const focusWilayahFromList = useCallback((w: MonitoringWilayah) => {
    if (!mapInstance.current || !layerRef.current || !highlightLayerRef.current) return;
    const namaGeo = normalizeNama(w.namaKabupaten);
    const src = layerRef.current.getSource();
    const hlSrc = highlightLayerRef.current.getSource();
    if (!src || !hlSrc) return;
    hlSrc.clear();
    src.getFeatures().forEach((feat) => {
      if (feat.get("nama") === namaGeo) {
        hlSrc.addFeature(feat);
        const geom = feat.getGeometry();
        if (geom) mapInstance.current!.getView().fit(geom.getExtent(), { padding: [100, 100, 100, 100], duration: 1000 });
      }
    });
    setSelected({ ...w, namaDisplay: namaGeo });
    setBottomSheetOpen(true);
    setMobileTab("detail");
  }, []);

  const resetDashboard = useCallback(() => {
    setSelected(null);
    setBottomSheetOpen(false);
    highlightLayerRef.current?.getSource()?.clear();
    if (mapInstance.current && layerRef.current) {
      const extent = layerRef.current.getSource()?.getExtent();
      if (extent) mapInstance.current.getView().fit(extent, { padding: [50, 50, 50, 50], duration: 800 });
    }
  }, []);

  const formatColor = (v: number) => (v > 70 ? "#2ecc71" : v > 40 ? "#f1c40f" : "#e74c3c");

  // ─── Render helpers ───────────────────────────────────────────────────────
  const renderDetail = () =>
    !selected ? (
      <div className="text-center mt-8">
        <img src="/images/logo_sulteng.png" className="w-36 mx-auto mb-4" />
        <h2 className="text-[#153893] font-bold text-xl">SULAWESI TENGAH</h2>
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
          <h2 className="text-[#153893] font-bold text-lg uppercase">{selected.namaDisplay}</h2>
          <p className="text-sm text-gray-500 mt-1">
            Total Penerima: <span className="font-bold text-[#153893]">{selected.totalPenerima}</span>
          </p>
          <p className="text-sm text-gray-500">
            Total Realisasi: <span className="font-bold text-[#153893]">{selected.totalRealisasi}</span>
          </p>
        </div>
        {selected.detailProgram.map((prog, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
            <div className="flex justify-between mb-1">
              <span className="text-[#153893] font-bold text-sm">{prog.namaProgram}</span>
              <span className="text-[#153893] font-bold text-sm">{prog.persentaseString}</span>
            </div>
            <p className="text-xs text-gray-400 mb-2">{prog.totalPenerima} penerima · {prog.totalRealisasi}</p>
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
    );

  const renderList = () =>
    !dataWilayah.length ? (
      <p className="text-center text-gray-400 text-sm mt-4">Memuat data...</p>
    ) : (
      <>
        {dataWilayah.map((w, idx) => (
          <div
            key={idx}
            onClick={() => focusWilayahFromList(w)}
            className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all border border-transparent hover:border-[#245CCE]"
          >
            <div className="flex justify-between mb-1">
              <span className="text-[#153893] font-bold text-xs uppercase">{w.namaKabupaten}</span>
              <span className="text-[#153893] font-bold text-xs">{w.persentaseTotal?.toFixed(3) ?? "0.000"}%</span>
            </div>
            <p className="text-xs text-gray-400 mb-2">{w.totalRealisasi}</p>
            <div className="bg-gray-100 h-2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-[#153893] transition-all"
                style={{ width: `${Math.min(w.persentaseTotal, 100)}%`, minWidth: w.persentaseTotal > 0 ? "4px" : "0" }}
              />
            </div>
          </div>
        ))}
      </>
    );

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <>
      {/* ── DESKTOP (md+) ─────────────────────────────────────────────────── */}
      {!isMobile && (
        <div className="flex gap-6 h-[85vh]">
          {/* Map slot — mapEl gets appended here via slotCallbackRef */}
          <div
            ref={slotCallbackRef}
            className="flex-[1.5] rounded-3xl overflow-hidden relative bg-white shadow"
          />

          {/* Detail panel */}
          <div className="flex-1 bg-white/30 rounded-3xl p-6 overflow-y-auto flex flex-col">
            {renderDetail()}
          </div>

          {/* Wilayah list */}
          <div className="flex-1 bg-white/30 rounded-3xl p-4 flex flex-col">
            <h3 className="text-[#153893] font-bold text-center text-lg mb-4 tracking-wider">
              DAFTAR WILAYAH
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 px-2">{renderList()}</div>
          </div>
        </div>
      )}

      {/* ── MOBILE (<md) ──────────────────────────────────────────────────── */}
      {isMobile && (
        <div className="flex flex-col h-[100dvh] relative overflow-hidden">
          <div className="flex-1 relative bg-white">
            {/* Map slot */}
            <div ref={slotCallbackRef} className="w-full h-full" />

            {/* Floating header */}
            <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2 shadow flex items-center gap-2 pointer-events-auto">
                <img src="/images/logo_sulteng.png" className="h-7 w-7 object-contain" />
                <span className="text-[#153893] font-bold text-sm tracking-wide">SIMONEVA</span>
              </div>
              <button
                onClick={() => setBottomSheetOpen((v) => !v)}
                className="bg-[#153893] text-white text-xs font-bold px-4 py-2 rounded-2xl shadow active:scale-95 transition-transform pointer-events-auto"
              >
                {bottomSheetOpen ? "TUTUP" : "DAFTAR WILAYAH"}
              </button>
            </div>
          </div>

          {/* Bottom sheet */}
          <div
            className="absolute left-0 right-0 bottom-0 bg-white rounded-t-3xl shadow-2xl z-20 flex flex-col transition-transform duration-500 ease-in-out"
            style={{ transform: bottomSheetOpen ? "translateY(0)" : "translateY(100%)", maxHeight: "72dvh" }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>
            <div className="flex border-b border-gray-100 mx-4 mb-2">
              {(["detail", "list"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setMobileTab(tab)}
                  className={`flex-1 py-2 text-sm font-bold transition-colors ${
                    mobileTab === tab ? "text-[#153893] border-b-2 border-[#153893]" : "text-gray-400"
                  }`}
                >
                  {tab === "detail" ? "DETAIL WILAYAH" : "DAFTAR WILAYAH"}
                </button>
              ))}
            </div>
            <div className="overflow-y-auto flex-1 px-4 pb-6">
              {mobileTab === "detail" ? renderDetail() : <div className="space-y-3">{renderList()}</div>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}