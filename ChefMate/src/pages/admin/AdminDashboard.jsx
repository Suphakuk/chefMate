import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, Scan, ChefHat, Video, TrendingUp, ChevronRight, Eye, AlertCircle, CheckCircle, X } from "lucide-react";
import { useLang } from "@/components/LanguageProvider";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

export default function AdminDashboard() {
  const { t, lang } = useLang();
  const [users, setUsers] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [scans, setScans] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState(null);

  // เอฟเฟกต์สำหรับซ่อนแจ้งเตือนอัตโนมัติ
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // ดึงข้อมูลทั้งหมดพร้อมกัน (ใช้ catch แยกเพื่อไม่ให้ API ตัวใดตัวหนึ่งพังแล้วพังทั้งหน้า)
      const [uRes, rRes, vRes, sRes] = await Promise.all([
        fetch("https://chefmate-ild4.onrender.com/api/users").then(res => res.ok ? res.json() : []).catch(() => []),
        fetch("https://chefmate-ild4.onrender.com/api/recipes").then(res => res.ok ? res.json() : []).catch(() => []),
        fetch("https://chefmate-ild4.onrender.com/api/videos").then(res => res.ok ? res.json() : []).catch(() => []),
        fetch("https://chefmate-ild4.onrender.com/api/scans").then(res => res.ok ? res.json() : []).catch(() => []) // เผื่ออนาคต
      ]);

      setUsers(uRes);
      setRecipes(rRes);
      setVideos(vRes);
      setScans(sRes);
    } catch (err) {
      setToastMsg({ type: "error", title: "ผิดพลาด", description: "โหลดข้อมูลแดชบอร์ดล้มเหลว" });
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  
  // คำนวณสถิติ Users
  const todayUsers = users.filter((u) => u.created_date && new Date(u.created_date).toDateString() === now.toDateString()).length;
  const monthUsers = users.filter((u) => u.created_date && new Date(u.created_date).getMonth() === now.getMonth()).length;

  // คำนวณกราฟ Scan
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const count = scans.filter((s) => s.created_date && new Date(s.created_date).toDateString() === d.toDateString()).length;
    days.push({ name: d.toLocaleDateString(lang === "th" ? "th-TH" : "en-US", { weekday: "short" }), scans: count });
  }

  // คำนวณกราฟ Users Growth (6 เดือน)
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const count = users.filter((u) => {
      if (!u.created_date) return false;
      const ud = new Date(u.created_date);
      return ud.getMonth() === d.getMonth() && ud.getFullYear() === d.getFullYear();
    }).length;
    months.push({ name: d.toLocaleDateString(lang === "th" ? "th-TH" : "en-US", { month: "short" }), users: count });
  }

  // จัดอันดับข้อมูล
  const ingredientCount = {};
  scans.forEach((s) => {
    s.detected_ingredients?.forEach((ing) => {
      ingredientCount[ing] = (ingredientCount[ing] || 0) + 1;
    });
  });
  const topIngredients = Object.entries(ingredientCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topRecipes = [...recipes].sort((a, b) => (b.recommended_count || 0) - (a.recommended_count || 0)).slice(0, 5);
  const topVideos = [...videos].sort((a, b) => (b.view_count || 0) - (a.view_count || 0)).slice(0, 5);

  // ตั้งค่าโทนสี CookGenius
  const COLORS = ["#245a3a", "#2a9d8f", "#e9c46a", "#f4a261", "#e76f51"];
  const CHART_BORDER = "#f1f5f9";
  const CHART_MUTED = "#94a3b8";
  const CHART_PRIMARY = "#245a3a";

  const stats = [
    { icon: Users, label: t("total_users") || "ผู้ใช้ทั้งหมด", value: users.length, sub: `${todayUsers} สมัครวันนี้`, path: "/admin/users" },
    { icon: TrendingUp, label: t("monthly_users") || "ผู้ใช้เดือนนี้", value: monthUsers, sub: lang === "th" ? "เติบโตในเดือนนี้" : "this month", path: "/admin/users" },
    { icon: ChefHat, label: t("recipe_management") || "เมนูอาหาร", value: recipes.length, sub: lang === "th" ? "เมนูในระบบ" : "recipes", path: "/admin/recipes" },
    { icon: Video, label: t("video_management") || "วิดีโอสอนทำอาหาร", value: videos.length, sub: lang === "th" ? "คลิปในระบบ" : "videos", path: "/admin/videos" },
  ];

  if (loading) {
    return (
      <div className="bg-[#f2f6f4] min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#245a3a] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#f2f6f4] min-h-screen relative pb-16">
      
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="text-xs text-muted-foreground mb-1">ผู้ดูแลระบบ</div>
        <h1 className="text-3xl md:text-4xl font-bold text-[#113221]">{t("admin_dashboard") || "ภาพรวมระบบ"}</h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Link key={i} to={stat.path} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[#245a3a]/50 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#e9f2ec] flex items-center justify-center group-hover:bg-[#245a3a] transition-colors duration-300">
                    <Icon className="w-5 h-5 text-[#245a3a] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#245a3a] transition-colors" />
                </div>
                <p className="text-3xl md:text-4xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mt-2">{stat.label}</p>
                <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
              </Link>
            );
          })}
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[#113221] mb-1">{t("user_growth") || "การเติบโตของผู้ใช้"}</h3>
            <p className="text-xs text-gray-500 mb-6">{lang === "th" ? "6 เดือนล่าสุด" : "Last 6 months"}</p>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={months}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_BORDER} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: CHART_MUTED }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fontSize: 12, fill: CHART_MUTED }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip contentStyle={{ border: `none`, borderRadius: 12, fontSize: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="users" name="ผู้ใช้งาน" stroke={CHART_PRIMARY} strokeWidth={3} dot={{ fill: CHART_PRIMARY, r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[#113221] mb-1">{t("scan_chart") || "สถิติการสแกนวัตถุดิบ"}</h3>
            <p className="text-xs text-gray-500 mb-6">{lang === "th" ? "7 วันล่าสุด" : "Last 7 days"}</p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={days} barSize={30}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_BORDER} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: CHART_MUTED }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fontSize: 12, fill: CHART_MUTED }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ border: `none`, borderRadius: 12, fontSize: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="scans" name="จำนวนสแกน" fill={CHART_PRIMARY} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Top Ingredients Pie */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-[#113221] mb-6">{t("top_ingredients") || "วัตถุดิบยอดฮิต"}</h3>
            {topIngredients.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-10">
                <Scan className="w-10 h-10 mb-3 opacity-20" />
                <p className="text-sm">ยังไม่มีข้อมูลการสแกน</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={topIngredients.map(([name, value]) => ({ name, value }))} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" paddingAngle={5}>
                      {topIngredients.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ border: `none`, borderRadius: 8, fontSize: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-6 space-y-2.5">
                  {topIngredients.slice(0, 5).map(([name, count], i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2.5 text-gray-700 font-medium">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                        {name}
                      </span>
                      <span className="text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded">{count}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Top Recipes List */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-[#113221] mb-6">{t("top_recipes") || "เมนูแนะนำยอดฮิต"}</h3>
            {topRecipes.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-10">
                <ChefHat className="w-10 h-10 mb-3 opacity-20" />
                <p className="text-sm">ยังไม่มีข้อมูลเมนูอาหาร</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topRecipes.map((recipe, i) => (
                  <div key={recipe.id} className="flex items-center gap-4 group">
                    <span className="text-lg font-bold text-gray-300 w-4 group-hover:text-[#245a3a] transition-colors">{i + 1}</span>
                    {recipe.image_url ? (
                      <img src={recipe.image_url} alt="" className="w-12 h-12 rounded-lg object-cover border border-gray-100" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center"><ChefHat className="w-5 h-5 text-gray-400" /></div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{lang === "th" ? recipe.title : recipe.title_en || recipe.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{recipe.recommended_count || 0} {lang === "th" ? "ครั้ง" : "times"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Videos List */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-[#113221] mb-6">{t("top_videos") || "วิดีโอล่าสุด"}</h3>
            {topVideos.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-10">
                <Video className="w-10 h-10 mb-3 opacity-20" />
                <p className="text-sm">ยังไม่มีข้อมูลวิดีโอ</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topVideos.map((video, i) => (
                  <div key={video.id} className="flex items-center gap-4 group">
                    <span className="text-lg font-bold text-gray-300 w-4 group-hover:text-[#245a3a] transition-colors">{i + 1}</span>
                    <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0 border border-red-100">
                      <Video className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate" title={lang === "th" ? video.title : video.title_en || video.title}>
                        {lang === "th" ? video.title : video.title_en || video.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" /> {video.view_count || 0} วิว
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}