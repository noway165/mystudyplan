import React, { useState } from 'react';

export default function ScheduleTab({ schedules, setSchedules, playSound, triggerAlarm, userTitle, isPremium }) {
  const [mode, setMode] = useState("manual");
  const [newScheduleName, setNewScheduleName] = useState("");
  const [newScheduleTime, setNewScheduleTime] = useState("");
  const [newScheduleType, setNewScheduleType] = useState("Học");
  
  const [aiSubject, setAiSubject] = useState("");
  const [aiDeadline, setAiDeadline] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddSchedule = () => {
    if (!newScheduleName || !newScheduleTime) return alert(`${userTitle} nhập đủ tên và chọn giờ nha!`);
    playSound("click");
    const newSch = { id: Date.now(), name: newScheduleName, time: newScheduleTime, type: newScheduleType, reminded: false };
    setSchedules([...schedules, newSch].sort((a, b) => new Date(a.time) - new Date(b.time)));
    setNewScheduleName(""); setNewScheduleTime("");
  };

  const handleAIScheduler = () => {
    if (!aiSubject || !aiDeadline) return alert("Nhập đủ môn và ngày thi nha!");
    playSound("click");
    setLoading(true);
    
    setTimeout(() => {
      const examDate = new Date(aiDeadline);
      const today = new Date();
      const diffTime = Math.abs(examDate - today);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const newSchedules = [];
      const numChunks = Math.min(diffDays, 5); // Tạo tối đa 5 buổi học
      
      for (let i = 1; i <= numChunks; i++) {
        const chunkDate = new Date(today);
        chunkDate.setDate(today.getDate() + Math.floor((diffDays / numChunks) * (i - 1)));
        chunkDate.setHours(19, 0, 0); // Default study time at 7 PM
        
        newSchedules.push({
          id: Date.now() + i,
          name: `📚 Ôn tập ${aiSubject} (Phần ${i})`,
          time: new Date(chunkDate.getTime() - chunkDate.getTimezoneOffset() * 60000).toISOString().slice(0,16),
          type: "Học",
          reminded: false
        });
      }
      
      // Add the final exam event
      newSchedules.push({
        id: Date.now() + 100,
        name: `🚨 THI: ${aiSubject}`,
        time: aiDeadline,
        type: "Thi",
        reminded: false
      });
      
      setSchedules([...schedules, ...newSchedules].sort((a, b) => new Date(a.time) - new Date(b.time)));
      setLoading(false);
      setAiSubject(""); setAiDeadline("");
      alert("Đã lên lịch thành công! Cùng cố gắng nhé!");
    }, 2000);
  };

  return (
    <div className="animate-in fade-in pb-24 lg:mt-6">
      <h2 className="font-black text-2xl text-pink-600 mb-6 drop-shadow-md text-center lg:text-left lg:mx-0 mx-5">📅 Lịch Học & Thi</h2>
      
      <div className="lg:grid lg:grid-cols-2 lg:gap-8">
        {/* Cột trái: Form thêm lịch */}
        <div className="mx-5 lg:mx-0 glass-card p-6 rounded-[2rem] shadow-lg border border-white/60 mb-6 lg:mb-0 relative overflow-hidden h-fit">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-bl-full backdrop-blur-md"></div>
          
          <div className="flex bg-white/50 p-1 rounded-2xl mb-6">
            <button onClick={() => {playSound("click"); setMode("manual");}} className={`flex-1 py-2 rounded-xl font-bold transition-all text-sm ${mode === "manual" ? "bg-white text-pink-500 shadow-sm" : "text-gray-400 hover:bg-white/30"}`}>Thủ công</button>
            <button onClick={() => {playSound("click"); setMode("ai");}} className={`flex-1 py-2 rounded-xl font-bold transition-all flex justify-center items-center gap-2 text-sm ${mode === "ai" ? "bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-sm" : "text-gray-400 hover:bg-white/30"}`}>
              AI Auto <span className="text-[10px] bg-yellow-200 text-yellow-700 px-2 py-0.5 rounded-full">PRO</span>
            </button>
          </div>

          {mode === "manual" ? (
            <div className="animate-in fade-in slide-in-from-left-4">
              <h3 className="font-black text-pink-500 mb-4 drop-shadow-sm">Thêm lịch mới nha {userTitle} ✍️</h3>
              <input type="text" placeholder="Tên môn (VD: Toán)..." value={newScheduleName} onChange={(e) => setNewScheduleName(e.target.value)} className="w-full mb-3 glass-input rounded-2xl p-4 font-bold text-pink-600 placeholder-pink-400" />
              <div className="flex gap-3 mb-5">
                <input type="datetime-local" value={newScheduleTime} onChange={(e) => setNewScheduleTime(e.target.value)} className="flex-1 glass-input rounded-2xl p-3 font-bold text-pink-600 text-xs" />
                <select value={newScheduleType} onChange={(e) => setNewScheduleType(e.target.value)} className="glass-input rounded-2xl p-3 font-bold text-pink-600">
                  <option value="Học">Học 📖</option>
                  <option value="Thi">Thi 📝</option>
                </select>
              </div>
              <button onClick={handleAddSchedule} className="w-full bg-gradient-to-r from-pink-400 to-pink-500 text-white py-4 rounded-2xl font-black shadow-[0_4px_0_rgba(219,39,119,0.5)] active:translate-y-[4px] active:shadow-none transition-all hover:scale-[1.02]">
                + Thêm Vào Lịch
              </button>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4">
              {!isPremium ? (
                <div className="border-2 border-dashed border-yellow-300 bg-yellow-50 p-6 rounded-3xl flex flex-col items-center text-center">
                   <div className="text-4xl mb-3">💎</div>
                   <h3 className="font-black text-yellow-600 mb-2">Tính Năng Premium</h3>
                   <p className="text-xs font-bold text-yellow-700/70 mb-4 px-2">Nâng cấp Premium để mở khóa thuật toán AI Smart Scheduler. Tự động chia nhỏ đề cương và rải đều vào lịch học, chống học dồn sát ngày thi!</p>
                   <button onClick={() => alert("Vui lòng nhấn nút Nâng Cấp ở góc phải phía trên màn hình!")} className="px-6 py-3 bg-yellow-400 text-white rounded-xl font-black shadow-[0_4px_0_rgba(202,138,4,0.5)] active:translate-y-[4px] active:shadow-none transition-all hover:scale-105">
                     Nâng cấp ngay
                   </button>
                </div>
              ) : (
                <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-200">
                   <div className="text-center mb-4">
                     <span className="text-3xl animate-bounce inline-block">🧠</span>
                     <h3 className="font-black text-pink-600">AI Smart Scheduler</h3>
                     <p className="text-xs font-bold text-pink-400 mt-1">Trợ lý lên lịch tự động</p>
                   </div>
                   <input type="text" placeholder="Môn thi (VD: Triết học)..." value={aiSubject} onChange={(e) => setAiSubject(e.target.value)} className="w-full mb-3 glass-input rounded-xl p-3 font-bold text-pink-600 placeholder-pink-400 text-sm" />
                   <p className="text-[10px] font-bold text-gray-500 mb-1 ml-2">Ngày giờ thi (Deadline):</p>
                   <input type="datetime-local" value={aiDeadline} onChange={(e) => setAiDeadline(e.target.value)} className="w-full mb-5 glass-input rounded-xl p-3 font-bold text-pink-600 text-xs" />
                   
                   <button onClick={handleAIScheduler} disabled={loading} className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-xl font-black shadow-[0_4px_0_rgba(225,29,72,0.5)] active:translate-y-[4px] active:shadow-none transition-all hover:scale-[1.02] flex justify-center items-center">
                     {loading ? <span className="animate-pulse">Đang tính toán...</span> : "⚡ Tạo Lộ Trình Ôn Tập"}
                   </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cột phải: Danh sách lịch */}
        <div className="space-y-4">
          {schedules.map((sch, idx) => {
            const schDate = new Date(sch.time);
            const isExam = sch.type === "Thi";
            return (
              <div key={sch.id} className={`glass p-4 rounded-3xl shadow-sm border-l-[6px] ${isExam ? 'border-l-rose-400' : 'border-l-blue-400'} border-y border-r border-white/50 flex items-center justify-between animate-in slide-in-from-bottom-5 fade-in`} style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="flex-1">
                  <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${isExam ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'}`}>{sch.type} • {schDate.toLocaleDateString('vi-VN')}</span>
                  <h4 className="font-black text-gray-700 text-lg mt-1">{sch.name}</h4>
                  <p className="text-xs font-bold text-gray-500">⏰ {schDate.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => triggerAlarm(sch)} className="bg-orange-100/50 text-orange-600 p-2 rounded-xl text-xs font-black shadow-sm border border-orange-200 active:scale-95">🔔 Test</button>
                  <button onClick={() => { playSound("click"); setSchedules(schedules.filter(s => s.id !== sch.id)); }} className="bg-gray-100/50 text-gray-500 p-2 rounded-xl text-xs font-black shadow-sm border border-white/60 active:scale-95 hover:bg-white hover:text-red-500">Xóa</button>
                </div>
              </div>
            )
          })}
          {schedules.length === 0 && <p className="text-center text-pink-400 font-bold mt-10 drop-shadow-sm">{userTitle} chưa có lịch học nào cả 🐾</p>}
        </div>
      </div>
    </div>
  );
}
