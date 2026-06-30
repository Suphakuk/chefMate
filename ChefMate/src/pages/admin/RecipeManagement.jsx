import { useState, useEffect } from "react";
import { Search, Trash2, Plus, Edit2, X, Upload as UploadIcon, AlertCircle, CheckCircle, ChefHat, Play } from "lucide-react";
import { useLang } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/button";

export default function RecipeManagement() {
  const { t, lang } = useLang();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // States สำหรับ Modal
  const [showForm, setShowForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [recipeToDelete, setRecipeToDelete] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // เพิ่มช่อง youtube_url สำหรับการผูกวิดีโออัตโนมัติ
  const [formData, setFormData] = useState({ 
    title: "", title_en: "", description: "", description_en: "", 
    image_url: "", category: "other", difficulty: "easy", cook_time: 30, calories: 0,
    youtube_url: "" 
  });

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

  const catMap = { rice: "cat_rice", noodle: "cat_noodle", soup: "cat_soup", curry: "cat_curry", stir_fry: "cat_stir_fry", salad: "cat_salad", dessert: "cat_dessert", other: "cat_other" };

  useEffect(() => { loadRecipes(); }, []);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3001/api/recipes");
      if (!res.ok) throw new Error("ไม่สามารถดึงข้อมูลได้");
      const data = await res.json();
      setRecipes(data);
    } catch (err) {
      console.error(err);
      showToast("error", "ผิดพลาด", "ดึงข้อมูลล้มเหลว กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    try {
      setUploadingImage(true);
      const form = new FormData();
      form.append("image", file);
      const res = await fetch("http://localhost:3001/api/upload", { method: "POST", body: form });
      const data = await res.json();
      setFormData((prev) => ({ ...prev, image_url: data.url }));
      showToast("success", "อัปโหลดสำเร็จ", "อัปโหลดรูปภาพเมนูเรียบร้อยแล้ว");
    } catch (err) {
      showToast("error", "ผิดพลาด", "อัปโหลดรูปไม่สำเร็จ");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.title_en) {
      showToast("error", "แจ้งเตือน", "กรุณากรอกชื่อเมนูให้ครบถ้วน");
      return;
    }

    const url = editingRecipe ? `http://localhost:3001/api/recipes/${editingRecipe.id}` : "http://localhost:3001/api/recipes";
    const method = editingRecipe ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error("บันทึกไม่สำเร็จ");
      
      setShowForm(false);
      setEditingRecipe(null);
      setFormData({ title: "", title_en: "", description: "", description_en: "", image_url: "", category: "other", difficulty: "easy", cook_time: 30, calories: 0, youtube_url: "" });
      loadRecipes();
      showToast("success", "สำเร็จ", editingRecipe ? "แก้ไขข้อมูลเมนูเรียบร้อย" : "เพิ่มเมนูใหม่ (และผูกวิดีโอ) เรียบร้อยแล้ว");
    } catch (err) {
      showToast("error", "ผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้");
    }
  };

  const confirmDelete = async () => {
    if (!recipeToDelete) return;
    try {
      const res = await fetch(`http://localhost:3001/api/recipes/${recipeToDelete.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("ลบไม่สำเร็จ");
      
      showToast("success", "สำเร็จ", "ลบเมนูเรียบร้อยแล้ว");
      loadRecipes();
    } catch (err) {
      showToast("error", "ผิดพลาด", "ไม่สามารถลบข้อมูลได้");
    } finally {
      setRecipeToDelete(null);
    }
  };

  const handleEdit = (recipe) => {
    setEditingRecipe(recipe);
    // กรณีแก้ไข เราอาจจะไม่โชว์ลิงก์วิดีโอในหน้านี้ (ให้ไปแก้ที่หน้า VideoManagement แทนเพื่อไม่ให้ซับซ้อน)
    setFormData({ ...recipe, youtube_url: "" }); 
    setShowForm(true);
  };

  const filtered = recipes.filter((r) =>
    !search || 
    (r.title || "").toLowerCase().includes(search.toLowerCase()) || 
    (r.title_en || "").toLowerCase().includes(search.toLowerCase())
  );

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
            <h1 className="text-3xl font-bold text-[#113221]">{t("recipe_management") || "จัดการเมนูอาหาร"}</h1>
          </div>
          <Button 
            onClick={() => { setEditingRecipe(null); setFormData({ title: "", title_en: "", description: "", description_en: "", image_url: "", category: "other", difficulty: "easy", cook_time: 30, calories: 0, youtube_url: "" }); setShowForm(true); }}
            className="bg-[#245a3a] hover:bg-[#1a432b] text-white rounded-full px-6 shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" /> เพิ่มเมนู
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
              placeholder={t("search") || "ค้นหาชื่อเมนู"} 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#245a3a] focus:ring-1 focus:ring-[#245a3a] transition-all" 
            />
          </div>
        </div>

        {/* Grid แสดงเมนูอาหาร */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#245a3a] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-white rounded-xl border border-gray-200 shadow-sm">ไม่พบเมนูอาหาร</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((recipe) => (
              <div key={recipe.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                  {recipe.image_url ? (
                    <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400"><ChefHat className="w-8 h-8 opacity-50" /></div>
                  )}
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-bold text-[#245a3a] uppercase tracking-wider">
                    {t(catMap[recipe.category] || "cat_other")}
                  </span>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">{lang === "th" ? recipe.title : recipe.title_en || recipe.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-4 flex-1">{lang === "th" ? recipe.description : recipe.description_en || recipe.description}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                      <span className="bg-gray-100 px-2 py-1 rounded">{recipe.cook_time} {lang === "th" ? "นาที" : "mins"}</span>
                      <span className="bg-gray-100 px-2 py-1 rounded">{recipe.calories} kcal</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(recipe)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setRecipeToDelete(recipe)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🔴 Modal ยืนยันการลบ 🔴 */}
      {recipeToDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200" onClick={() => setRecipeToDelete(null)}>
          <div className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-2xl text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="font-bold text-xl mb-2 text-gray-800">ยืนยันการลบเมนู?</h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              คุณต้องการลบเมนู <span className="font-semibold text-gray-800">"{recipeToDelete.title}"</span> ใช่หรือไม่? <br/>(หากลบเมนู วิดีโอที่ผูกไว้จะถูกลบไปด้วย)
            </p>
            <div className="flex gap-3">
              <button onClick={() => setRecipeToDelete(null)} className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-xl transition-colors">ยกเลิก</button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl shadow-sm shadow-red-200 transition-colors">ลบข้อมูล</button>
            </div>
          </div>
        </div>
      )}

      {/* 🔵 Modal เพิ่ม/แก้ไข 🔵 */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white rounded-t-2xl">
              <h2 className="font-bold text-xl text-[#113221]">{editingRecipe ? "แก้ไขเมนูอาหาร" : "เพิ่มเมนูใหม่"}</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-800 bg-gray-100 p-1.5 rounded-full"><X className="w-5 h-5"/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">ชื่อเมนู (TH)</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[#245a3a] focus:ring-1 focus:ring-[#245a3a] bg-gray-50/50" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">ชื่อเมนู (EN)</label>
                  <input type="text" value={formData.title_en} onChange={(e) => setFormData({ ...formData, title_en: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[#245a3a] focus:ring-1 focus:ring-[#245a3a] bg-gray-50/50" required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">คำอธิบาย (TH)</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[#245a3a] focus:ring-1 focus:ring-[#245a3a] bg-gray-50/50 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">คำอธิบาย (EN)</label>
                <textarea value={formData.description_en} onChange={(e) => setFormData({ ...formData, description_en: e.target.value })} rows={2} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[#245a3a] focus:ring-1 focus:ring-[#245a3a] bg-gray-50/50 resize-none" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">หมวดหมู่</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[#245a3a] focus:ring-1 focus:ring-[#245a3a] bg-gray-50/50">
                    {Object.entries(catMap).map(([val, key]) => <option key={val} value={val}>{t(key) || val}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">ความยาก</label>
                  <select value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[#245a3a] focus:ring-1 focus:ring-[#245a3a] bg-gray-50/50">
                    <option value="easy">ง่าย (Easy)</option>
                    <option value="medium">ปานกลาง (Medium)</option>
                    <option value="hard">ยาก (Hard)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">เวลา (นาที)</label>
                  <input type="number" value={formData.cook_time} onChange={(e) => setFormData({ ...formData, cook_time: parseInt(e.target.value) || 0 })} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[#245a3a] focus:ring-1 focus:ring-[#245a3a] bg-gray-50/50" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">แคลอรี</label>
                  <input type="number" value={formData.calories} onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) || 0 })} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[#245a3a] focus:ring-1 focus:ring-[#245a3a] bg-gray-50/50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">รูปภาพเมนู</label>
                  <div className="flex items-center gap-3">
                    {formData.image_url && <img src={formData.image_url} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-gray-200" />}
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#245a3a] hover:bg-green-50 transition-colors text-sm text-gray-600 bg-gray-50/50">
                      <UploadIcon className="w-4 h-4" /> {uploadingImage ? "กำลังอัปโหลด..." : "อัปโหลดรูปภาพ"}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e.target.files[0])} disabled={uploadingImage} />
                    </label>
                  </div>
                </div>
              </div>

              {/* ส่วนเพิ่มใหม่: กรอกลิงก์วิดีโอ (โชว์เฉพาะตอนเพิ่มเมนูใหม่) */}
              {!editingRecipe && (
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                  <label className="block text-xs font-bold text-red-700 mb-1.5 uppercase flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5" /> ผูกลิงก์ YouTube (ตัวเลือก)
                  </label>
                  <input 
                    type="url" 
                    value={formData.youtube_url} 
                    onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })} 
                    placeholder="https://www.youtube.com/watch?v=..." 
                    className="w-full p-3 border border-red-200 rounded-lg outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 bg-white text-sm" 
                  />
                  <p className="text-[10px] text-red-500 mt-1.5 ml-1">* หากกรอกลิงก์ ระบบจะนำไปสร้างเป็นรายการใน "จัดการวิดีโอ" ให้อัตโนมัติ</p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100">
                <Button type="submit" className="w-full py-6 text-base bg-[#245a3a] hover:bg-[#1a432b] text-white rounded-xl shadow-lg shadow-green-900/20 transition-all">
                  {editingRecipe ? "บันทึกการแก้ไข" : "เพิ่มเมนูเข้าสู่ระบบ"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* สไตล์สำหรับปรับแต่ง Scrollbar ภายใน Modal Form */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />
    </div>
  );
}