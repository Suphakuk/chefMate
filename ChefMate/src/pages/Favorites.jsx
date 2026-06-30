import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, ChevronRight } from "lucide-react";
import { useLang } from "@/components/LanguageProvider";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import RecipeCard from "@/components/RecipeCard";

export default function Favorites() {
  const { t } = useLang();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    base44.entities.Favorite.filter({ created_by_id: user.id }, "-created_date")
      .then(async (favs) => {
        setFavorites(favs);
        const recipePromises = favs.map((f) => base44.entities.Recipe.get(f.recipe_id).catch(() => null));
        const recipeResults = await Promise.all(recipePromises);
        setRecipes(recipeResults.filter(Boolean));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">{t("profile")}</div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">{t("favorites")}</h1>
        <p className="text-base text-muted-foreground">{recipes.length} {t("favorites").toLowerCase()}</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {recipes.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-10 h-10 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">{t("no_data")}</p>
            <Link to="/recommendation" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              {t("recommendation_title")} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}