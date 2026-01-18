# 🎨 RBAC Frontend Panel

Bu proje, **RBAC (Role-Based Access Control) Backend API** ile entegre çalışan  
**modern ve yönetilebilir bir admin panel frontend uygulamasıdır.**

Uygulama, kullanıcıların rollerine göre yetkilendirildiği,  
admin kullanıcıların ise sistem üzerindeki tüm RBAC yapılarını yönettiği  
tam kapsamlı bir frontend arayüz sunar.

---

## 🎯 Projenin Amacı

- Backend üzerinde geliştirilen RBAC yapısını görsel olarak yönetebilmek
- Kullanıcı, rol, modül ve fonksiyon yetkilendirmelerini admin panel üzerinden kontrol etmek
- JWT tabanlı kimlik doğrulama ile güvenli frontend–backend iletişimi sağlamak
- Kurumsal, sade ve yönetilebilir bir kullanıcı deneyimi oluşturmak

---

## 🧠 Sistem Mantığı

### Kullanıcı Girişi

- Kullanıcılar login ekranı üzerinden sisteme giriş yapar
- JWT token frontend tarafında yönetilir
- Kullanıcının sahip olduğu rol sistemden otomatik belirlenir

### Yetkilendirme

- Kullanıcılar yalnızca rollerinin izin verdiği:
  - Modülleri
  - Fonksiyonları
  - Sayfaları
  görebilir

### Admin Kullanıcı

Admin rolüne sahip kullanıcılar:

- Kullanıcı yönetimi
- Rol oluşturma
- Modül & fonksiyon tanımlama
- Rol–Fonksiyon (RFMC) yetkilendirme
- Kullanıcı–Rol atamaları

gibi tüm sistem operasyonlarını yönetebilir.

---

## 🧩 Yapılan Frontend Çalışmaları

- PrimeVue kullanılarak modern arayüz tasarımı
- Login / Register ekranlarının geliştirilmesi
- `App.vue` ana yapı mimarisinin kurulması
- Ortak Navbar & layout sisteminin oluşturulması
- Vue Router akışlarının stabil hale getirilmesi
- Backend API entegrasyon testlerinin yapılması
- Global component yapısının kurulması

---


## 🧑‍💻 Admin Panel Özellikleri

- Kullanıcı yönetim ekranı
- Rol oluşturma ve düzenleme
- Modül & fonksiyon yetkilendirme ekranları
- FMC / RFMC yapı yönetimi
- Rol–Fonksiyon güncelleme diyalogları
- Uçtan uca backend entegrasyonu
- Stabil ve güvenli yetkilendirme akışı

---
#### Rol ve Kullanıcı Yönetim Ekranı
<img width="600" height="476" alt="image" src="https://github.com/user-attachments/assets/773ba2b6-68c6-4525-8e3c-0b8995b78e67" />

#### Rol Oluşturma ve FMC / RFMC (Modül–Fonksiyon) Yetkilendirme Yönetimi
<img width="602" height="378" alt="image" src="https://github.com/user-attachments/assets/448cbc48-7fb8-424e-a774-918f1150e89d" />

#### Kullanıcı–Rol (RoleUser) İlişkilerinin Yönetimi 
<img width="650" height="480" alt="image" src="https://github.com/user-attachments/assets/d12bc862-9863-4011-af95-a7fa8099cfa1" />

#### Rol–FMC (RFMC) Güncelleme
<img width="700" height="480" alt="image" src="https://github.com/user-attachments/assets/28fbff40-1d7a-4279-b620-665b8023817e" />

## 🛠️ Kullanılan Teknolojiler

- **Vue 3**
- **PrimeVue**
- **Vue Router**
- **Axios**
- **JWT Token tabanlı authentication**

---

## 🔗 Backend Repository

Bu frontend uygulaması aşağıdaki backend API ile çalışmaktadır:

👉 **Backend Repo:**  
🔗 https://github.com/YunusGuclu/rbac-backend-api

---

## ✅ Proje Özeti

- ✔ Role-based dynamic frontend
- ✔ JWT ile güvenli oturum yönetimi
- ✔ Admin panel üzerinden tam RBAC kontrolü
- ✔ Backend ile %100 uyumlu yapı
- ✔ Kurumsal admin panel mimarisi
- ✔ Full Stack RBAC proje deneyimi

---

📌 Bu proje ile backend ve frontend ayrık olacak şekilde  
**tam kapsamlı bir Full Stack RBAC sistemi geliştirilmiştir.**

## 👨‍💻 Geliştirici

**Yunus Güçlü**  
Software Enginer

---

## 📄 Lisans

Bu proje kişisel olarak geliştirilmiştir.
Ticari kullanım için geliştirici izni gereklidir.
