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
  Leaf
} from 'lucide-react';

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

type Screen = 'landing' | 'profile' | 'profile_summary' | 'selector' | 'result';

// --- Constants ---

const DISHES = [
  {
    id: 'nasi-lemak',
    name: 'Nasi Lemak Ayam',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAG0B300c_DFnwgYLF-tAdfT4NUfaMG3pFPKut4MowO0eiet9-ekHQLjTb8PISRsVEalfbHwQoyg_AC4N2s73QGNkiEnkfybxxXcTyo_yK_ifSkxlmSMeCvY1hCMMiq-mezoHJYXEr5Tj1hxJ5uLEDigplXDbqXQu2wHtgtxSGvaeNCBecJiVDjCQl9GlQ3dVFuM5MDpRzy8-k7d7PwEUVvREY3B9j2o_uZJ9hygEU4yQM-XUMsH1yC20eGf07X9StNALGbUX7ldZA',
    baseKcal: 450,
    tag: 'High Protein'
  },
  {
    id: 'sarawak-laksa',
    name: 'Sarawak Laksa',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnSudja7qFt-InlG3vGf52XvIcjnOMapnKFMsB4aqtWfbgk-UTp07ctIB48u_jRoh9LLqWbyTHmJsG6X-DyRlcVpSQeUXIPw-RrHDrkzu0ttkoj16DOLixkF2eFBkN8Unubirc7nejnN2mQ_Keq7mECIj031-cLWsdvl5B9XoaN39ws8P43ztR2KEXCekUfvMiFEARXvOr9n_4BGKgnwkUfLzsyGRxY7WXR1OTTwwO0R4sa5TTII2Jp4ZVBHFohP96W61dNawJXck',
    baseKcal: 380,
    tag: 'Low Fat Swap'
  },
  {
    id: 'satay-chicken',
    name: 'Satay Chicken',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7YByTbdzLlLoOKTRE9E7cJLrPH82lu0JOHRcrgy7XIoS-UAvMgzGdmJd4rcG4lSlIEl5SV2Zs2yykZgteILlY5tSbUaB5RbOCLefoKfOI8f3P7VlmQD6nWVwN40I9DIUtgyt-lplzu_TSZR1O60NXN-DG_Ok6nLbzJ1fNh6Bvc3bMdUAey_xXUdnFcZ0iEVWnpkYsGAtiorrCXpBq-IP0_jx7KQxrCdudQXLEFFc8rO9z1wMtOE9_TbPfzXq-gO9TjxKY2Xze9p0',
    baseKcal: 290,
    tag: 'Lean Meat'
  },
  {
    id: 'mee-goreng',
    name: 'Mee Goreng Mamak',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDzk_V1_AaA-oTEt1eBhkdTlpSt3w-KreHJOtKatqzUgx9cURNvlc4wzvzqpRgZXjv0rHKtFFoaZbgb4RYPjewTYvb5NSDGbCQ-a7GetunTYePhxDBGCts-pmpJ9JfhY2p1LEqrEY4upLl25uKoWRqtc0JtUQT6p-hHHN9_R1E3IeeY36cbtRcScayKhpswCUQvL_aWNRdpgPxGvu6TBz61ET7SU5tRcYmwfu-vaSHOHfbktkJ4h9LNHCcxj9krmMz-l6VvZUSP-4',
    baseKcal: 410,
    tag: 'Less Oil'
  }
];

const SWAPS = [
  { id: 'brown_rice', label: 'Brown Rice', icon: '🌾' },
  { id: 'no_santan', label: 'No Santan', icon: '🥥' },
  { id: 'low_sodium', label: 'Low Sodium', icon: '🧂' },
  { id: 'extra_protein', label: 'Extra Protein', icon: '🍗' },
  { id: 'cauliflower_rice', label: 'Cauliflower Rice', icon: '🥦' },
  { id: 'air_fried', label: 'Air Fried', icon: '💨' }
];

// --- Components ---

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [onboardingComplete, setOnboardingComplete] = useState(() => {
    return localStorage.getItem('onboardingComplete') === 'true';
  });
  const [caloriesConsumed, setCaloriesConsumed] = useState(() => {
    return Number(localStorage.getItem('caloriesConsumed')) || 0;
  });
  const [searchQuery, setSearchQuery] = useState('');
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
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-500' };
    if (bmi < 25) return { label: 'Healthy', color: 'text-primary' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-orange-500' };
    return { label: 'Obese', color: 'text-red-500' };
  };

  const handleCustomize = async (dish: typeof DISHES[0]) => {
    setSelectedDish(dish);
    setLoading(true);
    setScreen('result');

    try {
      const response = await fetch('/api/customize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dish_name: dish.name,
          user_metrics: metrics,
          selected_swaps: activeSwaps
        })
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const logMeal = (calories: number) => {
    setCaloriesConsumed(prev => prev + calories);
    setScreen('selector');
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
          <LandingScreen onStart={() => setScreen(onboardingComplete ? 'selector' : 'profile')} />
        )}
        {screen === 'profile' && (
          <ProfileScreen 
            metrics={metrics} 
            setMetrics={setMetrics} 
            onNext={() => setScreen('profile_summary')} 
            getBMICategory={getBMICategory}
          />
        )}
        {screen === 'profile_summary' && (
          <ProfileSummaryScreen 
            metrics={metrics} 
            getBMICategory={getBMICategory}
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
          />
        )}
        {screen === 'result' && (
          <ResultScreen 
            loading={loading}
            result={result}
            onBack={() => setScreen('selector')}
            onLog={logMeal}
          />
        )}
      </AnimatePresence>

      {/* Bottom Nav - Only show on app screens */}
      {screen !== 'landing' && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-100 px-6 py-3 z-50">
          <div className="max-w-md mx-auto flex justify-between items-center">
            <NavButton 
              icon={<ProgressRing consumed={caloriesConsumed} total={metrics.dailyGoal} />} 
              label="Home" 
              active={screen === 'selector'} 
              onClick={() => setScreen('selector')} 
            />
            <NavButton icon={<Activity size={24} />} label="Plans" active={screen === 'profile'} onClick={() => setScreen('profile')} />
            <NavButton icon={<Utensils size={24} />} label="Meals" active={screen === 'result'} />
            <NavButton icon={<User size={24} />} label="Profile" active={screen === 'profile'} onClick={() => setScreen('profile')} />
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

function LandingScreen({ onStart }: { onStart: () => void }) {
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
        <div className="absolute inset-0 bg-gradient-to-t from-[#102216]/95 via-[#102216]/60 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 pt-20">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight">
            Our heritage is <br /> written in <br />
            <span className="text-primary italic">our recipes</span>
          </h1>
          <p className="text-xl text-slate-200 mt-6 font-light max-w-md mx-auto">
            Every <span className="italic font-medium">meal</span> is a story of home, love, and tradition.
          </p>
        </motion.div>
      </div>

      <div className="relative z-10 flex flex-col items-center px-6 pb-20">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="bg-primary text-[#102216] font-bold py-5 px-12 rounded-full shadow-2xl shadow-primary/30 flex items-center gap-3 text-lg"
        >
          Begin Your Story
          <ArrowRight size={20} />
        </motion.button>

        <div className="mt-12 flex flex-col items-center gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Utensils className="text-[#102216]" size={24} />
            </div>
            <div className="text-left">
              <p className="text-white font-bold text-xl leading-none">Makan Sejahtera</p>
              <p className="text-primary text-xs font-medium">Where Health Meets Heritage</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ProfileSummaryScreen({ metrics, getBMICategory, onConfirm }: any) {
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
      <h2 className="text-3xl font-bold text-slate-900 mb-2">Profile Confirmed</h2>
      <p className="text-slate-500 mb-10">Your health blueprint is ready.</p>

      <div className="w-full space-y-4 mb-12">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center">
          <div className="text-left">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Calculated BMI</p>
            <p className={`text-2xl font-black ${getBMICategory(metrics.bmi).color}`}>{metrics.bmi}</p>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full bg-slate-50 ${getBMICategory(metrics.bmi).color}`}>
            {getBMICategory(metrics.bmi).label}
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center">
          <div className="text-left">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Daily Calorie Goal</p>
            <p className="text-2xl font-black text-primary">{metrics.dailyGoal} kcal</p>
          </div>
          <Flame size={24} className="text-primary" />
        </div>
      </div>

      <button 
        onClick={onConfirm}
        className="w-full bg-primary text-[#102216] font-bold py-5 rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 text-lg"
      >
        Let's Eat
        <ArrowRight size={20} />
      </button>
    </motion.div>
  );
}

function ProfileScreen({ metrics, setMetrics, onNext, getBMICategory }: any) {
  return (
    <motion.div 
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      className="max-w-md mx-auto px-6 pt-12 pb-32"
    >
      <header className="mb-10">
        <h2 className="text-3xl font-bold text-slate-900">Dietary Requirements</h2>
        <p className="text-slate-500 mt-2">Let's personalize your health profile.</p>
      </header>

      <div className="space-y-8">
        <section>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Activity className="text-primary" size={20} />
            Health Profile
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">Height (cm)</label>
              <input 
                type="number"
                value={metrics.height}
                onChange={(e) => setMetrics({ ...metrics, height: Number(e.target.value) })}
                className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-4 focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">Weight (kg)</label>
              <input 
                type="number"
                value={metrics.weight}
                onChange={(e) => setMetrics({ ...metrics, weight: Number(e.target.value) })}
                className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-4 focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>
          </div>
          <div className="mt-6 p-4 bg-primary/5 rounded-2xl border border-primary/10">
            <p className="text-sm text-slate-500">Current BMI</p>
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
          <h3 className="text-lg font-bold mb-4">Daily Calorie Goal</h3>
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
              <span className="text-xs text-slate-400">1,200 kcal</span>
              <div className="text-center">
                <span className="text-3xl font-black text-primary">{metrics.dailyGoal}</span>
                <span className="text-xs block text-slate-400">kcal/day</span>
              </div>
              <span className="text-xs text-slate-400">4,000 kcal</span>
            </div>
          </div>
        </section>

        <button 
          onClick={onNext}
          className="w-full bg-primary text-[#102216] font-bold py-5 rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 text-lg"
        >
          Next: Meal Selection
          <ArrowRight size={20} />
        </button>
      </div>
    </motion.div>
  );
}

function SelectorScreen({ onBack, onSelect, activeSwaps, toggleSwap, searchQuery, setSearchQuery }: any) {
  const filteredDishes = useMemo(() => {
    return DISHES.filter(dish => 
      dish.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <motion.div 
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      className="max-w-md mx-auto px-6 pt-12 pb-32"
    >
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">What would you like to eat today?</h2>
      </header>

      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
          <Search size={20} />
        </div>
        <input 
          type="text"
          placeholder="Search for Malaysian dishes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-14 bg-slate-100 border-none rounded-2xl pl-12 pr-12 focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
        />
        <div className="absolute inset-y-0 right-4 flex items-center text-slate-400">
          <button className="p-1 hover:text-primary transition-colors">
            <Activity size={20} />
          </button>
        </div>
      </div>

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
            {swap.label}
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
                alt={dish.name}
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full text-slate-400">
                <Heart size={18} />
              </div>
            </div>
            <div className="p-5 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-xl text-slate-900">{dish.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Zap size={14} className="text-primary fill-primary" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {dish.baseKcal} kcal • {dish.tag}
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
            <p className="text-slate-400 font-medium">No dishes found matching "{searchQuery}"</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ResultScreen({ loading, result, onBack, onLog }: any) {
  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#102216] px-6 text-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full mb-8"
        />
        <h2 className="text-2xl font-bold text-white">Architecting Your Meal...</h2>
        <p className="text-slate-400 mt-4 max-w-xs">
          Our AI nutritionist is balancing your macros and preserving heritage flavors.
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
        <ChevronLeft size={20} /> New Selection
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
            <Info size={14} /> Architect's Note
          </p>
          <p className="text-slate-600 italic leading-relaxed">"{result.architect_note}"</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-10">
          <StatBox label="Calories" value={result.nutrition.calories} unit="kcal" />
          <StatBox label="Protein" value={result.nutrition.protein} unit="g" />
          <StatBox label="Fiber" value={result.nutrition.fiber} unit="g" />
        </div>

        <div className="space-y-8">
          <section>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Utensils size={20} className="text-primary" />
              Ingredients
            </h3>
            <ul className="space-y-3">
              {result.ingredients.map((ing: string, i: number) => (
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
              Cooking Steps
            </h3>
            <div className="space-y-6">
              {result.steps.map((step: string, i: number) => (
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
            <h3 className="text-lg font-bold mb-4">AI Recalculation Details</h3>
            <div className="space-y-4">
              <DetailCard icon={<Scale size={20} />} title="Portion Control" desc={result.ai_details.portion_control} />
              <DetailCard icon={<Zap size={20} />} title="Smart Swaps" desc={result.ai_details.smart_swaps} />
            </div>
          </section>

          <button 
            onClick={() => onLog(result.nutrition.calories)}
            className="w-full bg-[#102216] text-white font-bold py-5 rounded-2xl shadow-xl flex items-center justify-center gap-2 text-lg mt-8"
          >
            Log as Lunch/Dinner
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
