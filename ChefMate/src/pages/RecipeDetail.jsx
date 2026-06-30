import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Clock, Flame, ChefHat, Heart, ChevronLeft, Play } from "lucide-react";
import { useLang } from "@/components/LanguageProvider";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";

export default function RecipeDetail() {
  const { id } = useParams();
  const { t, lang } = useLang();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [steps, setSteps] = useState([]);
  const [videos, setVideos] = useState([]);
  const [allIngredients, setAllIngredients] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      base44.entities.Recipe.get(id),
      base44.entities.RecipeIngredient.filter({ recipe_id: id }),
      base44.entities.RecipeStep.filter({ recipe_id: id }, "step_number"),
      base44.entities.RecipeVideo.filter({ recipe_id: id }),
      base44.entities.Ingredient.list(),
    ]).then(([r, ris, sts, vids, ings]) => {
      setRecipe(r);
      setIngredients(ris);
      setSteps(sts);
      setVideos(vids);
      setAllIngredients(ings);
      base44.entities.Recipe.update(id, { view_count: (r.view_count || 0) + 1 });
      setLoading(false);
    }).catch(() => setLoading(false));

    if (user) {
      base44.entities.Favorite.filter({ created_by_id: user.id }).then(setFavorites).catch(() => {});
      base44.entities.Like.filter({ created_by_id: user.id }).then(setLikes).catch(() => {});
    }
  }, [id, user]);

  const isFavorited = favorites.some((f) => f.recipe_id === id);
  const ingredientMap = {};
  allIngredients.forEach((ing) => { ingredientMap[ing.id] = ing; });

  const toggleFavorite = async () => {
    if (!user) return;
    if (isFavorited) {
      const fav = favorites.find((f) => f.recipe_id === id);
      if (fav) {
        await base44.entities.Favorite.delete(fav.id);
        setFavorites(favorites.filter((f) => f.id !== fav.id));
      }
    } else {
      const newFav = await base44.entities.Favorite.create({ recipe_id: id });
      setFavorites([...favorites, newFav]);
    }
  };

  const toggleLike = async (videoId) => {
    if (!user) return;
    const isLiked = likes.some((l) => l.video_id === videoId);
    if (isLiked) {
      const like = likes.find((l) => l.video_id === videoId);
      if (like) {
        await base44.entities.Like.delete(like.id);
        setLikes(likes.filter((l) => l.id !== like.id));
        const vid = videos.find((v) => v.id === videoId);
        if (vid) {
          await base44.entities.RecipeVideo.update(videoId, { like_count: Math.max(0, (vid.like_count || 0) - 1) });
        }
      }
    } else {
      const newLike = await base44.entities.Like.create({ video_id: videoId });
      setLikes([...likes, newLike]);
      const vid = videos.find((v) => v.id === videoId);
      if (vid) {
        await base44.entities.RecipeVideo.update(videoId, { like_count: (vid.like_count || 0) + 1 });
      }
    }
    base44.entities.RecipeVideo.filter({ recipe_id: id }).then(setVideos).catch(() => {});
  };

  const diffMap = { easy: "diff_easy", medium: "diff_medium", hard: "diff_hard" };
  const catMap = { rice: "cat_rice", noodle: "cat_noodle", soup: "cat_soup", curry: "cat_curry", stir_fry: "cat_stir_fry", salad: "cat_salad", dessert: "cat_dessert", other: "cat_other" };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="text-center py-32">
        <p className="text-muted-foreground">{t("no_data")}</p>
        <Link to="/" className="text-sm text-primary hover:underline mt-2 inline-block">{t("home")}</Link>
      </div>
    );
  }

  const title = lang === "th" ? recipe.title : recipe.title_en || recipe.title;
  const desc = lang === "th" ? recipe.description : recipe.description_en || recipe.description;

  const getYoutubeEmbed = (url) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Back link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link to="/recommendation" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-4 h-4" />
          {t("recommendation_title")}
        </Link>
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-7">
            <div className="overflow-hidden aspect-[4/3] bg-muted">
              <img src={recipe.image_url} alt={title} className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">{t(catMap[recipe.category] || "cat_other")}</div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground leading-[1.05] mb-4">{title}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 drop-cap">{desc}</p>

            <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-border mb-6">
              <div>
                <Clock className="w-4 h-4 text-muted-foreground mb-1" />
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("cook_time")}</p>
                <p className="font-display text-lg font-semibold text-foreground">{recipe.cook_time} {t("mins")}</p>
              </div>
              <div>
                <Flame className="w-4 h-4 text-muted-foreground mb-1" />
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("calories")}</p>
                <p className="font-display text-lg font-semibold text-foreground">{recipe.calories}</p>
              </div>
              <div>
                <ChefHat className="w-4 h-4 text-muted-foreground mb-1" />
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("difficulty")}</p>
                <p className="font-display text-lg font-semibold text-foreground">{t(diffMap[recipe.difficulty] || "diff_easy")}</p>
              </div>
            </div>

            {user && (
              <Button
                onClick={toggleFavorite}
                variant={isFavorited ? "default" : "outline"}
                className={`rounded-full py-3 ${isFavorited ? "bg-primary text-primary-foreground hover:bg-primary/80" : "border-primary text-primary hover:bg-primary hover:text-primary-foreground"}`}
              >
                <Heart className={`w-4 h-4 mr-2 ${isFavorited ? "fill-primary-foreground" : ""}`} />
                {isFavorited ? t("remove_from_favorites") : t("add_to_favorites")}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Ingredients & Steps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Ingredients */}
          <div className="lg:col-span-4">
            <div className="sticky top-20">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">{lang === "th" ? "ส่วนผสม" : "Ingredients"}</div>
              <h2 className="font-display text-3xl font-bold text-foreground mb-6">{t("ingredients")}</h2>
              <ul className="space-y-3">
                {ingredients.length === 0 ? (
                  <li className="text-sm text-muted-foreground">{t("no_data")}</li>
                ) : (
                  ingredients.map((ri, i) => {
                    const ing = ingredientMap[ri.ingredient_id];
                    const name = ing ? (lang === "th" ? ing.name : ing.name_en || ing.name) : "—";
                    return (
                      <li key={i} className="flex items-start justify-between gap-4 pb-3 border-b border-border">
                        <span className="text-sm text-foreground">
                          {name}
                          {ri.is_optional && <span className="text-xs text-muted-foreground ml-2">({t("optional")})</span>}
                        </span>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">{ri.quantity} {ri.unit}</span>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          </div>

          {/* Steps */}
          <div className="lg:col-span-8">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">{lang === "th" ? "วิธีทำ" : "Instructions"}</div>
            <h2 className="font-display text-3xl font-bold text-foreground mb-8">{t("steps")}</h2>
            <ol className="space-y-8">
              {steps.length === 0 ? (
                <li className="text-sm text-muted-foreground">{t("no_data")}</li>
              ) : (
                steps.map((step, i) => (
                  <li key={step.id || i} className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display text-lg font-bold">
                        {step.step_number || i + 1}
                      </div>
                      {i < steps.length - 1 && <div className="w-px h-full bg-border ml-6 mt-2 min-h-[40px]"></div>}
                    </div>
                    <div className="flex-1 pb-2">
                      <p className="text-sm text-foreground leading-relaxed">
                        {lang === "th" ? step.instruction : step.instruction_en || step.instruction}
                      </p>
                      {step.image_url && (
                        <div className="mt-4 overflow-hidden aspect-video bg-muted max-w-md">
                          <img src={step.image_url} alt={`Step ${step.step_number}`} className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </li>
                ))
              )}
            </ol>

            {/* Videos */}
            {videos.length > 0 && (
              <div className="mt-12 pt-8 border-t border-border">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">{lang === "th" ? "วิดีโอสอนทำ" : "Video Tutorials"}</div>
                <h2 className="font-display text-3xl font-bold text-foreground mb-6">{t("videos")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {videos.map((video) => {
                    const isLiked = likes.some((l) => l.video_id === video.id);
                    return (
                      <div key={video.id} className="border border-border rounded-lg overflow-hidden">
                        <div className="aspect-video bg-foreground relative">
                          <iframe
                            src={getYoutubeEmbed(video.youtube_url)}
                            title={video.title}
                            className="w-full h-full"
                            allowFullScreen
                          />
                        </div>
                        <div className="p-4 flex items-center justify-between">
                          <div>
                            <h4 className="font-display text-base font-semibold text-foreground">{lang === "th" ? video.title : video.title_en || video.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{video.like_count || 0} {t("like")}s</p>
                          </div>
                          {user && (
                            <button
                              onClick={() => toggleLike(video.id)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${isLiked ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:border-primary hover:text-primary"}`}
                            >
                              <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-primary-foreground" : ""}`} />
                              {isLiked ? t("unlike") : t("like")}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}