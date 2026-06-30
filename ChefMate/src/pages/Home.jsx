import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, ArrowRight, Upload, Scan, ChefHat } from "lucide-react";
import { useLang } from "@/components/LanguageProvider";
import RecipeCard from "@/components/RecipeCard";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopRecipes();
  }, []);

  const loadTopRecipes = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3001/api/recipes");
      if (!res.ok) throw new Error("ไม่สามารถดึงข้อมูลเมนูได้");
      
      const data = await res.json();
      
      // เรียงลำดับจากเมนูที่มีคนแนะนำมากที่สุด (recommended_count) และตัดมาแค่ 6 อันดับแรก
      const topRecipes = data
        .sort((a, b) => (b.recommended_count || 0) - (a.recommended_count || 0))
        .slice(0, 6);
        
      setRecipes(topRecipes);
    } catch (err) {
      console.error("Home Load Error:", err);
      setRecipes([]); // ถ้าพังให้ตั้งเป็น Array ว่าง ป้องกันหน้าจอขาว
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const ingredients = searchQuery.split(",").map(s => s.trim()).filter(Boolean);
    navigate("/recommendation", { state: { manualIngredients: ingredients } });
  };

  const heroImg = "https://media.base44.com/images/public/6a3bcd9103d8fa2fe8269676/4c4cb2049_generated_image.png";
  const uploadImg = "https://media.base44.com/images/public/6a3bcd9103d8fa2fe8269676/b9e3327f0_generated_image.png";
  const detectImg = "https://media.base44.com/images/public/6a3bcd9103d8fa2fe8269676/ce8ae358f_generated_image.png";
  const recommendImg = "https://media.base44.com/images/public/6a3bcd9103d8fa2fe8269676/d72376d78_generated_image.png";

  const steps = [
    { img: uploadImg, icon: Upload, title: t("step1_title"), desc: t("step1_desc") },
    { img: detectImg, icon: Scan, title: t("step2_title"), desc: t("step2_desc") },
    { img: recommendImg, icon: ChefHat, title: t("step3_title"), desc: t("step3_desc") },
  ];

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 md:pt-20 md:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Text */}
            <div className="lg:col-span-5 lg:order-1">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-2">
                <span className="w-8 h-px bg-primary"></span>
                {lang === "th" ? "Cooking Recipe Recommendation" : "Cooking Recipe Recommendation"}
              </div>
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[0.95] mb-2">
                {t("hero_title_1")}
              </h1>
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl italic font-normal text-foreground leading-[0.95] mb-8">
                {t("hero_title_2")}
              </h1>
              <p className="text-base text-muted-foreground mb-8 leading-relaxed max-w-md">
                {lang === "th"
                  ? "อัปโหลดรูปวัตถุดิบหรือพิมพ์ชื่อวัตถุดิบที่มีในครัว แล้วให้ AI แนะนำเมนูอาหารที่คุณทำได้ทันที"
                  : "Upload a photo of your ingredients or type them in, and let AI recommend recipes you can cook right now."}
              </p>

              {/* Search */}
              <form onSubmit={handleSearch} className="pill-search flex items-center gap-2 bg-card px-5 py-3.5 mb-4 rounded-full border border-border shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("hero_search_placeholder") || "พิมพ์ชื่อวัตถุดิบ เช่น หมู, ไก่, ไข่..."}
                  className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                />
                <button type="submit" className="bg-primary hover:bg-primary/80 text-primary-foreground rounded-full p-2 transition-colors flex-shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="flex items-center gap-4 text-sm mt-6">
                <Link to="/upload">
                  <Button variant="outline" className="rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all">
                    <Upload className="w-4 h-4 mr-2" />
                    {t("upload_title") || "อัปโหลดรูปภาพ"}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Image */}
            <div className="lg:col-span-7 lg:order-2 relative">
              <div className="aspect-[5/4] overflow-hidden bg-muted rounded-2xl shadow-lg">
                <img src={heroImg} alt="Fresh ingredients" className="w-full h-full object-cover" />
              </div>
              {/* Magazine-style label overlay */}
              <div className="absolute bottom-6 left-6 bg-card/95 backdrop-blur px-5 py-2.5 rounded-lg shadow-sm border border-border/50">
                <p className="font-display text-sm italic text-foreground font-medium">— {lang === "th" ? "ครัวของคุณ คือจุดเริ่มต้น" : "Your kitchen, your starting point"}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border py-16 md:py-20 bg-muted/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">{lang === "th" ? "วิธีการใช้งาน" : "How it works"}</div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">{t("how_it_works")}</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="group bg-card rounded-2xl p-4 border border-border shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative overflow-hidden aspect-[4/3] mb-5 bg-muted rounded-xl">
                    <img src={step.img} alt={step.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-card/95 flex items-center justify-center shadow-sm">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="absolute top-4 right-4 font-display text-5xl font-bold text-primary-foreground/90 drop-shadow-md">
                      0{i + 1}
                    </div>
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2 px-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed px-2 pb-2">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular recipes */}
      <section className="border-t border-border py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">{lang === "th" ? "เมนูแนะนำ" : "Trending"}</div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">{t("popular_recipes") || "เมนูยอดนิยม"}</h2>
            </div>
            <Link to="/recommendation" className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline bg-primary/5 px-4 py-2 rounded-full transition-colors hover:bg-primary/10">
              {t("view_all")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : recipes.length === 0 ? (
            <p className="text-center py-20 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border">{t("no_data") || "ยังไม่มีข้อมูลเมนูอาหาร"}</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
              {/* Featured large (อันดับ 1) */}
              {recipes[0] && (
                <div className="lg:col-span-5">
                  <RecipeCard recipe={recipes[0]} variant="featured" />
                </div>
              )}
              {/* Grid of smaller (อันดับ 2-6) */}
              <div className="lg:col-span-7">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {recipes.slice(1, 7).map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-8 text-center sm:hidden">
            <Link to="/recommendation" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline bg-primary/5 px-6 py-3 rounded-full transition-colors hover:bg-primary/10">
              {t("view_all")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
{/* CTA - จะแสดงก็ต่อเมื่อยังไม่ได้ล็อกอินเท่านั้น */}
      {!localStorage.getItem("user") && (
        <section className="border-t border-border py-16 md:py-24 bg-primary/5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              {lang === "th" ? "เริ่มค้นหาเมนูอร่อยวันนี้" : "Start discovering recipes today"}
            </h2>
            <p className="text-base text-muted-foreground mb-8 max-w-xl mx-auto">
              {lang === "th"
                ? "สมัครสมาชิกเพื่อบันทึกเมนูโปรดและดูประวัติการสแกนของคุณ"
                : "Sign up to save your favorite recipes and track your scan history"}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/register">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-6 text-base shadow-lg shadow-primary/20 transition-all hover:scale-105">
                  {t("register") || "สมัครสมาชิก"}
                </Button>
              </Link>
              <Link to="/upload">
                <Button variant="outline" className="rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-6 text-base bg-white transition-all">
                  {t("upload_title") || "อัปโหลดวัตถุดิบ"}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}