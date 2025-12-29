import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️  Mevcut veriler temizleniyor...')
  
  // Tüm verileri sil (cascade ile otomatik silinecek, sıra önemli)
  await prisma.satinAlmaTeklif.deleteMany()
  await prisma.satinAlma.deleteMany()
  await prisma.uretimPlanlamaAdimi.deleteMany()
  await prisma.sozlesme.deleteMany()
  await prisma.uretimGelisme.deleteMany()
  await prisma.urunGideri.deleteMany()
  await prisma.makinaAtama.deleteMany()
  await prisma.uretim.deleteMany()
  await prisma.planlama.deleteMany()
  await prisma.teklifUrun.deleteMany()
  await prisma.teklif.deleteMany()
  await prisma.duzenlemeGecmisi.deleteMany()
  await prisma.makinaBilesen.deleteMany()
  await prisma.makina.deleteMany()
  await prisma.yetkiliKisi.deleteMany()
  await prisma.firma.deleteMany()
  await prisma.user.deleteMany()

  console.log('✅ Veriler temizlendi\n')

  // Kullanıcılar oluştur
  console.log('👥 Kullanıcılar oluşturuluyor...')
  const hashedPassword = await bcrypt.hash('mls123', 10)

  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      password: hashedPassword,
      adSoyad: 'Admin Kullanıcı',
      yetki: 'Yönetici',
    },
  })

  const kullanicilar = [
    { username: 'enes', adSoyad: 'Enes Salkan', yetki: 'Kullanıcı' },
    { username: 'levent', adSoyad: 'Levent Yılmaz', yetki: 'Kullanıcı' },
    { username: 'omer', adSoyad: 'Ömer Demir', yetki: 'Kullanıcı' },
    { username: 'meryem', adSoyad: 'Meryem Kaya', yetki: 'Kullanıcı' },
  ]

  const olusturulanKullanicilar = [admin]
  for (const kullaniciData of kullanicilar) {
    const kullanici = await prisma.user.create({
      data: {
        ...kullaniciData,
        password: hashedPassword,
      },
    })
    olusturulanKullanicilar.push(kullanici)
  }
  console.log(`✅ ${olusturulanKullanicilar.length} kullanıcı oluşturuldu\n`)

  // Firmalar oluştur
  console.log('🏢 Firmalar oluşturuluyor...')
  const firmalar = [
    {
      ad: 'ABC Makina Sanayi A.Ş.',
      telefon: '0212 555 10 01',
      email: 'info@abcmakina.com',
      adres: 'İstanbul, Organize Sanayi Bölgesi',
    },
    {
      ad: 'XYZ Endüstri Makinaları Ltd.',
      telefon: '0312 555 20 02',
      email: 'satis@xyzendustri.com',
      adres: 'Ankara, Ostim Sanayi Sitesi',
    },
    {
      ad: 'Delta Otomasyon Sistemleri',
      telefon: '0232 555 30 03',
      email: 'info@deltaotomasyon.com',
      adres: 'İzmir, Çiğli Organize Sanayi',
    },
    {
      ad: 'Gama Metal İşleme Makinaları',
      telefon: '0216 555 40 04',
      email: 'iletisim@gamametal.com',
      adres: 'İstanbul, Gebze Sanayi Bölgesi',
    },
  ]

  const olusturulanFirmalar = []
  for (const firmaData of firmalar) {
    const firma = await prisma.firma.create({ data: firmaData })
    olusturulanFirmalar.push(firma)
  }
  console.log(`✅ ${olusturulanFirmalar.length} firma oluşturuldu\n`)

  // Makinalar oluştur
  console.log('⚙️  Makinalar oluşturuluyor...')
  const makineler = [
    {
      ad: 'Alüminyum Geri Dönüşüm Hattı',
      model: 'ALG-5000',
      durum: 'Aktif',
      aciklama: 'Tam otomatik alüminyum geri dönüşüm hattı',
      bilesenler: [
        { ad: 'Kırıcı Ünitesi', miktar: 1, birimMaliyet: 45000, paraBirimi: 'EUR' },
        { ad: 'Öğütücü Ünitesi', miktar: 1, birimMaliyet: 55000, paraBirimi: 'EUR' },
        { ad: 'Ergitme Fırını', miktar: 1, birimMaliyet: 85000, paraBirimi: 'EUR' },
      ],
    },
    {
      ad: 'Plastik Geri Dönüşüm Hattı',
      model: 'PLG-3000',
      durum: 'Aktif',
      aciklama: '500 kg/saat kapasiteli plastik geri dönüşüm hattı',
      bilesenler: [
        { ad: 'Yıkama Ünitesi', miktar: 1, birimMaliyet: 28000, paraBirimi: 'EUR' },
        { ad: 'Ekstrüder', miktar: 1, birimMaliyet: 95000, paraBirimi: 'EUR' },
        { ad: 'Granül Kesme', miktar: 1, birimMaliyet: 25000, paraBirimi: 'EUR' },
      ],
    },
    {
      ad: 'ATY Üretim Hattı',
      model: 'ATY-100',
      durum: 'Aktif',
      aciklama: 'Günlük 100 ton kapasiteli ATY üretim hattı',
      bilesenler: [
        { ad: 'Kırma Ünitesi', miktar: 2, birimMaliyet: 35000, paraBirimi: 'EUR' },
        { ad: 'Kurutma Sistemi', miktar: 1, birimMaliyet: 125000, paraBirimi: 'EUR' },
        { ad: 'Peletleme Makinesi', miktar: 1, birimMaliyet: 85000, paraBirimi: 'EUR' },
      ],
    },
  ]

  const olusturulanMakineler = []
  for (const makinaData of makineler) {
    const toplamMaliyet = makinaData.bilesenler.reduce(
      (sum, b) => sum + b.birimMaliyet * b.miktar,
      0
    )
    
    const makina = await prisma.makina.create({
      data: {
        ad: makinaData.ad,
        model: makinaData.model,
        durum: makinaData.durum,
        aciklama: makinaData.aciklama,
        toplamMaliyet: toplamMaliyet,
        makinaBilesenleri: {
          create: makinaData.bilesenler.map((b) => ({
            ad: b.ad,
            miktar: b.miktar,
            birimMaliyet: b.birimMaliyet,
            paraBirimi: b.paraBirimi,
            toplamMaliyet: b.birimMaliyet * b.miktar,
          })),
        },
      },
    })
    olusturulanMakineler.push(makina)
  }
  console.log(`✅ ${olusturulanMakineler.length} makina oluşturuldu\n`)

  // Onaylanmış Teklifler oluştur
  console.log('📋 Onaylanmış teklifler oluşturuluyor...')
  const simdi = new Date()
  const teklifler = [
    {
      ad: 'Alüminyum Geri Dönüşüm Hattı - Proje 1',
      firma: olusturulanFirmalar[0],
      makina: olusturulanMakineler[0],
      toplamFiyat: 1500000,
      teklifTarihi: new Date(2024, 0, 15),
      urunler: [
        {
          urunAdi: 'Alüminyum Geri Dönüşüm Hattı ALG-5000',
          miktar: 1,
          birimFiyat: 1350000,
          toplamFiyat: 1350000,
        },
        { urunAdi: 'Kurulum ve Montaj', miktar: 1, birimFiyat: 80000, toplamFiyat: 80000 },
        { urunAdi: 'Personel Eğitimi', miktar: 1, birimFiyat: 15000, toplamFiyat: 15000 },
        { urunAdi: '1 Yıl Garanti', miktar: 1, birimFiyat: 55000, toplamFiyat: 55000 },
      ],
    },
    {
      ad: 'Plastik Geri Dönüşüm Hattı - Proje 1',
      firma: olusturulanFirmalar[1],
      makina: olusturulanMakineler[1],
      toplamFiyat: 800000,
      teklifTarihi: new Date(2024, 1, 10),
      urunler: [
        {
          urunAdi: 'Plastik Geri Dönüşüm Hattı PLG-3000',
          miktar: 1,
          birimFiyat: 720000,
          toplamFiyat: 720000,
        },
        { urunAdi: 'Kurulum ve Montaj', miktar: 1, birimFiyat: 45000, toplamFiyat: 45000 },
        { urunAdi: 'Yedek Parça Seti', miktar: 1, birimFiyat: 25000, toplamFiyat: 25000 },
        { urunAdi: 'Teknik Destek', miktar: 1, birimFiyat: 10000, toplamFiyat: 10000 },
      ],
    },
    {
      ad: 'ATY Üretim Hattı - Proje 1',
      firma: olusturulanFirmalar[2],
      makina: olusturulanMakineler[2],
      toplamFiyat: 2000000,
      teklifTarihi: new Date(2024, 2, 5),
      urunler: [
        {
          urunAdi: 'ATY Üretim Hattı ATY-100',
          miktar: 1,
          birimFiyat: 1800000,
          toplamFiyat: 1800000,
        },
        { urunAdi: 'Kurulum ve Montaj', miktar: 1, birimFiyat: 120000, toplamFiyat: 120000 },
        { urunAdi: 'Operasyonel Eğitim', miktar: 1, birimFiyat: 35000, toplamFiyat: 35000 },
        { urunAdi: 'Bakım Hizmetleri', miktar: 1, birimFiyat: 45000, toplamFiyat: 45000 },
      ],
    },
  ]

  const olusturulanTeklifler = []
  for (const teklifData of teklifler) {
    const teklif = await prisma.teklif.create({
      data: {
        ad: teklifData.ad,
        firmaId: teklifData.firma.id,
        userId: admin.id,
        makinaId: teklifData.makina.id,
        durum: 2, // Onaylanan
        toplamFiyat: teklifData.toplamFiyat,
        teklifTarihi: teklifData.teklifTarihi,
        teklifUrunler: {
          create: teklifData.urunler,
        },
      },
    })
    olusturulanTeklifler.push(teklif)
  }
  console.log(`✅ ${olusturulanTeklifler.length} onaylanmış teklif oluşturuldu\n`)

  // Sözleşmeler oluştur (onaylanmış teklifler için)
  console.log('📄 Sözleşmeler oluşturuluyor...')
  const sozlesmeler = []
  for (let i = 0; i < olusturulanTeklifler.length; i++) {
    const teklif = olusturulanTeklifler[i]
    const sozlesme = await prisma.sozlesme.create({
      data: {
        teklifId: teklif.id,
        dosyaUrl: `/uploads/sozlesme-${teklif.id}.pdf`,
        notlar: `${teklif.ad} için imzalanan sözleşme. Teslim süresi: ${60 + i * 15} gün.`,
      },
    })
    sozlesmeler.push(sozlesme)
  }
  console.log(`✅ ${sozlesmeler.length} sözleşme oluşturuldu\n`)

  // Üretimler oluştur (onaylanmış teklifler için)
  console.log('🏭 Üretimler oluşturuluyor...')
  const uretimler = []
  for (let i = 0; i < olusturulanTeklifler.length; i++) {
    const teklif = olusturulanTeklifler[i]
    const uretim = await prisma.uretim.create({
      data: {
        teklifId: teklif.id,
        userId: olusturulanKullanicilar[i % olusturulanKullanicilar.length].id,
        durum: i === 0 ? 'Üretimde' : i === 1 ? 'Son Kontrol' : 'Onaylandı',
        baslangicTarihi: new Date(teklif.teklifTarihi || teklif.createdAt),
        aciklama: `${teklif.ad} üretim süreci başlatıldı.`,
      },
    })
    uretimler.push(uretim)
  }
  console.log(`✅ ${uretimler.length} üretim oluşturuldu\n`)

  // Üretim Planlama Adımları oluştur
  console.log('📅 Üretim planlama adımları oluşturuluyor...')
  const planlamaAdimlari = []
  const adimIsimleri = [
    'Tasarım ve Mühendislik',
    'Malzeme Temini',
    'Üretim ve Montaj',
    'Kalite Kontrol',
    'Test ve Devreye Alma',
  ]

  for (let i = 0; i < uretimler.length; i++) {
    const uretim = uretimler[i]
    const teklif = olusturulanTeklifler[i]
    const baslangicTarihi = new Date(uretim.baslangicTarihi)

    for (let j = 0; j < adimIsimleri.length; j++) {
      const adimBaslangic = new Date(baslangicTarihi)
      adimBaslangic.setDate(adimBaslangic.getDate() + j * 10)

      const adimBitis = new Date(adimBaslangic)
      adimBitis.setDate(adimBitis.getDate() + 8)

      const durumlar = ['Planlandı', 'Başladı', 'Tamamlandı']
      const durum = j < 2 ? durumlar[1] : j < 4 ? durumlar[0] : durumlar[2]

      const adim = await prisma.uretimPlanlamaAdimi.create({
          data: {
            teklifId: teklif.id,
          adimAdi: adimIsimleri[j],
          siraNo: j + 1,
          kullaniciId:
            olusturulanKullanicilar[(i + j) % olusturulanKullanicilar.length].id,
          makinaId: teklif.makinaId,
          baslangicTarihi: adimBaslangic,
          bitisTarihi: adimBitis,
          isMaliyeti: (teklif.toplamFiyat * 0.15) / adimIsimleri.length,
          durum: durum,
          aciklama: `${adimIsimleri[j]} adımı için planlama.`,
        },
      })
      planlamaAdimlari.push(adim)
    }
  }
  console.log(`✅ ${planlamaAdimlari.length} planlama adımı oluşturuldu\n`)

  // Satın Almalar oluştur (planlama adımları için)
  console.log('🛒 Satın almalar oluşturuluyor...')
  const satinAlmalar = []
  const urunler = [
    'Alüminyum Levha',
    'Çelik Profil',
    'Elektrik Motoru',
    'Hidrolik Silindir',
    'PLC Kontrol Ünitesi',
    'Sensör Seti',
    'Konveyör Bant',
    'Kırıcı Çeneleri',
  ]

  for (let i = 0; i < planlamaAdimlari.length; i++) {
    const adim = planlamaAdimlari[i]
    const uretim = uretimler.find((u) => u.teklifId === adim.teklifId)!

    // Her adım için 1-2 satın alma oluştur
    const satinAlmaSayisi = i % 2 === 0 ? 1 : 2

    for (let j = 0; j < satinAlmaSayisi; j++) {
      const urunAdi = urunler[(i + j) % urunler.length]
      const miktar = Math.floor(Math.random() * 50) + 10
      const birimFiyat = Math.floor(Math.random() * 500) + 100
      const toplamFiyat = miktar * birimFiyat

      const satinAlma = await prisma.satinAlma.create({
          data: {
          uretimId: uretim.id,
          uretimPlanlamaAdimiId: adim.id,
          urunAdi: urunAdi,
          miktar: miktar,
          birim: 'Adet',
          birimFiyat: birimFiyat,
          toplamFiyat: toplamFiyat,
          tedarikciFirma: `Tedarikçi ${String.fromCharCode(65 + (i % 4))}`,
          tedarikciIletisim: `0555 ${100 + i} ${2000 + j}`,
          durum: j === 0 ? 'Sipariş Verildi' : 'Planlandı',
          siparisTarihi: j === 0 ? new Date(adim.baslangicTarihi) : null,
          aciklama: `${urunAdi} için satın alma kaydı.`,
        },
      })
      satinAlmalar.push(satinAlma)
    }
  }
  console.log(`✅ ${satinAlmalar.length} satın alma oluşturuldu\n`)

  // Satın Alma Teklifleri oluştur
  console.log('📝 Satın alma teklifleri oluşturuluyor...')
  const tedarikciIsimleri = [
    'Metal A.Ş.',
    'Endüstri Malzemeleri Ltd.',
    'Otomasyon Parçaları',
    'Sanayi Tedarik',
    'Makina Yedek Parça',
  ]

  let toplamTeklif = 0
  for (const satinAlma of satinAlmalar) {
    // Her satın alma için 2-3 teklif oluştur
    const teklifSayisi = Math.floor(Math.random() * 2) + 2

    for (let i = 0; i < teklifSayisi; i++) {
      const tedarikciAdi = tedarikciIsimleri[i % tedarikciIsimleri.length]
      const birimFiyat = satinAlma.birimFiyat * (0.9 + Math.random() * 0.2) // %10 farklılık
      const toplamFiyat = satinAlma.miktar * birimFiyat
      const teslimSuresi = Math.floor(Math.random() * 20) + 10

      await prisma.satinAlmaTeklif.create({
        data: {
          satinAlmaId: satinAlma.id,
          tedarikciAdi: tedarikciAdi,
          teklifNo: `TEK-${satinAlma.id.substring(0, 6)}-${i + 1}`,
          birimFiyat: birimFiyat,
          toplamFiyat: toplamFiyat,
          teslimSuresi: teslimSuresi,
          odemeKosullari: i === 0 ? '%30 peşin, %70 teslimatta' : '%50 peşin, %50 teslimatta',
          durum: i === 0 ? 'Seçildi' : 'Beklemede',
          aciklama: `${satinAlma.urunAdi} için ${tedarikciAdi} teklifi.`,
        },
      })
      toplamTeklif++
    }
  }
  console.log(`✅ ${toplamTeklif} satın alma teklifi oluşturuldu\n`)

  // Genel Giderler oluştur
  console.log('💰 Genel giderler oluşturuluyor...')
  const genelGiderler = [
    {
      urunAdi: 'Personel Maaşları',
      miktar: 1,
      birim: 'Aylık',
      birimFiyat: 800000,
      toplamFiyat: 800000,
      tedarikciFirma: 'İnsan Kaynakları',
      tedarikciIletisim: '0212 555 0001',
      durum: 'Sipariş Verildi',
      aciklama: 'Aylık personel maaşları',
      teslimTarihi: new Date(new Date().setDate(new Date().getDate() + 3)), // 3 gün sonra
    },
    {
      urunAdi: 'Elektrik',
      miktar: 1,
      birim: 'Aylık',
      birimFiyat: 300000,
      toplamFiyat: 300000,
      tedarikciFirma: 'Elektrik Dağıtım Şirketi',
      tedarikciIletisim: '0212 555 0002',
      durum: 'Sipariş Verildi',
      aciklama: 'Aylık elektrik faturası',
      teslimTarihi: new Date(new Date().setDate(new Date().getDate() + 10)), // 10 gün sonra
    },
    {
      urunAdi: 'Su',
      miktar: 1,
      birim: 'Aylık',
      birimFiyat: 25000,
      toplamFiyat: 25000,
      tedarikciFirma: 'Su İdaresi',
      tedarikciIletisim: '0212 555 0003',
      durum: 'Sipariş Verildi',
      aciklama: 'Aylık su faturası',
      teslimTarihi: new Date(new Date().setDate(new Date().getDate() + 12)), // 12 gün sonra
    },
    {
      urunAdi: 'Doğalgaz',
      miktar: 1,
      birim: 'Aylık',
      birimFiyat: 50000,
      toplamFiyat: 50000,
      tedarikciFirma: 'Doğalgaz Dağıtım Şirketi',
      tedarikciIletisim: '0212 555 0004',
      durum: 'Sipariş Verildi',
      aciklama: 'Aylık doğalgaz faturası',
      teslimTarihi: new Date(new Date().setDate(new Date().getDate() + 15)), // 15 gün sonra
    },
    {
      urunAdi: 'Yemek',
      miktar: 1,
      birim: 'Aylık',
      birimFiyat: 60000,
      toplamFiyat: 60000,
      tedarikciFirma: 'Yemek Firması',
      tedarikciIletisim: '0555 123 4567',
      durum: 'Sipariş Verildi',
      aciklama: 'Aylık yemek gideri',
      teslimTarihi: new Date(new Date().setDate(new Date().getDate() + 5)), // 5 gün sonra
    },
    {
      urunAdi: 'Kira',
      miktar: 1,
      birim: 'Aylık',
      birimFiyat: 300000,
      toplamFiyat: 300000,
      tedarikciFirma: 'Gayrimenkul Yönetimi',
      tedarikciIletisim: '0212 555 1234',
      durum: 'Sipariş Verildi',
      aciklama: 'Aylık ofis kirası',
      teslimTarihi: new Date(new Date().setDate(new Date().getDate() + 7)), // 7 gün sonra
    },
  ]

  const olusturulanGenelGiderler = []
  for (const gider of genelGiderler) {
    // Tekrarlayan giderler için sonraki tekrar tarihini hesapla
    let sonrakiTekrarTarihi: Date | null = null
    if (gider.teslimTarihi) {
      sonrakiTekrarTarihi = new Date(gider.teslimTarihi)
      // Aylık tekrarlama varsayıyoruz
      sonrakiTekrarTarihi.setMonth(sonrakiTekrarTarihi.getMonth() + 1)
    }

    const genelGider = await prisma.satinAlma.create({
      data: {
        genelGider: true,
        tekrarlayanMi: true, // Tüm genel giderler tekrarlayan
        tekrarlamaSuresi: 'Aylık',
        sonrakiTekrarTarihi: sonrakiTekrarTarihi,
        urunAdi: gider.urunAdi,
        miktar: gider.miktar,
        birim: gider.birim,
        birimFiyat: gider.birimFiyat,
        toplamFiyat: gider.toplamFiyat,
        tedarikciFirma: gider.tedarikciFirma,
        tedarikciIletisim: gider.tedarikciIletisim,
        durum: gider.durum,
        siparisTarihi: new Date(),
        teslimTarihi: gider.teslimTarihi,
        aciklama: gider.aciklama,
      },
    })
    olusturulanGenelGiderler.push(genelGider)
  }
  console.log(`✅ ${olusturulanGenelGiderler.length} genel gider oluşturuldu\n`)

  console.log('✨ Tüm veriler başarıyla oluşturuldu!')
  console.log('\n📊 Özet:')
  console.log(`   👥 Kullanıcılar: ${olusturulanKullanicilar.length}`)
  console.log(`   🏢 Firmalar: ${olusturulanFirmalar.length}`)
  console.log(`   ⚙️  Makinalar: ${olusturulanMakineler.length}`)
  console.log(`   📋 Teklifler: ${olusturulanTeklifler.length}`)
  console.log(`   📄 Sözleşmeler: ${sozlesmeler.length}`)
  console.log(`   🏭 Üretimler: ${uretimler.length}`)
  console.log(`   📅 Planlama Adımları: ${planlamaAdimlari.length}`)
  console.log(`   🛒 Satın Almalar: ${satinAlmalar.length}`)
  console.log(`   💰 Genel Giderler: ${olusturulanGenelGiderler.length}`)
  console.log(`   📝 Satın Alma Teklifleri: ${toplamTeklif}`)
  console.log('\n🔑 Giriş Bilgileri:')
  console.log('   Kullanıcı Adı: admin')
  console.log('   Şifre: mls123')
}

main()
  .catch((e) => {
    console.error('❌ Hata:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
