import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, X, Play, AlertCircle, CheckCircle } from "lucide-react";
import { useLang } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/button";

export default function VideoManagement() {
  const { t, lang } = useLang();
  const [videos, setVideos] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // States สำหรับ Modal
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [videoToDelete, setVideoToDelete] = useState(null);
  
  const [formData, setFormData] = useState({ title: "", title_en: "", youtube_url: "", duration: "", recipe_id: "" });

  // State สำหรับ Custom Toast
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  const showToast = (type, title, description) => {
    setToastMsg({ type, title, description });
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // โหลดข้อมูลวิดีโอและเมนูอาหารพร้อมกัน
      const [videosRes, recipesRes] = await Promise.all([
        fetch("http://localhost:3001/api/videos"),
        fetch("http://localhost:3001/api/recipes")
      ]);
      
      if (!videosRes.ok || !recipesRes.ok) throw new Error("ไม่สามารถดึงข้อมูลได้");
      
      setVideos(await videosRes.json());
      setRecipes(await recipesRes.json());
    } catch (err) {
      showToast("error", "ผิดพลาด", "ดึงข้อมูลล้มเหลว กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const loadVideosOnly = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/videos");
      if (res.ok) setVideos(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const getYoutubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.youtube_url) {
      showToast("error", "แจ้งเตือน", "กรุณากรอกชื่อและ URL ของวิดีโอ");
      return;
    }

    const url = editingItem ? `http://localhost:3001/api/videos/${editingItem.id}` : "http://localhost:3001/api/videos";
    const method = editingItem ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error("บันทึกไม่สำเร็จ");
      
      setShowForm(false);
      setEditingItem(null);
      setFormData({ title: "", title_en: "", youtube_url: "", duration: "", recipe_id: "" });
      loadVideosOnly();
      showToast("success", "สำเร็จ", editingItem ? "แก้ไขวิดีโอเรียบร้อย" : "เพิ่มวิดีโอใหม่เรียบร้อย");
    } catch (err) {
      showToast("error", "ผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้");
    }
  };

  const confirmDelete = async () => {
    if (!videoToDelete) return;
    try {
      const res = await fetch(`http://localhost:3001/api/videos/${videoToDelete.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("ลบไม่สำเร็จ");
      
      showToast("success", "สำเร็จ", "ลบวิดีโอเรียบร้อยแล้ว");
      loadVideosOnly();
    } catch (err) {
      showToast("error", "ผิดพลาด", "ไม่สามารถลบข้อมูลได้");
    } finally {
      setVideoToDelete(null);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ 
      title: item.title || "", 
      title_en: item.title_en || "", 
      youtube_url: item.youtube_url || "", 
      duration: item.duration || "", 
      recipe_id: item.recipe_id || "" 
    });
    setShowForm(true);
  };

  const filtered = videos.filter((v) =>
    !search || 
    (v.title || "").toLowerCase().includes(search.toLowerCase()) || 
    (v.title_en || "").toLowerCase().includes(search.toLowerCase())
  );

  const recipeMap = {};
  recipes.forEach((r) => { recipeMap[r.id] = r; });

  return (
    <div className="bg-[#f2f6f4] min-h-screen p-8 relative">
      
      {/* 🟢 Custom Toast Notification 🟢 */}
      {toastMsg && (
        <div className="fixed top-8 right-8 z-[100] animate-in slide-in-from-top-5 fade-in duration-300">
          <div className={`flex items-start gap-3 px-5 py-4 rounded-xl shadow-2xl border-l-4 bg-white ${toastMsg.type === 'success' ? 'border-green-500' : 'border-red-500'}`}>
            {toastMsg.type === 'success' ? <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" /> : <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />}
            <div>
              <h4 className={`text-sm font-bold ${toastMsg.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>{toastMsg.title}</h4>
              <p className="text-xs text-gray-600 mt-0.5">{toastMsg.description}</p>
            </div>
            <button onClick={() => setToastMsg(null)} className="ml-4 text-gray-400 hover:text-gray-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="text-xs text-muted-foreground mb-1">ผู้ดูแลระบบ</div>
            <h1 className="text-3xl font-bold text-[#113221]">{t("video_management") || "จัดการวิดีโอ"}</h1>
          </div>
          <Button 
            onClick={() => { setEditingItem(null); setFormData({ title: "", title_en: "", youtube_url: "", duration: "", recipe_id: "" }); setShowForm(true); }}
            className="bg-[#245a3a] hover:bg-[#1a432b] text-white rounded-full px-6 shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" /> เพิ่มวิดีโอ
          </Button>
        </div>

        {/* Search */}
        <div className="bg-white border border-gray-200 rounded-xl p-3 mb-6 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder={t("search") || "ค้นหาชื่อวิดีโอ"} 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#245a3a] focus:ring-1 focus:ring-[#245a3a] transition-all" 
            />
          </div>
        </div>

        {/* Grid วิดีโอ */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#245a3a] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-white rounded-xl border border-gray-200 shadow-sm">ไม่พบวิดีโอในระบบ</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((video) => {
              const ytId = getYoutubeId(video.youtube_url);
              return (
                <div key={video.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                  <div className="aspect-video bg-gray-900 relative overflow-hidden flex items-center justify-center">
                    {ytId ? (
                      <>
                        <img src={`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`} onError={(e) => { e.target.onerror = null; e.target.src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`; }} alt="" className="w-full h-full object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 bg-red-600/90 rounded-full flex items-center justify-center shadow-lg shadow-red-900/50 backdrop-blur-sm group-hover:scale-110 transition-transform">
                            <Play className="w-5 h-5 text-white ml-1" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <Play className="w-10 h-10 text-gray-600" />
                    )}
                    {video.duration && (
                      <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded">
                        {video.duration}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1" title={lang === "th" ? video.title : video.title_en || video.title}>
                      {lang === "th" ? video.title : video.title_en || video.title}
                    </h3>
                    <a href={video.youtube_url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline truncate mb-4 block">
                      {video.youtube_url}
                    </a>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                      <div className="text-xs font-medium text-gray-500 flex items-center gap-1.5 truncate pr-2">
                        <span className={`px-2 py-1 rounded truncate max-w-[120px] ${video.recipe_id && recipeMap[video.recipe_id] ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {video.recipe_id && recipeMap[video.recipe_id] 
                            ? (lang === "th" ? recipeMap[video.recipe_id].title : recipeMap[video.recipe_id].title_en || recipeMap[video.recipe_id].title)
                            : (lang === "th" ? "ไม่ผูกกับเมนูใด" : "No recipe linked")
                          }
                        </span>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => handleEdit(video)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setVideoToDelete(video)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 🔴 Modal ยืนยันการลบ 🔴 */}
      {videoToDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200" onClick={() => setVideoToDelete(null)}>
          <div className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-2xl text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="font-bold text-xl mb-2 text-gray-800">ยืนยันการลบวิดีโอ?</h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              คุณต้องการลบวิดีโอ <span className="font-semibold text-gray-800">"{videoToDelete.title}"</span> ใช่หรือไม่?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setVideoToDelete(null)} className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-xl transition-colors">ยกเลิก</button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl shadow-sm shadow-red-200 transition-colors">ลบข้อมูล</button>
            </div>
          </div>
        </div>
      )}

      {/* 🔵 Modal เพิ่ม/แก้ไข 🔵 */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
              <h2 className="font-bold text-xl text-[#113221]">{editingItem ? "แก้ไขวิดีโอ" : "เพิ่มวิดีโอใหม่"}</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-800 bg-gray-100 p-1.5 rounded-full"><X className="w-5 h-5"/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">ชื่อวิดีโอ (TH)</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[#245a3a] focus:ring-1 focus:ring-[#245a3a] bg-gray-50/50" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">ชื่อวิดีโอ (EN)</label>
                  <input type="text" value={formData.title_en} onChange={(e) => setFormData({ ...formData, title_en: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[#245a3a] focus:ring-1 focus:ring-[#245a3a] bg-gray-50/50" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">YouTube URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Play className="h-4 w-4 text-red-500" />
                  </div>
                  <input type="url" value={formData.youtube_url} onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." className="w-full pl-9 p-3 border border-gray-200 rounded-xl outline-none focus:border-[#245a3a] focus:ring-1 focus:ring-[#245a3a] bg-gray-50/50" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">เมนูอาหารที่เกี่ยวข้อง</label>
                  <select value={formData.recipe_id} onChange={(e) => setFormData({ ...formData, recipe_id: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[#245a3a] focus:ring-1 focus:ring-[#245a3a] bg-gray-50/50">
                    <option value="">-- ไม่ผูกกับเมนูใด --</option>
                    {recipes.map((r) => <option key={r.id} value={r.id}>{lang === "th" ? r.title : r.title_en || r.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">ความยาววิดีโอ</label>
                  <input type="text" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} placeholder="เช่น 10:30" className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[#245a3a] focus:ring-1 focus:ring-[#245a3a] bg-gray-50/50" />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <Button type="submit" className="w-full py-6 text-base bg-[#245a3a] hover:bg-[#1a432b] text-white rounded-xl shadow-lg shadow-green-900/20 transition-all">
                  {editingItem ? "บันทึกการแก้ไข" : "เพิ่มวิดีโอเข้าสู่ระบบ"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}