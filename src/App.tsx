/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ArrowRight, 
  Flame, 
  Scale, 
  Utensils, 
  History, 
  User, 
  Home, 
  Search, 
  Heart, 
  Info,
  Activity,
  CheckCircle2,
  Zap,
  Leaf,
  Facebook,
  Instagram,
  Globe,
  Dices,
  X
} from 'lucide-react';

import { GoogleGenAI } from "@google/genai";

// --- Types ---

interface UserMetrics {
  height: number;
  weight: number;
  bmi: number;
  dailyGoal: number;
}

interface RecipeResult {
  modified_dish_name: string;
  architect_note: string;
  ingredients: string[];
  steps: string[];
  nutrition: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    fiber: number;
  };
  ai_details: {
    portion_control: string;
    smart_swaps: string;
  };
}

type Screen = 'landing' | 'profile' | 'profile_summary' | 'selector' | 'result' | 'history';
type Language = 'en' | 'cn' | 'bm';

const TRANSLATIONS = {
  en: {
    heritage_title: <>Our heritage is <br /> written in <br /><span className="text-primary italic">our recipes</span></>,
    heritage_subtitle: <>Every <span className="italic font-medium">makan</span> is a story of home, love, and tradition.</>,
    begin_story: "Begin Your Story",
    dietary_requirements: "Dietary Requirements",
    personalize_profile: "Let's personalize your health profile.",
    health_profile: "Health Profile",
    height: "Height (cm)",
    weight: "Weight (kg)",
    current_bmi: "Current BMI",
    daily_calorie_goal: "Daily Calorie Goal",
    next_meal_selection: "Next: Meal Selection",
    profile_confirmed: "Profile Confirmed",
    blueprint_ready: "Your health blueprint is ready.",
    calculated_bmi: "Calculated BMI",
    lets_eat: "Let's Eat",
    what_to_eat: "What would you like to eat today?",
    search_placeholder: "Search for Malaysian dishes...",
    cant_decide: "Can't Decide?",
    picked_favorite: "We've picked a heritage favorite for you!",
    customize_meal: "Customize This Meal",
    logged_meals: "Logged Meals",
    no_meals_logged: "No meals logged yet.",
    find_first_meal: "Find your first meal",
    architecting_meal: "Architecting Your Meal...",
    ai_note: "Architect's Note",
    ingredients: "Ingredients",
    cooking_steps: "Cooking Steps",
    log_as_meal: "Log as Lunch/Dinner",
    calories: "Calories",
    protein: "Protein",
    fiber: "Fiber",
    fat: "Fat",
    carbs: "Carbs",
    portion_control: "Portion Control",
    smart_swaps: "Smart Swaps",
    ai_recalculation: "AI Recalculation Details",
    home: "Home",
    plans: "Plans",
    profile: "Profile",
    underweight: "Underweight",
    healthy: "Healthy",
    overweight: "Overweight",
    obese: "Obese",
    no_dishes_found: "No dishes found matching",
    new_selection: "New Selection",
    ai_loading_note: "Our AI nutritionist is balancing your macros and preserving heritage flavors.",
    swap_brown_rice: "Brown Rice",
    swap_no_santan: "No Santan",
    swap_low_sodium: "Low Sodium",
    swap_extra_protein: "Extra Protein",
    swap_cauliflower_rice: "Cauliflower Rice",
    swap_air_fried: "Air Fried",
    dish_nasi_lemak: "Nasi Lemak Ayam",
    dish_sarawak_laksa: "Sarawak Laksa",
    dish_satay_chicken: "Satay Chicken",
    dish_mee_goreng: "Mee Goreng Mamak",
    tag_high_protein: "High Protein",
    tag_low_fat: "Low Fat Swap",
    tag_lean_meat: "Lean Meat",
    tag_less_oil: "Less Oil",
    more: "more",
    kcal_per_day: "kcal/day",
    app_name: "Makan Sejahtera",
    app_tagline: "Where Health Meets Heritage",
    min_kcal: "1,200 kcal",
    max_kcal: "4,000 kcal",
    default_portion_desc: "Balanced portioning based on BMI.",
    default_swaps_desc: "Heritage-friendly healthy alternatives."
  },
  cn: {
    heritage_title: <>我们的传统 <br /> 写在 <br /><span className="text-primary italic">食谱里</span></>,
    heritage_subtitle: <>每一餐 <span className="italic font-medium">makan</span> 都是关于家、爱和传统的故事。</>,
    begin_story: "开始您的故事",
    dietary_requirements: "饮食需求",
    personalize_profile: "让我们个性化您的健康档案。",
    health_profile: "健康档案",
    height: "身高 (厘米)",
    weight: "体重 (公斤)",
    current_bmi: "当前 BMI",
    daily_calorie_goal: "每日卡路里目标",
    next_meal_selection: "下一步：选择餐点",
    profile_confirmed: "档案已确认",
    blueprint_ready: "您的健康蓝图已准备就绪。",
    calculated_bmi: "计算出的 BMI",
    lets_eat: "开饭了",
    what_to_eat: "今天想吃什么？",
    search_placeholder: "搜索马来西亚美食...",
    cant_decide: "无法决定？",
    picked_favorite: "我们为您挑选了一个传统最爱！",
    customize_meal: "个性化这餐",
    logged_meals: "记录的餐点",
    no_meals_logged: "尚未记录任何餐点。",
    find_first_meal: "寻找您的第一餐",
    architecting_meal: "正在构建您的餐点...",
    ai_note: "建筑师笔记",
    ingredients: "配料",
    cooking_steps: "烹饪步骤",
    log_as_meal: "记录为午餐/晚餐",
    calories: "卡路里",
    protein: "蛋白质",
    fiber: "纤维",
    fat: "脂肪",
    carbs: "碳水化合物",
    portion_control: "分量控制",
    smart_swaps: "智能替换",
    ai_recalculation: "AI 重新计算详情",
    home: "首页",
    plans: "计划",
    profile: "个人资料",
    underweight: "体重过轻",
    healthy: "健康",
    overweight: "超重",
    obese: "肥胖",
    no_dishes_found: "未找到匹配的菜肴",
    new_selection: "重新选择",
    ai_loading_note: "我们的 AI 营养师正在平衡您的宏量营养素并保留传统风味。",
    swap_brown_rice: "糙米",
    swap_no_santan: "无椰浆",
    swap_low_sodium: "低钠",
    swap_extra_protein: "额外蛋白质",
    swap_cauliflower_rice: "花椰菜米",
    swap_air_fried: "气炸",
    dish_nasi_lemak: "椰浆饭配炸鸡",
    dish_sarawak_laksa: "砂拉越叻沙",
    dish_satay_chicken: "沙爹鸡肉",
    dish_mee_goreng: "印度炒面",
    tag_high_protein: "高蛋白质",
    tag_low_fat: "低脂替换",
    tag_lean_meat: "瘦肉",
    tag_less_oil: "少油",
    more: "更多",
    kcal_per_day: "千卡/天",
    app_name: "Makan Sejahtera",
    app_tagline: "健康与传统的交汇点",
    min_kcal: "1,200 千卡",
    max_kcal: "4,000 千卡",
    default_portion_desc: "基于 BMI 的平衡分量。",
    default_swaps_desc: "传统友好的健康替代品。"
  },
  bm: {
    heritage_title: <>Warisan kita <br /> tertulis dalam <br /><span className="text-primary italic">resipi kita</span></>,
    heritage_subtitle: <>Setiap <span className="italic font-medium">makan</span> adalah kisah rumah, kasih sayang, and tradisi.</>,
    begin_story: "Mulakan Kisah Anda",
    dietary_requirements: "Keperluan Pemakanan",
    personalize_profile: "Mari peribadikan profil kesihatan anda.",
    health_profile: "Profil Kesihatan",
    height: "Tinggi (cm)",
    weight: "Berat (kg)",
    current_bmi: "BMI Semasa",
    daily_calorie_goal: "Matlamat Kalori Harian",
    next_meal_selection: "Seterusnya: Pilihan Hidangan",
    profile_confirmed: "Profil Disahkan",
    blueprint_ready: "Pelan kesihatan anda sudah sedia.",
    calculated_bmi: "BMI Dikira",
    lets_eat: "Jom Makan",
    what_to_eat: "Apa yang anda ingin makan hari ini?",
    search_placeholder: "Cari hidangan Malaysia...",
    cant_decide: "Tak Boleh Pilih?",
    picked_favorite: "Kami telah memilih kegemaran warisan untuk anda!",
    customize_meal: "Peribadikan Hidangan Ini",
    logged_meals: "Hidangan Direkod",
    no_meals_logged: "Belum ada hidangan direkodkan.",
    find_first_meal: "Cari hidangan pertama anda",
    architecting_meal: "Membina Hidangan Anda...",
    ai_note: "Nota Arkitek",
    ingredients: "Bahan-bahan",
    cooking_steps: "Langkah Memasak",
    log_as_meal: "Rekod sebagai Makan Tengahari/Malam",
    calories: "Kalori",
    protein: "Protein",
    fiber: "Serat",
    fat: "Lemak",
    carbs: "Karbohidrat",
    portion_control: "Kawalan Bahagian",
    smart_swaps: "Pertukaran Pintar",
    ai_recalculation: "Butiran Pengiraan Semula AI",
    home: "Utama",
    plans: "Pelan",
    profile: "Profil",
    underweight: "Kurang Berat",
    healthy: "Sihat",
    overweight: "Berlebihan Berat",
    obese: "Obesiti",
    no_dishes_found: "Tiada hidangan ditemui sepadan",
    new_selection: "Pilihan Baru",
    ai_loading_note: "Pakar pemakanan AI kami sedang mengimbangi makro anda dan mengekalkan rasa warisan.",
    swap_brown_rice: "Nasi Perang",
    swap_no_santan: "Tanpa Santan",
    swap_low_sodium: "Rendah Natrium",
    swap_extra_protein: "Protein Tambahan",
    swap_cauliflower_rice: "Nasi Kobis Bunga",
    swap_air_fried: "Goreng Udara",
    dish_nasi_lemak: "Nasi Lemak Ayam",
    dish_sarawak_laksa: "Sarawak Laksa",
    dish_satay_chicken: "Sate Ayam",
    dish_mee_goreng: "Mee Goreng Mamak",
    tag_high_protein: "Tinggi Protein",
    tag_low_fat: "Tukar Rendah Lemak",
    tag_lean_meat: "Daging Tanpa Lemak",
    tag_less_oil: "Kurang Minyak",
    more: "lagi",
    kcal_per_day: "kcal/hari",
    app_name: "Makan Sejahtera",
    app_tagline: "Di Mana Kesihatan Bertemu Warisan",
    min_kcal: "1,200 kcal",
    max_kcal: "4,000 kcal",
    default_portion_desc: "Pembahagian seimbang berdasarkan BMI.",
    default_swaps_desc: "Alternatif sihat yang mesra warisan."
  }
};

// --- Constants ---

const DISHES = [
  {
    id: 'nasi-lemak',
    nameKey: 'dish_nasi_lemak',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAG0B300c_DFnwgYLF-tAdfT4NUfaMG3pFPKut4MowO0eiet9-ekHQLjTb8PISRsVEalfbHwQoyg_AC4N2s73QGNkiEnkfybxxXcTyo_yK_ifSkxlmSMeCvY1hCMMiq-mezoHJYXEr5Tj1hxJ5uLEDigplXDbqXQu2wHtgtxSGvaeNCBecJiVDjCQl9GlQ3dVFuM5MDpRzy8-k7d7PwEUVvREY3B9j2o_uZJ9hygEU4yQM-XUMsH1yC20eGf07X9StNALGbUX7ldZA',
    baseKcal: 450,
    tagKey: 'tag_high_protein'
  },
  {
    id: 'sarawak-laksa',
    nameKey: 'dish_sarawak_laksa',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnSudja7qFt-InlG3vGf52XvIcjnOMapnKFMsB4aqtWfbgk-UTp07ctIB48u_jRoh9LLqWbyTHmJsG6X-DyRlcVpSQeUXIPw-RrHDrkzu0ttkoj16DOLixkF2eFBkN8Unubirc7nejnN2mQ_Keq7mECIj031-cLWsdvl5B9XoaN39ws8P43ztR2KEXCekUfvMiFEARXvOr9n_4BGKgnwkUfLzsyGRxY7WXR1OTTwwO0R4sa5TTII2Jp4ZVBHFohP96W61dNawJXck',
    baseKcal: 380,
    tagKey: 'tag_low_fat'
  },
  {
    id: 'satay-chicken',
    nameKey: 'dish_satay_chicken',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7YByTbdzLlLoOKTRE9E7cJLrPH82lu0JOHRcrgy7XIoS-UAvMgzGdmJd4rcG4lSlIEl5SV2Zs2yykZgteILlY5tSbUaB5RbOCLefoKfOI8f3P7VlmQD6nWVwN40I9DIUtgyt-lplzu_TSZR1O60NXN-DG_Ok6nLbzJ1fNh6Bvc3bMdUAey_xXUdnFcZ0iEVWnpkYsGAtiorrCXpBq-IP0_jx7KQxrCdudQXLEFFc8rO9z1wMtOE9_TbPfzXq-gO9TjxKY2Xze9p0',
    baseKcal: 290,
    tagKey: 'tag_lean_meat'
  },
  {
    id: 'mee-goreng',
    nameKey: 'dish_mee_goreng',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDzk_V1_AaA-oTEt1eBhkdTlpSt3w-KreHJOtKatqzUgx9cURNvlc4wzvzqpRgZXjv0rHKtFFoaZbgb4RYPjewTYvb5NSDGbCQ-a7GetunTYePhxDBGCts-pmpJ9JfhY2p1LEqrEY4upLl25uKoWRqtc0JtUQT6p-hHHN9_R1E3IeeY36cbtRcScayKhpswCUQvL_aWNRdpgPxGvu6TBz61ET7SU5tRcYmwfu-vaSHOHfbktkJ4h9LNHCcxj9krmMz-l6VvZUSP-4',
    baseKcal: 410,
    tagKey: 'tag_less_oil'
  }
];

const SWAPS = [
  { id: 'brown_rice', labelKey: 'swap_brown_rice', icon: '🌾' },
  { id: 'no_santan', labelKey: 'swap_no_santan', icon: '🥥' },
  { id: 'low_sodium', labelKey: 'swap_low_sodium', icon: '🧂' },
  { id: 'extra_protein', labelKey: 'swap_extra_protein', icon: '🍗' },
  { id: 'cauliflower_rice', labelKey: 'swap_cauliflower_rice', icon: '🥦' },
  { id: 'air_fried', labelKey: 'swap_air_fried', icon: '💨' }
];

// --- Components ---

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('lang');
    return (saved as Language) || 'en';
  });

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);
  const [onboardingComplete, setOnboardingComplete] = useState(() => {
    return localStorage.getItem('onboardingComplete') === 'true';
  });
  const [caloriesConsumed, setCaloriesConsumed] = useState(() => {
    return Number(localStorage.getItem('caloriesConsumed')) || 0;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [mealHistory, setMealHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('mealHistory');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('mealHistory', JSON.stringify(mealHistory));
  }, [mealHistory]);

  const [metrics, setMetrics] = useState<UserMetrics>(() => {
    const saved = localStorage.getItem('userMetrics');
    return saved ? JSON.parse(saved) : {
      height: 170,
      weight: 65,
      bmi: 22.5,
      dailyGoal: 2200
    };
  });

  useEffect(() => {
    localStorage.setItem('onboardingComplete', onboardingComplete.toString());
  }, [onboardingComplete]);

  useEffect(() => {
    localStorage.setItem('caloriesConsumed', caloriesConsumed.toString());
  }, [caloriesConsumed]);

  useEffect(() => {
    localStorage.setItem('userMetrics', JSON.stringify(metrics));
  }, [metrics]);

  const [selectedDish, setSelectedDish] = useState<typeof DISHES[0] | null>(null);
  const [activeSwaps, setActiveSwaps] = useState<string[]>(['brown_rice']);
  const [result, setResult] = useState<RecipeResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Calculate BMI
  useEffect(() => {
    const hMeters = metrics.height / 100;
    const bmi = metrics.weight / (hMeters * hMeters);
    if (bmi !== metrics.bmi) {
      setMetrics(prev => ({ ...prev, bmi: parseFloat(bmi.toFixed(1)) }));
    }
  }, [metrics.height, metrics.weight]);

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: t.underweight, color: 'text-blue-500' };
    if (bmi < 25) return { label: t.healthy, color: 'text-primary' };
    if (bmi < 30) return { label: t.overweight, color: 'text-orange-500' };
    return { label: t.obese, color: 'text-red-500' };
  };

  const handleCustomize = async (dish: typeof DISHES[0]) => {
    setSelectedDish(dish);
    setLoading(true);
    setScreen('result');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      
      const systemInstruction = `You are the Nutri-Malay Architect. 
Your Goal: Take a standard Malaysian recipe and a set of user health constraints (BMI, target calories) to produce a modified, healthy version of the dish.
The user's preferred language is ${lang === 'cn' ? 'Simplified Chinese' : lang === 'bm' ? 'Bahasa Melayu' : 'English'}. Please provide the response in this language.

Input: {dish_name, bmi, calorie_limit}. 

Output Rules:
1. Always return valid JSON.
2. Scaling Logic: If the user's BMI is high (over 25) or their calorie goal is low, prioritize "karbo" (carbohydrate) reduction and increasing fiber.
3. Authenticity Guardrail: Ensure the modified recipe still tastes like the original dish. Always suggest local Malaysian health swaps like cauliflower rice, diluted santan, or monkfruit sweetener.

Expected JSON structure:
{
  "modified_dish_name": "string",
  "architect_note": "string",
  "ingredients": ["string"],
  "steps": ["string"],
  "nutrition": {
    "calories": number,
    "protein": number,
    "fat": number,
    "carbs": number,
    "fiber": number
  },
  "ai_details": {
    "portion_control": "string",
    "smart_swaps": "string"
  }
}`;

      const prompt = `Dish: ${t[dish.nameKey]}
User Metrics: ${JSON.stringify(metrics)}
Selected Swaps: ${activeSwaps.map(id => SWAPS.find(s => s.id === id)?.labelKey ? t[SWAPS.find(s => s.id === id)!.labelKey] : id).join(", ")}`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
        },
      });

      const responseText = response.text;
      if (responseText) {
        setResult(JSON.parse(responseText));
      }
    } catch (error) {
      console.error("Gemini API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const logMeal = (calories: number) => {
    setCaloriesConsumed(prev => prev + calories);
    
    // Add to history
    if (result) {
      setMealHistory(prev => [
        { 
          ...result, 
          id: Date.now(),
          date: new Date().toLocaleDateString('en-MY', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) 
        },
        ...prev
      ]);
    }

    setScreen('history');
    setResult(null);
    setSelectedDish(null);
  };

  const toggleSwap = (id: string) => {
    setActiveSwaps(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-[#f6f8f6] font-display">
      <AnimatePresence mode="wait">
        {screen === 'landing' && (
          <LandingScreen 
            onStart={() => setScreen(onboardingComplete ? 'selector' : 'profile')} 
            lang={lang}
            setLang={setLang}
            t={t}
          />
        )}
        {screen === 'profile' && (
          <ProfileScreen 
            metrics={metrics} 
            setMetrics={setMetrics} 
            onNext={() => setScreen('profile_summary')} 
            getBMICategory={getBMICategory}
            t={t}
          />
        )}
        {screen === 'profile_summary' && (
          <ProfileSummaryScreen 
            metrics={metrics} 
            getBMICategory={getBMICategory}
            t={t}
            onConfirm={() => {
              setOnboardingComplete(true);
              setScreen('selector');
            }}
          />
        )}
        {screen === 'selector' && (
          <SelectorScreen 
            onBack={() => setScreen('profile')}
            onSelect={handleCustomize}
            activeSwaps={activeSwaps}
            toggleSwap={toggleSwap}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            t={t}
          />
        )}
        {screen === 'result' && (
          <ResultScreen 
            loading={loading}
            result={result}
            onBack={() => setScreen('selector')}
            onLog={logMeal}
            t={t}
          />
        )}
        {screen === 'history' && (
          <HistoryScreen 
            history={mealHistory}
            onBack={() => setScreen('selector')}
            t={t}
          />
        )}
      </AnimatePresence>

      {/* Bottom Nav - Only show on app screens */}
      {screen !== 'landing' && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-100 px-6 py-3 z-50">
          <div className="max-w-md mx-auto flex justify-between items-center">
            <NavButton 
              icon={<Home size={24} />} 
              label={t.home} 
              active={screen === 'landing'} 
              onClick={() => setScreen('landing')} 
            />
            <NavButton 
              icon={<Activity size={24} />} 
              label={t.plans} 
              active={screen === 'selector' || screen === 'result'} 
              onClick={() => setScreen('selector')} 
            />
            <NavButton 
              icon={<History size={24} />} 
              label={t.logged_meals} 
              active={screen === 'history'} 
              onClick={() => setScreen('history')} 
            />
            <NavButton 
              icon={<User size={24} />} 
              label={t.profile} 
              active={screen === 'profile' || screen === 'profile_summary'} 
              onClick={() => setScreen('profile')} 
            />
          </div>
        </nav>
      )}
    </div>
  );
}

// --- Sub-Screens ---

function ProgressRing({ consumed, total }: { consumed: number; total: number }) {
  const percentage = Math.min((consumed / total) * 100, 100);
  const radius = 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-8 h-8 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="16"
          cy="16"
          r={radius}
          stroke="currentColor"
          strokeWidth="3"
          fill="transparent"
          className="text-slate-200"
        />
        <circle
          cx="16"
          cy="16"
          r={radius}
          stroke="currentColor"
          strokeWidth="3"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <Home size={12} className="text-slate-600" />
      </div>
    </div>
  );
}

function LandingScreen({ onStart, lang, setLang, t }: { onStart: () => void; lang: Language; setLang: (l: Language) => void; t: any }) {
  const [showLangMenu, setShowLangMenu] = useState(false);

  const languages = [
    { id: 'en', label: 'EN' },
    { id: 'cn', label: 'CN' },
    { id: 'bm', label: 'BM' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative h-screen w-full overflow-hidden flex flex-col justify-between"
    >
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=1920" 
          className="w-full h-full object-cover"
          alt="Malaysian Food"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Language Selector */}
      <div className="relative z-10 flex justify-end p-6">
        <div className="relative">
          <button 
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-1 text-white/80 text-sm font-medium bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10"
          >
            <Globe size={16} />
            {lang.toUpperCase()}
          </button>
          
          <AnimatePresence>
            {showLangMenu && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 w-24"
              >
                {languages.map(l => (
                  <button
                    key={l.id}
                    onClick={() => {
                      setLang(l.id as Language);
                      setShowLangMenu(false);
                    }}
                    className={`w-full px-4 py-3 text-sm font-bold text-left hover:bg-slate-50 transition-colors ${lang === l.id ? 'text-primary' : 'text-slate-600'}`}
                  >
                    {l.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight">
            {t.heritage_title}
          </h1>
          <p className="text-lg text-white mt-6 font-light max-w-md mx-auto leading-relaxed">
            {t.heritage_subtitle}
          </p>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="bg-primary text-[#102216] font-bold py-4 px-10 rounded-full shadow-2xl shadow-primary/30 flex items-center gap-3 text-lg mt-10"
        >
          {t.begin_story}
          <ArrowRight size={20} />
        </motion.button>
      </div>

      <div className="relative z-10 flex flex-col items-center px-6 pb-12">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Utensils className="text-[#102216]" size={28} />
            </div>
            <div className="text-left">
              <p className="text-white font-bold text-2xl leading-none tracking-tight">{t.app_name}</p>
              <p className="text-primary text-[10px] font-bold uppercase tracking-[0.2em] mt-1">{t.app_tagline}</p>
            </div>
          </div>
          
          <div className="w-12 h-0.5 bg-primary/30 rounded-full mt-2" />

          <div className="flex items-center gap-6 mt-4 text-white/60">
            <Facebook size={20} className="hover:text-primary cursor-pointer transition-colors" />
            <Instagram size={20} className="hover:text-primary cursor-pointer transition-colors" />
            <Globe size={20} className="hover:text-primary cursor-pointer transition-colors" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ProfileSummaryScreen({ metrics, getBMICategory, onConfirm, t }: any) {
  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="max-w-md mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center"
    >
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-8">
        <CheckCircle2 size={40} />
      </div>
      <h2 className="text-3xl font-bold text-slate-900 mb-2">{t.profile_confirmed}</h2>
      <p className="text-slate-500 mb-10">{t.blueprint_ready}</p>

      <div className="w-full space-y-4 mb-12">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center">
          <div className="text-left">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.calculated_bmi}</p>
            <p className={`text-2xl font-black ${getBMICategory(metrics.bmi).color}`}>{metrics.bmi}</p>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full bg-slate-50 ${getBMICategory(metrics.bmi).color}`}>
            {getBMICategory(metrics.bmi).label}
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center">
          <div className="text-left">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.daily_calorie_goal}</p>
            <p className="text-2xl font-black text-primary">{metrics.dailyGoal} kcal</p>
          </div>
          <Flame size={24} className="text-primary" />
        </div>
      </div>

      <button 
        onClick={onConfirm}
        className="w-full bg-primary text-[#102216] font-bold py-5 rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 text-lg"
      >
        {t.lets_eat}
        <ArrowRight size={20} />
      </button>
    </motion.div>
  );
}

function ProfileScreen({ metrics, setMetrics, onNext, getBMICategory, t }: any) {
  return (
    <motion.div 
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      className="max-w-md mx-auto px-6 pt-12 pb-32"
    >
      <header className="mb-10">
        <h2 className="text-3xl font-bold text-slate-900">{t.dietary_requirements}</h2>
        <p className="text-slate-500 mt-2">{t.personalize_profile}</p>
      </header>

      <div className="space-y-8">
        <section>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Activity className="text-primary" size={20} />
            {t.health_profile}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">{t.height}</label>
              <input 
                type="number"
                value={metrics.height}
                onChange={(e) => setMetrics({ ...metrics, height: Number(e.target.value) })}
                className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-4 focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">{t.weight}</label>
              <input 
                type="number"
                value={metrics.weight}
                onChange={(e) => setMetrics({ ...metrics, weight: Number(e.target.value) })}
                className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-4 focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>
          </div>
          <div className="mt-6 p-4 bg-primary/5 rounded-2xl border border-primary/10">
            <p className="text-sm text-slate-500">{t.current_bmi}</p>
            <div className="flex items-center justify-between mt-1">
              <p className={`text-2xl font-bold ${getBMICategory(metrics.bmi).color}`}>
                {metrics.bmi}
              </p>
              <span className={`text-sm font-semibold px-3 py-1 rounded-full bg-white border border-slate-100 ${getBMICategory(metrics.bmi).color}`}>
                {getBMICategory(metrics.bmi).label}
              </span>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-4">{t.daily_calorie_goal}</h3>
          <div className="space-y-4">
            <input 
              type="range" 
              min="1200" 
              max="4000" 
              step="50"
              value={metrics.dailyGoal}
              onChange={(e) => setMetrics({ ...metrics, dailyGoal: Number(e.target.value) })}
              className="w-full h-2 bg-slate-100 rounded-full appearance-none accent-primary cursor-pointer"
            />
            <div className="flex justify-between items-end">
              <span className="text-xs text-slate-400">{t.min_kcal}</span>
              <div className="text-center">
                <span className="text-3xl font-black text-primary">{metrics.dailyGoal}</span>
                <span className="text-xs block text-slate-400">{t.kcal_per_day}</span>
              </div>
              <span className="text-xs text-slate-400">{t.max_kcal}</span>
            </div>
          </div>
        </section>

        <button 
          onClick={onNext}
          className="w-full bg-primary text-[#102216] font-bold py-5 rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 text-lg"
        >
          {t.next_meal_selection}
          <ArrowRight size={20} />
        </button>
      </div>
    </motion.div>
  );
}

function SelectorScreen({ onBack, onSelect, activeSwaps, toggleSwap, searchQuery, setSearchQuery, t }: any) {
  const [showCantDecide, setShowCantDecide] = useState(false);
  const [randomDish, setRandomDish] = useState<any>(null);

  const filteredDishes = useMemo(() => {
    return DISHES.filter(dish => 
      t[dish.nameKey].toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, t]);

  const handleCantDecide = () => {
    const random = DISHES[Math.floor(Math.random() * DISHES.length)];
    setRandomDish(random);
    setShowCantDecide(true);
  };

  return (
    <motion.div 
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      className="max-w-md mx-auto px-6 pt-12 pb-32"
    >
      <header className="mb-8 flex justify-between items-start">
        <h2 className="text-3xl font-bold text-slate-900 pr-4">{t.what_to_eat}</h2>
        <button 
          onClick={handleCantDecide}
          className="shrink-0 w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all"
          title={t.cant_decide}
        >
          <Dices size={24} />
        </button>
      </header>

      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
          <Search size={20} />
        </div>
        <input 
          type="text"
          placeholder={t.search_placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-14 bg-slate-100 border-none rounded-2xl pl-12 pr-12 focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
        />
      </div>

      <AnimatePresence>
        {showCantDecide && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCantDecide(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
            >
              <button 
                onClick={() => setShowCantDecide(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
              
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
                  <Dices size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">{t.cant_decide}</h3>
                <p className="text-slate-500 mt-2">{t.picked_favorite}</p>
              </div>

              <div className="bg-slate-50 rounded-3xl p-4 mb-8 border border-slate-100">
                <img 
                  src={randomDish.image} 
                  className="w-full h-40 object-cover rounded-2xl mb-4" 
                  alt={t[randomDish.nameKey]}
                />
                <h4 className="font-bold text-xl text-slate-900 text-center">{t[randomDish.nameKey]}</h4>
                <p className="text-center text-xs text-slate-400 mt-1 font-bold uppercase tracking-widest">{t[randomDish.tagKey]}</p>
              </div>

              <button 
                onClick={() => {
                  setShowCantDecide(false);
                  onSelect(randomDish);
                }}
                className="w-full bg-primary text-[#102216] font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                {t.customize_meal}
                <ArrowRight size={20} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="mb-8 overflow-x-auto no-scrollbar flex gap-3 pb-2">
        {SWAPS.map(swap => (
          <button
            key={swap.id}
            onClick={() => toggleSwap(swap.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-full whitespace-nowrap font-semibold text-sm transition-all ${
              activeSwaps.includes(swap.id) 
                ? 'bg-primary text-[#102216] shadow-lg shadow-primary/20' 
                : 'bg-white border border-slate-200 text-slate-600'
            }`}
          >
            <span>{swap.icon}</span>
            {t[swap.labelKey]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredDishes.map(dish => (
          <motion.div 
            key={dish.id}
            whileHover={{ y: -5 }}
            onClick={() => onSelect(dish)}
            className="group relative bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 cursor-pointer"
          >
            <div className="h-48 w-full overflow-hidden">
              <img 
                src={dish.image} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                alt={t[dish.nameKey]}
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full text-slate-400">
                <Heart size={18} />
              </div>
            </div>
            <div className="p-5 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-xl text-slate-900">{t[dish.nameKey]}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Zap size={14} className="text-primary fill-primary" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {dish.baseKcal} kcal • {t[dish.tagKey]}
                  </p>
                </div>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <ArrowRight size={24} />
              </div>
            </div>
          </motion.div>
        ))}
        {filteredDishes.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-400 font-medium">{t.no_dishes_found} "{searchQuery}"</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function HistoryScreen({ history, onBack, t }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="max-w-md mx-auto px-6 pt-12 pb-32"
    >
      <header className="mb-8 flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-900">{t.logged_meals}</h2>
        <button onClick={onBack} className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400">
          <Utensils size={20} />
        </button>
      </header>

      {history.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
          <History size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 font-medium">{t.no_meals_logged}</p>
          <button 
            onClick={onBack}
            className="mt-4 text-primary font-bold text-sm"
          >
            {t.find_first_meal}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((meal: any) => (
            <div key={meal.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold text-slate-900">{meal.modified_dish_name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{meal.date}</p>
                </div>
                <div className="bg-primary/10 px-3 py-1 rounded-full">
                  <span className="text-xs font-bold text-primary">{meal.nutrition.calories} kcal</span>
                </div>
              </div>
              <div className="flex gap-2">
                {meal.ingredients.slice(0, 3).map((ing: string, i: number) => (
                  <span key={i} className="text-[10px] bg-slate-50 text-slate-500 px-2 py-1 rounded-md border border-slate-100">
                    {ing.split(' ').slice(-1)}
                  </span>
                ))}
                {meal.ingredients.length > 3 && (
                  <span className="text-[10px] text-slate-400 py-1">+{meal.ingredients.length - 3} {t.more}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function ResultScreen({ loading, result, onBack, onLog, t }: any) {
  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#102216] px-6 text-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full mb-8"
        />
        <h2 className="text-2xl font-bold text-white">{t.architecting_meal}</h2>
        <p className="text-slate-400 mt-4 max-w-xs">
          {t.ai_loading_note}
        </p>
      </div>
    );
  }

  if (!result) return null;

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="max-w-md mx-auto px-6 pt-12 pb-32"
    >
      <button onClick={onBack} className="mb-6 text-slate-400 flex items-center gap-1">
        <ChevronLeft size={20} /> {t.new_selection}
      </button>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-[#102216]">
            <Leaf size={28} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 leading-tight">{result.modified_dish_name}</h2>
        </div>

        <div className="p-5 bg-primary/5 rounded-3xl border border-primary/10 mb-8">
          <p className="text-sm font-bold text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
            <Info size={14} /> {t.ai_note}
          </p>
          <p className="text-slate-600 italic leading-relaxed">"{result.architect_note}"</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-10">
          <StatBox label={t.calories} value={result.nutrition?.calories || 0} unit="kcal" />
          <StatBox label={t.protein} value={result.nutrition?.protein || 0} unit="g" />
          <StatBox label={t.fiber} value={result.nutrition?.fiber || 0} unit="g" />
        </div>

        <div className="space-y-8">
          <section>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Utensils size={20} className="text-primary" />
              {t.ingredients}
            </h3>
            <ul className="space-y-3">
              {result.ingredients?.map((ing: string, i: number) => (
                <li key={i} className="flex gap-3 text-slate-600">
                  <CheckCircle2 size={18} className="text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">{ing}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Activity size={20} className="text-primary" />
              {t.cooking_steps}
            </h3>
            <div className="space-y-6">
              {result.steps?.map((step: string, i: number) => (
                <div key={i} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-400 text-sm">
                    {i + 1}
                  </span>
                  <p className="text-sm text-slate-600 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="pt-6 border-t border-slate-100">
            <h3 className="text-lg font-bold mb-4">{t.ai_recalculation}</h3>
            <div className="space-y-4">
              <DetailCard icon={<Scale size={20} />} title={t.portion_control} desc={result.ai_details?.portion_control || t.default_portion_desc} />
              <DetailCard icon={<Zap size={20} />} title={t.smart_swaps} desc={result.ai_details?.smart_swaps || t.default_swaps_desc} />
            </div>
          </section>

          <button 
            onClick={() => onLog(result.nutrition?.calories || 0)}
            className="w-full bg-[#102216] text-white font-bold py-5 rounded-2xl shadow-xl flex items-center justify-center gap-2 text-lg mt-8"
          >
            {t.log_as_meal}
            <CheckCircle2 size={20} className="text-primary" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function StatBox({ label, value, unit }: any) {
  return (
    <div className="bg-slate-50 p-4 rounded-3xl text-center border border-slate-100">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-xl font-black text-primary">{value}</p>
      <p className="text-[10px] text-slate-400 font-medium">{unit}</p>
    </div>
  );
}

function DetailCard({ icon, title, desc }: any) {
  return (
    <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-slate-900 text-sm">{title}</h4>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function NavButton({ icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-primary' : 'text-slate-400'}`}
    >
      {icon}
      <span className={`text-[10px] font-bold uppercase tracking-widest ${active ? 'opacity-100' : 'opacity-60'}`}>
        {label}
      </span>
    </button>
  );
}
