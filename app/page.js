"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import HomeTab from "./components/HomeTab";
import StudyTab from "./components/StudyTab";
import ScheduleTab from "./components/ScheduleTab";
import GradesTab from "./components/GradesTab";
import FlashcardTab from "./components/FlashcardTab";

export default function MyStudyPlanProMax() {
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [userTitle, setUserTitle] = useState("Bạn");

  const [activeTab, setActiveTab] = useState("home");
  const [foodCoins, setFoodCoins] = useState(50);
  const [aiMessage, setAiMessage] = useState("");
  
  const [hasCrown, setHasCrown] = useState(false);
  const [hasGlasses, setHasGlasses] = useState(false);
  const [stats, setStats] = useState({ streak: 1, minutes: 0, tasks: 0 });

  // ===== NEW GAMIFICATION STATES =====
  const [inventory, setInventory] = useState([]);
  const [equippedBg, setEquippedBg] = useState("default");
  
  const defaultQuests = [
    { id: 'pomodoro', desc: 'Học 2 Pomodoro', target: 2, current: 0, reward: 15, done: false, claimed: false, icon: '⏳' },
    { id: 'todo', desc: 'Hoàn thành 3 việc', target: 3, current: 0, reward: 10, done: false, claimed: false, icon: '✅' },
    { id: 'flashcard', desc: 'Chơi 1 lần Flashcard', target: 1, current: 0, reward: 5, done: false, claimed: false, icon: '🃏' },
  ];
  const [quests, setQuests] = useState(defaultQuests);
  const [lastLogin, setLastLogin] = useState("");
  // ===================================

  const [gradeHistory, setGradeHistory] = useState([]);
  const [isAiThinking, setIsAiThinking] = useState(false);

  const [schedules, setSchedules] = useState([]);
  const [reminderAlert, setReminderAlert] = useState(null);

  const CAT_IMAGE = "/pink_cat.png";

  const playSound = (type) => {
    const sounds = {
      success: "https://www.myinstants.com/media/sounds/success-bell.mp3",
      buy: "https://www.myinstants.com/media/sounds/cash-register-kaching.mp3",
      click: "https://www.myinstants.com/media/sounds/pop_1.mp3",
      alarm: "https://www.myinstants.com/media/sounds/dog-bark.mp3"
    };
    new Audio(sounds[type]).play().catch(() => {});
  };

  useEffect(() => {
    setMounted(true);
    const savedUser = localStorage.getItem("msp_user");
    if (savedUser) {
      setIsLoggedIn(true);
      setUsername(savedUser);
      setUserTitle(localStorage.getItem("msp_title") || "Bạn");
      setFoodCoins(Number(localStorage.getItem("msp_coins")) || 50);
      setHasCrown(localStorage.getItem("msp_crown") === "true");
      setHasGlasses(localStorage.getItem("msp_glasses") === "true");
      setStats(JSON.parse(localStorage.getItem("msp_stats")) || { streak: 1, minutes: 0, tasks: 0 });
      setGradeHistory(JSON.parse(localStorage.getItem("msp_grades")) || []);
      setSchedules(JSON.parse(localStorage.getItem("msp_schedules")) || []);
      
      setInventory(JSON.parse(localStorage.getItem("msp_inventory")) || []);
      setEquippedBg(localStorage.getItem("msp_bg") || "default");
      
      const savedDate = localStorage.getItem("msp_lastLogin");
      const today = new Date().toLocaleDateString('vi-VN');
      if (savedDate !== today) {
        setQuests(defaultQuests);
        setLastLogin(today);
      } else {
        setQuests(JSON.parse(localStorage.getItem("msp_quests")) || defaultQuests);
        setLastLogin(savedDate);
      }
    }
  }, []);

  useEffect(() => {
    if (mounted && isLoggedIn) {
      localStorage.setItem("msp_coins", foodCoins);
      localStorage.setItem("msp_crown", hasCrown);
      localStorage.setItem("msp_glasses", hasGlasses);
      localStorage.setItem("msp_stats", JSON.stringify(stats));
      localStorage.setItem("msp_grades", JSON.stringify(gradeHistory));
      localStorage.setItem("msp_schedules", JSON.stringify(schedules));
      localStorage.setItem("msp_inventory", JSON.stringify(inventory));
      localStorage.setItem("msp_bg", equippedBg);
      localStorage.setItem("msp_quests", JSON.stringify(quests));
      localStorage.setItem("msp_lastLogin", lastLogin);
      localStorage.setItem("msp_title", userTitle);
    }
  }, [foodCoins, hasCrown, hasGlasses, stats, gradeHistory, schedules, inventory, equippedBg, quests, lastLogin, userTitle, mounted, isLoggedIn]);

  useEffect(() => {
    const hour = new Date().getHours();
    let greeting = hour >= 18 ? "Chào buổi tối" : hour >= 12 ? "Chào buổi chiều" : "Chào buổi sáng";
    if (isLoggedIn && !aiMessage) setAiMessage(`Meo meo~ ${greeting} ${username}! Hôm nay trời đẹp lắm, ${userTitle} nhớ học bài nha 💖🐾`);
  }, [isLoggedIn, username, aiMessage, userTitle]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const interval = setInterval(() => {
      const now = new Date();
      schedules.forEach(sch => {
        const schTime = new Date(sch.time);
        const diffMinutes = Math.floor((schTime - now) / 60000);
        if (diffMinutes === 30 && !sch.reminded) {
          triggerAlarm(sch);
          setSchedules(prev => prev.map(p => p.id === sch.id ? {...p, reminded: true} : p));
        }
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [schedules, isLoggedIn]);

  const triggerAlarm = (schedule) => {
    playSound("alarm");
    setReminderAlert(schedule);
    setTimeout(() => setReminderAlert(null), 7000);
  };

  const handleLogin = async () => {
    if (username.length < 2) return alert(`Tên đăng nhập hơi ngắn ${userTitle} ơi 🌸`);
    playSound("click");
    localStorage.setItem("msp_user", username);
    localStorage.setItem("msp_title", userTitle);
    setIsLoggedIn(true);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    
    // Initialize quests
    const today = new Date().toLocaleDateString('vi-VN');
    if (!localStorage.getItem("msp_lastLogin")) {
       setLastLogin(today);
    }
  };

  const handleLogout = () => {
    playSound("click");
    localStorage.removeItem("msp_user");
    setIsLoggedIn(false);
    setUsername("");
  };

  const buyItem = (item, price) => {
    if (foodCoins >= price) {
      setFoodCoins(prev => prev - price);
      playSound("buy");
      confetti({ colors: ['#f472b6', '#fcd34d'] });
      if (item === 'crown') setHasCrown(true);
      if (item === 'glasses') setHasGlasses(true);
    } else {
      alert(`😿 Thiếu xương rùi ${userTitle} ơi!`);
    }
  };

  const updateQuestProgress = (type, amount = 1) => {
    setQuests(prev => prev.map(q => {
      if (q.id === type && !q.claimed) {
        const newCurrent = Math.min(q.current + amount, q.target);
        return { ...q, current: newCurrent, done: newCurrent >= q.target };
      }
      return q;
    }));
  };

  const claimQuestReward = (id) => {
    setQuests(prev => prev.map(q => {
      if (q.id === id && q.done && !q.claimed) {
        setFoodCoins(f => f + q.reward);
        playSound("buy");
        confetti({ particleCount: 50, spread: 60, colors: ["#fb923c", "#fcd34d"] });
        return { ...q, claimed: true };
      }
      return q;
    }));
  };

  const callGemini = async (prompt, isJsonMode = false) => {
    try {
      const API_KEY = process.env.NEXT_PUBLIC_GEMINI_KEY;
      if (!API_KEY) return "Bố quên cài mã API Key vào file .env.local rồi 😿";

      const systemText = isJsonMode 
        ? "Chỉ trả về định dạng JSON hợp lệ. Không kèm theo text."
        : `Bạn là Mèo Hồng. Gọi người dùng là '${userTitle}'. Trả lời dưới 40 từ, siêu nũng nịu, nhiều emoji 🌸💖🐾.`;

      const bodyPayload = {
        systemInstruction: { parts: [{ text: systemText }] },
        contents: [{ parts: [{ text: prompt }] }]
      };

      if (isJsonMode) {
        bodyPayload.generationConfig = { responseMimeType: "application/json" };
      }

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload)
      });
      const data = await res.json();
      return data.candidates[0].content.parts[0].text.replace(/\*/g, "");
    } catch (error) {
      return `Lag quá ${userTitle} ơi, Mèo hông load được huhu 😿`;
    }
  };

  if (!mounted) return <div className="min-h-screen bg-pink-100 flex items-center justify-center"><div className="animate-spin text-5xl">🌸</div></div>;

  // ================= 1. GIAO DIỆN ĐĂNG NHẬP =================
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-300 via-pink-200 to-rose-200 animate-gradient-x flex items-center justify-center p-5">
        <div className="glass-card p-8 rounded-[2.5rem] shadow-2xl w-full max-w-sm text-center relative z-10 border-[3px] border-white/60 animate-in zoom-in duration-500 glow-pink">
          <img src={CAT_IMAGE} alt="Mèo Hồng" className="w-40 h-40 mx-auto rounded-full border-8 border-white/80 shadow-xl mb-6 animate-[bounce_3s_infinite] object-cover" />
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500 mb-2 drop-shadow-sm">MyStudyPlan</h1>
          <p className="text-sm font-bold text-pink-400 mb-8">Kỷ luật tự giác - Nuôi thú cực mượt</p>
          <div className="flex gap-2 mb-4">
            <select value={userTitle} onChange={(e) => setUserTitle(e.target.value)} className="w-1/3 p-4 rounded-2xl glass-input text-pink-600 font-bold text-lg outline-none cursor-pointer">
              <option value="Bạn">Bạn</option>
              <option value="Bố">Bố</option>
              <option value="Mẹ">Mẹ</option>
              <option value="Anh">Anh</option>
              <option value="Chị">Chị</option>
              <option value="Chủ nhân">Chủ nhân</option>
            </select>
            <input type="text" placeholder="Tên là gì ạ?..." value={username} onChange={(e) => setUsername(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleLogin()} className="w-2/3 p-4 rounded-2xl glass-input text-pink-600 placeholder-pink-400 text-center font-bold text-lg outline-none" />
          </div>
          <button onClick={handleLogin} className="w-full bg-gradient-to-r from-pink-400 to-rose-400 text-white text-lg font-black py-4 rounded-2xl shadow-[0_6px_0_rgb(225,29,72)] active:translate-y-[6px] active:shadow-none transition-all hover:scale-[1.02] hover:shadow-lg">
            Vào Học Thôi {userTitle} Ơi ✨
          </button>
        </div>
      </div>
    );
  }

  // ================= 2. GIAO DIỆN CHÍNH (ĐA NỀN TẢNG) =================
  const tabs = [ 
    { id: 'home', icon: '🏠', label: 'Trang chủ' }, 
    { id: 'schedule', icon: '📅', label: 'Lịch học' }, 
    { id: 'study', icon: '⏳', label: 'Học bài' },
    { id: 'grades', icon: '💯', label: 'Điểm số' }, 
    { id: 'flashcard', icon: '🃏', label: 'AI Quiz' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-rose-100 to-pink-300 animate-gradient-x flex justify-center items-start lg:items-stretch lg:p-6">
      <div className="w-full lg:max-w-7xl lg:rounded-[3rem] bg-white/40 backdrop-blur-xl min-h-screen lg:min-h-0 relative lg:shadow-2xl md:border-x-[6px] lg:border-[6px] border-white/60 flex flex-col lg:flex-row pb-28 lg:pb-0 text-gray-700 font-sans overflow-hidden">
        
        {/* TOAST ALARM NHẮC NHỞ LỊCH HỌC */}
        {reminderAlert && (
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50 w-11/12 max-w-sm animate-in slide-in-from-top-10 fade-in duration-300">
            <div className="glass-card rounded-3xl p-4 shadow-2xl border-2 border-orange-300 flex items-center gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-orange-100 rounded-bl-full -z-10"></div>
              <div className="text-5xl animate-[bounce_1s_infinite]">🌭🐕</div>
              <div className="flex-1">
                <h3 className="font-black text-orange-500 text-lg drop-shadow-sm">BÁO ĐỘNG! GÂU GÂU!</h3>
                <p className="text-sm font-bold text-gray-600 mt-1">Sắp tới giờ <span className="text-pink-500">{reminderAlert.type}</span> môn <span className="text-pink-500">{reminderAlert.name}</span> rồi!</p>
              </div>
              <button onClick={() => setReminderAlert(null)} className="text-gray-300 hover:text-gray-500 font-black text-xl px-2">X</button>
            </div>
          </div>
        )}

        {/* SIDEBAR FOR DESKTOP / IPAD */}
        <aside className="hidden lg:flex flex-col w-32 border-r-2 border-white/50 glass p-6 justify-between items-center z-40">
           <div className="flex flex-col items-center gap-6 mt-4">
              <div className="text-4xl animate-bounce mb-8">🐾</div>
              {tabs.map(tab => (
                 <button key={tab.id} onClick={() => {playSound("click"); setActiveTab(tab.id)}} className={`flex flex-col items-center justify-center w-20 h-20 rounded-3xl transition-all duration-300 ${activeTab === tab.id ? 'glass bg-white/60 text-pink-600 shadow-xl border border-white/80 scale-110' : 'text-pink-400/80 hover:bg-white/30 hover:scale-105'}`}>
                   <span className={`text-3xl mb-1 transition-transform ${activeTab === tab.id ? 'animate-pulse' : ''}`}>{tab.icon}</span>
                   <span className="text-[10px] font-black">{tab.label}</span>
                 </button>
              ))}
           </div>
           <button onClick={handleLogout} className="text-pink-400 font-bold glass-card px-4 py-2 rounded-xl text-sm hover:bg-pink-100 transition">Thoát</button>
        </aside>

        <div className="flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden relative">
           {/* HEADER */}
           <header className="flex justify-between items-center p-6 lg:p-8 glass lg:bg-transparent lg:backdrop-blur-none rounded-b-[2.5rem] lg:rounded-none sticky top-0 z-40 text-pink-600 border-b-2 lg:border-none border-white/60">
             <div>
               <h1 className="text-2xl lg:text-4xl font-black truncate max-w-[200px] lg:max-w-none drop-shadow-sm">Chào, {username}! 🌸</h1>
               <p className="text-sm font-bold text-gray-500 hidden lg:block mt-1">Hôm nay {userTitle} muốn học môn gì nào?</p>
               <button onClick={handleLogout} className="lg:hidden text-[10px] font-bold bg-pink-100/50 px-2 py-1 rounded-md mt-1 hover:bg-pink-200 transition">Đăng xuất 🚪</button>
             </div>
             <div className="flex items-center glass-card px-5 py-3 rounded-full shadow-[0_4px_0_rgba(244,114,182,0.3)] hover:scale-105 transition-transform cursor-pointer border-white/80">
               <span className="text-2xl animate-bounce">🍖</span><span className="ml-3 font-black text-pink-600 text-2xl">{foodCoins}</span>
             </div>
           </header>

           {/* --- CONTENT AREA CHÍNH --- */}
           <main className="flex-1 p-0 lg:p-4">
             <div className="max-w-5xl mx-auto">
               {activeTab === "home" && <HomeTab stats={stats} isAiThinking={isAiThinking} aiMessage={aiMessage} hasGlasses={hasGlasses} hasCrown={hasCrown} buyItem={buyItem} foodCoins={foodCoins} quests={quests} claimQuestReward={claimQuestReward} inventory={inventory} setInventory={setInventory} equippedBg={equippedBg} setEquippedBg={setEquippedBg} setFoodCoins={setFoodCoins} playSound={playSound} userTitle={userTitle} />}
               {activeTab === "schedule" && <ScheduleTab schedules={schedules} setSchedules={setSchedules} playSound={playSound} triggerAlarm={triggerAlarm} userTitle={userTitle} />}
               {activeTab === "grades" && <GradesTab playSound={playSound} isAiThinking={isAiThinking} setIsAiThinking={setIsAiThinking} gradeHistory={gradeHistory} setGradeHistory={setGradeHistory} callGemini={callGemini} setAiMessage={setAiMessage} setActiveTab={setActiveTab} setFoodCoins={setFoodCoins} userTitle={userTitle} />}
               {activeTab === "study" && <StudyTab playSound={playSound} setFoodCoins={setFoodCoins} setStats={setStats} updateQuestProgress={updateQuestProgress} userTitle={userTitle} />}
               {activeTab === "flashcard" && <FlashcardTab playSound={playSound} foodCoins={foodCoins} setFoodCoins={setFoodCoins} callGemini={callGemini} updateQuestProgress={updateQuestProgress} userTitle={userTitle} />}
             </div>
           </main>
        </div>

        {/* BOTTOM NAV */}
        <div className="fixed bottom-6 w-full px-4 z-50 flex justify-center lg:hidden pointer-events-none">
          <nav className="w-full max-w-md glass-card rounded-[2rem] shadow-[0_10px_40px_rgba(244,114,182,0.3)] border border-white/60 px-2 py-3 flex justify-between items-center pointer-events-auto">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => {playSound("click"); setActiveTab(tab.id)}} className={`flex flex-col items-center justify-center w-[60px] h-14 rounded-[1.2rem] transition-all duration-300 ${activeTab === tab.id ? 'glass bg-white/50 text-pink-600 -translate-y-2 shadow-lg border border-white/80' : 'text-pink-400/80 hover:bg-white/30'}`}>
                <span className={`text-xl mb-0.5 transition-transform ${activeTab === tab.id ? 'scale-110 animate-bounce' : 'scale-100'}`}>{tab.icon}</span>
                <span className="text-[9px] font-black">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
