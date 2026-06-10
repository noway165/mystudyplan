import React, { useState } from 'react';

export default function ScheduleTab({ schedules, setSchedules, playSound, triggerAlarm, userTitle }) {
  const [newScheduleName, setNewScheduleName] = useState("");
  const [newScheduleTime, setNewScheduleTime] = useState("");
  const [newScheduleType, setNewScheduleType] = useState("Học");

  const handleAddSchedule = () => {
    if (!newScheduleName || !newScheduleTime) return alert(`${userTitle} nhập đủ tên và chọn giờ nha!`);
    playSound("click");
    const newSch = { id: Date.now(), name: newScheduleName, time: newScheduleTime, type: newScheduleType, reminded: false };
    setSchedules([...schedules, newSch].sort((a, b) => new Date(a.time) - new Date(b.time)));
    setNewScheduleName(""); setNewScheduleTime("");
  };

  return (
    <div className="animate-in fade-in pb-24 lg:mt-6">
      <h2 className="font-black text-2xl text-pink-600 mb-6 drop-shadow-md text-center lg:text-left lg:mx-0 mx-5">📅 Lịch Học & Thi</h2>
      
      <div className="lg:grid lg:grid-cols-2 lg:gap-8">
      {/* Cột trái: Form thêm lịch */}
      <div className="mx-5 lg:mx-0 glass-card p-6 rounded-[2rem] shadow-lg border border-white/60 mb-6 lg:mb-0 relative overflow-hidden h-fit">
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-bl-full backdrop-blur-md"></div>
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
