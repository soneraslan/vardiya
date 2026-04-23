# 🌊 HES Dijital Vardiya Kayıt Sistemi (Hasan Uğurlu & Suat Uğurlu)

Bu proje, hidroelektrik santrallerindeki operasyonel kayıtların dijitalleştirilmesi, veri bütünlüğünün sağlanması ve vardiya teslim süreçlerinin hatasız hale getirilmesi amacıyla geliştirilmiştir.

## 🎯 Projenin Amacı
Geleneksel kağıt kayıtların yerini alan bu sistem; ünite hareketlerini, arızaları ve göl seviyelerini gerçek zamanlı olarak takip eder. En büyük hedefimiz, operatör hatalarını en aza indirmek ve santralin operasyonel geçmişini "satır satır" kusursuz bir şekilde arşivlemektir.

## 🚀 Öne Çıkan Temel Özellikler

### 1. Çoklu Seans (Etkinlik) Mimarisi
*   **Dinamik Satırlar**: Her ünite için tek bir kayıt yerine, aynı vardiya içinde gerçekleşen tüm hareketler (Devreye Giriş, Çıkış, Arıza) ayrı satırlar halinde kaydedilir.
*   **Otomatik Yeni Satır**: Bir seansın giriş ve çıkış saatleri doldurulduğu an, sistem "İşlem bitti" diyerek otomatik olarak bir alt satıra yeni bir seans açar.

### 2. Akıllı Vardiya Mirası (Inheritance)
*   **Durum Aktarımı**: Yeni bir vardiyaya geçildiğinde, ünitelerin en son hangi durumda (Çalışıyor/Duran) olduğu ve hangi hattan (Kuzey/Güney) beslendiği bir önceki vardiyadan otomatik olarak devralınır.
*   **Göl Kotu Referansı**: Bir önceki vardiya sonunda ölçülen göl seviyesi, yeni vardiyanın başlangıç noktası olarak otomatik gelir.

### 3. Operasyonel Güvenlik ve Validasyon
*   **Veri Kilitleme**: Giriş ve çıkış saatleri girilen seanslar otomatik olarak kilitlenir (Read-Only), böylece geçmişe dönük yanlışlıkla veri silinmesi engellenir.
*   **Zaman Mantığı**: Bir ünitenin çıkış saati, giriş saatinden önce olamaz; sistem bu tür hatalı girişleri reddeder.
*   **Hat Seçim Zorunluluğu**: Üniteyi devreye alırken "Kuzey" veya "Güney" hattı seçilmeden kayıt yapılmasına izin verilmez.
*   **Göl Kotu Uyarı Sistemi**: Giriş yapılan göl seviyesi, bir önceki kayda göre ±0.30m'den fazla fark gösteriyorsa sistem operatörü uyarır.

### 4. Satır Bazlı İzahat Sistemi
*   **Nokta Atışı Notlar**: Her seansın veya arızanın kendi izahat kutusu vardır. "Neden durdu?" veya "Arıza neydi?" gibi açıklamalar doğrudan o olayın satırına yazılır.
*   **Birleşik Tablo Görünümü**: Vardiya tablosunda, o satırdaki tüm ünitelerin notlarını birleştirilerek tek bir hücrede özetlenir.

## 🛠 Teknik Altyapı
*   **Arayüz**: HTML5, Vanilla CSS (Modern Tasarım), Javascript (ES6+).
*   **Veri Yönetimi**: JSON tabanlı dinamik veri saklama, AutoSave (Otomatik Kayıt) mekanizması.
*   **Bildirim**: Önemli olayların ve arızaların otomatik olarak raporlanması.

---
**Emrinize Amade, Kusursuz Operasyon İçin Hazır.**  
*Antigravity AI*
