import React, { useState } from 'react';
import confetti from 'canvas-confetti';

export default function GradesTab({ playSound, isAiThinking, setIsAiThinking, gradeHistory, setGradeHistory, callGemini, setAiMessage, setActiveTab, setFoodCoins, userTitle }) {
  const [gradeSystem, setGradeSystem] = useState("SCALE_10");
  const [subject, setSubject] = useState("");
  const [targetScore, setTargetScore] = useState("8.0");
  const [actualScore, setActualScore] = useState("");

  const handleGradeSubmit = async () => {
    if (!subject || !actualScore) return alert(`${userTitle} điền đủ thông tin cho Mèo nha 🐾!`);
    playSound("click");
    setIsAiThinking(true);
    setAiMessage(`Mèo đang bấm máy tính tính điểm môn ${subject} cho ${userTitle} nè... 🐾`);
    
    let isPass = false;
    if (gradeSystem === "SCALE_10" && parseFloat(actualScore) >= parseFloat(targetScore)) isPass = true;
    if (gradeSystem === "GPA_4") {
      const gpaMap = { "A": 4, "B": 3, "C": 2, "D": 1, "F": 0 };
      if ((gpaMap[actualScore.toUpperCase()] || parseFloat(actualScore)) >= (gpaMap[targetScore.toUpperCase()] || parseFloat(targetScore))) isPass = true;
    }
    
    let situation = `${userTitle} thi môn ${subject} được ${actualScore} (Mục tiêu: ${targetScore} hệ ${gradeSystem}). `;
    if (isPass) {
      situation += `Đạt mục tiêu! Khen ${userTitle} tung trời!`;
      setFoodCoins(prev => prev + 3);
      playSound("success");
      confetti({ particleCount: 150, spread: 80, colors: ["#ec4899", "#fbcfe8"] });
    } else {
      situation += `Rớt mục tiêu! Khóc lóc òa lên an ủi ${userTitle}.`;
    }

    const newGrade = { id: Date.now(), subject, score: actualScore, target: targetScore, isPass, date: new Date().toLocaleDateString('vi-VN') };
    setGradeHistory([newGrade, ...gradeHistory]);

    const reply = await callGemini(situation);
    setAiMessage(reply);
    setIsAiThinking(false);
    setActiveTab("home");
    setSubject(""); setActualScore("");
  };

  return (
    <div className="animate-in fade-in pb-24 lg:mt-6">
      <h2 className="font-black text-2xl text-pink-600 mb-6 drop-shadow-md text-center lg:text-left lg:mx-0 mx-5">💯 Khoe Điểm Số</h2>
      
      <div className="lg:grid lg:grid-cols-2 lg:gap-8">
      {/* Cột trái: Form nhập điểm */}
      <div className="mx-5 lg:mx-0 glass-card p-6 rounded-[2rem] shadow-lg border border-white/60 mb-6 lg:mb-0 h-fit">
        <div className="flex gap-3 mb-6 glass p-2 rounded-2xl border border-white/50">
          <button onClick={() => { playSound("click"); setGradeSystem("SCALE_10"); setTargetScore("8.0"); }} className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${gradeSystem === "SCALE_10" ? "bg-white/60 text-pink-600 shadow-md border border-white/80" : "bg-transparent text-pink-500 hover:bg-white/30"}`}>Điểm Hệ 10</button>
          <button onClick={() => { playSound("click"); setGradeSystem("GPA_4"); setTargetScore("B"); }} className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${gradeSystem === "GPA_4" ? "bg-white/60 text-pink-600 shadow-md border border-white/80" : "bg-transparent text-pink-500 hover:bg-white/30"}`}>Hệ Chữ GPA</button>
        </div>
        <label className="text-sm font-black text-pink-500 ml-2 drop-shadow-sm">Tên môn học</label>
        <input type="text" placeholder="VD: Lịch sử Đảng..." value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full mt-1 mb-5 glass-input rounded-2xl p-4 font-bold text-pink-600 placeholder-pink-400" />
        <div className="flex gap-4 mb-8">
          <div className="flex-1"><label className="text-sm font-black text-pink-500 ml-2 drop-shadow-sm">Mục tiêu 🎯</label><input type="text" value={targetScore} onChange={(e) => setTargetScore(e.target.value)} className="w-full mt-1 glass-input rounded-2xl p-4 font-black text-center text-pink-600" /></div>
          <div className="flex-1"><label className="text-sm font-black text-pink-500 ml-2 drop-shadow-sm">Thực tế ✍️</label><input type="text" placeholder={gradeSystem === "SCALE_10" ? "9.5" : "A"} value={actualScore} onChange={(e) => setActualScore(e.target.value)} className="w-full mt-1 glass-input bg-white/70 rounded-2xl p-4 font-black text-center text-pink-600 border-[3px] border-white" /></div>
        </div>
        <button onClick={handleGradeSubmit} disabled={isAiThinking} className="w-full bg-gradient-to-r from-pink-400 to-rose-400 text-white py-4 rounded-2xl font-black text-lg shadow-[0_6px_0_rgba(225,29,72,0.5)] active:translate-y-[6px] active:shadow-none disabled:opacity-70 transition-all flex justify-center items-center hover:scale-[1.02]">
          {isAiThinking ? "Mèo đang suy nghĩ... 🐾" : "Gửi Mèo phân tích 🐾"}
        </button>
      </div>
      {gradeHistory.length > 0 && (
        <div className="mx-5 lg:mx-0 glass-card p-5 rounded-[2rem] shadow-lg border border-white/60 mb-24 lg:mb-0 h-fit">
           <h3 className="font-black text-pink-600 mb-4 drop-shadow-sm">📜 Bảng Vàng Của {userTitle}</h3>
           <ul className="space-y-3">
             {gradeHistory.map((item, idx) => (
               <li key={item.id} className="flex justify-between items-center p-4 border border-white/50 rounded-2xl glass hover:scale-[1.02] transition-transform animate-in slide-in-from-bottom-2 fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                 <div><p className="font-bold text-pink-600">{item.subject}</p><p className="text-xs text-pink-400">{item.date} • Mục tiêu: {item.target}</p></div>
                 <div className={`font-black text-lg ${item.isPass ? 'text-green-500' : 'text-red-500'}`}>{item.score} {item.isPass ? '✅' : '❌'}</div>
               </li>
             ))}
           </ul>
        </div>
      )}
      </div>
    </div>
  );
}
