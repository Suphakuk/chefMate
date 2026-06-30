import { Link, useNavigate, useLocation } from "react-router-dom";
import { useLang } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Menu, X, Globe, LogOut, ChevronDown, AlertCircle } from "lucide-react"; // เพิ่ม AlertCircle
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast"; 

export default function Navbar() {
  const { t, lang, toggleLang } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null); 
  
  // State ใหม่สำหรับควบคุมการเปิด/ปิด Popup ออกจากระบบ
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  }, [location.pathname]);

  // ฟังก์ชันนี้แค่เปิด Popup ขึ้นมา (ยังไม่ได้ออกจริง)
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  // ฟังก์ชันนี้คือการ กดยืนยันออกจากระบบ จริงๆ
  const confirmLogout = () => {
    setShowLogoutModal(false); // ปิด Popup ก่อน
    localStorage.removeItem("user");
    setUser(null);
    
    toast({
      title: "👋 ออกจากระบบสำเร็จ",
      description: "ระบบได้ทำการล็อกเอาท์เรียบร้อยแล้ว แล้วพบกันใหม่ครับ!",
      duration: 3000, // 👈 เปลี่ยนตรงนี้เป็น 3000 (3 วินาที) หรือลบบรรทัดนี้ทิ้งไปเลยก็ได้ครับ
    });
    
    navigate("/");
  };

  const isAdmin = user?.role === "admin";

  const userNavLinks = [
    { label: t("dashboard"), path: "/dashboard" },
    { label: t("upload"), path: "/upload" },
    { label: t("favorites"), path: "/favorites" },
  ];

  const adminNavLinks = [
    { label: t("admin_dashboard"), path: "/admin" },
    { label: t("user_management"), path: "/admin/users" },
    { label: t("recipe_management"), path: "/admin/recipes" },
    { label: t("ingredient_management"), path: "/admin/ingredients" },
    { label: t("video_management"), path: "/admin/videos" },
    { label: t("ai_models"), path: "/admin/ai-models" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="font-display text-xl font-bold tracking-tight text-foreground">
              Cook<span className="italic">Genius</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              <Link to="/" className={`px-3 py-2 text-sm font-medium transition-colors ${isActive("/") ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {t("home")}
              </Link>

              {user && userNavLinks.map((link) => (
                <Link key={link.path} to={link.path} className={`px-3 py-2 text-sm font-medium transition-colors ${isActive(link.path) ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {link.label}
                </Link>
              ))}

              {isAdmin && (
                <div className="relative group">
                  <button className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                    {t("admin")}
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute right-0 top-full pt-2 hidden group-hover:block">
                    <div className="bg-card border border-border shadow-lg rounded-md w-52 py-1">
                      {adminNavLinks.map((link) => (
                        <Link key={link.path} to={link.path} className={`block px-4 py-2 text-sm transition-colors ${isActive(link.path) ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Language toggle */}
              <button onClick={toggleLang} className="ml-2 px-2.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                <Globe className="w-4 h-4" />
                {lang === "th" ? "TH" : "EN"}
              </button>

              {!user ? (
                <>
                  <Link to="/login">
                    <Button variant="ghost" className="text-sm font-medium text-muted-foreground hover:text-foreground">{t("login")}</Button>
                  </Link>
                  <Link to="/register">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-full px-5">{t("register")}</Button>
                  </Link>
                </>
              ) : (
                <div className="relative group ml-1">
                  <button className="flex items-center gap-2 pl-2 pr-1 py-1.5 rounded-full hover:bg-muted transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      {(user.username || user.email || "U")[0].toUpperCase()}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <div className="absolute right-0 top-full pt-2 hidden group-hover:block">
                    <div className="bg-card border border-border shadow-lg rounded-md w-48 py-1">
                      <div className="px-4 py-2 border-b border-border">
                        <p className="text-sm font-medium text-foreground truncate">{user.username || "User"}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <Link to="/profile" className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">{t("profile")}</Link>
                      {/* เปลี่ยนมาเรียก handleLogoutClick แทน */}
                      <button onClick={handleLogoutClick} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 flex items-center gap-2 transition-colors">
                        <LogOut className="w-3.5 h-3.5" />
                        {t("logout")}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </nav>

            {/* Mobile toggle */}
            <div className="md:hidden flex items-center gap-2">
              <button onClick={toggleLang} className="p-2 text-muted-foreground hover:text-foreground">
                <Globe className="w-4 h-4" />
              </button>
              <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-foreground">
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileOpen && (
            <div className="md:hidden border-t border-border py-3 space-y-1">
              <Link to="/" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm font-medium text-foreground">{t("home")}</Link>
              {user && userNavLinks.map((link) => (
                <Link key={link.path} to={link.path} onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground">{link.label}</Link>
              ))}
              {isAdmin && adminNavLinks.map((link) => (
                <Link key={link.path} to={link.path} onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground">{link.label}</Link>
              ))}
              {user && (
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground">{t("profile")}</Link>
              )}
              <div className="pt-2 border-t border-border flex flex-col gap-2 px-3">
                {!user ? (
                  <>
                    <Link to="/login" onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" className="w-full rounded-full">{t("login")}</Button>
                    </Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full">{t("register")}</Button>
                    </Link>
                  </>
                ) : (
                  <Button onClick={() => { setMobileOpen(false); handleLogoutClick(); }} variant="destructive" className="w-full rounded-full flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    {t("logout")}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* =========================================
          UI Popup สำหรับยืนยันการออกจากระบบ (Modal)
          ========================================= */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-card w-[90%] max-w-sm p-6 rounded-2xl shadow-2xl border border-border animate-in zoom-in-95 slide-in-from-bottom-8 duration-300"
          >
            <div className="flex flex-col items-center text-center">
              {/* ไอคอนแจ้งเตือน */}
              <div className="w-14 h-14 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-500 rounded-full flex items-center justify-center mb-4">
                <LogOut className="w-7 h-7 ml-1" />
              </div>
              
              <h3 className="text-xl font-bold text-foreground">ออกจากระบบ?</h3>
              <p className="text-sm text-muted-foreground mt-2 mb-6">
                คุณแน่ใจหรือไม่ที่จะออกจากระบบ CookGenius?
              </p>
              
              {/* ปุ่มกดยืนยัน/ยกเลิก */}
              <div className="flex w-full gap-3">
                <Button 
                  variant="outline" 
                  className="w-full h-11 rounded-xl" 
                  onClick={() => setShowLogoutModal(false)}
                >
                  ยกเลิก
                </Button>
                <Button 
                  className="w-full h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white shadow-md transition-all" 
                  onClick={confirmLogout}
                >
                  ออกจากระบบ
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}