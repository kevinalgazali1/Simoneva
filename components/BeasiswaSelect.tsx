'use client'

import { Listbox, Transition } from '@headlessui/react'
import { ChevronDown, Check } from 'lucide-react'
import { Fragment } from 'react'

interface BeasiswaOption {
  kategori: string
  items: { value: string; label: string }[]
}

interface BeasiswaSelectProps {
  value?: string
  onChange?: (value: string) => void
}

const jalurBeasiswa: BeasiswaOption[] = [
  {
    kategori: 'Mahasiswa Baru',
    items: [
      { value: 'Mahasiswa Baru Jalur Afirmasi', label: 'Jalur Afirmasi' },
      { value: 'Mahasiswa Baru Jalur prestasi Nonakademik', label: 'Jalur Prestasi Nonakademik' },
      { value: 'Mahasiswa Baru Jalur Seleksi Nasional Berbasiskan Prestasi (SNBP)', label: 'SNBP' },
      { value: 'Mahasiswa Baru Jalur Seleksi Nasional Berbasiskan Tes (SNBT)', label: 'SNBT' },
    ]
  },
  {
    kategori: 'Mahasiswa Aktif',
    items: [
      { value: 'Mahasiswa Aktif Jalur Prestasi Akademik', label: 'Jalur Prestasi Akademik' },
      { value: 'Mahasiswa Aktif Jalur Afirmasi', label: 'Jalur Afirmasi' },
      { value: 'Mahasiswa Aktif Jalur Prestasi Nonakademik', label: 'Jalur Prestasi Nonakademik' },
    ]
  },
  {
    kategori: 'Lainnya',
    items: [
      { value: 'Guru serta ASN', label: 'Guru serta ASN' },
      { value: 'Pendidikan Profesi (Keahlian)', label: 'Pendidikan Profesi (Keahlian)' },
    ]
  }
]

export default function BeasiswaSelect({ value = '', onChange }: BeasiswaSelectProps) {

  const getSelectedLabel = () => {
    for (const group of jalurBeasiswa) {
      const found = group.items.find(item => item.value === value)
      if (found) return found.label
    }
    return ''
  }

  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <Listbox.Button className="w-full border border-gray-300 px-4 py-2.5 pr-10 rounded-xl bg-white text-left">
          <span className={value ? 'text-black' : 'text-gray-400'}>
            {value ? getSelectedLabel() : 'Pilih jalur beasiswa'}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-3">
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </span>
        </Listbox.Button>

        <Transition as={Fragment}>
          <Listbox.Options className="absolute z-10 mt-2 w-full bg-white border rounded-xl shadow-lg max-h-80 overflow-auto py-2">
            {jalurBeasiswa.map((group, i) => (
              <div key={i}>
                <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">
                  {group.kategori}
                </div>

                {group.items.map((item, j) => (
                  <Listbox.Option
                    key={j}
                    value={item.value}
                    className={({ active }) =>
                      `cursor-pointer py-2.5 pl-10 pr-4 ${
                        active ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                      }`
                    }
                  >
                    {({ selected }) => (
                      <>
                        <span className={selected ? 'font-semibold' : ''}>
                          {item.label}
                        </span>

                        {selected && (
                          <span className="absolute left-3">
                            <Check className="w-5 h-5 text-blue-600" />
                          </span>
                        )}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </div>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  )
}
