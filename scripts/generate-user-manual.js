const { jsPDF } = require('jspdf')
require('jspdf-autotable')

const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4'
})

let yPosition = 20
const pageWidth = doc.internal.pageSize.getWidth()
const pageHeight = doc.internal.pageSize.getHeight()
const margin = 20
const contentWidth = pageWidth - (margin * 2)
const lineHeight = 7
const sectionSpacing = 10

// Helper function to add new page if needed
function checkPageBreak(requiredSpace = 20) {
  if (yPosition + requiredSpace > pageHeight - margin) {
    doc.addPage()
    yPosition = 20
  }
}

// Helper function to add title
function addTitle(text, fontSize = 18) {
  checkPageBreak(15)
  doc.setFontSize(fontSize)
  doc.setFont('helvetica', 'bold')
  doc.text(text, margin, yPosition)
  yPosition += fontSize / 2 + 5
}

// Helper function to add subtitle
function addSubtitle(text, fontSize = 14) {
  checkPageBreak(12)
  yPosition += 3
  doc.setFontSize(fontSize)
  doc.setFont('helvetica', 'bold')
  doc.text(text, margin, yPosition)
  yPosition += fontSize / 2 + 3
}

// Helper function to add text
function addText(text, fontSize = 11, isBold = false) {
  checkPageBreak(10)
  doc.setFontSize(fontSize)
  doc.setFont('helvetica', isBold ? 'bold' : 'normal')
  
  const lines = doc.splitTextToSize(text, contentWidth)
  doc.text(lines, margin, yPosition)
  yPosition += lines.length * lineHeight + 2
}

// Helper function to add bullet point
function addBullet(text, fontSize = 11) {
  checkPageBreak(8)
  doc.setFontSize(fontSize)
  doc.setFont('helvetica', 'normal')
  doc.text('•', margin, yPosition)
  
  const lines = doc.splitTextToSize(text, contentWidth - 10)
  doc.text(lines, margin + 5, yPosition)
  yPosition += lines.length * lineHeight + 2
}

// Helper function to add numbered list
function addNumberedItem(number, text, fontSize = 11) {
  checkPageBreak(8)
  doc.setFontSize(fontSize)
  doc.setFont('helvetica', 'normal')
  doc.text(`${number}.`, margin, yPosition)
  
  const lines = doc.splitTextToSize(text, contentWidth - 10)
  doc.text(lines, margin + 8, yPosition)
  yPosition += lines.length * lineHeight + 2
}

// Cover Page
doc.setFillColor(30, 64, 175)
doc.rect(0, 0, pageWidth, pageHeight, 'F')

doc.setTextColor(255, 255, 255)
doc.setFontSize(28)
doc.setFont('helvetica', 'bold')
doc.text('MLS MAKİNA', pageWidth / 2, pageHeight / 2 - 20, { align: 'center' })

doc.setFontSize(20)
doc.text('Üretim Yönetim Sistemi', pageWidth / 2, pageHeight / 2, { align: 'center' })

doc.setFontSize(16)
doc.text('Kullanıcı Kılavuzu', pageWidth / 2, pageHeight / 2 + 15, { align: 'center' })

doc.setFontSize(12)
doc.text(`Versiyon 1.0`, pageWidth / 2, pageHeight / 2 + 35, { align: 'center' })

const currentDate = new Date().toLocaleDateString('tr-TR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})
doc.text(`Tarih: ${currentDate}`, pageWidth / 2, pageHeight / 2 + 45, { align: 'center' })

// Add new page for content
doc.addPage()
yPosition = 20

// Table of Contents
doc.setTextColor(0, 0, 0)
addTitle('İçindekiler', 18)

addBullet('1. Giriş', 12)
addBullet('2. Sistem Genel Bakış', 12)
addBullet('3. Giriş ve Güvenlik', 12)
addBullet('4. Dashboard (Anasayfa)', 12)
addBullet('5. Teklif Yönetimi', 12)
addBullet('6. Firma Yönetimi', 12)
addBullet('7. Makina Yönetimi', 12)
addBullet('8. Üretim Yönetimi', 12)
addBullet('9. Kullanıcı Yönetimi', 12)
addBullet('10. Planlama', 12)
addBullet('11. Raporlama', 12)
addBullet('12. Ayarlar', 12)
addBullet('13. Dışa Aktarma (Export)', 12)
addBullet('14. Düzenleme Geçmişi', 12)

doc.addPage()
yPosition = 20

// 1. Giriş
addTitle('1. Giriş', 18)
addText('MLS Makina Üretim Yönetim Sistemi, makine üretim süreçlerini dijitalleştirmek ve yönetmek için tasarlanmış kapsamlı bir web uygulamasıdır. Bu sistem ile teklif oluşturma, firma yönetimi, makina takibi, üretim süreçleri ve raporlama işlemlerini tek bir platform üzerinden yönetebilirsiniz.', 11)
yPosition += 3

addSubtitle('1.1 Sistem Gereksinimleri', 14)
addBullet('Modern bir web tarayıcısı (Chrome, Firefox, Edge, Safari)')
addBullet('İnternet bağlantısı')
addBullet('Ekran çözünürlüğü: Minimum 1024x768 piksel')

addSubtitle('1.2 Desteklenen Tarayıcılar', 14)
addBullet('Google Chrome (önerilen)')
addBullet('Mozilla Firefox')
addBullet('Microsoft Edge')
addBullet('Safari')

doc.addPage()
yPosition = 20

// 2. Sistem Genel Bakış
addTitle('2. Sistem Genel Bakış', 18)
addText('MLS Makina Üretim Yönetim Sistemi, aşağıdaki ana modülleri içermektedir:', 11)
yPosition += 3

addSubtitle('2.1 Ana Modüller', 14)
addBullet('Dashboard: Sistem genel görünümü ve istatistikler')
addBullet('Teklif Yönetimi: Teklif oluşturma, düzenleme ve takibi')
addBullet('Firma Yönetimi: Müşteri firmalarının yönetimi')
addBullet('Makina Yönetimi: Makina tanımları ve atamaları')
addBullet('Üretim Yönetimi: Üretim süreçlerinin takibi')
addBullet('Kullanıcı Yönetimi: Sistem kullanıcılarının yönetimi')
addBullet('Planlama: Üretim planlaması ve takvimi')
addBullet('Raporlama: Detaylı raporlar ve analizler')
addBullet('Ayarlar: Sistem ayarları ve konfigürasyonlar')

addSubtitle('2.2 Sistem Özellikleri', 14)
addBullet('Kullanıcı dostu arayüz')
addBullet('Gerçek zamanlı istatistikler ve grafikler')
addBullet('Excel ve PDF dışa aktarma')
addBullet('Düzenleme geçmişi takibi (Audit Log)')
addBullet('Güvenli kullanıcı kimlik doğrulama')
addBullet('Mobil uyumlu tasarım')

doc.addPage()
yPosition = 20

// 3. Giriş ve Güvenlik
addTitle('3. Giriş ve Güvenlik', 18)

addSubtitle('3.1 Sisteme Giriş', 14)
addNumberedItem(1, 'Web tarayıcınızda sistem adresini açın')
addNumberedItem(2, 'Giriş sayfasında kullanıcı adınızı girin')
addNumberedItem(3, 'Şifrenizi girin')
addNumberedItem(4, '"Giriş Yap" butonuna tıklayın')

addSubtitle('3.2 İlk Giriş', 14)
addText('İlk kez giriş yapan kullanıcılar için şifre sıfırlama e-postası gönderilir. E-postanızdaki linke tıklayarak yeni şifrenizi belirleyebilirsiniz.', 11)
yPosition += 3

addSubtitle('3.3 Şifre Güvenliği', 14)
addBullet('Şifre en az 6 karakter olmalıdır')
addBullet('Güvenliğiniz için şifrenizi düzenli olarak değiştirin')
addBullet('Şifrenizi kimseyle paylaşmayın')
addBullet('Oturumunuzu kullanmadığınızda mutlaka çıkış yapın')

addSubtitle('3.4 Çıkış Yapma', 14)
addText('Sistemden çıkmak için sol menüdeki "Çıkış" butonuna tıklayın.', 11)

doc.addPage()
yPosition = 20

// 4. Dashboard (Anasayfa)
addTitle('4. Dashboard (Anasayfa)', 18)
addText('Dashboard, sistemin ana sayfasıdır ve genel bir bakış sunar. Burada tüm önemli istatistikleri ve grafikleri görebilirsiniz.', 11)
yPosition += 3

addSubtitle('4.1 İstatistik Kartları', 14)
addBullet('Toplam Teklif: Sistemdeki toplam teklif sayısı')
addBullet('Bekleyen Teklifler: Onay bekleyen teklifler')
addBullet('Onaylanan Teklifler: Onaylanmış teklifler')
addBullet('Tamamlanan Teklifler: Tamamlanmış teklifler')
addBullet('Aktif Üretimler: Devam eden üretimler')
addBullet('Son Kontrol: Son kontrol aşamasındaki üretimler')
addBullet('Onaylanan Üretimler: Onaylanmış üretimler')
addBullet('Tamamlanan Üretimler: Tamamlanmış üretimler')

addSubtitle('4.2 Grafikler', 14)
addText('Dashboard\'da aylık teklif dağılımını gösteren grafikler bulunur. Bu grafikler, teklif durumlarına göre (bekleyen, onaylanan, reddedilen, tamamlanan) aylık dağılımı gösterir.', 11)

doc.addPage()
yPosition = 20

// 5. Teklif Yönetimi
addTitle('5. Teklif Yönetimi', 18)

addSubtitle('5.1 Teklif Oluşturma', 14)
addText('Yeni bir teklif oluşturmak için:', 11)
addNumberedItem(1, 'Menüden "Teklif > Teklif Oluştur" seçeneğine tıklayın')
addNumberedItem(2, 'Firma bilgilerini seçin veya yeni firma oluşturun')
addNumberedItem(3, 'Teklif adı ve konu bilgilerini girin')
addNumberedItem(4, 'Ürün bilgilerini ekleyin (ürün adı, miktar, birim fiyat, KDV, iskonto)')
addNumberedItem(5, 'Ödeme şekli ve para birimini seçin')
addNumberedItem(6, 'Teklif tarihini belirleyin')
addNumberedItem(7, 'Gerekirse ek açıklamalar ve notlar ekleyin')
addNumberedItem(8, 'Dosya ekleyebilirsiniz (opsiyonel)')
addNumberedItem(9, '"Teklif Oluştur" butonuna tıklayın')

addSubtitle('5.2 Teklif Listesi', 14)
addText('Tüm teklifleri görüntülemek için "Teklif > Tüm Teklifler" menüsünü kullanın. Teklifleri durumlarına göre filtreleyebilirsiniz:', 11)
addBullet('Tüm Teklifler')
addBullet('Bekleyen Teklifler (Durum: 1)')
addBullet('Onaylanan Teklifler (Durum: 2)')
addBullet('Reddedilen Teklifler (Durum: 3)')
addBullet('Tamamlanan Teklifler (Durum: 4)')

addSubtitle('5.3 Teklif Düzenleme', 14)
addText('Bir teklifi düzenlemek için teklif detay sayfasına gidin ve "Düzenle" butonuna tıklayın. Teklif bilgilerini güncelleyip kaydedebilirsiniz.', 11)

addSubtitle('5.4 Teklif Durumu Değiştirme', 14)
addText('Teklif durumunu değiştirmek için teklif listesinde veya detay sayfasında durum dropdown menüsünü kullanın.', 11)

addSubtitle('5.5 Teklif Detayları', 14)
addText('Teklif detay sayfasında şunları görebilirsiniz:', 11)
addBullet('Teklif genel bilgileri')
addBullet('Firma bilgileri')
addBullet('Ürün listesi ve fiyat detayları')
addBullet('Toplam tutar ve KDV bilgileri')
addBullet('Eklenen dosyalar')
addBullet('Teklif geçmişi')

doc.addPage()
yPosition = 20

// 6. Firma Yönetimi
addTitle('6. Firma Yönetimi', 18)

addSubtitle('6.1 Firma Oluşturma', 14)
addText('Yeni bir firma eklemek için:', 11)
addNumberedItem(1, 'Menüden "Firma > Firma Oluştur" seçeneğine tıklayın')
addNumberedItem(2, 'Firma adını girin (zorunlu)')
addNumberedItem(3, 'Telefon, e-posta, adres bilgilerini girin (opsiyonel)')
addNumberedItem(4, '"Firma Oluştur" butonuna tıklayın')

addSubtitle('6.2 Firma Listesi', 14)
addText('Tüm firmaları görüntülemek için "Firma > Firmaları Gör" menüsünü kullanın. Firmaları düzenleyebilir, silebilir veya detaylarını görüntüleyebilirsiniz.', 11)

addSubtitle('6.3 Firma Düzenleme', 14)
addText('Firma bilgilerini güncellemek için firma listesinden ilgili firmaya tıklayın ve düzenleme sayfasında bilgileri güncelleyin.', 11)

addSubtitle('6.4 Yetkili Kişi Yönetimi', 14)
addText('Firmalara yetkili kişiler ekleyebilirsiniz. Yetkili kişi bilgileri (ad soyad, telefon, e-posta, pozisyon) firma detay sayfasından yönetilir.', 11)

doc.addPage()
yPosition = 20

// 7. Makina Yönetimi
addTitle('7. Makina Yönetimi', 18)

addSubtitle('7.1 Makina Oluşturma', 14)
addText('Yeni bir makina tanımlamak için:', 11)
addNumberedItem(1, 'Menüden "Makina > Makina Ekle" seçeneğine tıklayın')
addNumberedItem(2, 'Makina adını girin (zorunlu)')
addNumberedItem(3, 'Model bilgisini girin (opsiyonel)')
addNumberedItem(4, 'Makina durumunu seçin (Aktif/Pasif)')
addNumberedItem(5, 'Makina açıklamasını girin (opsiyonel)')
addNumberedItem(6, 'Makina fotoğrafı yükleyebilirsiniz (opsiyonel)')
addNumberedItem(7, '"Makina Oluştur" butonuna tıklayın')

addSubtitle('7.2 Makina Listesi', 14)
addText('Tüm makineleri görüntülemek için "Makina > Makinaları Gör" menüsünü kullanın. Makinaları düzenleyebilir, silebilir veya detaylarını görüntüleyebilirsiniz.', 11)

addSubtitle('7.3 Makina Bileşenleri', 14)
addText('Makina detay sayfasından makina bileşenlerini ekleyebilir ve yönetebilirsiniz. Her bileşen için ad, miktar, birim maliyet ve para birimi bilgilerini girebilirsiniz.', 11)

addSubtitle('7.4 Makina Ataması', 14)
addText('Makineleri üretimlere atamak için "Makina > Makina Ataması" menüsünü kullanın. Bu sayfada makineleri üretimlere atayabilir ve atama tarihlerini belirleyebilirsiniz.', 11)

doc.addPage()
yPosition = 20

// 8. Üretim Yönetimi
addTitle('8. Üretim Yönetimi', 18)

addSubtitle('8.1 Üretim Oluşturma', 14)
addText('Yeni bir üretim kaydı oluşturmak için:', 11)
addNumberedItem(1, 'Menüden "Üretim > Üretim Oluştur" seçeneğine tıklayın')
addNumberedItem(2, 'İlgili teklifi seçin')
addNumberedItem(3, 'Üretim başlangıç tarihini belirleyin')
addNumberedItem(4, 'Üretim açıklamasını girin (opsiyonel)')
addNumberedItem(5, '"Üretim Oluştur" butonuna tıklayın')

addSubtitle('8.2 Üretim Durumları', 14)
addText('Üretimler aşağıdaki durumlarda olabilir:', 11)
addBullet('Üretimde: Üretim devam ediyor')
addBullet('Son Kontrol: Son kontrol aşamasında')
addBullet('Onaylandı: Üretim tamamlandı ve onaylandı')

addSubtitle('8.3 Devam Eden Üretimler', 14)
addText('"Üretim > Üretimi Devam Edenler" menüsünden aktif üretimleri görüntüleyebilirsiniz. Bu sayfada üretim gelişmelerini takip edebilir ve güncellemeler yapabilirsiniz.', 11)

addSubtitle('8.4 Üretim Gelişmeleri', 14)
addText('Üretim detay sayfasından üretim gelişmelerini ekleyebilirsiniz. Her gelişme için açıklama ve tahmini ilerleme yüzdesi girebilirsiniz.', 11)

addSubtitle('8.5 Üretim Giderleri', 14)
addText('Üretim sürecinde oluşan giderleri kaydetmek için üretim detay sayfasından "Giderler" bölümünü kullanın. Gider adı, tutar ve açıklama bilgilerini girebilirsiniz.', 11)

addSubtitle('8.6 Tamamlanan Üretimler', 14)
addText('Tamamlanan üretimleri görüntülemek için "Üretim > Üretimi Tamamlananlar" menüsünü kullanın. Bu sayfada tamamlanmış üretimlerin detaylarını görebilirsiniz.', 11)

doc.addPage()
yPosition = 20

// 9. Kullanıcı Yönetimi
addTitle('9. Kullanıcı Yönetimi', 18)

addSubtitle('9.1 Kullanıcı Oluşturma', 14)
addText('Yeni bir kullanıcı eklemek için (sadece admin yetkisi):', 11)
addNumberedItem(1, 'Menüden "Kullanıcı > Kullanıcı Oluştur" seçeneğine tıklayın')
addNumberedItem(2, 'Kullanıcı adını girin (zorunlu, benzersiz olmalı)')
addNumberedItem(3, 'Ad Soyad bilgisini girin')
addNumberedItem(4, 'E-posta adresini girin (opsiyonel)')
addNumberedItem(5, 'Kullanıcı yetkisini seçin (Admin/Kullanıcı)')
addNumberedItem(6, '"Kullanıcı Oluştur" butonuna tıklayın')
addText('Not: Yeni kullanıcıya şifre belirleme e-postası gönderilir.', 10)

addSubtitle('9.2 Kullanıcı Listesi', 14)
addText('Tüm kullanıcıları görüntülemek için "Kullanıcı > Kullanıcıları Gör" menüsünü kullanın. Kullanıcıları düzenleyebilir veya detaylarını görüntüleyebilirsiniz.', 11)

addSubtitle('9.3 Kullanıcı Düzenleme', 14)
addText('Kullanıcı bilgilerini güncellemek için kullanıcı listesinden ilgili kullanıcıya tıklayın. Kullanıcı adı, ad soyad, e-posta ve yetki bilgilerini güncelleyebilirsiniz. Şifre değiştirmek için şifre alanını doldurun.', 11)

addSubtitle('9.4 Kullanıcı Yetkileri', 14)
addText('Sistemde iki yetki seviyesi vardır:', 11)
addBullet('Admin: Tüm sistem özelliklerine erişim')
addBullet('Kullanıcı: Standart kullanıcı yetkileri')

doc.addPage()
yPosition = 20

// 10. Planlama
addTitle('10. Planlama', 18)
addText('Planlama modülü ile tekliflerinize göre üretim planlaması yapabilirsiniz.', 11)
yPosition += 3

addSubtitle('10.1 Planlama Oluşturma', 14)
addText('Bir teklif için planlama oluşturmak için:', 11)
addNumberedItem(1, 'Menüden "Planlama" seçeneğine tıklayın')
addNumberedItem(2, 'Planlama yapmak istediğiniz teklifi seçin')
addNumberedItem(3, 'Başlangıç ve bitiş tarihlerini belirleyin')
addNumberedItem(4, 'Planlama durumunu seçin')
addNumberedItem(5, 'Açıklama ekleyin (opsiyonel)')
addNumberedItem(6, 'Planlamayı kaydedin')

addSubtitle('10.2 Planlama Takibi', 14)
addText('Planlama sayfasından tüm planlamaları görüntüleyebilir, düzenleyebilir ve takip edebilirsiniz.', 11)

doc.addPage()
yPosition = 20

// 11. Raporlama
addTitle('11. Raporlama', 18)

addSubtitle('11.1 Kullanıcı Raporu', 14)
addText('Kullanıcı bazlı raporları görüntülemek için "Rapor > Kullanıcı Raporu" menüsünü kullanın. Bu raporda kullanıcıların oluşturduğu teklif ve üretim sayılarını görebilirsiniz.', 11)

addSubtitle('11.2 Makina Raporu', 14)
addText('Makina bazlı raporları görüntülemek için "Rapor > Makina Raporu" menüsünü kullanın. Bu raporda makinelerin kullanım istatistiklerini görebilirsiniz.', 11)

doc.addPage()
yPosition = 20

// 12. Ayarlar
addTitle('12. Ayarlar', 18)
addText('Sistem ayarları sayfasından çeşitli konfigürasyonları yönetebilirsiniz. Bu sayfa genellikle admin yetkisi gerektirir.', 11)

doc.addPage()
yPosition = 20

// 13. Dışa Aktarma (Export)
addTitle('13. Dışa Aktarma (Export)', 18)

addSubtitle('13.1 Excel Export', 14)
addText('Çeşitli sayfalarda Excel formatında dışa aktarma özelliği bulunmaktadır:', 11)
addBullet('Teklif listesi Excel export')
addBullet('Firma listesi Excel export')
addBullet('Makina listesi Excel export')
addBullet('Kullanıcı listesi Excel export')
addBullet('Üretim listesi Excel export')

addSubtitle('13.2 PDF Export', 14)
addText('Üretim listelerini PDF formatında dışa aktarabilirsiniz. PDF export butonu ilgili sayfalarda bulunmaktadır.', 11)

addSubtitle('13.3 Export Kullanımı', 14)
addText('Dışa aktarma yapmak için ilgili sayfadaki Excel\'e Aktar veya PDF\'e Aktar butonuna tıklayın. Dosya otomatik olarak indirilecektir.', 11)

doc.addPage()
yPosition = 20

// 14. Düzenleme Geçmişi
addTitle('14. Düzenleme Geçmişi', 18)
addText('Sistem, tüm önemli değişiklikleri otomatik olarak kaydeder. Düzenleme geçmişi sayfasından hangi kullanıcının, hangi kaydı, ne zaman ve nasıl değiştirdiğini görebilirsiniz.', 11)
yPosition += 3

addSubtitle('14.1 Geçmiş Görüntüleme', 14)
addText('"Düzenleme Geçmişi" menüsünden tüm değişiklikleri görüntüleyebilirsiniz. Geçmiş kayıtlarında şu bilgiler bulunur:', 11)
addBullet('Tablo adı (hangi modülde değişiklik yapıldı)')
addBullet('Kayıt ID ve adı')
addBullet('İşlem tipi (oluşturma, güncelleme, silme)')
addBullet('Kullanıcı bilgisi')
addBullet('Açıklama')
addBullet('Eski ve yeni değerler')
addBullet('İşlem tarihi')

doc.addPage()
yPosition = 20

// İpuçları ve Best Practices
addTitle('İpuçları ve En İyi Uygulamalar', 18)

addSubtitle('Genel İpuçları', 14)
addBullet('Düzenli olarak verilerinizi yedekleyin')
addBullet('Teklif oluştururken tüm bilgileri eksiksiz doldurun')
addBullet('Üretim gelişmelerini düzenli olarak güncelleyin')
addBullet('Firma bilgilerini güncel tutun')
addBullet('Makina atamalarını doğru tarihlerle yapın')

addSubtitle('Güvenlik İpuçları', 14)
addBullet('Şifrenizi düzenli olarak değiştirin')
addBullet('Oturumunuzu kullanmadığınızda kapatın')
addBullet('Şifrenizi kimseyle paylaşmayın')
addBullet('Şüpheli aktivite fark ederseniz yöneticiye bildirin')

addSubtitle('Performans İpuçları', 14)
addBullet('Büyük listelerde filtreleme kullanın')
addBullet('Gereksiz verileri düzenli olarak temizleyin')
addBullet('Excel export kullanarak büyük veri setlerini analiz edin')

doc.addPage()
yPosition = 20

// Destek ve İletişim
addTitle('Destek ve İletişim', 18)
addText('Sistem ile ilgili sorularınız veya sorunlarınız için lütfen sistem yöneticiniz ile iletişime geçin.', 11)
yPosition += 5

addSubtitle('Sık Karşılaşılan Sorunlar', 14)

addSubtitle('1. Giriş Yapamıyorum', 12)
addText('• Kullanıcı adı ve şifrenizi kontrol edin\n• Şifrenizi unuttuysanız Şifremi Unuttum özelliğini kullanın\n• E-posta onayınızı kontrol edin', 10)

addSubtitle('2. Sayfa Yüklenmiyor', 12)
addText('• İnternet bağlantınızı kontrol edin\n• Tarayıcı önbelleğinizi temizleyin\n• Farklı bir tarayıcı deneyin', 10)

addSubtitle('3. Veri Kaydedilmiyor', 12)
addText('• Zorunlu alanları doldurduğunuzdan emin olun\n• İnternet bağlantınızı kontrol edin\n• Sayfayı yenileyip tekrar deneyin', 10)

// Son sayfa
doc.addPage()
yPosition = pageHeight / 2

doc.setFontSize(16)
doc.setFont('helvetica', 'bold')
doc.text('Teşekkürler!', pageWidth / 2, yPosition, { align: 'center' })

yPosition += 10
doc.setFontSize(12)
doc.setFont('helvetica', 'normal')
doc.text('Bu kılavuzu okuduğunuz için teşekkür ederiz.', pageWidth / 2, yPosition, { align: 'center' })

yPosition += 8
doc.text('Sorularınız için sistem yöneticiniz ile iletişime geçebilirsiniz.', pageWidth / 2, yPosition, { align: 'center' })

// Save PDF
const outputPath = 'KULLANICI_KILAVUZU.pdf'
doc.save(outputPath)
console.log(`PDF kullanıcı kılavuzu başarıyla oluşturuldu: ${outputPath}`)

