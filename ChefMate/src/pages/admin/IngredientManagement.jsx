import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, X, AlertCircle, CheckCircle } from "lucide-react";
import { useLang } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/button";

export default function IngredientManagement() {
  const { t, lang } = useLang();
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // States สำหรับ Modal
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  const [formData, setFormData] = useState({ name: "", name_en: "", category: "other", calories_per_unit: 0, unit: "g" });

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

  useEffect(() => { loadIngredients(); }, []);

  const loadIngredients = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3001/api/ingredients");
      if (!res.ok) throw new Error("ไม่สามารถดึงข้อมูลได้");
      const data = await res.json();
      setIngredients(data);
    } catch (err) {
      showToast("error", "ผิดพลาด", "ดึงข้อมูลวัตถุดิบล้มเหลว");
    } finally {
      setLoading(false);
    }
  };

  const filtered = ingredients.filter((i) =>
    !search || 
    (i.name || "").toLowerCase().includes(search.toLowerCase()) || 
    (i.name_en || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.name_en) {
      showToast("error", "แจ้งเตือน", "กรุณากรอกชื่อวัตถุดิบให้ครบถ้วน");
      return;
    }

    const url = editingItem ? `http://localhost:3001/api/ingredients/${editingItem.id}` : "http://localhost:3001/api/ingredients";
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
      setFormData({ name: "", name_en: "", category: "other", calories_per_unit: 0, unit: "g" });
      loadIngredients();
      showToast("success", "สำเร็จ", editingItem ? "แก้ไขข้อมูลวัตถุดิบเรียบร้อย" : "เพิ่มวัตถุดิบใหม่เรียบร้อย");
    } catch (err) {
      showToast("error", "ผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้");
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      const res = await fetch(`http://localhost:3001/api/ingredients/${itemToDelete.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("ลบไม่สำเร็จ");
      
      showToast("success", "สำเร็จ", "ลบวัตถุดิบเรียบร้อยแล้ว");
      loadIngredients();
    } catch (err) {
      showToast("error", "ผิดพลาด", "ไม่สามารถลบข้อมูลได้");
    } finally {
      setItemToDelete(null);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ 
      name: item.name || "", 
      name_en: item.name_en || "", 
      category: item.category || "other", 
      calories_per_unit: item.calories_per_unit || 0, 
      unit: item.unit || "g" 
    });
    setShowForm(true);
  };

  const catMap = { meat: "เนื้อสัตว์", vegetable: "ผัก", fruit: "ผลไม้", dairy: "ผลิตภัณฑ์นม", grain: "ธัญพืช/แป้ง", spice: "เครื่องเทศ", sauce: "ซอส/เครื่องปรุง", other: "อื่นๆ" };
  const catColors = { meat: "#E63946", vegetable: "#2D6A4F", fruit: "#E76F51", dairy: "#2196F3", grain: "#795548", spice: "#9C27B0", sauce: "#607D8B", other: "#6B7280" };

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
            <h1 className="text-3xl font-bold text-[#113221]">{t("ingredient_management") || "จัดการวัตถุดิบ"}</h1>
          </div>
          <Button 
            onClick={() => { setEditingItem(null); setFormData({ name: "", name_en: "", category: "other", calories_per_unit: 0, unit: "g" }); setShowForm(true); }} 
            className="bg-[#245a3a] hover:bg-[#1a432b] text-white rounded-full px-6 shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" /> เพิ่มวัตถุดิบ
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
              placeholder={t("search") || "ค้นหาชื่อวัตถุดิบ"} 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#245a3a] focus:ring-1 focus:ring-[#245a3a] transition-all" 
            />
          </div>
        </div>

        {/* Table วัตถุดิบ */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700 uppercase tracking-wider text-xs">{lang === "th" ? "ชื่อ (TH)" : "Name (TH)"}</th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700 uppercase tracking-wider text-xs hidden md:table-cell">{lang === "th" ? "ชื่อ (EN)" : "Name (EN)"}</th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700 uppercase tracking-wider text-xs">หมวดหมู่</th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700 uppercase tracking-wider text-xs hidden sm:table-cell">พลังงาน</th>
                  <th className="px-4 py-4 text-right font-semibold text-gray-700 uppercase tracking-wider text-xs">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="5" className="text-center p-12 text-gray-500">กำลังโหลดข้อมูล...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="5" className="text-center p-12 text-gray-500">ไม่พบวัตถุดิบในระบบ</td></tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-4 py-3.5 font-medium text-gray-900">{item.name}</td>
                      <td className="px-4 py-3.5 text-gray-500 hidden md:table-cell">{item.name_en}</td>
                      <td className="px-4 py-3.5">
                        <span className="text-[11px] font-bold tracking-wide rounded-full px-3 py-1" style={{ backgroundColor: `${catColors[item.category] || "#6B7280"}15`, color: catColors[item.category] || "#6B7280" }}>
                          {lang === "th" ? catMap[item.category] || item.category : item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-600 hidden sm:table-cell">{item.calories_per_unit} kcal / {item.unit}</td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(item)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="แก้ไข"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setItemToDelete(item)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="ลบ"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 🔴 Modal ยืนยันการลบ 🔴 */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200" onClick={() => setItemToDelete(null)}>
          <div className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-2xl text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="font-bold text-xl mb-2 text-gray-800">ยืนยันการลบวัตถุดิบ?</h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              คุณต้องการลบ <span className="font-semibold text-gray-800">"{itemToDelete.name}"</span> ใช่หรือไม่?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setItemToDelete(null)} className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-xl transition-colors">ยกเลิก</button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl shadow-sm shadow-red-200 transition-colors">ลบข้อมูล</button>
            </div>
          </div>
        </div>
      )}

      {/* 🔵 Modal เพิ่ม/แก้ไข 🔵 */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
              <h2 className="font-bold text-xl text-[#113221]">{editingItem ? "แก้ไขวัตถุดิบ" : "เพิ่มวัตถุดิบใหม่"}</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-800 bg-gray-100 p-1.5 rounded-full"><X className="w-5 h-5"/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">ชื่อ (TH)</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[#245a3a] focus:ring-1 focus:ring-[#245a3a] bg-gray-50/50" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">ชื่อ (EN)</label>
                  <input type="text" value={formData.name_en} onChange={(e) => setFormData({ ...formData, name_en: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[#245a3a] focus:ring-1 focus:ring-[#245a3a] bg-gray-50/50" required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">หมวดหมู่</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[#245a3a] focus:ring-1 focus:ring-[#245a3a] bg-gray-50/50">
                  {Object.keys(catMap).map((cat) => <option key={cat} value={cat}>{lang === "th" ? catMap[cat] : cat}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">แคลอรี</label>
                  <input type="number" value={formData.calories_per_unit} onChange={(e) => setFormData({ ...formData, calories_per_unit: parseInt(e.target.value) || 0 })} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[#245a3a] focus:ring-1 focus:ring-[#245a3a] bg-gray-50/50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">ต่อหน่วย (เช่น g, ml)</label>
                  <input type="text" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-[#245a3a] focus:ring-1 focus:ring-[#245a3a] bg-gray-50/50" placeholder="g" />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <Button type="submit" className="w-full py-6 text-base bg-[#245a3a] hover:bg-[#1a432b] text-white rounded-xl shadow-lg shadow-green-900/20 transition-all">
                  {editingItem ? "บันทึกการแก้ไข" : "เพิ่มวัตถุดิบ"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}