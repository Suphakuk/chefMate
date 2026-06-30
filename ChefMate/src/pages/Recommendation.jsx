import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Search, AlertCircle, ChevronRight } from "lucide-react";
import { useLang } from "@/components/LanguageProvider";
import { base44 } from "@/api/base44Client";
import RecipeCard from "@/components/RecipeCard";

export default function Recommendation() {
  const { t, lang } = useLang();
  const location = useLocation();
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [allRecipeIngredients, setAllRecipeIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [manualInput, setManualInput] = useState("");
  const [ingredientMap, setIngredientMap] = useState({});

  useEffect(() => {
    const initial = location.state?.manualIngredients || [];
    setIngredients(initial);
    Promise.all([
      base44.entities.Recipe.list(),
      base44.entities.RecipeIngredient.list(),
    ]).then(([recipesData, riData]) => {
      setRecipes(recipesData);
      setAllRecipeIngredients(riData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [location.state]);

  useEffect(() => {
    base44.entities.Ingredient.list().then((ingredientsData) => {
      const map = {};
      ingredientsData.forEach((ing) => {
        map[ing.id] = { th: ing.name, en: ing.name_en || ing.name };
      });
      setIngredientMap(map);
    }).catch(() => {});
  }, []);

  const recommendations = recipes.map((recipe) => {
    const recipeRIs = allRecipeIngredients.filter((ri) => ri.recipe_id === recipe.id);
    if (recipeRIs.length === 0) return { recipe, matchScore: 0, missing: [], have: [], total: 0 };

    const riNames = recipeRIs.map((ri) => {
      const ing = ingredientMap[ri.ingredient_id];
      return ing ? (lang === "th" ? ing.th : ing.en) : "";
    }).filter(Boolean);

    const normalized = ingredients.map((i) => i.toLowerCase().trim());

    const have = riNames.filter((name) =>
      normalized.some((uIng) => name.toLowerCase().includes(uIng) || uIng.includes(name.toLowerCase()))
    );
    const missing = riNames.filter((name) =>
      !normalized.some((uIng) => name.toLowerCase().includes(uIng) || uIng.includes(name.toLowerCase()))
    );

    const matchScore = have.length / riNames.length;
    return { recipe, matchScore, missing, have, total: riNames.length };
  }).filter((r) => r.matchScore > 0).sort((a, b) => b.matchScore - a.matchScore);

  const handleAddIngredient = () => {
    const items = manualInput.split(",").map((s) => s.trim()).filter(Boolean);
    if (items.length === 0) return;
    setIngredients((prev) => [...new Set([...prev, ...items])]);
    setManualInput("");
  };

  const handleRemoveIngredient = (item) => {
    setIngredients((prev) => prev.filter((i) => i !== item));
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">{lang === "th" ? "ผลการค้นหา" : "Results"}</div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">{t("recommendation_title")}</h1>
        <p className="text-base text-muted-foreground max-w-xl mb-8">
          {lang === "th"
            ? `พบ ${recommendations.length} เมนูที่ทำได้จากวัตถุดิบของคุณ`
            : `Found ${recommendations.length} recipes you can make with your ingredients`}
        </p>

        {/* Ingredient chips */}
        <div className="border border-border rounded-lg p-4 mb-8 bg-muted/30">
          <label className="text-xs uppercase tracking-wider text-muted-foreground mb-3 block">{t("ingredients_have")}</label>
          {ingredients.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {ingredients.map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-card border border-border rounded-full pl-4 pr-1 py-1.5">
                  <span className="text-sm text-foreground">{item}</span>
                  <button onClick={() => handleRemoveIngredient(item)} className="w-5 h-5 rounded-full hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors text-xs">×</button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddIngredient()}
              placeholder={t("manual_input_placeholder")}
              className="flex-1 bg-card border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <button onClick={handleAddIngredient} className="bg-primary hover:bg-primary/80 text-primary-foreground rounded-md px-4 py-2 text-sm font-medium transition-colors">
              {t("add_ingredient")}
            </button>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : ingredients.length === 0 ? (
          <div className="text-center py-20">
            <AlertCircle className="w-10 h-10 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">{t("no_ingredients")}</p>
            <Link to="/upload" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              {t("upload_title")} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-20">
            <AlertCircle className="w-10 h-10 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">{t("no_recommendations")}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Featured top match */}
            {recommendations[0] && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 pb-8 border-b border-border">
                <div className="lg:col-span-5">
                  <RecipeCard recipe={recommendations[0].recipe} variant="featured" matchScore={recommendations[0].matchScore} />
                </div>
                <div className="lg:col-span-7">
                  <MissingIngredientsCard
                    recipe={recommendations[0].recipe}
                    have={recommendations[0].have}
                    missing={recommendations[0].missing}
                  />
                </div>
              </div>
            )}

            {/* Rest */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {recommendations.slice(1).map((rec) => (
                <RecipeCard key={rec.recipe.id} recipe={rec.recipe} matchScore={rec.matchScore} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MissingIngredientsCard({ recipe, have, missing }) {
  const { t, lang } = useLang();
  return (
    <div className="bg-muted/30 rounded-lg p-6 h-full">
      <h3 className="font-display text-xl font-bold text-foreground mb-4">
        {lang === "th" ? "วัตถุดิบที่มี / ที่ขาด" : "Have / Missing"}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="text-xs uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            {t("ingredients_have")} ({have.length})
          </div>
          {have.length === 0 ? (
            <p className="text-sm text-muted-foreground">—</p>
          ) : (
            <ul className="space-y-1.5">
              {have.map((item, i) => (
                <li key={i} className="text-sm text-foreground flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-primary"></span>
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-destructive mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-destructive"></span>
            {t("ingredients_missing")} ({missing.length})
          </div>
          {missing.length === 0 ? (
            <p className="text-sm text-primary font-medium">{lang === "th" ? "ครบทุกอย่าง!" : "You have everything!"}</p>
          ) : (
            <ul className="space-y-1.5">
              {missing.map((item, i) => (
                <li key={i} className="text-sm text-foreground flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-destructive"></span>
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}