import { Link } from "react-router-dom";
import { Clock, Flame, ChefHat } from "lucide-react";
import { useLang } from "@/components/LanguageProvider";

export default function RecipeCard({ recipe, variant = "default", matchScore, missingIngredients = [] }) {
  const { t, lang } = useLang();
  const title = lang === "th" ? recipe.title : recipe.title_en || recipe.title;
  const desc = lang === "th" ? recipe.description : recipe.description_en || recipe.description;

  const diffMap = { easy: "diff_easy", medium: "diff_medium", hard: "diff_hard" };
  const catMap = { rice: "cat_rice", noodle: "cat_noodle", soup: "cat_soup", curry: "cat_curry", stir_fry: "cat_stir_fry", salad: "cat_salad", dessert: "cat_dessert", other: "cat_other" };

  if (variant === "featured") {
    return (
      <Link to={`/recipe/${recipe.id}`} className="group block">
        <div className="overflow-hidden mb-4 aspect-[4/3] bg-muted">
          <img src={recipe.image_url} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        </div>
        <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground mb-2">
          <span>{lang === "th" ? "เมนูแนะนำ" : "Featured"}</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground" />
          <span>{t(catMap[recipe.category] || "cat_other")}</span>
        </div>
        <h3 className="font-display text-3xl font-bold text-foreground mb-2 group-hover:underline">{title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3 leading-relaxed">{desc}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {recipe.cook_time} min</span>
          <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5" /> {recipe.calories} kcal</span>
          <span className="flex items-center gap-1"><ChefHat className="w-3.5 h-3.5" /> {t(diffMap[recipe.difficulty] || "diff_easy")}</span>
        </div>
        {matchScore !== undefined && (
          <MatchBadge score={matchScore} />
        )}
      </Link>
    );
  }

  return (
    <Link to={`/recipe/${recipe.id}`} className="group block">
      <div className="overflow-hidden mb-3 aspect-square bg-muted">
        <img src={recipe.image_url} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{t(catMap[recipe.category] || "cat_other")}</div>
      <h3 className="font-display text-lg font-semibold text-foreground mb-1 group-hover:underline line-clamp-1">{title}</h3>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">{desc}</p>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {recipe.cook_time}m</span>
        <span className="flex items-center gap-1"><Flame className="w-3 h-3" /> {recipe.calories}</span>
      </div>
      {matchScore !== undefined && (
        <MatchBadge score={matchScore} />
      )}
    </Link>
  );
}

function MatchBadge({ score }) {
  const { t } = useLang();
  const pct = Math.round(score * 100);
  const color = pct >= 75 ? "#2D6A4F" : pct >= 50 ? "#E76F51" : "#BC4749";
  return (
    <div className="mt-3 flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-semibold" style={{ color }}>{pct}% {t("match_score")}</span>
    </div>
  );
}