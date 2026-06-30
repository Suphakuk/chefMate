import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Plus, X, Scan, Search, Camera, ImageIcon } from "lucide-react";
import { useLang } from "@/components/LanguageProvider";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";

export default function UploadPage() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [detectedIngredients, setDetectedIngredients] = useState([]);
  const [allIngredients, setAllIngredients] = useState([]);

  useEffect(() => {
    base44.entities.Ingredient.list().then(setAllIngredients).catch(() => {});
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      alert(lang === "th" ? "กรุณาอัปโหลดไฟล์ JPG, PNG หรือ JPEG เท่านั้น" : "Please upload JPG, PNG, or JPEG files only");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleUploadAndDetect = async () => {
    if (!imageFile) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: imageFile });
      setUploading(false);
      setDetecting(true);

      // Mock AI detection — simulates POST /api/detection/yolo
      await new Promise((r) => setTimeout(r, 1500));
      const pool = ["ไก่", "ไข่", "มะเขือเทศ", "หอมหัวใหญ่", "กระเทียม", "พริก", "พริก", "มะนาว", "ผักชี", "ต้นหอม", "ซีอิ๊ว", "น้ำปลา", "ข้าว", "กุ้ง", "หมู", "โหระพา"];
      const count = 3 + Math.floor(Math.random() * 3);
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      const mockDetected = shuffled.slice(0, count);
      const confidenceScores = mockDetected.map(() => 0.75 + Math.random() * 0.24);

      // Save scan result
      await base44.entities.ScanResult.create({
        image_url: file_url,
        detected_ingredients: mockDetected,
        detection_method: "yolo",
        confidence_scores: confidenceScores,
      });

      setDetectedIngredients(mockDetected);
      setDetecting(false);
    } catch (err) {
      console.error(err);
      setUploading(false);
      setDetecting(false);
      alert(lang === "th" ? "เกิดข้อผิดพลาดในการอัปโหลด" : "Upload failed");
    }
  };

  const handleAddManual = () => {
    const items = manualInput.split(",").map((s) => s.trim()).filter(Boolean);
    if (items.length === 0) return;
    setDetectedIngredients((prev) => {
      const newSet = new Set([...prev, ...items]);
      return [...newSet];
    });
    setManualInput("");
  };

  const handleRemoveIngredient = (item) => {
    setDetectedIngredients((prev) => prev.filter((i) => i !== item));
  };

  const handleFindRecipes = () => {
    navigate("/recommendation", { state: { manualIngredients: detectedIngredients } });
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Page header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">{lang === "th" ? "ขั้นตอนที่ 1" : "Step 1"}</div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">{t("upload_title")}</h1>
        <p className="text-base text-muted-foreground max-w-xl">{t("upload_desc")}</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Upload area */}
          <div>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative border-2 border-dashed border-border rounded-lg aspect-[4/3] flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden bg-muted/30"
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <p className="text-primary-foreground text-sm flex items-center gap-2"><Camera className="w-4 h-4" /> {lang === "th" ? "เปลี่ยนรูป" : "Change image"}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-card shadow-sm flex items-center justify-center mb-4">
                    <ImageIcon className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <p className="font-display text-lg text-foreground mb-1">{t("upload_button")}</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG, JPEG</p>
                </>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/jpg" onChange={handleFileSelect} className="hidden" />

            {imageFile && (
              <div className="mt-4">
                <Button
                  onClick={handleUploadAndDetect}
                  disabled={uploading || detecting}
                  className="w-full bg-primary hover:bg-primary/80 text-primary-foreground rounded-full py-3"
                >
                  {uploading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      {lang === "th" ? "กำลังอัปโหลด..." : "Uploading..."}
                    </span>
                  ) : detecting ? (
                    <span className="flex items-center gap-2">
                      <Scan className="w-4 h-4 animate-pulse" />
                      {t("detecting")}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Scan className="w-4 h-4" />
                      {t("detect_button")}
                    </span>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Ingredients list */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="font-display text-2xl font-bold text-foreground">{t("detected_ingredients")}</h2>
              {detectedIngredients.length > 0 && (
                <span className="bg-primary text-primary-foreground text-xs rounded-full px-2.5 py-1">{detectedIngredients.length}</span>
              )}
            </div>

            {/* Manual input */}
            <div className="border border-border rounded-lg p-4 mb-4 bg-muted/30">
              <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">{t("upload_or")}</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddManual()}
                  placeholder={t("manual_input_placeholder")}
                  className="flex-1 bg-card border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <Button onClick={handleAddManual} className="bg-primary hover:bg-primary/80 text-primary-foreground rounded-md px-3">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Ingredient chips */}
            <div className="min-h-[200px]">
              {detectedIngredients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Upload className="w-8 h-8 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">{t("no_ingredients")}</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {detectedIngredients.map((item, i) => (
                    <div key={i} className="group flex items-center gap-2 bg-card border border-border rounded-full pl-4 pr-1 py-1.5 hover:border-primary transition-colors">
                      <span className="text-sm text-foreground">{item}</span>
                      <button onClick={() => handleRemoveIngredient(item)} className="w-5 h-5 rounded-full hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {detectedIngredients.length > 0 && (
              <div className="mt-6 pt-6 border-t border-border">
                <Button onClick={handleFindRecipes} className="w-full bg-primary hover:bg-primary/80 text-primary-foreground rounded-full py-3 text-base">
                  <Search className="w-4 h-4 mr-2" />
                  {t("find_recipes")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
