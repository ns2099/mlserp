'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Home,
  Building2,
  FileText,
  Factory,
  Users,
  Settings,
  Wrench,
  LogOut,
  Menu,
  X,
  ShoppingCart,
  FileCheck,
  FolderKanban,
  DollarSign,
} from 'lucide-react'
import { useState } from 'react'

const menuItems = [
  { href: '/', icon: Home, label: 'Anasayfa' },
  {
    href: '#',
    icon: FolderKanban,
    label: 'Projeler',
    children: [
      { href: '/projeler', label: 'Tüm Projeler' },
    ],
  },
  {
    href: '#',
    icon: Wrench,
    label: 'Makina',
    children: [
      { href: '/makina/olustur', label: 'Makina Ekle' },
      { href: '/makina/liste', label: 'Makinaları Gör' },
      { href: '/makina/atama', label: 'Makina Ataması' },
    ],
  },
  {
    href: '#',
    icon: Building2,
    label: 'Firma',
    children: [
      { href: '/firma/olustur', label: 'Firma Oluştur' },
      { href: '/firma/liste', label: 'Firmaları Gör' },
    ],
  },
  {
    href: '#',
    icon: FileText,
    label: 'Teklif',
    children: [
      { href: '/teklif/olustur', label: 'Teklif Oluştur' },
      { href: '/teklif/liste?durum=tum', label: 'Tüm Teklifler' },
      { href: '/teklif/liste?durum=1', label: 'Bekleyen Teklifler' },
      { href: '/teklif/liste?durum=2', label: 'Onaylanan Teklifler' },
      { href: '/teklif/liste?durum=3', label: 'Reddedilen Teklifler' },
      { href: '/teklif/liste?durum=4', label: 'Tamamlanan Teklifler' },
    ],
  },
  {
    href: '#',
    icon: FileCheck,
    label: 'Sözleşmeler',
    children: [
      { href: '/sozlesme/olustur', label: 'Sözleşme Oluştur' },
      { href: '/sozlesme/liste', label: 'Sözleşme Listesi' },
    ],
  },
  {
    href: '#',
    icon: Factory,
    label: 'Üretim',
    children: [
      { href: '/uretim-planlama/olustur', label: 'Üretim Planlama' },
      { href: '/uretim/devam-eden', label: 'Üretimi Devam Edenler' },
      { href: '/uretim/tamamlanan', label: 'Üretimi Tamamlananlar' },
      { href: '/uretim-planlama/liste', label: 'Planlama Listesi' },
    ],
  },
  {
    href: '#',
    icon: ShoppingCart,
    label: 'Satın Alma',
    children: [
      { href: '/satin-alma/olustur', label: 'Satın Alma Oluştur' },
      { href: '/satin-alma/liste', label: 'Satın Alma Listesi' },
    ],
  },
  {
    href: '#',
    icon: DollarSign,
    label: 'Finans & Nakit Akışı',
    children: [
      { href: '/finans', label: 'Finansal Özet' },
      { href: '/finans/projeler', label: 'Proje Bazlı Planlama' },
      { href: '/finans/genel-giderler', label: 'Genel Giderler' },
      { href: '/finans/yaklasan-odemeler', label: 'Yaklaşan Ödemeler' },
    ],
  },
  {
    href: '#',
    icon: Users,
    label: 'Kullanıcı',
    children: [
      { href: '/kullanici/olustur', label: 'Kullanıcı Oluştur' },
      { href: '/kullanici/liste', label: 'Kullanıcıları Gör' },
    ],
  },
  { href: '/ayarlar', icon: Settings, label: 'Ayarlar' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    )
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/' || pathname === '/dashboard'
    return pathname?.startsWith(href)
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-gray-900 text-white z-40 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3 mb-3">
              <Image
                src="/mlsmakina.png"
                alt="MLS MAKİNA Logo"
                width={40}
                height={40}
                className="object-contain"
                style={{ width: 'auto', height: 'auto' }}
              />
            <div>
              <h1 className="text-xl font-bold">MLS Makina</h1>
              <p className="text-xs text-gray-400">Ürün Yönetim Sistemi</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-120px)]">
          {menuItems.map((item) => {
            const Icon = item.icon
            const hasChildren = item.children && item.children.length > 0
            const isExpanded = expandedItems.includes(item.label)

            if (hasChildren) {
              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleExpand(item.label)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive(item.href) || isExpanded
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="flex-1 text-left">{item.label}</span>
                    <span className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                      ›
                    </span>
                  </button>
                  {isExpanded && (
                    <div className="ml-4 mt-2 space-y-1">
                      {item.children!.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setIsOpen(false)}
                          className={`block px-4 py-2 rounded-lg transition-colors ${
                            isActive(child.href)
                              ? 'bg-blue-700 text-white'
                              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' })
              window.location.href = '/login'
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
          >
            <LogOut size={20} />
            <span>Çıkış</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}

