import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Mail, User as UserIcon, Calendar, Scan, Heart, ChevronRight } from "lucide-react";
import { useLang } from "@/components/LanguageProvider";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const { t, lang } = useLang();
  const { user, logout } = useAuth();
  const [scanCount, setScanCount] = useState(0);
  const [favCount, setFavCount] = useState(0);
  const [recentScans, setRecentScans] = useState([]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      base44.entities.ScanResult.filter({ created_by_id: user.id }),
      base44.entities.Favorite.filter({ created_by_id: user.id }),
    ]).then(([scans, favs]) => {
      setScanCount(scans.length);
      setFavCount(favs.length);
      setRecentScans(scans.slice(-3).reverse());
    }).catch(() => {});
  }, [user]);

  const handleLogout = () => logout("/");

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">{t("profile")}</div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-8">{t("profile_title")}</h1>

        {/* Profile card */}
        <div className="border border-border rounded-lg p-8 mb-8">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display text-3xl font-bold">
              {(user?.full_name || user?.email || "U")[0].toUpperCase()}
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">{user?.full_name || "User"}</h2>
              <p className="text-sm text-muted-foreground capitalize">{user?.role || "user"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-border">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{t("email")}</p>
                <p className="text-sm text-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <UserIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{t("full_name")}</p>
                <p className="text-sm text-foreground">{user?.full_name || "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{t("created_date")}</p>
                <p className="text-sm text-foreground">{user?.created_date ? new Date(user.created_date).toLocaleDateString() : "—"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link to="/upload" className="border border-border rounded-lg p-6 hover:border-primary transition-colors group">
            <div className="flex items-center justify-between mb-3">
              <Scan className="w-5 h-5 text-primary" />
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <p className="font-display text-3xl font-bold text-foreground">{scanCount}</p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{t("total_scans")}</p>
          </Link>
          <Link to="/favorites" className="border border-border rounded-lg p-6 hover:border-primary transition-colors group">
            <div className="flex items-center justify-between mb-3">
              <Heart className="w-5 h-5 text-destructive" />
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <p className="font-display text-3xl font-bold text-foreground">{favCount}</p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{t("favorites")}</p>
          </Link>
        </div>

        {/* Recent scans */}
        {recentScans.length > 0 && (
          <div className="mb-8">
            <h3 className="font-display text-xl font-bold text-foreground mb-4">{t("scan_history")}</h3>
            <div className="space-y-3">
              {recentScans.map((scan) => (
                <div key={scan.id} className="flex items-center gap-4 border border-border rounded-lg p-4">
                  {scan.image_url ? (
                    <img src={scan.image_url} alt="Scan" className="w-16 h-16 rounded object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded bg-muted flex items-center justify-center">
                      <Scan className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-1.5">
                      {scan.detected_ingredients?.map((ing, i) => (
                        <span key={i} className="text-xs bg-muted text-foreground rounded-full px-2.5 py-1">{ing}</span>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{new Date(scan.created_date).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button onClick={handleLogout} variant="outline" className="rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
          {t("logout")}
        </Button>
      </div>
    </div>
  );
}