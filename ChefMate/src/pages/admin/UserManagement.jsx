import { useState, useEffect } from "react";
import { Search, Trash2, Plus, Edit2, X, AlertCircle, CheckCircle } from "lucide-react";
import { useLang } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/button";

export default function UserManagement() {
  const { t } = useLang();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // States สำหรับจัดการ Modal ต่างๆ
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null); // เก็บข้อมูลผู้ใช้ที่กำลังจะลบ
  const [editingUser, setEditingUser] = useState(null);
  
  // State สำหรับ Form
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'user' });

  // State สำหรับแจ้งเตือน (Custom Toast)
  const [toastMsg, setToastMsg] = useState(null);

  // เอฟเฟกต์ให้ Toast หายไปเองใน 3 วินาที
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => {
        setToastMsg(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  // ฟังก์ชันตัวช่วยแสดงแจ้งเตือน
  const showToast = (type, title, description) => {
    setToastMsg({ type, title, description });
  };

  useEffect(() => { 
    loadUsers(); 
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("https://chefmate-ild4.onrender.com/api/users");
      if (!res.ok) throw new Error("ไม่สามารถดึงข้อมูลได้");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      showToast("error", "ผิดพลาด", "ดึงข้อมูลล้มเหลว กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingUser ? `https://chefmate-ild4.onrender.com/api/users/${editingUser.id}` : "https://chefmate-ild4.onrender.com/api/users";
    const method = editingUser ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "บันทึกไม่สำเร็จ");
      }

      setIsModalOpen(false);
      setEditingUser(null);
      setFormData({ username: '', email: '', password: '', role: 'user' });
      loadUsers();
      showToast("success", "สำเร็จ", editingUser ? "แก้ไขข้อมูลผู้ใช้เรียบร้อยแล้ว" : "เพิ่มผู้ใช้ใหม่เรียบร้อยแล้ว");
    } catch (err) {
      showToast("error", "ผิดพลาด", err.message);
    }
  };

  // ฟังก์ชันกดยืนยันการลบ (ทำงานเมื่อกดปุ่ม "ลบข้อมูล" ใน Modal)
  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      const res = await fetch(`https://chefmate-ild4.onrender.com/api/users/${userToDelete.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("ลบไม่สำเร็จ");
      
      showToast("success", "สำเร็จ", "ลบผู้ใช้งานเรียบร้อยแล้ว");
      loadUsers();
    } catch (err) {
      showToast("error", "ผิดพลาด", "ไม่สามารถลบข้อมูลได้");
    } finally {
      setUserToDelete(null); // ปิด Modal ยืนยันการลบ
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({ username: user.username, email: user.email, password: '', role: user.role });
    setIsModalOpen(true);
  };

  const filtered = users.filter((u) =>
    !search || 
    (u.email || "").toLowerCase().includes(search.toLowerCase()) || 
    (u.username || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-[#f2f6f4] min-h-screen p-8 relative">
      
      {/* 🟢 Custom Toast Notification มุมขวาบน 🟢 */}
      {toastMsg && (
        <div className="fixed top-8 right-8 z-[100] animate-in slide-in-from-top-5 fade-in duration-300">
          <div className={`flex items-start gap-3 px-5 py-4 rounded-xl shadow-2xl border-l-4 bg-white ${toastMsg.type === 'success' ? 'border-green-500' : 'border-red-500'}`}>
            {toastMsg.type === 'success' ? (
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
            )}
            <div>
              <h4 className={`text-sm font-bold ${toastMsg.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>{toastMsg.title}</h4>
              <p className="text-xs text-gray-600 mt-0.5">{toastMsg.description}</p>
            </div>
            <button onClick={() => setToastMsg(null)} className="ml-4 text-gray-400 hover:text-gray-700 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="text-xs text-muted-foreground mb-1">ผู้ดูแลระบบ</div>
            <h1 className="text-3xl font-bold text-[#113221]">{t("user_management") || "จัดการผู้ใช้"}</h1>
          </div>
          <Button 
            onClick={() => { setEditingUser(null); setFormData({ username: '', email: '', password: '', role: 'user' }); setIsModalOpen(true); }}
            className="bg-[#245a3a] hover:bg-[#1a432b] text-white rounded-full px-6 shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" /> เพิ่มผู้ใช้
          </Button>
        </div>

        {/* Search */}
        <div className="bg-white border border-gray-200 rounded-xl p-3 mb-6 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder={t("search") || "ค้นหา Username หรือ Email"} 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#245a3a] focus:ring-1 focus:ring-[#245a3a] transition-all" 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 text-left font-semibold text-gray-700 uppercase tracking-wider text-xs">Username</th>
                <th className="p-4 text-left font-semibold text-gray-700 uppercase tracking-wider text-xs">Email</th>
                <th className="p-4 text-left font-semibold text-gray-700 uppercase tracking-wider text-xs">Role</th>
                <th className="p-4 text-right font-semibold text-gray-700 uppercase tracking-wider text-xs">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="4" className="text-center p-12 text-gray-500">กำลังโหลดข้อมูล...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="4" className="text-center p-12 text-gray-500">ไม่พบผู้ใช้งานในระบบ</td></tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-4 font-medium text-gray-800">{u.username}</td>
                    <td className="p-4 text-gray-600">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide ${u.role === 'admin' ? 'bg-[#e9f2ec] text-[#245a3a]' : 'bg-gray-100 text-gray-600'}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleEdit(u)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="แก้ไข">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setUserToDelete(u)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all ml-1" title="ลบ">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔴 Modal ยืนยันการลบ 🔴 */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200" onClick={() => setUserToDelete(null)}>
          <div className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-2xl text-center transform scale-100" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="font-bold text-xl mb-2 text-gray-800">ยืนยันการลบผู้ใช้?</h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              คุณต้องการลบผู้ใช้ <span className="font-semibold text-gray-800">"{userToDelete.username}"</span> ใช่หรือไม่? <br/>การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>
            <div className="flex gap-3">
              <button onClick={() => setUserToDelete(null)} className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-xl transition-colors">
                ยกเลิก
              </button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl shadow-sm shadow-red-200 transition-colors">
                ลบข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔵 Modal เพิ่ม/แก้ไข 🔵 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-xl text-[#113221]">
                {editingUser ? "แก้ไขข้อมูลผู้ใช้" : "เพิ่มผู้ใช้ใหม่"}
              </h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-800 bg-gray-100 p-1.5 rounded-full transition-colors">
                <X className="w-4 h-4"/>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Username</label>
                <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[#245a3a] focus:ring-1 focus:ring-[#245a3a] transition-all bg-gray-50/50" required />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Email Address</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[#245a3a] focus:ring-1 focus:ring-[#245a3a] transition-all bg-gray-50/50" required />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Password {editingUser && <span className="text-gray-400 font-normal normal-case ml-1">(เว้นว่างหากไม่ต้องการเปลี่ยน)</span>}
                </label>
                <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[#245a3a] focus:ring-1 focus:ring-[#245a3a] transition-all bg-gray-50/50" required={!editingUser} />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Role</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[#245a3a] focus:ring-1 focus:ring-[#245a3a] transition-all bg-gray-50/50">
                  <option value="user">USER</option>
                  <option value="admin">ADMIN</option>
                </select>
              </div>
              
              <div className="pt-6">
                <Button type="submit" className="w-full py-6 text-base bg-[#245a3a] hover:bg-[#1a432b] text-white rounded-xl shadow-lg shadow-green-900/20">
                  {editingUser ? "บันทึกการแก้ไข" : "สร้างผู้ใช้งาน"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}