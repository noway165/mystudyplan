import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';

export default function FlashcardTab({ playSound, foodCoins, setFoodCoins, callGemini, updateQuestProgress, userTitle, isPremium }) {
  const [mode, setMode] = useState("flashcard");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  
  const fileInputRef = useRef(null);

  const generateQuiz = async (inputTopic, fileData = null) => {
    if (!inputTopic && !fileData) return alert(`Nhập thông tin đi ${userTitle} ơi!`);
    playSound("click");
    setLoading(true);
    setLoadingMsg(mode === "mocktest" ? "Mèo đang đọc và bóc tách tài liệu..." : "Mèo đang soạn đề cương...");
    setQuizFinished(false);
    setScore(0);
    setCurrentIndex(0);
    setShowAnswer(false);

    const prompt = `Bạn là chuyên gia giáo dục. Hãy tạo 3 câu hỏi trắc nghiệm cực vui về chủ đề/tài liệu: "${inputTopic || 'Tài liệu đính kèm'}". Trả về CHỈ MỘT MẢNG JSON hợp lệ với format: [{"q": "Câu hỏi", "options": ["Đáp án 1", "Đáp án 2", "Đáp án 3", "Đáp án 4"], "answer": "Đáp án đúng"}]. Không kèm văn bản khác.`;
    
    const reply = await callGemini(prompt, true, fileData);
    try {
      let jsonStr = reply.replace(/```json/g, "").replace(/```/g, "").trim();
      const data = JSON.parse(jsonStr);
      setQuestions(data);
    } catch (e) {
      alert(`Lỗi bóc tách tài liệu rồi, ${userTitle} thử lại nha 😿`);
    }
    setLoading(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      return alert("File nặng quá, Mèo đọc không nổi đâu! Vui lòng chọn file dưới 5MB nha.");
    }

    setLoading(true);
    setLoadingMsg("Đang tải file lên não Mèo...");

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target.result.split(',')[1];
      const fileData = { mimeType: file.type || "application/pdf", data: base64String };
      generateQuiz(`Nội dung xoay quanh tài liệu ${file.name}`, fileData);
    };
    reader.onerror = () => {
      alert("Lỗi đọc file rồi!");
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSelect = (selected) => {
    if (showAnswer) return;
    setShowAnswer(true);
    const isCorrect = selected === questions[currentIndex].answer;
    
    if (isCorrect) {
      playSound("success");
      setScore(prev => prev + 1);
      confetti({ particleCount: 50, spread: 40 });
    } else {
      playSound("click");
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setShowAnswer(false);
      } else {
        setQuizFinished(true);
        if (score + (isCorrect ? 1 : 0) === questions.length) {
          setFoodCoins(prev => prev + 10);
          alert("Tuyệt đỉnh! Trả lời đúng hết, Mèo tặng 10 🍖!");
        } else {
          setFoodCoins(prev => prev + 2);
          alert(`Hoàn thành! Đúng ${score + (isCorrect ? 1 : 0)}/${questions.length}. Tặng ${userTitle} 2 🍖!`);
        }
        if (updateQuestProgress) updateQuestProgress('flashcard', 1);
      }
    }, 1500);
  };

  return (
    <div className="mx-5 lg:mx-auto lg:max-w-2xl mt-6 animate-in fade-in pb-24">
      <h2 className="font-black text-2xl text-pink-600 mb-6 drop-shadow-md text-center">🧠 Hệ sinh thái AI</h2>
      
      {!questions.length && !loading && (
        <div className="glass-card p-6 rounded-[2rem] shadow-lg border border-white/60 mb-6 text-center">
          <div className="flex bg-white/50 p-1 rounded-2xl mb-6">
            <button onClick={() => {playSound("click"); setMode("flashcard");}} className={`flex-1 py-3 rounded-xl font-bold transition-all ${mode === "flashcard" ? "bg-white text-pink-500 shadow-sm" : "text-gray-400 hover:bg-white/30"}`}>Mèo Flashcard</button>
            <button onClick={() => {playSound("click"); setMode("mocktest");}} className={`flex-1 py-3 rounded-xl font-bold transition-all flex justify-center items-center gap-2 ${mode === "mocktest" ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-sm" : "text-gray-400 hover:bg-white/30"}`}>
              Mock-Test <span className="text-xs bg-yellow-200 text-yellow-700 px-2 py-0.5 rounded-full shadow-sm">PRO</span>
            </button>
          </div>

          {mode === "flashcard" ? (
            <div className="animate-in fade-in slide-in-from-left-4">
              <div className="text-5xl mb-4">🪄</div>
              <h3 className="font-black text-pink-500 mb-2 drop-shadow-sm">Tạo Flashcard Chủ Đề</h3>
              <p className="text-xs font-bold text-gray-500 mb-6">Nhập chủ đề bất kỳ, Mèo sẽ sinh ra câu hỏi trắc nghiệm!</p>
              <input type="text" placeholder="VD: Hiện tượng nhà kính..." value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full mb-4 glass-input rounded-2xl p-4 font-bold text-pink-600 placeholder-pink-400 text-center" />
              <button onClick={() => generateQuiz(topic)} className="w-full bg-gradient-to-r from-pink-400 to-rose-400 text-white py-4 rounded-2xl font-black shadow-[0_4px_0_rgba(219,39,119,0.5)] active:translate-y-[4px] active:shadow-none transition-all hover:scale-[1.02]">
                Tạo Quiz Ngay 🚀
              </button>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4">
              {!isPremium ? (
                <div className="border-2 border-dashed border-yellow-300 bg-yellow-50 p-8 rounded-3xl flex flex-col items-center">
                   <div className="text-5xl mb-4">💎</div>
                   <h3 className="font-black text-yellow-600 mb-2">Tính Năng Premium</h3>
                   <p className="text-sm font-bold text-yellow-700/70 mb-4 px-4">Nâng cấp Premium để sử dụng AI đọc file PDF/Slide và sinh ra đề thi thử bám sát nội dung bài giảng nhé!</p>
                   <button onClick={() => alert("Vui lòng nhấn nút Nâng Cấp ở góc phải phía trên màn hình!")} className="px-6 py-3 bg-yellow-400 text-white rounded-xl font-black shadow-[0_4px_0_rgba(202,138,4,0.5)] active:translate-y-[4px] active:shadow-none transition-all hover:scale-105">
                     Nâng cấp ngay
                   </button>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-orange-300 bg-orange-50 hover:bg-orange-100 transition-colors p-8 rounded-3xl flex flex-col items-center cursor-pointer group shadow-inner"
                >
                   <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.ppt,.pptx,.doc,.docx" />
                   <div className="text-6xl mb-4 group-hover:-translate-y-2 transition-transform drop-shadow-md">📄</div>
                   <h3 className="font-black text-orange-600 mb-2 text-xl">Tải tài liệu bài giảng lên</h3>
                   <p className="text-sm font-bold text-orange-700/70">Kéo thả hoặc bấm vào để chọn file PDF, Slide, Word...</p>
                   <div className="mt-6 px-4 py-2 bg-orange-200 text-orange-700 rounded-lg text-xs font-black shadow-sm">AI Auto-Parsing Enabled ✨</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center h-64">
           <div className="text-6xl animate-bounce mb-4">🐾</div>
           <p className="font-black text-pink-500 animate-pulse">{loadingMsg}</p>
        </div>
      )}

      {questions.length > 0 && !quizFinished && !loading && (
        <div className="glass-card p-6 rounded-[2rem] shadow-xl border border-white/60 relative overflow-hidden animate-in slide-in-from-bottom-10">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-300/20 rounded-full blur-3xl"></div>
          <div className="flex justify-between items-center mb-6">
            <span className="font-black text-pink-400 bg-white/50 px-3 py-1 rounded-full text-xs">Câu {currentIndex + 1}/{questions.length}</span>
            <span className="font-black text-green-500 bg-white/50 px-3 py-1 rounded-full text-xs">Đúng: {score}</span>
          </div>
          
          <h3 className="font-black text-gray-700 text-lg mb-8 leading-relaxed text-center drop-shadow-sm">
            {questions[currentIndex].q}
          </h3>

          <div className="space-y-3">
            {questions[currentIndex].options.map((opt, idx) => {
              const isCorrect = opt === questions[currentIndex].answer;
              let btnClass = "glass hover:bg-white/50 text-pink-600";
              if (showAnswer) {
                if (isCorrect) btnClass = "bg-green-400 text-white shadow-lg scale-105 border-green-300";
                else btnClass = "bg-red-400/50 text-white opacity-50";
              }
              return (
                <button 
                  key={idx} 
                  onClick={() => handleSelect(opt)}
                  disabled={showAnswer}
                  className={`w-full p-4 rounded-2xl font-bold border border-white/50 transition-all duration-300 text-left ${btnClass}`}
                >
                  {String.fromCharCode(65 + idx)}. {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {quizFinished && (
        <div className="glass-card p-8 rounded-[2rem] shadow-xl border border-white/60 text-center animate-in zoom-in">
           <div className="text-6xl mb-4 animate-bounce">🏆</div>
           <h3 className="font-black text-2xl text-pink-500 mb-2">Hoàn Thành!</h3>
           <p className="font-bold text-gray-600 mb-6">{userTitle} đúng {score}/{questions.length} câu. Đỉnh quá!</p>
           <button onClick={() => {setQuestions([]); setTopic(""); setMode("flashcard");}} className="w-full bg-gradient-to-r from-pink-400 to-rose-400 text-white py-4 rounded-2xl font-black shadow-[0_4px_0_rgba(219,39,119,0.5)] active:translate-y-[4px] active:shadow-none transition-all hover:scale-[1.02]">
            Học chủ đề khác 🔄
          </button>
        </div>
      )}
    </div>
  );
}
