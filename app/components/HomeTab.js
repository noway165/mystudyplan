import React, { useState } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import confetti from 'canvas-confetti';

const ITEMS = [
  { id: "bg_forest", name: "Rừng Mộng Mơ", icon: "🌲", type: "bg", prob: 30, color: "from-green-400 to-emerald-600" },
  { id: "bg_galaxy", name: "Dải Ngân Hà", icon: "🌌", type: "bg", prob: 20, color: "from-indigo-600 to-purple-900" },
  { id: "bg_beach", name: "Bãi Biển Xanh", icon: "🏖️", type: "bg", prob: 30, color: "from-cyan-300 to-blue-500" },
  { id: "crown_gold", name: "Vương Miện Vàng", icon: "👑", type: "acc", prob: 10 },
  { id: "wings_angel", name: "Cánh Thiên Thần", icon: "🧚‍♀️", type: "acc", prob: 10 }
];

export default function HomeTab({ 
  stats, chartData, isAiThinking, aiMessage, hasGlasses, hasCrown, isRunning, buyItem, foodCoins,
  quests, claimQuestReward, inventory, setInventory, equippedBg, setEquippedBg, setFoodCoins, playSound, userTitle
}) {
  const CAT_IMAGE = "/pink_cat.png";
  const DOG_IMAGE = "/sausage_dog.png";
  const [isSpinning, setIsSpinning] = useState(false);

  const rollGacha = () => {
    if (foodCoins < 20) return alert(`${userTitle} không đủ 20 🍖 rồi, học bài kiếm thêm đi!`);
    setFoodCoins(prev => prev - 20);
    playSound("click");
    setIsSpinning(true);
    
    let rand = Math.random() * 100;
    let sum = 0;
    let wonItem = ITEMS[0];
    for (let item of ITEMS) {
      sum += item.prob;
      if (rand <= sum) { wonItem = item; break; }
    }

    setTimeout(() => {
      setIsSpinning(false);
      playSound("success");
      confetti({ particleCount: 150, spread: 80 });
      
      if (!inventory.includes(wonItem.id)) {
        alert(`🎉 Uầy! ${userTitle} quay trúng đồ mới: ${wonItem.icon} ${wonItem.name}!`);
        setInventory([...inventory, wonItem.id]);
      } else {
        alert(`🎉 ${userTitle} quay trúng ${wonItem.icon} ${wonItem.name} nhưng xui cái là có rồi haha 😸`);
      }
    }, 2000);
  };

  const currentBgClass = equippedBg === "default" ? "bg-white/40" 
    : ITEMS.find(i => i.id === equippedBg)?.color || "bg-white/40";

  return (
      <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:mt-8 animate-in fade-in duration-500 pb-20">
        
        {/* Cột trái: Quests, Stats & Pet */}
        <div className="flex flex-col gap-6">
          
          {/* Daily Quests */}
          <div className="mx-5 lg:mx-0 glass-card p-5 rounded-[2rem] shadow-lg border border-white/60">
            <h3 className="font-black text-pink-500 mb-4 text-lg drop-shadow-sm">📜 Nhiệm vụ hôm nay</h3>
            <div className="space-y-3">
              {quests.map(q => (
                <div key={q.id} className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${q.claimed ? 'bg-gray-100/50 border-gray-200/50 grayscale opacity-60' : 'glass border-white/50'}`}>
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-pink-100/50 flex items-center justify-center text-xl">{q.icon}</div>
                      <div>
                        <p className="font-bold text-sm text-pink-600">{q.desc}</p>
                        <p className="text-[10px] font-black text-gray-400">{q.current}/{q.target}</p>
                      </div>
                   </div>
                   {!q.claimed && (
                     <button 
                       onClick={() => claimQuestReward(q.id)}
                       disabled={!q.done}
                       className={`px-3 py-2 text-xs font-black rounded-xl transition-all shadow-sm ${q.done ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white animate-bounce' : 'bg-gray-200 text-gray-400'}`}
                     >
                       {q.done ? `Nhận ${q.reward}🍖` : 'Chưa xong'}
                     </button>
                   )}
                   {q.claimed && <span className="text-sm font-black text-green-500 px-2">Đã nhận ✓</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="mx-5 lg:mx-0 grid grid-cols-3 gap-4">
            <div className="glass-card p-4 rounded-3xl border border-white/60 text-center shadow-lg hover:-translate-y-1 transition-transform cursor-pointer"><div className="text-3xl mb-1 animate-pulse">🔥</div><div className="font-black text-pink-500 text-xl drop-shadow-sm">{stats.streak}</div><div className="text-[10px] font-bold text-gray-500">NGÀY HỌC</div></div>
            <div className="glass-card p-4 rounded-3xl border border-white/60 text-center shadow-lg hover:-translate-y-1 transition-transform cursor-pointer"><div className="text-3xl mb-1 animate-pulse">⏳</div><div className="font-black text-blue-500 text-xl drop-shadow-sm">{stats.minutes}</div><div className="text-[10px] font-bold text-gray-500">PHÚT HỌC</div></div>
            <div className="glass-card p-4 rounded-3xl border border-white/60 text-center shadow-lg hover:-translate-y-1 transition-transform cursor-pointer"><div className="text-3xl mb-1 animate-pulse">✅</div><div className="font-black text-green-500 text-xl drop-shadow-sm">{stats.tasks}</div><div className="text-[10px] font-bold text-gray-500">TASK XONG</div></div>
          </div>

          {/* AI Message */}
          <div className="mx-5 lg:mx-0 p-5 glass-card rounded-[2rem] border border-white/60 shadow-lg relative animate-float">
            <div className="absolute -top-5 -left-4 text-5xl -rotate-12 drop-shadow-md">🎀</div>
            <div className="flex justify-between items-center mb-3 ml-6">
              <div className="flex items-center"><span className="text-2xl mr-2">{isAiThinking ? "⏳" : "✨"}</span><h2 className="font-black text-pink-500 text-lg drop-shadow-sm">Mèo Tâm Sự</h2></div>
            </div>
            <div className="glass p-4 rounded-2xl border border-white/50 relative">
              <div className="absolute -bottom-3 left-8 w-4 h-4 bg-white/40 border-b border-r border-white/50 transform rotate-45 backdrop-blur-md"></div>
              <p className="text-sm text-pink-700 font-bold italic leading-relaxed">"{aiMessage}"</p>
            </div>
          </div>

          {/* Pets Area (Tamagotchi Style) */}
          <div className={`mx-5 lg:mx-0 p-6 rounded-[2rem] shadow-lg border-2 border-white/60 relative overflow-hidden transition-all duration-1000 bg-gradient-to-br ${currentBgClass} ${equippedBg !== 'default' ? 'backdrop-blur-none' : 'glass-card'}`}>
            <h3 className="font-black text-pink-500 mb-4 text-center text-lg drop-shadow-sm bg-white/50 rounded-full py-1 inline-block px-6 relative left-1/2 -translate-x-1/2">Trại Thú Cưng</h3>
            
            {/* Status Bars */}
            <div className="mb-6 space-y-3 bg-white/60 backdrop-blur-sm p-3 rounded-2xl border border-white/50 shadow-sm">
              <div className="flex items-center text-xs font-bold text-pink-600">
                <span className="w-16">Level {Math.floor(stats.minutes / 100) + 1}</span>
                <div className="flex-1 h-3 bg-pink-100 rounded-full overflow-hidden mx-2 shadow-inner border border-white">
                  <div className="h-full bg-gradient-to-r from-pink-400 to-rose-400 transition-all duration-500" style={{ width: `${(stats.minutes % 100)}%` }}></div>
                </div>
                <span className="w-10 text-right">{stats.minutes % 100}/100 XP</span>
              </div>
              <div className="flex gap-4">
                 <div className="flex-1 flex items-center bg-white/50 p-1.5 rounded-xl border border-white text-xs shadow-sm" title="Độ no">
                    <span className="mr-2">🍔</span>
                    <div className="flex-1 h-2 bg-pink-100 rounded-full overflow-hidden"><div className="h-full bg-orange-400 transition-all duration-1000" style={{ width: `${stats.hunger ?? 50}%` }}></div></div>
                 </div>
                 <div className="flex-1 flex items-center bg-white/50 p-1.5 rounded-xl border border-white text-xs shadow-sm" title="Độ vui vẻ">
                    <span className="mr-2">💖</span>
                    <div className="flex-1 h-2 bg-pink-100 rounded-full overflow-hidden"><div className="h-full bg-pink-400 transition-all duration-1000" style={{ width: `${stats.happiness ?? 50}%` }}></div></div>
                 </div>
              </div>
            </div>

            <div className="flex justify-center items-center gap-10 h-36 relative mt-4">
              <div className="absolute bottom-2 w-64 h-8 bg-black/20 blur-xl rounded-full"></div>
              
              <div className="flex flex-col items-center relative cursor-pointer hover:scale-105 transition z-10">
                <div className="relative w-32 h-32 rounded-full border-[6px] border-white/80 shadow-xl animate-[bounce_2s_infinite]">
                  {hasGlasses && <span className="absolute -top-2 left-8 text-4xl z-50">🕶️</span>}
                  {inventory.includes('wings_angel') && <span className="absolute top-8 -left-6 text-5xl -scale-x-100 z-0 opacity-80">🧚‍♀️</span>}
                  <img src={DOG_IMAGE} alt="Chó" className={`w-full h-full object-cover rounded-full ${isRunning ? 'opacity-50 blur-[2px]' : 'opacity-100'}`} />
                </div>
                <span className="mt-4 font-black text-pink-500 bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-[0_4px_0_rgb(252,165,165)] text-sm">Xúc Xích</span>
              </div>
              
              <div className="flex flex-col items-center relative cursor-pointer hover:scale-105 transition z-10">
                <div className="relative w-32 h-32 rounded-full border-[6px] border-white/80 shadow-xl animate-[bounce_2.5s_infinite]">
                  {(hasCrown || inventory.includes('crown_gold')) && <span className="absolute -top-8 left-4 text-5xl rotate-12 z-50">👑</span>}
                  {inventory.includes('wings_angel') && <span className="absolute top-8 -right-6 text-5xl z-0 opacity-80">🧚‍♀️</span>}
                  <img src={CAT_IMAGE} alt="Mèo" className={`w-full h-full object-cover rounded-full ${isRunning ? 'opacity-50 blur-[2px]' : 'opacity-100'}`} />
                </div>
                <span className="mt-4 font-black text-pink-500 bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-[0_4px_0_rgb(244,114,182)] text-sm">Mèo Nho</span>
              </div>
            </div>
          </div>
        </div> {/* Hết Cột Trái */}

        {/* Cột phải: Charts & Shop */}
        <div className="flex flex-col gap-6 mt-8 lg:mt-0">
          
          {/* Statistics Chart */}
          <div className="mx-5 lg:mx-0 glass-card p-6 rounded-[2rem] shadow-lg border border-white/60">
             <h3 className="font-black text-pink-500 mb-6 text-center text-lg drop-shadow-sm">📊 Phân Tích Học Tập</h3>
             <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={chartData}>
                      <XAxis dataKey="name" tick={{fill: '#ec4899', fontSize: 12, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: 'rgba(244, 114, 182, 0.1)'}} contentStyle={{borderRadius: '16px', border: 'none', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', color: '#db2777', fontWeight: 'bold'}} />
                      <Bar dataKey="min" fill="url(#colorPink)" radius={[10, 10, 10, 10]} />
                      <defs>
                         <linearGradient id="colorPink" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f472b6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#fb7185" stopOpacity={0.8}/>
                         </linearGradient>
                      </defs>
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Gacha Shop */}
          <div className="mx-5 lg:mx-0 glass-card p-6 rounded-[2.5rem] shadow-xl border-[3px] border-white/80 relative overflow-hidden bg-gradient-to-br from-pink-100/50 to-orange-100/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-300/20 rounded-bl-full blur-2xl animate-pulse"></div>
            <h3 className="font-black text-pink-500 mb-2 text-xl drop-shadow-sm flex items-center justify-center">🎰 Vòng Quay Nhân Phẩm</h3>
            <p className="text-center text-xs font-bold text-gray-500 mb-6">Dùng xương để quay ra Hình nền và Trang phục xịn!</p>
            
            <div className="flex justify-center mb-6">
               <button 
                 onClick={rollGacha} 
                 disabled={isSpinning}
                 className={`relative w-32 h-32 rounded-full shadow-[0_8px_0_rgb(225,29,72)] flex flex-col items-center justify-center transition-all ${isSpinning ? 'bg-gradient-to-r from-gray-400 to-gray-500 translate-y-[8px] shadow-none animate-spin' : 'bg-gradient-to-r from-pink-400 to-rose-500 hover:scale-105 active:translate-y-[8px] active:shadow-none cursor-pointer'}`}
               >
                 <span className="text-4xl mb-1">{isSpinning ? '🌀' : '🍖'}</span>
                 <span className="text-white font-black text-sm">Quay (20)</span>
                 <div className="absolute inset-0 border-[6px] border-white/30 rounded-full"></div>
               </button>
            </div>

            {/* Inventory Display */}
            <h4 className="font-black text-gray-600 mb-3 text-sm">🎒 Hòm Đồ Của {userTitle}</h4>
            <div className="grid grid-cols-4 gap-2">
               {/* Default Background */}
               <div onClick={() => setEquippedBg('default')} className={`glass p-2 rounded-xl text-center cursor-pointer transition-all hover:scale-105 ${equippedBg === 'default' ? 'border-2 border-pink-400 bg-pink-100' : 'border border-white/50'}`}>
                 <div className="text-2xl mb-1">🏠</div>
                 <p className="text-[8px] font-black">Mặc định</p>
               </div>

               {/* Unlocked Backgrounds */}
               {ITEMS.filter(i => i.type === 'bg' && inventory.includes(i.id)).map(bg => (
                 <div key={bg.id} onClick={() => setEquippedBg(bg.id)} className={`glass p-2 rounded-xl text-center cursor-pointer transition-all hover:scale-105 ${equippedBg === bg.id ? 'border-2 border-pink-400 bg-pink-100' : 'border border-white/50'}`}>
                   <div className="text-2xl mb-1">{bg.icon}</div>
                   <p className="text-[8px] font-black">{bg.name}</p>
                 </div>
               ))}

               {/* Lock placeholders if inventory is empty */}
               {inventory.filter(id => ITEMS.find(i => i.id === id && i.type === 'bg')).length === 0 && (
                 <>
                   <div className="glass p-2 rounded-xl text-center border border-white/50 opacity-50"><div className="text-2xl mb-1">🔒</div><p className="text-[8px] font-black">Chưa có</p></div>
                   <div className="glass p-2 rounded-xl text-center border border-white/50 opacity-50"><div className="text-2xl mb-1">🔒</div><p className="text-[8px] font-black">Chưa có</p></div>
                 </>
               )}
            </div>
            
            {/* Show accessories in a separate list if unlocked */}
            {inventory.some(id => ITEMS.find(i => i.id === id && i.type === 'acc')) && (
               <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                 {ITEMS.filter(i => i.type === 'acc' && inventory.includes(i.id)).map(acc => (
                   <span key={acc.id} className="text-[10px] font-black bg-pink-100 text-pink-600 px-3 py-1 rounded-full shadow-sm flex items-center border border-pink-200">
                     {acc.icon} {acc.name}
                   </span>
                 ))}
               </div>
            )}
          </div>

        </div> {/* Hết Cột Phải */}
      </div>
  );
}
