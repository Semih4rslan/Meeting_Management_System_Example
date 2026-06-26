# Özbağ Yazılım - Toplantı Yönetimi Sistemi

Bu proje, Özbağ Yazılım teknik değerlendirme çalışması kapsamında geliştirilmiş tam kapsamlı (fullstack) bir toplantı yönetimi uygulamasıdır. Projede, teknik belgede yer alan zorunlu temel gereksinimlerin yanı sıra opsiyonel olarak belirtilen tüm ek özellikler eksiksiz bir şekilde hayata geçirilmiştir.

Geliştirici: Semih Arslan


## 1. Projede Alınan Teknik Kararlar

Değerlendirme dokümanında belirtilen "Serbest Alan" (Veritabanı tasarımı, API yapısı, Kod organizasyonu ve UI/UX) beklentileri doğrultusunda aşağıdaki teknik kararlar alınmıştır:

### Veritabanı Tasarımı ve Veri Modelleme
* İlişkisel Veritabanı: Sistemde PostgreSQL kullanılmıştır. Kullanıcılar (users) ve Toplantılar (meetings) arasında "Çoka Çok" (Many-to-Many) bir ilişki tasarlanmıştır. Bu ilişkiyi yönetmek için `ozbag_meetings` adında bir pivot (ara) tablo oluşturulmuştur. Bu sayede bir toplantıya birden fazla katılımcı atanabilirken, bir kullanıcı da birden fazla toplantıya dahil edilebilmektedir.

### API Endpoint Yapısı Sonuçları ve Backend (Laravel)
* RESTful Mimari: Tüm backend uç noktaları standart REST prensiplerine uygun olarak tasarlanmıştır. Dönen tüm veriler standart JSON formatındadır.
* Güvenlik ve Yetkilendirme: API tabanlı (Bearer Token) güvenli kimlik doğrulama mekanizması kurulmuştur. Sisteme giriş yapmamış kullanıcıların veri çekmesi veya işlem yapması engellenmiştir.
* Sayfalama ve Performans: Toplantı listeleme işlemlerinde sunucu tarafı (backend-side) sayfalama (pagination) kullanılarak yüksek veri hacimlerinde performans kaybı önlenmiştir.
* Arama ve Filtreleme: API üzerinden gelen arama parametreleri ile veritabanı seviyesinde filtreleme yapılarak sadece ilgili sonuçların dönmesi sağlanmıştır.

### Kod Organizasyonu ve Frontend (React + TypeScript)
* Tip Güvenliği: Geliştirme sürecinde TypeScript kullanılarak veri tipleri (Interface'ler) katı bir şekilde tanımlanmış ve olası çalışma zamanı hataları derleme aşamasında engellenmiştir.
* Modüler Yapı: Bileşenler ve fonksiyonlar okunabilirliği yüksek, tekrar kullanılabilir bir yapıda organize edilmiştir.

### UI/UX Yaklaşımı ve Hata Yönetimi (Error Handling)
* Merkezi Bildirim Sistemi: Tarayıcının standart ve demode uyarı pencereleri yerine, projenin koyu temasına uygun, arka planı bulanıklaştıran modern bir Modal (Pop-up) bildirim sistemi tasarlanmıştır. Sunucudan veya validasyonlardan dönen hatalar kullanıcıya anlaşılır mesajlar ile sunulmaktadır.
* Veri Giriş Güvenliği: Toplantı başlığı için 255, açıklama alanı için 1000 karakterlik veritabanı sınırları önyüzde sayaçlarla desteklenmiştir. Sınıra ulaşıldığında kullanıcıyi görsel olarak uyaran bir yapı kurulmuştur.
* Tasarım Koruması: Kullanıcıların boşluksuz çok uzun metinler girmesi ihtimaline karşı CSS seviyesinde `word-break` özelliği kullanılarak arayüzün taşması ve bozulması engellenmiştir.


## 2. Kurulum Adımları

### Adım 2.1: Gerekli Temel Programların Kurulması

Projeyi bilgisayarınızda çalıştırabilmek için aşağıdaki araçların bilgisayarınızda yüklü olması gerekir:

1. Laragon (PHP ve Sunucu Yönetimi İçin):
* "Laragon Full" sürümünü indirin ve bilgisayarınıza kurun.

2. PostgreSQL ve pgAdmin (Veritabanı Yönetimi İçin):
* Kurulum sırasında "pgAdmin 4" bileşeninin seçili olduğundan emin olun. Kurulum esnasında belirleyeceğiniz ana veritabanı şifresini unutmayınız.

3. Node.js (Arayüz Paket Yönetimi İçin):
* "LTS" (Önerilen) sürümü indirin ve bilgisayarınıza kurun.

### Adım 2.2: Veritabanının Hazırlanması

Laragon üzerindeki varsayılan veritabanı butonu MySQL bağlantısı için ayarlandığından, PostgreSQL veritabanımızı oluşturmak için pgAdmin programını kullanacağız:

1. Bilgisayarınızın arama çubuğuna "pgAdmin" yazarak programı açın.
2. Açılışta sizden kurulum sırasında belirlediğiniz ana şifre istenirse şifrenizi girerek paneli açın.
3. Sol menüde yer alan "Servers" sekmesini genişletin ve altındaki veritabanı bağlantısına tıklayın.
4. "Databases" yazan seçeneğe sağ tıklayın.
5. "Create" seçeneğinin üzerine gelip "Database..." butonuna tıklayın.
6. Karşınıza çıkan penceredeki "Database" alanına şu ismi yazın: `ozbag_meetings`
7. Alt tarafta bulunan "Save" butonuna tıklayarak boş veritabanınızı oluşturun.
8. Laragon programını açın ve sadece "Start All" butonuna basarak arka plan servislerini başlatın.

### Adım 2.3: Arka Plan (Backend - Laravel) Kurulumu

Projenin çalışması için eksik kütüphane dosyalarının internetten çekilmesi ve veritabanı bağlantısının yapılması gerekir.

1. Proje dosyalarınızın bulunduğu dizine gidin ve `meeting-backend` klasörünün içine girin.
2. Klasörün en üst kısmında yer alan adres çubuğuna (dosya yolunun yazdığı boşluğa) tıklayın, oradaki yazıları silin.
3. Oraya `cmd` yazın ve klavyeden Enter tuşuna basın. Siyah bir komut satırı ekranı açılacaktır.
4. Açılan bu siyah ekrana aşağıdaki komutu yazın:
   composer install
5. Aynı klasörün içinde yer alan `.env.example` isimli dosyanın adını sadece `.env` olacak şekilde değiştirin.
6. Bu `.env` dosyasini herhangi bir metin editörü (Not Defteri vb.) ile açın ve veritabanı bağlantı ayarlarını az önce pgAdmin üzerinde oluşturduğunuz bilgilere göre düzenleyip dosyayı kaydedin. Örnek:

   DB_CONNECTION=pgsql
   DB_HOST=127.0.0.1
   DB_PORT=5432 (postgreSQL'den kendi db_portunuzu kontrol edin orada ne yazıyorsa buraya da onu yazın.)
   DB_DATABASE=ozbag_meetings
   DB_USERNAME=postgres
   DB_PASSWORD=kurulumda_belirlediginiz_sifre

7. Ayarları kaydettikten sonra siyah komut ekranına geri dönün ve projenin güvenlik anahtarını üretmek için şu komutu yazın:
   php artisan key:generate
8. Veritabanı tablolarını ve ilişkilerini otomatik oluşturmak için şu komutu çalıştırın:
   php artisan migrate
9. Sunucuyu ayağa kaldırmak için son olarak şu komutu çalıştırın:
   php artisan serve
   (Ekranda "Server running on http://127.0.0.1:8000" yazdığında bu ekranı aşağıya küçültün, kapatmayın.)

### Adım 2.4: Arayüz (Frontend - React) Kurulumu

1. Ana proje klasörünüze geri dönün ve `meeting-frontend` klasörünün içine girin.
2. Yine klasörün adres çubuğuna `cmd` yazarak yeni bir siyah komut ekranı açın.
3. Eksik paketleri indirmek için şu komutu yazın:
   npm install
4. Arayüzü başlatmak için şu komutu çalıştırın:
   npm run dev
   (Ekranda "Local: http://localhost:5173/" yazısını göreceksiniz. Bu ekranı da aşağıya küçültün, kapatmayın.)


## 3. Sistemin Test Edilmesi

1. İnternet tarayıcınızı (Chrome, Edge vb.) açın.
2. Adres çubuğuna `http://localhost:5173/` yazıp Enter tuşuna basın.
3. Açılan giriş ekranında, alt taraftaki "Yeni hesap açın" seçeneğine tıklayarak sistemde yeni bir kullanıcı oluşturun.
4. Kaydınız oluştuktan sonra giriş yapın.
5. Portal üzerinden toplantı ekleyebilir, mevcut toplantıları listeleyebilir, güncelleyebilir veya silebilirsiniz. Ayrıca sayfalama ve arama özelliklerini test edebilirsiniz.


## 4. Uygulamayı Yeniden Çalıştırmak İstediğinizde

Bilgisayarı kapatıp açtığınızda projeyi tekrar çalıştırmak için sadece şu adımları yapmanız yeterlidir:
1. Laragon programını açıp "Start All" deyin.
2. PostgreSQL'in açık olduğundan emin olun.
3. Backend klasöründe cmd açıp `php artisan serve` yazın.
4. Frontend klasöründe cmd açıp `npm run dev` yazın.
5. Tarayıcıdan http://localhost:5173 adresine girin.
