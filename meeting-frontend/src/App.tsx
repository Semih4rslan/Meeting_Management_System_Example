import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import './App.css';

// VERİ MODELLERİ
interface User {
  id: number;
  name: string;
  email: string;
}

interface Meeting {
  id: number;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  user_id: number;
  users?: User[];
}

interface AuthData {
  name?: string;
  email: string;
  password: string;
}

interface FormData {
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  participant_ids: string[];
}

interface PaginationResponse {
  data: Meeting[];
  current_page: number;
  last_page: number;
}

function App() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // STATE: Katılımcı arama çubuğu için
  const [userSearchTerm, setUserSearchTerm] = useState<string>('');
  
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token')); 
  const [isRegister, setIsRegister] = useState<boolean>(false);
  
  const [authData, setAuthData] = useState<AuthData>({ name: '', email: '', password: '' });
  const [formData, setFormData] = useState<FormData>({
    title: '', description: '', start_time: '', end_time: '', participant_ids: []
  });

  const [modal, setModal] = useState<{ show: boolean; title: string; message: string }>({ show: false, title: '', message: '' });

  const API_URL = 'http://127.0.0.1:8000/api';

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  });

  const openModal = (title: string, message: string) => setModal({ show: true, title, message });
  const closeModal = () => setModal({ show: false, title: '', message: '' });

  const fetchUsers = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/users`, { headers: getHeaders() });
      const data: User[] = await res.json();
      setAllUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Kullanıcı listesi çekilemedi.");
    }
  };

  const fetchMeetings = async (page: number = 1, search: string = '') => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/meetings?page=${page}&search=${search}`, { headers: getHeaders() });
      if (res.status === 401) return handleLogout();
      
      const responseData: PaginationResponse = await res.json();
      if (responseData && responseData.data) {
        setMeetings(responseData.data);
        setCurrentPage(responseData.current_page);
        setLastPage(responseData.last_page);
      } else {
        setMeetings([]);
      }
    } catch (err) {
      openModal("Sunucu Bağlantı Hatası", "Veritabanı veya sunucu şu an yanıt vermiyor. Lütfen Laragon'un açık olduğundan ve arka planda 'php artisan serve' komutunun çalıştığından emin olun.");
    }
  };

  useEffect(() => { 
    if (token) {
      fetchUsers();
      const delayTimer = setTimeout(() => {
        fetchMeetings(currentPage, searchTerm);
      }, 400);
      return () => clearTimeout(delayTimer);
    }
  }, [token, currentPage, searchTerm]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email: authData.email, password: authData.password })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.access_token);
        setToken(data.access_token);
      } else {
        openModal("Giriş Yapılamadı", "Girdiğiniz e-posta adresi veya şifre sistemdeki kayıtlarla eşleşmiyor. Lütfen bilgilerinizi kontrol edip tekrar deneyin.");
      }
    } catch (err) { 
      openModal("Bağlantı Kurulamadı", "Sunucuya ulaşılamıyor. Lütfen arka plan motorunun (backend) çalıştığını kontrol edin."); 
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(authData)
      });
      const data = await response.json();
      if (response.ok) {
        openModal("Aramıza Hoş Geldiniz!", "Hesabınız başarıyla oluşturuldu. Şimdi e-posta ve şifrenizle sisteme giriş yapabilirsiniz.");
        setIsRegister(false);
      } else {
        const errorMsg = data.errors ? Object.values(data.errors).flat().join("\n") : data.message;
        openModal("Kayıt İşlemi Başarısız !", `Kayıt olurken bir sorunla karşılaştık. Sebep: ${errorMsg}`);
      }
    } catch (err) { 
      openModal("Bağlantı Kurulamadı", "Sunucuya ulaşılamıyor. Lütfen arka plan motorunun (backend) çalıştığını kontrol edin."); 
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setMeetings([]);
    setFormData({ title: '', description: '', start_time: '', end_time: '', participant_ids: [] });
  };

  const handleEdit = (m: Meeting) => {
    setEditingId(m.id);
    setFormData({
      title: m.title,
      description: m.description || '',
      start_time: m.start_time.substring(0, 16).replace(' ', 'T'),
      end_time: m.end_time.substring(0, 16).replace(' ', 'T'),
      participant_ids: m.users ? m.users.map(u => u.id.toString()) : []
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (new Date(formData.end_time) <= new Date(formData.start_time)) {
      openModal("Geçersiz Tarih Seçimi", "Toplantının bitiş zamanı, başlangıç zamanından daha önce veya aynı olamaz. Lütfen tarihleri düzeltin.");
      return;
    }

    const url = editingId ? `${API_URL}/meetings/${editingId}` : `${API_URL}/meetings`;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: getHeaders(),
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (response.ok) {
        setFormData({ title: '', description: '', start_time: '', end_time: '', participant_ids: [] });
        setUserSearchTerm(''); // İşlem başarılı olunca arama kutusunu da temizle
        fetchMeetings(currentPage, searchTerm);
        openModal("İşlem Başarılı", editingId ? "Toplantı bilgileri sisteme başarıyla güncellendi!" : "Yeni toplantı planlaması başarıyla kaydedildi!");
        setEditingId(null);
      } else {
        const errorMsg = data.errors ? Object.values(data.errors).flat().join(" - ") : "Eksik veya hatalı bilgi girdiniz.";
        openModal("Toplantı Kaydedilemedi", `Formda hatalı alanlar var. Lütfen şu uyarıları dikkate alın: ${errorMsg}`);
      }
    } catch (err) { 
      openModal("Sunucu Hatası", "Kayıt işlemi sırasında arka planda bir hata oluştu. Veritabanı bağlantınızı kontrol edin."); 
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bu toplantıyı tamamen silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) {
      try {
        await fetch(`${API_URL}/meetings/${id}`, { method: 'DELETE', headers: getHeaders() });
        fetchMeetings(currentPage, searchTerm);
        openModal("Silme İşlemi Başarılı", "Toplantı sistemden tamamen kaldırıldı.");
      } catch (err) {
        openModal("Silme İşlemi Başarısız", "Sunucuya ulaşılamadığı için kayıt silinemedi.");
      }
    }
  };

  const ModalComponent = () => (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>{modal.title}</h3>
        <p>{modal.message}</p>
        <button className="btn-primary-full" onClick={closeModal}>Anladım</button>
      </div>
    </div>
  );

  if (!token) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">{isRegister ? "Hesap Oluştur" : "Özbağ Portal Giriş"}</h2>
          
          <form onSubmit={isRegister ? handleRegister : handleLogin}>
            {isRegister && (
              <div className="form-group">
                <input type="text" placeholder="Ad Soyad" required onChange={e => setAuthData({...authData, name: e.target.value})} />
              </div>
            )}
            <div className="form-group">
              <input type="email" placeholder="E-posta Adresi" required onChange={e => setAuthData({...authData, email: e.target.value})} />
            </div>
            <div className="form-group">
              <input type="password" placeholder="Şifre" required onChange={e => setAuthData({...authData, password: e.target.value})} />
            </div>
            <button type="submit" className="btn-primary-full">{isRegister ? "Kayıt Ol" : "Giriş Yap"}</button>
          </form>
          <p onClick={() => setIsRegister(!isRegister)} className="toggle-auth">
            {isRegister ? "Zaten hesabınız var mı? Giriş yapın" : "Hesabınız yok mu? Yeni hesap açın"}
          </p>
        </div>
        {modal.show && <ModalComponent />}
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="main-header">
        <h1>Özbağ Toplantı Portalı</h1>
        <button onClick={handleLogout} className="btn-logout">Güvenli Çıkış</button>
      </header>

      <section className="card-section">
        <h3 className="card-title">{editingId ? "Toplantıyı Düzenle" : "Yeni Toplantı Planla"}</h3>
        <form onSubmit={handleSubmit} className="meeting-form">
          
          {/* SAYAÇLI BAŞLIK ALANI */}
          <div className="form-group">
            <div className="label-header">
              <label>Toplantı Başlığı</label>
              <span className={`char-counter ${formData.title.length >= 255 ? 'limit-reached' : ''}`}>
                {formData.title.length}/255 {formData.title.length >= 255 && "- Maksimum"}
              </span>
            </div>
            <input type="text" placeholder="Örn: Haftalık Değerlendirme" required maxLength={255} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>

          {/* SAYAÇLI AÇIKLAMA ALANI */}
          <div className="form-group">
            <div className="label-header">
              <label>Açıklama / Gündem</label>
              <span className={`char-counter ${formData.description.length >= 1000 ? 'limit-reached' : ''}`}>
                {formData.description.length}/1000 {formData.description.length >= 1000 && "- Maksimum"}
              </span>
            </div>
            <textarea maxLength={1000} placeholder="Gündem maddelerini yazın..." rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          
          {/* YENİ FİLTRELEMELİ KATILIMCI SEÇİM ALANI */}
          <div className="form-group">
            <label>Katılımcıları Seçin (Birden fazla için Ctrl + Tık)</label>
            <input 
              type="text" 
              placeholder="Katılımcı ara (İsim veya E-posta)..." 
              value={userSearchTerm} 
              onChange={e => setUserSearchTerm(e.target.value)} 
              style={{ marginBottom: '8px', padding: '10px 14px', fontSize: '0.9rem' }}
            />
            <select multiple className="user-select" value={formData.participant_ids} onChange={e => {
                const values = Array.from(e.target.selectedOptions, option => option.value);
                setFormData({...formData, participant_ids: values});
              }}>
              {allUsers
                .filter(u => u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) || u.email.toLowerCase().includes(userSearchTerm.toLowerCase()))
                .map(u => (
                  <option key={u.id} value={u.id.toString()}>{u.name} ({u.email})</option>
                ))
              }
            </select>
          </div>

          <div className="date-row">
            <div className="form-group">
              <label>Başlangıç</label>
              <input type="datetime-local" required value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Bitiş</label>
              <input type="datetime-local" required value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} />
            </div>
          </div>
          
          <div className="btn-group">
            <button type="submit" className="btn-primary-full"> {editingId ? "Değişiklikleri Kaydet" : "Toplantıyı Oluştur"} </button>
            {editingId && <button type="button" onClick={() => { setEditingId(null); setFormData({title:'', description:'', start_time:'', end_time:'', participant_ids: []}); }} className="btn-cancel">İptal</button>}
          </div>
        </form>
      </section>

      <div className="search-container">
        <input type="text" className="search-input" placeholder="Toplantılarda ara..." value={searchTerm} onChange={(e: ChangeEvent<HTMLInputElement>) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
      </div>

      <div className="meeting-grid">
        {meetings.length > 0 ? meetings.map(m => (
          <div key={m.id} className="meeting-card">
            <div className="meeting-content">
              <h4>{m.title}</h4>
              <p className="m-desc">{m.description || "Açıklama belirtilmemiş."}</p>
              <div className="meeting-details">
                <span className="m-date"><strong>Tarih:</strong> {new Date(m.start_time).toLocaleString('tr-TR')}</span>
                {m.users && m.users.length > 0 && (
                  <span className="m-users"><strong>Katılımcılar:</strong> {m.users.map(u => u.name).join(', ')}</span>
                )}
              </div>
            </div>
            <div className="meeting-actions">
              <button onClick={() => handleEdit(m)} className="btn-edit">Düzenle</button>
              <button onClick={() => handleDelete(m.id)} className="btn-delete">Sil</button>
            </div>
          </div>
        )) : <div className="no-data">Toplantı bulunamadı.</div>}
      </div>

      {lastPage > 1 && (
        <div className="pagination">
          <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Önceki</button>
          <span className="page-info">Sayfa {currentPage} / {lastPage}</span>
          <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, lastPage))} disabled={currentPage === lastPage}>Sonraki</button>
        </div>
      )}

      {modal.show && <ModalComponent />}
    </div>
  );
}

export default App;