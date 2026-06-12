"use client";
import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import HomeTab from "./components/HomeTab";
import ScheduleTab from "./components/ScheduleTab";
import GradesTab from "./components/GradesTab";
import StudyTab from "./components/StudyTab";
import FlashcardTab from "./components/FlashcardTab";

import { auth, db } from "../firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function App() {
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Auth states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const [username, setUsername] = useState("");
  const [userTitle, setUserTitle] = useState("");

  const [activeTab, setActiveTab] = useState("home");
  const [foodCoins, setFoodCoins] = useState(50);
  const [hasCrown, setHasCrown] = useState(false);
  const [hasGlasses, setHasGlasses] = useState(false);
  const [stats, setStats] = useState({ streak: 1, minutes: 0, tasks: 0 });
  const [chartData, setChartData] = useState([
    { name: 'T2', min: 0 }, { name: 'T3', min: 0 }, { name: 'T4', min: 0 },
    { name: 'T5', min: 0 }, { name: 'T6', min: 0 }, { name: 'T7', min: 0 }, { name: 'CN', min: 0 }
  ]);
  const [gradeHistory, setGradeHistory] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [equippedBg, setEquippedBg] = useState("default");
  
  const [quests, setQuests] = useState([]);
  const [lastLogin, setLastLogin] = useState("");

  const [aiMessage, setAiMessage] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);

  const [isPremium, setIsPremium] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Lắng nghe trạng thái đăng nhập từ Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        setUsername(user.displayName || "Bạn");
        
        // Kéo dữ liệu từ Cloud Firestore
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserTitle(data.userTitle || "Bạn");
          setFoodCoins(data.foodCoins ?? 50);
          setHasCrown(data.hasCrown || false);
          setHasGlasses(data.hasGlasses || false);
          setStats(data.stats || { streak: 1, minutes: 0, tasks: 0 });
          setIsPremium(data.isPremium || false);
          setChartData(data.chartData || [
            { name: 'T2', min: 0 }, { name: 'T3', min: 0 }, { name: 'T4', min: 0 },
            { name: 'T5', min: 0 }, { name: 'T6', min: 0 }, { name: 'T7', min: 0 }, { name: 'CN', min: 0 }
          ]);
          setGradeHistory(data.gradeHistory || []);
          setSchedules(data.schedules || []);
          setInventory(data.inventory || []);
          setEquippedBg(data.equippedBg || "default");
          
          const today = new Date().toLocaleDateString('vi-VN');
          if (data.lastLogin !== today) {
            setLastLogin(today);
            setStats(prev => ({ ...prev, streak: prev.streak + 1 }));
            generateDailyQuests();
          } else {
            setQuests(data.quests || []);
            setLastLogin(data.lastLogin || "");
          }
        } else {
          // Người dùng mới hoàn toàn
          setUserTitle(userTitle || "Bạn");
          setLastLogin(new Date().toLocaleDateString('vi-VN'));
          generateDailyQuests();
        }
      } else {
        setIsLoggedIn(false);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Đồng bộ hóa liên tục lên Cloud Firestore khi có thay đổi
  useEffect(() => {
    if (isLoggedIn && auth.currentUser) {
      const userRef = doc(db, "users", auth.currentUser.uid);
      setDoc(userRef, {
        userTitle, foodCoins, hasCrown, hasGlasses, stats, chartData, gradeHistory, schedules, inventory, equippedBg, quests, lastLogin, isPremium
      }, { merge: true });
    }
  }, [foodCoins, hasCrown, hasGlasses, stats, chartData, gradeHistory, schedules, inventory, equippedBg, quests, lastLogin, userTitle, isLoggedIn, isPremium]);

  const generateDailyQuests = () => {
    const dailyQuests = [
      { id: "q1", type: "pomodoro", desc: "Hoàn thành 2 Pomodoro", target: 2, current: 0, reward: 15, done: false, claimed: false, icon: "⏳" },
      { id: "q2", type: "todo", desc: "Hoàn thành 3 việc trong Todo List", target: 3, current: 0, reward: 20, done: false, claimed: false, icon: "✅" },
      { id: "q3", type: "flashcard", desc: "Chơi 1 bài test Flashcard", target: 1, current: 0, reward: 10, done: false, claimed: false, icon: "🃏" }
    ];
    setQuests(dailyQuests);
  };

  const updateQuestProgress = (type, amount) => {
    setQuests(prev => prev.map(q => {
      if (q.type === type && !q.done) {
        const newCurrent = Math.min(q.current + amount, q.target);
        return { ...q, current: newCurrent, done: newCurrent >= q.target };
      }
      return q;
    }));
  };

  const claimQuestReward = (id) => {
    const q = quests.find(q => q.id === id);
    if (q && q.done && !q.claimed) {
      playSound("success");
      confetti({ particleCount: 50, spread: 60 });
      setFoodCoins(prev => prev + q.reward);
      setQuests(prev => prev.map(quest => quest.id === id ? { ...quest, claimed: true } : quest));
    }
  };

  useEffect(() => {
    const hour = new Date().getHours();
    let greeting = hour >= 18 ? "Chào buổi tối" : hour >= 12 ? "Chào buổi chiều" : "Chào buổi sáng";
    if (isLoggedIn && !aiMessage) setAiMessage(`Meo meo~ ${greeting} ${username}! Hôm nay trời đẹp lắm, ${userTitle} nhớ học bài nha 💖🐾`);
  }, [isLoggedIn, username, aiMessage, userTitle]);

  const playSound = (type) => {
    let audioSrc = "";
    if (type === "click") audioSrc = "https://actions.google.com/sounds/v1/ui/button_click.ogg";
    else if (type === "success") audioSrc = "https://actions.google.com/sounds/v1/cartoon/woodblock_high.ogg";
    if (audioSrc) { const audio = new Audio(audioSrc); audio.volume = 0.5; audio.play().catch(() => {}); }
  };

  const handleAuth = async () => {
    if (!email || !password) return alert("Vui lòng điền đủ Email và Mật khẩu nha!");
    const finalTitle = userTitle.trim() === "" ? "Bạn" : userTitle;
    const finalUsername = username.trim() === "" ? "Học Sinh" : username;
    
    setIsLoading(true);
    try {
      if (isRegistering) {
        if (finalUsername.length < 2) { setIsLoading(false); return alert(`Tên đăng nhập hơi ngắn ${finalTitle} ơi 🌸`); }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: finalUsername });
        setUserTitle(finalTitle);
        setUsername(finalUsername);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
      playSound("click");
    } catch (error) {
      console.error(error);
      alert(`Lỗi đăng nhập: ${error.message}`);
    }
    setIsLoading(false);
  };

  const handleLogout = async () => {
    playSound("click");
    await signOut(auth);
    setAiMessage("");
    setIsLoggedIn(false);
  };

  const triggerAlarm = () => {
    const audio = new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg");
    audio.play();
    alert("⏰ ĐẾN GIỜ RỒI!!! ⏰");
  };

  const buyItem = (item, price) => {
    if (foodCoins >= price) {
      setFoodCoins(prev => prev - price);
      playSound("success");
      confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } });
      if (item === 'crown') setHasCrown(true);
      if (item === 'glasses') setHasGlasses(true);
    } else {
      alert(`😿 Thiếu xương rùi ${userTitle} ơi!`);
    }
  };

  const callGemini = async (prompt, isJsonMode = false, fileData = null) => {
    try {
      const API_KEY = process.env.NEXT_PUBLIC_GEMINI_KEY;
      if (!API_KEY) return "Bố quên cài mã API Key vào file .env.local rồi 😿";

      const systemText = isJsonMode 
        ? "Chỉ trả về định dạng JSON hợp lệ. Không kèm theo text."
        : `Bạn là Mèo Hồng. Gọi người dùng là '${userTitle}'. Trả lời dưới 40 từ, siêu nũng nịu, nhiều emoji 🌸💖🐾.`;

      const userParts = [{ text: prompt }];
      if (fileData) {
        userParts.push({ inlineData: { mimeType: fileData.mimeType, data: fileData.data } });
      }

      const bodyPayload = {
        systemInstruction: { parts: [{ text: systemText }] },
        contents: [{ role: "user", parts: userParts }],
      };
      if (isJsonMode) bodyPayload.generationConfig = { responseMimeType: "application/json" };

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });
      const data = await res.json();
      if (!res.ok) { console.error(data); return "ERROR: " + (data.error?.message || "Lỗi API"); }
      return data.candidates[0].content.parts[0].text.replace(/\*/g, "");
    } catch (error) {
      return `Lag quá ${userTitle} ơi, Mèo hông load được huhu 😿`;
    }
  };

  if (!mounted) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-rose-200">
        <div className="text-4xl animate-bounce">🐾</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-pink-50 relative overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob"></div>
        <div className="absolute top-20 right-10 w-32 h-32 bg-rose-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-32 h-32 bg-fuchsia-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-4000"></div>
        
        <div className="max-w-md w-full glass p-8 rounded-[3rem] shadow-2xl relative z-10 border border-white/60">
          <img src="/pink_cat.png" alt="Mèo Hồng" className="w-32 h-32 mx-auto rounded-full border-8 border-white/80 shadow-xl mb-4 animate-[bounce_3s_infinite] object-cover" />
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500 mb-2 drop-shadow-sm text-center">MyStudyPlan</h1>
          <p className="text-sm font-bold text-pink-400 mb-8 text-center">Cloud Database Enabled ☁️</p>
          
          <div className="flex flex-col gap-3 mb-6">
            <input type="email" placeholder="Email của bạn..." value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 rounded-2xl glass-input text-pink-600 placeholder-pink-400 font-bold text-base outline-none" />
            <input type="password" placeholder="Mật khẩu (ít nhất 6 ký tự)..." value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 rounded-2xl glass-input text-pink-600 placeholder-pink-400 font-bold text-base outline-none" />
            
            {isRegistering && (
              <div className="flex gap-2 mt-2 animate-in fade-in slide-in-from-top-2">
                <input type="text" placeholder="Xưng hô (VD: Bố...)" value={userTitle} onChange={(e) => setUserTitle(e.target.value)} className="w-1/3 p-4 rounded-2xl glass-input text-pink-600 placeholder-pink-400 font-bold text-base outline-none" />
                <input type="text" placeholder="Tên hiển thị..." value={username} onChange={(e) => setUsername(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAuth()} className="w-2/3 p-4 rounded-2xl glass-input text-pink-600 placeholder-pink-400 font-bold text-base outline-none" />
              </div>
            )}
          </div>

          <button onClick={handleAuth} className="w-full bg-gradient-to-r from-pink-400 to-rose-400 text-white text-lg font-black py-4 rounded-2xl shadow-[0_6px_0_rgb(225,29,72)] active:translate-y-[6px] active:shadow-none transition-all hover:scale-[1.02] hover:shadow-lg mb-4">
            {isRegistering ? "Tạo Tài Khoản ✨" : "Đăng Nhập 🚀"}
          </button>
          
          <p className="text-center text-sm font-bold text-gray-500 cursor-pointer hover:text-pink-500 transition-colors" onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? "Đã có tài khoản? Đăng nhập thôi!" : "Chưa có tài khoản? Đăng ký ngay!"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-pink-50 font-sans flex flex-col lg:flex-row pb-20 lg:pb-0 overflow-x-hidden selection:bg-pink-300 selection:text-white transition-colors duration-500">
       {/* --- SIDEBAR CHO DESKTOP --- */}
       <aside className="hidden lg:flex flex-col w-24 glass border-r border-white/50 h-screen sticky top-0 items-center py-8 z-50">
         <div className="w-14 h-14 bg-gradient-to-tr from-pink-400 to-rose-400 rounded-2xl shadow-lg shadow-pink-300 flex items-center justify-center text-white text-2xl font-black mb-10 transform -rotate-6 hover:rotate-0 transition-transform">M</div>
         <nav className="flex flex-col gap-6 flex-1 w-full items-center">
           {[
             { id: 'home', icon: '🏠', label: 'Nhà' },
             { id: 'schedule', icon: '📅', label: 'Lịch' },
             { id: 'grades', icon: '🎯', label: 'Điểm' },
             { id: 'study', icon: '⏳', label: 'Học' },
             { id: 'flashcard', icon: '🃏', label: 'Ôn' }
           ].map(tab => (
             <div key={tab.id} onClick={() => {playSound("click"); setActiveTab(tab.id);}} className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl cursor-pointer transition-all duration-300 group relative ${activeTab === tab.id ? 'bg-white shadow-[0_4px_0_rgb(244,114,182)] -translate-y-1' : 'hover:bg-white/50'}`}>
               <span className={activeTab === tab.id ? 'animate-bounce' : 'group-hover:scale-110 transition-transform'}>{tab.icon}</span>
             </div>
           ))}
         </nav>
         <button onClick={handleLogout} className="mt-auto w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-xl hover:bg-pink-200 transition shadow-sm">🚪</button>
       </aside>

       {/* --- BOTTOM BAR CHO MOBILE --- */}
       <nav className="lg:hidden fixed bottom-4 left-4 right-4 glass rounded-3xl p-2 flex justify-around items-center z-50 border border-white/60 shadow-2xl">
         {[
           { id: 'home', icon: '🏠' }, { id: 'schedule', icon: '📅' }, { id: 'grades', icon: '🎯' }, { id: 'study', icon: '⏳' }, { id: 'flashcard', icon: '🃏' }
         ].map(tab => (
           <div key={tab.id} onClick={() => {playSound("click"); setActiveTab(tab.id);}} className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all duration-300 ${activeTab === tab.id ? 'bg-gradient-to-tr from-pink-400 to-rose-400 shadow-lg shadow-pink-300 text-white -translate-y-2' : 'hover:bg-white/50'}`}>
             <span className={activeTab === tab.id ? 'animate-bounce' : ''}>{tab.icon}</span>
           </div>
         ))}
       </nav>

       {/* --- KHU VỰC NỘI DUNG CHÍNH --- */}
       <div className="flex-1 flex flex-col min-h-screen relative">
         <header className="flex justify-between items-center p-6 lg:p-8 glass lg:bg-transparent lg:backdrop-blur-none rounded-b-[2.5rem] lg:rounded-none sticky top-0 z-40 text-pink-600 border-b-2 lg:border-none border-white/60">
           <div>
             <h1 className="text-2xl lg:text-4xl font-black truncate max-w-[200px] lg:max-w-none drop-shadow-sm flex items-center">
               Chào, {username}! {isPremium ? <span className="ml-2 text-xl text-yellow-500" title="Người dùng Premium">💎</span> : <span className="ml-2">🌸</span>}
             </h1>
             <p className="text-sm font-bold text-gray-500 hidden lg:block mt-1">Hôm nay {userTitle} muốn học môn gì nào?</p>
             <button onClick={handleLogout} className="lg:hidden text-[10px] font-bold bg-pink-100/50 px-2 py-1 rounded-md mt-1 hover:bg-pink-200 transition">Đăng xuất 🚪</button>
           </div>
           <div className="flex items-center gap-4">
             {!isPremium && (
               <button onClick={() => {playSound("click"); setShowPremiumModal(true);}} className="hidden md:flex items-center px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full font-black text-sm shadow-[0_3px_0_rgba(180,83,9,0.8)] active:translate-y-[3px] active:shadow-none hover:scale-105 transition-all">
                 <span className="mr-2 animate-pulse">💎</span> Nâng Cấp
               </button>
             )}
             <div className="flex items-center glass-card px-5 py-3 rounded-full shadow-[0_4px_0_rgba(244,114,182,0.3)] hover:scale-105 transition-transform cursor-pointer border-white/80">
               <span className="text-2xl animate-bounce">🍖</span><span className="ml-3 font-black text-pink-600 text-2xl">{foodCoins}</span>
             </div>
           </div>
         </header>

         <main className="flex-1 p-0 lg:p-4">
           <div className="max-w-5xl mx-auto">
             {activeTab === "home" && <HomeTab stats={stats} chartData={chartData} isAiThinking={isAiThinking} aiMessage={aiMessage} hasGlasses={hasGlasses} hasCrown={hasCrown} buyItem={buyItem} foodCoins={foodCoins} quests={quests} claimQuestReward={claimQuestReward} inventory={inventory} setInventory={setInventory} equippedBg={equippedBg} setEquippedBg={setEquippedBg} setFoodCoins={setFoodCoins} playSound={playSound} userTitle={userTitle} isPremium={isPremium} />}
             {activeTab === "schedule" && <ScheduleTab schedules={schedules} setSchedules={setSchedules} playSound={playSound} triggerAlarm={triggerAlarm} userTitle={userTitle} isPremium={isPremium} />}
             {activeTab === "grades" && <GradesTab playSound={playSound} isAiThinking={isAiThinking} setIsAiThinking={setIsAiThinking} gradeHistory={gradeHistory} setGradeHistory={setGradeHistory} callGemini={callGemini} setAiMessage={setAiMessage} setActiveTab={setActiveTab} setFoodCoins={setFoodCoins} userTitle={userTitle} />}
             {activeTab === "study" && <StudyTab playSound={playSound} setFoodCoins={setFoodCoins} setStats={setStats} setChartData={setChartData} updateQuestProgress={updateQuestProgress} userTitle={userTitle} />}
             {activeTab === "flashcard" && <FlashcardTab playSound={playSound} foodCoins={foodCoins} setFoodCoins={setFoodCoins} callGemini={callGemini} updateQuestProgress={updateQuestProgress} userTitle={userTitle} isPremium={isPremium} />}
           </div>
         </main>
         
         {showPremiumModal && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in" onClick={() => setShowPremiumModal(false)}>
             <div className="bg-white rounded-3xl w-full max-w-lg p-6 relative shadow-2xl border-4 border-yellow-300" onClick={(e) => e.stopPropagation()}>
               <button onClick={() => setShowPremiumModal(false)} className="absolute top-4 right-4 z-[110] w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-500 rounded-full font-black text-xl hover:bg-red-100 hover:text-red-500 transition-colors cursor-pointer">×</button>
               
               <div className="text-center mb-6">
                 <div className="text-6xl mb-2 animate-bounce">💎</div>
                 <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500">Premium Scholar</h2>
                 <p className="text-gray-500 font-bold mt-2">Mở khóa sức mạnh AI - Bứt phá điểm số!</p>
               </div>
               
               <div className="space-y-4 mb-6">
                 <div className="flex items-center gap-3 bg-yellow-50 p-4 rounded-2xl border border-yellow-200">
                   <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-white font-black text-xl">🚀</div>
                   <div>
                     <h3 className="font-black text-yellow-700">Mock-Test Generator</h3>
                     <p className="text-xs font-bold text-yellow-600">Quét vô hạn PDF/Slide tạo đề thi thử siêu chuẩn.</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-3 bg-pink-50 p-4 rounded-2xl border border-pink-200">
                   <div className="w-10 h-10 bg-pink-400 rounded-full flex items-center justify-center text-white font-black text-xl">📅</div>
                   <div>
                     <h3 className="font-black text-pink-700">AI Smart Scheduler</h3>
                     <p className="text-xs font-bold text-pink-600">Lên lịch ôn thi thần tốc bằng thuật toán chia nhỏ.</p>
                   </div>
                 </div>
                 
                 <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-200 flex items-start gap-3">
                   <div className="text-2xl mt-1">🌍</div>
                   <div>
                     <h3 className="font-black text-green-700 text-sm">Quỹ SDG 4 - Quality Education</h3>
                     <p className="text-[11px] font-bold text-green-600 leading-tight">Với mỗi gói Premium, bạn đang tài trợ 1 tài khoản miễn phí trọn đời cho sinh viên vùng sâu vùng xa theo mục tiêu phát triển bền vững của Liên Hợp Quốc.</p>
                   </div>
                 </div>
               </div>
               
               <div className="flex flex-col gap-3">
                 <button onClick={() => { playSound("success"); confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }}); setIsPremium(true); setShowPremiumModal(false); alert("Cảm ơn bạn đã đồng hành cùng MyStudyPlan và Quỹ SDG 4! Bạn đã trở thành hội viên Premium!"); }} className="w-full py-4 rounded-2xl font-black text-white text-lg bg-gradient-to-r from-yellow-400 to-orange-500 shadow-[0_6px_0_rgba(180,83,9,0.5)] active:translate-y-[6px] active:shadow-none hover:scale-[1.02] transition-all">
                   Đăng ký ngay - 29,000đ/tháng
                 </button>
                 <button onClick={() => { playSound("success"); confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }}); setIsPremium(true); setShowPremiumModal(false); alert("Cảm ơn bạn đã đồng hành cùng MyStudyPlan và Quỹ SDG 4! Bạn đã trở thành hội viên Premium!"); }} className="w-full py-3 rounded-2xl font-black text-yellow-700 text-base bg-yellow-100 hover:bg-yellow-200 transition-colors">
                   Tiết kiệm 40% (199,000đ/năm)
                 </button>
               </div>
             </div>
           </div>
         )}
      </div>
    </div>
  );
}
