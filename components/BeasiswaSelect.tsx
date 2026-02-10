'use client'

import { Listbox, Transition } from '@headlessui/react'
import { ChevronDown, Check } from 'lucide-react'
import { Fragment, useState } from 'react'

interface BeasiswaOption {
  kategori: string
  items: { value: string; label: string }[]
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

export default function BeasiswaSelect() {
  const [selected, setSelected] = useState<string>('')

  const getSelectedLabel = () => {
    for (const group of jalurBeasiswa) {
      const found = group.items.find(item => item.value === selected)
      if (found) return found.label
    }
    return ''
  }

  return (
    <Listbox value={selected} onChange={setSelected}>
      <div className="relative">
        <Listbox.Button className="w-full border border-gray-300 px-4 py-2.5 pr-10 
          rounded-xl bg-white text-left
          hover:border-[#245CCE] transition-all
          focus:outline-none focus:ring-2 focus:ring-[#245CCE]/40">
          <span className={selected ? 'text-black' : 'text-gray-400'}>
            {selected ? getSelectedLabel() : 'Pilih jalur beasiswa'}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </span>
        </Listbox.Button>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-10 mt-2 w-full bg-white
            border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-auto
            focus:outline-none py-2">
            
            {jalurBeasiswa.map((group, groupIdx) => (
              <div key={groupIdx}>
                {/* Category Header */}
                <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wide">
                  {group.kategori}
                </div>

                {/* Items */}
                {group.items.map((item, itemIdx) => (
                  <Listbox.Option
                    key={itemIdx}
                    value={item.value}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2.5 pl-10 pr-4 transition-colors
                      ${active ? 'bg-[#245CCE]/10 text-[#245CCE]' : 'text-gray-900'}`
                    }
                  >
                    {({ selected }) => (
                      <>
                        <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                          {item.label}
                        </span>
                        {selected && (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#245CCE]">
                            <Check className="w-5 h-5" />
                          </span>
                        )}
                      </>
                    )}
                  </Listbox.Option>
                ))}

                {/* Divider */}
                {groupIdx < jalurBeasiswa.length - 1 && (
                  <div className="my-2 border-t border-gray-200" />
                )}
              </div>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  )
}