# Nodemailer Kurulumu

## Sorun
next-auth@4.24.13 nodemailer@^7.0.7 istiyor ama biz 6.9.8 eklemiştik. Bu uyumsuzluğu çözmek için nodemailer versiyonunu güncelledik.

## Kurulum

CMD (Command Prompt) kullanarak şu komutu çalıştırın:

```cmd
cd C:\Users\ENES\Desktop\mlsmakina
npm install nodemailer@^7.0.7 @types/nodemailer@^6.4.14
```

Veya eğer hala hata alırsanız:

```cmd
npm install nodemailer@^7.0.7 @types/nodemailer@^6.4.14 --legacy-peer-deps
```

## Alternatif Çözüm

Eğer yukarıdaki komutlar çalışmazsa, package.json'dan nodemailer'ı kaldırıp tekrar ekleyin:

```cmd
npm uninstall nodemailer @types/nodemailer
npm install nodemailer@^7.0.7 @types/nodemailer@^6.4.14
```

## Not
- Nodemailer 7.x versiyonu next-auth ile uyumludur
- Kod değişikliği gerekmez, sadece versiyon güncellendi




