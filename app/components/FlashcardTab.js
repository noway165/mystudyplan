import React, { useState } from 'react';
import confetti from 'canvas-confetti';

export default function FlashcardTab({ playSound, foodCoins, setFoodCoins, callGemini, updateQuestProgress, userTitle }) {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const generateQuiz = async () => {
    if (!topic) return alert(`Nhập chủ đề đi ${userTitle} ơi!`);
    playSound("click");
    setLoading(true);
    setQuizFinished(false);
    setScore(0);
    setCurrentIndex(0);
    setShowAnswer(false);

    const prompt = `Bạn là Mèo Hồng. Hãy tạo 3 câu hỏi trắc nghiệm cực vui về chủ đề: "${topic}". Trả về CHỈ MỘT MẢNG JSON hợp lệ với format: [{"q": "Câu hỏi", "options": ["Đáp án 1", "Đáp án 2", "Đáp án 3", "Đáp án 4"], "answer": "Đáp án đúng (phải trùng khớp chính xác với 1 trong 4 options)"}]. Không kèm theo bất kỳ văn bản nào khác.`;
    
    const reply = await callGemini(prompt, true);
    try {
      // Find JSON block if it has markdown formatting
      let jsonStr = reply.replace(/```json/g, "").replace(/```/g, "").trim();
      const data = JSON.parse(jsonStr);
      setQuestions(data);
    } catch (e) {
      alert(`Mèo đang buồn ngủ nên tạo câu hỏi bị lỗi rồi, ${userTitle} thử lại nha 😿`);
      console.log(reply, e);
    }
    setLoading(false);
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
      playSound("click"); // Could use a wrong sound here if available
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
          alert(`Hoàn thành! Đúng ${score + (isCorrect ? 1 : 0)}/${questions.length}. Tặng ${userTitle} 2 🍖 khích lệ nha!`);
        }
        if (updateQuestProgress) updateQuestProgress('flashcard', 1);
      }
    }, 1500);
  };

  return (
    <div className="mx-5 lg:mx-auto lg:max-w-2xl mt-6 animate-in fade-in pb-24">
      <h2 className="font-black text-2xl text-pink-600 mb-6 drop-shadow-md text-center">🃏 AI Flashcard</h2>
      
      {!questions.length && !loading && (
        <div className="glass-card p-6 rounded-[2rem] shadow-lg border border-white/60 mb-6 text-center">
          <div className="text-5xl mb-4">🪄</div>
          <h3 className="font-black text-pink-500 mb-2 drop-shadow-sm">Mèo Tạo Câu Hỏi</h3>
          <p className="text-xs font-bold text-gray-500 mb-6">Nhập chủ đề bất kỳ, Mèo sẽ tạo bài test để {userTitle} ôn tập nha!</p>
          <input type="text" placeholder="VD: Hiện tượng nhà kính..." value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full mb-4 glass-input rounded-2xl p-4 font-bold text-pink-600 placeholder-pink-400 text-center" />
          <button onClick={generateQuiz} className="w-full bg-gradient-to-r from-pink-400 to-rose-400 text-white py-4 rounded-2xl font-black shadow-[0_4px_0_rgba(219,39,119,0.5)] active:translate-y-[4px] active:shadow-none transition-all hover:scale-[1.02]">
            Tạo Quiz Ngay 🚀
          </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center h-64">
           <div className="text-6xl animate-bounce mb-4">🐾</div>
           <p className="font-black text-pink-500 animate-pulse">Mèo đang soạn đề cương...</p>
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
           <button onClick={() => {setQuestions([]); setTopic("");}} className="w-full bg-gradient-to-r from-pink-400 to-rose-400 text-white py-4 rounded-2xl font-black shadow-[0_4px_0_rgba(219,39,119,0.5)] active:translate-y-[4px] active:shadow-none transition-all hover:scale-[1.02]">
            Học chủ đề khác 🔄
          </button>
        </div>
      )}
    </div>
  );
}
