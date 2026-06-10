import React, { useState, useEffect } from 'react';
import confetti from "canvas-confetti";
import { Music, CloudRain, Coffee } from 'lucide-react';

export default function StudyTab({ playSound, setFoodCoins, setStats, setChartData, updateQuestProgress, userTitle }) {
  const [workTime, setWorkTime] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  // Âm thanh nền
  const [playingRain, setPlayingRain] = useState(false);
  const [playingCafe, setPlayingCafe] = useState(false);
  const [playingLofi, setPlayingLofi] = useState(false);

  useEffect(() => {
    // Sync tasks on mount
    const saved = localStorage.getItem("msp_tasks");
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("msp_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      playSound("success");
      confetti({ particleCount: 200, spread: 90, colors: ["#f472b6", "#fb923c", "#fcd34d"] });
      setFoodCoins((prev) => prev + (workTime >= 50 ? 15 : workTime >= 25 ? 5 : 2));
      setStats(prev => ({ 
        ...prev, 
        minutes: prev.minutes + workTime,
        hunger: Math.min(100, (prev.hunger ?? 50) + (workTime >= 50 ? 20 : 10)),
        happiness: Math.min(100, (prev.happiness ?? 50) + (workTime >= 50 ? 30 : 15))
      }));
      
      const dayIndex = (new Date().getDay() + 6) % 7;
      if (setChartData) {
        setChartData(prev => {
          const arr = [...prev];
          arr[dayIndex] = { ...arr[dayIndex], min: arr[dayIndex].min + workTime };
          return arr;
        });
      }

      alert(`✨ Ting ting! Hoàn thành ${workTime} phút! Mèo thưởng xương nha!`);
      setTimeLeft(workTime * 60);
      if (updateQuestProgress) updateQuestProgress('pomodoro', 1);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, workTime, playSound, setFoodCoins, setStats, setChartData, updateQuestProgress]);

  const changeTime = (mins) => {
    setWorkTime(mins);
    setTimeLeft(mins * 60);
    setIsRunning(false);
  };

  const circumference = 54 * 2 * Math.PI;
  const TOTAL_SECONDS = workTime * 60;
  const strokeDashoffset = circumference - (timeLeft / TOTAL_SECONDS) * circumference;

  return (
    <div className="animate-in fade-in pb-24 lg:grid lg:grid-cols-2 lg:gap-8 lg:mt-8">
      
      {/* Cột trái: Pomodoro & Âm thanh */}
      <div className="flex flex-col gap-6">
      {/* Pomodoro */}
      <div className="mx-5 lg:mx-0 glass-card p-6 rounded-[2.5rem] shadow-xl border border-white/60 text-center flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-300/20 rounded-bl-full blur-2xl"></div>
        <h2 className="font-black text-xl text-pink-600 mb-2 drop-shadow-sm">⏳ Vùng Tập Trung</h2>
        
        {/* Time Selector */}
        <div className="flex gap-2 mt-2 bg-white/40 p-1.5 rounded-full border border-white/50">
           <button onClick={() => changeTime(15)} className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${workTime === 15 ? 'bg-pink-400 text-white shadow-md' : 'text-pink-500 hover:bg-white/50'}`}>15p</button>
           <button onClick={() => changeTime(25)} className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${workTime === 25 ? 'bg-pink-400 text-white shadow-md' : 'text-pink-500 hover:bg-white/50'}`}>25p</button>
           <button onClick={() => changeTime(50)} className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${workTime === 50 ? 'bg-pink-400 text-white shadow-md' : 'text-pink-500 hover:bg-white/50'}`}>50p</button>
        </div>

        <div className={`relative w-64 h-64 flex justify-center items-center my-6 transition-transform duration-500 ${isRunning ? 'scale-105 glow-pink rounded-full' : ''}`}>
          <svg className="w-full h-full -rotate-90 drop-shadow-xl" viewBox="0 0 120 120"><circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="8"></circle><circle cx="60" cy="60" r="54" fill="none" stroke="url(#pinkGradient)" strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className="transition-all duration-1000 ease-linear"></circle><defs><linearGradient id="pinkGradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#f472b6" /><stop offset="100%" stopColor="#fb7185" /></linearGradient></defs></svg>
          <div className="absolute text-5xl font-black text-pink-500 drop-shadow-md">{String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}</div>
        </div>
        <button onClick={() => {playSound("click"); setIsRunning(!isRunning)}} className={`px-10 py-4 rounded-2xl font-black text-white text-xl w-full transition-all duration-300 hover:scale-[1.02] ${isRunning ? 'bg-gradient-to-r from-red-400 to-rose-400 shadow-[0_6px_0_rgba(225,29,72,0.5)] active:shadow-none active:translate-y-[6px]' : 'bg-gradient-to-r from-pink-400 to-rose-400 shadow-[0_6px_0_rgba(219,39,119,0.5)] active:shadow-none active:translate-y-[6px]'}`}>
          {isRunning ? `Dừng Lại Đi ${userTitle}` : "Học Bài Thôi 🚀"}
        </button>
      </div>

      {/* Âm thanh Lofi / Chill */}
      <div className="mx-5 lg:mx-0 glass-card p-5 rounded-[2rem] shadow-lg border border-white/60">
         <h3 className="font-black text-pink-600 mb-3 text-lg drop-shadow-sm flex items-center"><Music className="w-5 h-5 mr-2" /> Thư Giãn & Tập Trung</h3>
         <div className="flex gap-3">
            <button onClick={() => setPlayingLofi(!playingLofi)} className={`flex-1 flex flex-col items-center p-3 rounded-2xl border border-white/50 transition-all ${playingLofi ? 'bg-pink-400 text-white shadow-md' : 'glass text-pink-500 hover:bg-white/50'}`}>
               <span className="text-xl mb-1">🎧</span>
               <span className="text-[10px] font-bold">Lofi</span>
               {playingLofi && <audio src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" autoPlay loop className="hidden" />}
            </button>
            <button onClick={() => setPlayingRain(!playingRain)} className={`flex-1 flex flex-col items-center p-3 rounded-2xl border border-white/50 transition-all ${playingRain ? 'bg-blue-400 text-white shadow-md' : 'glass text-pink-500 hover:bg-white/50'}`}>
               <CloudRain className="w-5 h-5 mb-1" />
               <span className="text-[10px] font-bold">Tiếng Mưa</span>
               {playingRain && <audio src="https://assets.mixkit.co/sfx/preview/mixkit-light-rain-loop-2393.mp3" autoPlay loop className="hidden" />}
            </button>
            <button onClick={() => setPlayingCafe(!playingCafe)} className={`flex-1 flex flex-col items-center p-3 rounded-2xl border border-white/50 transition-all ${playingCafe ? 'bg-orange-400 text-white shadow-md' : 'glass text-pink-500 hover:bg-white/50'}`}>
               <Coffee className="w-5 h-5 mb-1" />
               <span className="text-[10px] font-bold">Quán Cafe</span>
               {playingCafe && <audio src="https://assets.mixkit.co/sfx/preview/mixkit-coffee-shop-ambience-loop-3201.mp3" autoPlay loop className="hidden" />}
            </button>
         </div>
      </div>
      </div> {/* Hết cột trái */}

      {/* Cột phải: Todo List */}
      <div className="flex flex-col gap-6 mt-6 lg:mt-0">
      {/* Todo List */}
      <div className="mx-5 lg:mx-0 glass-card p-5 rounded-[2rem] shadow-lg border border-white/60">
        <h3 className="font-black text-pink-600 mb-4 text-lg drop-shadow-sm">📝 Việc cần làm</h3>
        <div className="flex mb-6 glass p-2 rounded-2xl border border-white/50 focus-within:border-pink-300 transition-colors">
          <input type="text" placeholder={`Thêm việc mới nha ${userTitle}...`} value={newTask} onChange={(e) => setNewTask(e.target.value)} onKeyPress={(e) => {if(e.key==='Enter' && newTask) {setTasks([{id: Date.now(), text: newTask, done: false}, ...tasks]); setNewTask(""); playSound("click");}}} className="flex-1 bg-transparent outline-none p-2 font-bold text-pink-600 placeholder-pink-400" />
          <button onClick={() => {if(newTask) {setTasks([{id: Date.now(), text: newTask, done: false}, ...tasks]); setNewTask(""); playSound("click");}}} className="bg-pink-400 text-white w-12 h-12 rounded-xl font-black text-2xl shadow-[0_4px_0_rgba(219,39,119,0.5)] active:translate-y-[4px] active:shadow-none hover:bg-pink-500 transition-colors">+</button>
        </div>
        <ul className="space-y-3">
          {tasks.map((t, idx) => (
            <li key={t.id} className="flex items-center p-4 rounded-2xl border border-white/50 glass cursor-pointer transition-all hover:scale-[1.02] animate-in slide-in-from-right-5 fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className={`w-8 h-8 rounded-xl border-[3px] flex items-center justify-center mr-4 transition-all ${t.done ? 'bg-pink-400 border-pink-400 scale-110 shadow-lg' : 'border-white bg-white/50'}`} onClick={() => { setTasks(tasks.map(task => task.id === t.id ? { ...task, done: !task.done } : task)); if (!t.done) { playSound("success"); setFoodCoins(f => f + 1); setStats(s => ({...s, tasks: s.tasks + 1, hunger: Math.min(100, (s.hunger ?? 50) + 5), happiness: Math.min(100, (s.happiness ?? 50) + 5)})); confetti({particleCount: 50, spread: 40}); if (updateQuestProgress) updateQuestProgress('todo', 1); } }}>{t.done && <span className="text-white font-black text-sm">✓</span>}</div>
              <span className={`font-bold flex-1 transition-all ${t.done ? 'line-through text-pink-300/80' : 'text-pink-600'}`}>{t.text}</span>
              <button onClick={(e) => {e.stopPropagation(); setTasks(tasks.filter(task => task.id !== t.id)); playSound("click");}} className="text-pink-300 hover:text-red-400 font-black ml-2 px-2 text-xl hover:scale-110 transition-transform">×</button>
            </li>
          ))}
        </ul>
      </div>
      </div> {/* Hết cột phải */}
    </div>
  );
}
