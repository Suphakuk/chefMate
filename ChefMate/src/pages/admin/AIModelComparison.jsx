import { useState, useEffect } from "react";
import { Cpu, Activity, Target, Zap, Gauge } from "lucide-react";
import { useLang } from "@/components/LanguageProvider";
import { base44 } from "@/api/base44Client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts";

export default function AIModelComparison() {
  const { t, lang } = useLang();
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = () => {
    base44.entities.ModelPerformance.list("-test_date")
      .then(setModels)
      .catch(() => {
        const mockData = [
          { model_name: "YOLOv8", accuracy: 0.92, precision: 0.89, recall: 0.91, f1_score: 0.90, map: 0.88, test_date: "2026-06-01" },
          { model_name: "CNN (ResNet50)", accuracy: 0.87, precision: 0.85, recall: 0.84, f1_score: 0.85, map: 0.82, test_date: "2026-06-01" },
          { model_name: "YOLOv5", accuracy: 0.85, precision: 0.83, recall: 0.86, f1_score: 0.84, map: 0.81, test_date: "2026-05-15" },
          { model_name: "CNN (VGG16)", accuracy: 0.82, precision: 0.80, recall: 0.79, f1_score: 0.80, map: 0.77, test_date: "2026-05-15" },
        ];
        base44.entities.ModelPerformance.bulkCreate(mockData).then(() => loadModels()).catch(() => {});
      })
      .finally(() => setLoading(false));
  };

  const runMockTest = async (modelType) => {
    setTesting(true);
    await new Promise((r) => setTimeout(r, 2000));
    const result = {
      model_name: modelType === "yolo" ? `YOLOv8 (test ${new Date().toLocaleTimeString()})` : `CNN-ResNet50 (test ${new Date().toLocaleTimeString()})`,
      accuracy: 0.80 + Math.random() * 0.18,
      precision: 0.78 + Math.random() * 0.20,
      recall: 0.76 + Math.random() * 0.22,
      f1_score: 0.77 + Math.random() * 0.21,
      map: 0.74 + Math.random() * 0.24,
      test_date: new Date().toISOString().split("T")[0],
    };
    await base44.entities.ModelPerformance.create(result);
    loadModels();
    setTesting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const chartData = models.map((m) => ({
    name: m.model_name,
    Accuracy: m.accuracy,
    Precision: m.precision,
    Recall: m.recall,
    "F1 Score": m.f1_score,
    mAP: m.map,
  }));

  const radarData = [
    { metric: t("accuracy"), YOLO: models[0]?.accuracy || 0.9, CNN: models[1]?.accuracy || 0.85 },
    { metric: t("precision"), YOLO: models[0]?.precision || 0.89, CNN: models[1]?.precision || 0.85 },
    { metric: t("recall"), YOLO: models[0]?.recall || 0.91, CNN: models[1]?.recall || 0.84 },
    { metric: t("f1_score"), YOLO: models[0]?.f1_score || 0.90, CNN: models[1]?.f1_score || 0.85 },
    { metric: t("map_score"), YOLO: models[0]?.map || 0.88, CNN: models[1]?.map || 0.82 },
  ];

  const CHART_BORDER = "hsl(var(--border))";
  const CHART_MUTED = "hsl(var(--muted-foreground))";
  const CHART_PRIMARY = "hsl(var(--primary))";
  const CHART_DESTRUCTIVE = "hsl(var(--destructive))";
  const CHART_ACCENT = "hsl(var(--accent))";

  const metrics = [
    { key: "accuracy", label: t("accuracy"), icon: Target, color: CHART_PRIMARY },
    { key: "precision", label: t("precision"), icon: Gauge, color: CHART_DESTRUCTIVE },
    { key: "recall", label: t("recall"), icon: Activity, color: CHART_ACCENT },
    { key: "f1_score", label: t("f1_score"), icon: Zap, color: "#E76F51" },
    { key: "map", label: t("map_score"), icon: Cpu, color: "#9C27B0" },
  ];

  return (
    <div className="bg-muted/30 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">{t("admin")} · {lang === "th" ? "งานวิจัย" : "Research"}</div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">{t("ai_models")}</h1>
        <p className="text-base text-muted-foreground max-w-2xl">
          {lang === "th"
            ? "เปรียบเทียบประสิทธิภาพโมเดล AI สำหรับการตรวจจับวัตถุดิบ — ส่วนนี้ใช้ Mock API และพร้อมเชื่อมต่อโมเดลจริงในอนาคต"
            : "Compare AI model performance for ingredient detection — this section uses Mock API and is ready to connect real models in the future."}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Mock API buttons */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h3 className="font-display text-lg font-semibold text-foreground mb-1">{lang === "th" ? "ทดสอบ Mock API" : "Test Mock API"}</h3>
          <p className="text-xs text-muted-foreground mb-4">{lang === "th" ? "จำลองการเรียก POST /api/ai/yolo และ POST /api/ai/cnn" : "Simulates POST /api/ai/yolo and POST /api/ai/cnn"}</p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => runMockTest("yolo")}
              disabled={testing}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/80 disabled:opacity-50 transition-colors"
            >
              <Cpu className="w-4 h-4" />
              {testing ? (lang === "th" ? "กำลังทดสอบ..." : "Testing...") : `POST /api/ai/yolo`}
            </button>
            <button
              onClick={() => runMockTest("cnn")}
              disabled={testing}
              className="flex items-center gap-2 px-4 py-2.5 border border-primary text-primary rounded-full text-sm font-medium hover:bg-primary hover:text-primary-foreground disabled:opacity-50 transition-colors"
            >
              <Cpu className="w-4 h-4" />
              {testing ? (lang === "th" ? "กำลังทดสอบ..." : "Testing...") : `POST /api/ai/cnn`}
            </button>
          </div>
        </div>

        {/* Latest comparison cards */}
        {models.length >= 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {[models[0], models[1]].filter(Boolean).map((model, i) => (
              <div key={model.id || i} className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${i === 0 ? "bg-primary" : "bg-destructive"}`}>
                      <Cpu className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold text-foreground">{model.model_name}</h3>
                      <p className="text-xs text-muted-foreground">{t("test_date")}: {model.test_date}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {metrics.map((metric) => {
                    const Icon = metric.icon;
                    const val = model[metric.key];
                    return (
                      <div key={metric.key}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="flex items-center gap-2 text-sm text-foreground">
                            <Icon className="w-3.5 h-3.5" style={{ color: metric.color }} />
                            {metric.label}
                          </span>
                          <span className="font-display text-sm font-semibold text-foreground">{(val * 100).toFixed(1)}%</span>
                        </div>
                        <div className="h-1.5 bg-border rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${val * 100}%`, backgroundColor: metric.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-display text-lg font-semibold text-foreground mb-6">{lang === "th" ? "เปรียบเทียบโมเดลทั้งหมด" : "All Models Comparison"}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_BORDER} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: CHART_MUTED }} axisLine={{ stroke: CHART_BORDER }} angle={-15} textAnchor="end" height={60} />
                <YAxis domain={[0, 1]} tick={{ fontSize: 12, fill: CHART_MUTED }} axisLine={{ stroke: CHART_BORDER }} />
                <Tooltip contentStyle={{ border: `1px solid ${CHART_BORDER}`, borderRadius: 8, fontSize: 12 }} formatter={(v) => `${(v * 100).toFixed(1)}%`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Accuracy" fill={CHART_PRIMARY} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Precision" fill={CHART_DESTRUCTIVE} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Recall" fill={CHART_ACCENT} radius={[4, 4, 0, 0]} />
                <Bar dataKey="F1 Score" fill="#E76F51" radius={[4, 4, 0, 0]} />
                <Bar dataKey="mAP" fill="#9C27B0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-display text-lg font-semibold text-foreground mb-6">{lang === "th" ? "เรดาร์เปรียบเทียบ" : "Radar Comparison"}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke={CHART_BORDER} />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12, fill: CHART_MUTED }} />
                <PolarRadiusAxis domain={[0, 1]} tick={{ fontSize: 10, fill: CHART_MUTED }} />
                <Radar name="YOLO" dataKey="YOLO" stroke={CHART_PRIMARY} fill={CHART_PRIMARY} fillOpacity={0.2} strokeWidth={2} />
                <Radar name="CNN" dataKey="CNN" stroke={CHART_DESTRUCTIVE} fill={CHART_DESTRUCTIVE} fillOpacity={0.2} strokeWidth={2} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ border: `1px solid ${CHART_BORDER}`, borderRadius: 8, fontSize: 12 }} formatter={(v) => `${(v * 100).toFixed(1)}%`} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Full table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-display text-lg font-semibold text-foreground">{lang === "th" ? "ตารางผลการทดสอบทั้งหมด" : "All Test Results"}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left text-xs uppercase tracking-wider text-muted-foreground font-medium px-4 py-3">{t("model_name")}</th>
                  <th className="text-center text-xs uppercase tracking-wider text-muted-foreground font-medium px-4 py-3">{t("accuracy")}</th>
                  <th className="text-center text-xs uppercase tracking-wider text-muted-foreground font-medium px-4 py-3 hidden md:table-cell">{t("precision")}</th>
                  <th className="text-center text-xs uppercase tracking-wider text-muted-foreground font-medium px-4 py-3 hidden md:table-cell">{t("recall")}</th>
                  <th className="text-center text-xs uppercase tracking-wider text-muted-foreground font-medium px-4 py-3">{t("f1_score")}</th>
                  <th className="text-center text-xs uppercase tracking-wider text-muted-foreground font-medium px-4 py-3 hidden lg:table-cell">{t("map_score")}</th>
                  <th className="text-right text-xs uppercase tracking-wider text-muted-foreground font-medium px-4 py-3">{t("test_date")}</th>
                </tr>
              </thead>
              <tbody>
                {models.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-12 text-muted-foreground text-sm">{t("no_data")}</td></tr>
                ) : (
                  models.map((m) => (
                    <tr key={m.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3"><span className="text-sm text-foreground">{m.model_name}</span></td>
                      <td className="px-4 py-3 text-center"><span className="text-sm font-medium text-foreground">{(m.accuracy * 100).toFixed(1)}%</span></td>
                      <td className="px-4 py-3 text-center hidden md:table-cell"><span className="text-sm text-muted-foreground">{(m.precision * 100).toFixed(1)}%</span></td>
                      <td className="px-4 py-3 text-center hidden md:table-cell"><span className="text-sm text-muted-foreground">{(m.recall * 100).toFixed(1)}%</span></td>
                      <td className="px-4 py-3 text-center"><span className="text-sm text-muted-foreground">{(m.f1_score * 100).toFixed(1)}%</span></td>
                      <td className="px-4 py-3 text-center hidden lg:table-cell"><span className="text-sm text-muted-foreground">{(m.map * 100).toFixed(1)}%</span></td>
                      <td className="px-4 py-3 text-right"><span className="text-sm text-muted-foreground">{m.test_date}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}