import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Upload, Heart, Scan, ChevronRight, Clock, User, LogOut, Settings, ChefHat } from "lucide-react";
import { useLang } from "@/components/LanguageProvider";
import RecipeCard from "@/components/RecipeCard";

export default function UserDashboard() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [popularRecipes, setPopularRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
    else navigate("/login");
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [recipesRes, scansRes, favsRes] = await Promise.all([
        fetch("http://localhost:3001/api/recipes").then(r => r.ok ? r.json() : []),
        fetch("http://localhost:3001/api/scans").then(r => r.ok ? r.json() : []),
        fetch("http://localhost:3001/api/favorites").then(r => r.ok ? r.json() : [])
      ]);
      setPopularRecipes(recipesRes.sort((a,b) => b.recommended_count - a.recommended_count).slice(0, 4));
      setRecentScans(scansRes.filter(s => s.created_by_id === user.id).slice(0, 3));
      setFavorites(favsRes.filter(f => f.user_id === user.id));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  const confirmLogout = () => {
  localStorage.removeItem("user");
  window.location.href = "/login";
};

  if (!user) return null;

  return (
    <div className="bg-[#f2f6f4] min-h-screen pb-20">
      {/* 🟩 Header Profile 🟩 */}
      <div className="bg-[#245a3a] text-white pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/30 backdrop-blur-sm shadow-xl">
            <User className="w-12 h-12 text-white" />
          </div>
          <div className="text-center md:text-left">
            <div className="text-sm font-medium text-green-200 tracking-wider uppercase mb-1">แดชบอร์ดส่วนตัว</div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">สวัสดี, {user.username}</h1>
            <p className="text-green-100 text-sm">{user.email}</p>
          </div>
          <div className="md:ml-auto flex gap-3">
            {/* เปลี่ยนบรรทัดนี้ใน Header */}
            <button 
              onClick={() => setShowLogoutModal(true)} 
              className="bg-red-500/90 hover:bg-red-600 transition-all px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg"
            >
              <LogOut className="w-4 h-4" /> ออกจากระบบ
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* 🟡 Action Cards 🟡 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Link to="/upload" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-center gap-4">
            <div className="w-12 h-12 bg-[#e9f2ec] rounded-full flex items-center justify-center"><Upload className="w-6 h-6 text-[#245a3a]" /></div>
            <div><h3 className="font-bold text-gray-900">อัปโหลด</h3><p className="text-xs text-gray-500">สแกนวัตถุดิบ</p></div>
          </Link>
          <Link to="/recommendation" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center"><Scan className="w-6 h-6 text-blue-500" /></div>
            <div><h3 className="font-bold text-gray-900">เมนูแนะนำ</h3><p className="text-xs text-gray-500">ค้นหาเมนู</p></div>
          </Link>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center"><Scan className="w-6 h-6 text-gray-400" /></div>
            <div><p className="text-2xl font-bold">{recentScans.length}</p><p className="text-xs text-gray-500">สแกนทั้งหมด</p></div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center"><Heart className="w-6 h-6 text-rose-500" /></div>
            <div><p className="text-2xl font-bold">{favorites.length}</p><p className="text-xs text-gray-500">เมนูโปรด</p></div>
          </div>
        </div>

        {/* 🔵 Recent Scans 🔵 */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-10">
          <h2 className="text-2xl font-bold text-[#113221] mb-6">ประวัติการสแกนล่าสุด</h2>
          {recentScans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentScans.map((scan) => (
                <div key={scan.id} className="bg-gray-50 p-4 rounded-2xl">
                  <div className="text-[10px] font-bold text-gray-400 mb-2">{new Date(scan.created_date).toLocaleDateString()}</div>
                  <div className="flex flex-wrap gap-2">
                    {scan.detected_ingredients?.map((ing, i) => (
                      <span key={i} className="text-xs bg-white border border-gray-200 px-2 py-1 rounded">{ing}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400">ยังไม่มีประวัติการสแกน</div>
          )}
        </div>

        {/* 🔴 Popular Recipes 🔴 */}
        <div>
          <h2 className="text-2xl font-bold text-[#113221] mb-6">เมนูยอดนิยมสำหรับคุณ</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}