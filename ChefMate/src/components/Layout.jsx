import { Outlet, Link } from "react-router-dom"; // 👈 เพิ่ม Link เข้ามาตรงบรรทัดนี้
import Navbar from "@/components/Navbar";
import { LanguageProvider } from "@/components/LanguageProvider";

export default function Layout() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}

function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-display text-2xl font-bold">Cook<span className="italic">Genius</span></h3>
            <p className="text-sm text-primary-foreground/60 mt-2">ระบบแนะนำเมนูอาหารจากวัตถุดิบ<br/>Cooking Recipe Recommendation System</p>
          </div>
          
          {/* โค้ดส่วน QUICK LINKS ใน Footer */}
          <div>
            <h3 className="font-bold uppercase tracking-wider mb-4 text-white">QUICK LINKS</h3>
            <ul className="space-y-2 text-sm text-green-100">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              
              {/* เช็กเงื่อนไข: ถ้ายัง 'ไม่ได้' ล็อกอิน ให้โชว์ Sign Up / Login */}
              {!localStorage.getItem("user") ? (
                <>
                  <li>
                    <Link to="/register" className="hover:text-white transition-colors">Sign Up</Link>
                  </li>
                  <li>
                    <Link to="/login" className="hover:text-white transition-colors">Login</Link>
                  </li>
                </>
              ) : (
                /* เช็กเงื่อนไข: ถ้า 'ล็อกอินแล้ว' ให้โชว์เมนูอื่นแทน */
                <>
                  <li>
                    <Link to="/userDashboard" className="hover:text-white transition-colors">Dashboard</Link>
                  </li>
                  <li>
                    <Link to="/favorites" className="hover:text-white transition-colors">My Favorites</Link>
                  </li>
                </>
              )}
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/80 mb-3">About</h4>
            <p className="text-sm text-primary-foreground/60">Supported by AI ingredient detection (YOLO / CNN) for research and daily cooking.</p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-primary-foreground/10 text-center text-xs text-primary-foreground/40">
          © 2026 CookGenius. Cooking Recipe Recommendation System.
        </div>
      </div>
    </footer>
  );
}