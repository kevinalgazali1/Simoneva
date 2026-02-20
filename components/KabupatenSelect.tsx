"use client";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const wilayahSulteng = [
  "Palu",
  "Banggai",
  "Banggai Kepulauan",
  "Banggai Laut",
  "Buol",
  "Donggala",
  "Morowali",
  "Morowali Utara",
  "Parigi Moutong",
  "Poso",
  "Sigi",
  "Tojo Una-Una",
  "Toli-Toli",
];

export default function KabupatenSelect({ value, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full sm:w-65 mb-4 rounded-xl border-2 border-blue-600
      bg-white px-4 py-2.5 text-sm font-semibold text-[#245CCE]
      shadow-md outline-none focus:ring-2 focus:ring-blue-300"
    >
      <option value="">Semua Wilayah</option>

      {wilayahSulteng.map((item, i) => (
        <option key={i} value={item}>
          {item}
        </option>
      ))}
    </select>
  );
}