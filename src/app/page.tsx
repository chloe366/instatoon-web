'use client';

import { useState, useEffect } from 'react';

interface Cut {
  id: number;
  title: string;
  dialogue: string;
  emotion: string;
  prompt: string;
  imageUrl?: string;
  loading?: boolean;
  error?: boolean;
}

// 캐릭터 타입 정의
const CHARACTER_TYPES = {
  human_male: {
    name: '👨 남자 직장인',
    description: 'young Korean male office worker in his 30s with short black hair and glasses wearing navy suit',
    nameKr: '민수',
  },
  human_female: {
    name: '👩 여자 직장인',
    description: 'young Korean female office worker in her 30s with shoulder-length black hair wearing white blouse',
    nameKr: '지현',
  },
  cat: {
    name: '🐱 고양이',
    description: 'cute orange tabby cat character with big round eyes standing upright wearing tiny clothes',
    nameKr: '나비',
  },
  dog: {
    name: '🐶 강아지',
    description: 'adorable golden retriever puppy character with big eyes standing upright wearing casual clothes',
    nameKr: '초코',
  },
  bear: {
    name: '🐻 곰돌이',
    description: 'cute brown teddy bear character with round face and small ears wearing cozy sweater',
    nameKr: '뽀미',
  },
  rabbit: {
    name: '🐰 토끼',
    description: 'cute white rabbit character with long floppy ears and pink nose wearing casual outfit',
    nameKr: '토리',
  },
};

// 아트 스타일 정의
const ART_STYLES = {
  webtoon: {
    name: '📱 웹툰',
    description: 'Korean webtoon manhwa style clean line art soft pastel colors',
  },
  cute: {
    name: '🎀 귀여운',
    description: 'kawaii chibi style big head adorable expressions pastel colors',
  },
  minimal: {
    name: '✨ 미니멀',
    description: 'minimalist flat illustration simple shapes clean design',
  },
  cartoon: {
    name: '🎨 카툰',
    description: 'cartoon style bold outlines vibrant colors expressive',
  },
};

// Snow White 스토리보드 템플릿 (감정 여정)
const STORY_TEMPLATES = {
  problem_solution: [
    { phase: 'hook', emotion: 'curious', titleTemplate: '일상의 시작' },
    { phase: 'problem', emotion: 'frustrated', titleTemplate: '문제 발생' },
    { phase: 'struggle', emotion: 'confused', titleTemplate: '고민과 방황' },
    { phase: 'discovery', emotion: 'surprised', titleTemplate: '발견의 순간' },
    { phase: 'solution', emotion: 'excited', titleTemplate: '해결책' },
    { phase: 'action', emotion: 'determined', titleTemplate: '실천' },
    { phase: 'result', emotion: 'happy', titleTemplate: '변화' },
    { phase: 'ending', emotion: 'satisfied', titleTemplate: '해피엔딩' },
  ],
};

// 감정별 표현
const EMOTIONS = {
  curious: 'curious tilted head interested expression',
  frustrated: 'frustrated stressed holding head annoyed expression',
  confused: 'confused question marks around puzzled expression',
  surprised: 'surprised wide eyes amazed expression lightbulb moment',
  excited: 'excited happy sparkling eyes big smile energetic',
  determined: 'determined focused serious confident expression',
  happy: 'happy cheerful bright smile warm expression',
  satisfied: 'satisfied peaceful content proud smile success',
};

// 예시 갤러리 데이터
const EXAMPLE_GALLERY = [
  { topic: '연금저축 ETF', character: '곰돌이', style: '웹툰', image: '🐻💰' },
  { topic: '아침 루틴', character: '토끼', style: '귀여운', image: '🐰☀️' },
  { topic: '다이어트', character: '고양이', style: '카툰', image: '🐱🥗' },
  { topic: '재테크', character: '강아지', style: '미니멀', image: '🐶📈' },
];

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [topic, setTopic] = useState('');
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');
  const [characterType, setCharacterType] = useState<keyof typeof CHARACTER_TYPES>('bear');
  const [artStyle, setArtStyle] = useState<keyof typeof ART_STYLES>('webtoon');
  const [cuts, setCuts] = useState<Cut[]>([]);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [seed, setSeed] = useState<number>(0);
  const [showHero, setShowHero] = useState(true);

  // 다크모드 초기화
  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDark);
  }, []);

  const generateSeed = () => Math.floor(Math.random() * 999999);

  // Snow White 방식: 주제에 맞는 스토리 생성
  const generateStoryboard = () => {
    if (!topic) return;

    const newSeed = generateSeed();
    setSeed(newSeed);

    const char = CHARACTER_TYPES[characterType];
    const style = ART_STYLES[artStyle];
    const charName = char.nameKr;

    // 주제와 문제/해결책을 기반으로 동적 스토리 생성
    const storyDialogues = generateDialogues(topic, problem, solution, charName);

    const storyboard: Cut[] = STORY_TEMPLATES.problem_solution.map((template, index) => {
      const dialogue = storyDialogues[index];
      const emotion = EMOTIONS[template.emotion as keyof typeof EMOTIONS];

      return {
        id: index + 1,
        title: template.titleTemplate,
        dialogue: dialogue.text,
        emotion: template.emotion,
        prompt: `${char.description}, ${emotion}, comic panel with white speech bubble containing Korean text, ${style.description}, single character, clean background, webtoon panel style, square format 1:1 ratio, high quality illustration`,
      };
    });

    setCuts(storyboard);
    setShowHero(false);
  };

  // 동적 대사 생성
  const generateDialogues = (topic: string, problem: string, solution: string, charName: string) => {
    const defaultProblem = problem || `${topic}이 너무 어려워...`;
    const defaultSolution = solution || `알고 보니 ${topic}은 생각보다 간단했어!`;

    return [
      { text: `오늘도 ${topic}에 대해 알아봐야지~` },
      { text: defaultProblem },
      { text: `어떻게 해야 할지 모르겠어... 나중에 하자` },
      { text: `잠깐! 이렇게 하면 되는 거였어?!` },
      { text: defaultSolution },
      { text: `바로 해볼게! 생각보다 쉽네?` },
      { text: `와! 진작 할 걸 그랬어~` },
      { text: `여러분도 지금 바로 시작해보세요!` },
    ];
  };

  const generateImage = async (prompt: string, cutIndex: number): Promise<string> => {
    const cutSeed = seed + cutIndex;
    const encodedPrompt = encodeURIComponent(prompt);
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${cutSeed}&model=flux`;
    return url;
  };

  const handleGenerate = async () => {
    if (cuts.length === 0) return;

    setGenerating(true);
    setProgress(0);

    const updatedCuts = [...cuts];

    for (let i = 0; i < updatedCuts.length; i++) {
      updatedCuts[i].loading = true;
      updatedCuts[i].error = false;
      setCuts([...updatedCuts]);

      try {
        const imageUrl = await generateImage(updatedCuts[i].prompt, i);

        await new Promise((resolve, reject) => {
          const img = new Image();
          const timeout = setTimeout(() => reject(new Error('timeout')), 30000);
          img.onload = () => {
            clearTimeout(timeout);
            resolve(true);
          };
          img.onerror = () => {
            clearTimeout(timeout);
            reject(new Error('load error'));
          };
          img.src = imageUrl;
        });

        updatedCuts[i].imageUrl = imageUrl;
        updatedCuts[i].loading = false;
      } catch (error) {
        console.error('Failed to generate image:', error);
        updatedCuts[i].loading = false;
        updatedCuts[i].error = true;
      }

      setProgress(((i + 1) / updatedCuts.length) * 100);
      setCuts([...updatedCuts]);

      if (i < updatedCuts.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }

    setGenerating(false);
  };

  const retryImage = async (index: number) => {
    const updatedCuts = [...cuts];
    updatedCuts[index].loading = true;
    updatedCuts[index].error = false;
    setCuts([...updatedCuts]);

    try {
      const newSeed = seed + index + Math.floor(Math.random() * 100);
      const encodedPrompt = encodeURIComponent(updatedCuts[index].prompt);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${newSeed}&model=flux`;

      await new Promise((resolve, reject) => {
        const img = new Image();
        const timeout = setTimeout(() => reject(new Error('timeout')), 30000);
        img.onload = () => {
          clearTimeout(timeout);
          resolve(true);
        };
        img.onerror = () => {
          clearTimeout(timeout);
          reject(new Error('load error'));
        };
        img.src = imageUrl;
      });

      updatedCuts[index].imageUrl = imageUrl;
      updatedCuts[index].loading = false;
    } catch (error) {
      updatedCuts[index].loading = false;
      updatedCuts[index].error = true;
    }

    setCuts([...updatedCuts]);
  };

  const handleDownload = async () => {
    for (let i = 0; i < cuts.length; i++) {
      const cut = cuts[i];
      if (cut.imageUrl && !cut.error) {
        try {
          const response = await fetch(cut.imageUrl);
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${String(i + 1).padStart(2, '0')}_${cut.title}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (error) {
          console.error('Download failed:', error);
        }
      }
    }
  };

  const bgClass = darkMode
    ? 'bg-gray-950 text-white'
    : 'bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 text-gray-900';

  const cardClass = darkMode
    ? 'bg-gray-900/80 backdrop-blur-xl border border-gray-800'
    : 'bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl';

  return (
    <main className={`min-h-screen transition-colors duration-300 ${bgClass}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 ${darkMode ? 'bg-gray-950/80' : 'bg-white/60'} backdrop-blur-xl border-b ${darkMode ? 'border-gray-800' : 'border-white/20'}`}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
              T
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                인스타툰
              </h1>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>AI 웹툰 생성기</p>
            </div>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-full transition-all hover:scale-110 ${
              darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      {showHero && (
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Main Headline */}
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                아이디어를 웹툰으로
              </span>
            </h2>
            <p className={`text-lg md:text-xl mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              그림 실력 없이도 AI가 8컷 인스타툰을 만들어드려요
            </p>

            {/* 3-Step Workflow */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-12">
              {[
                { step: '1', icon: '✍️', title: '주제 입력', desc: '이야기 주제만 입력' },
                { step: '2', icon: '🎨', title: 'AI 생성', desc: '8컷 스토리보드 자동 생성' },
                { step: '3', icon: '📱', title: '업로드', desc: '인스타그램에 바로 공유' },
              ].map((item, i) => (
                <div key={i} className="relative">
                  <div className={`${cardClass} rounded-2xl p-4 hover:scale-105 transition-transform`}>
                    <div className="text-3xl mb-2">{item.icon}</div>
                    <div className="text-sm font-semibold">{item.title}</div>
                    <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{item.desc}</div>
                  </div>
                  {i < 2 && (
                    <div className={`absolute top-1/2 -right-2 transform -translate-y-1/2 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`}>
                      →
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Example Gallery */}
            <div className="mb-8">
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                이런 인스타툰을 만들 수 있어요
              </p>
              <div className="flex justify-center gap-3 flex-wrap">
                {EXAMPLE_GALLERY.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setTopic(ex.topic);
                      setShowHero(false);
                    }}
                    className={`${cardClass} px-4 py-2 rounded-full text-sm hover:scale-105 transition-all group`}
                  >
                    <span className="mr-2">{ex.image}</span>
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{ex.topic}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => setShowHero(false)}
              className="group relative px-8 py-4 rounded-2xl font-bold text-white text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 transition-all group-hover:opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center gap-2">
                지금 시작하기 <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </button>
          </div>
        </section>
      )}

      {/* Main Content */}
      {!showHero && (
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
          {/* Back to Hero */}
          <button
            onClick={() => setShowHero(true)}
            className={`text-sm ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} transition`}
          >
            ← 메인으로
          </button>

          {/* Style Selection */}
          <section className={`${cardClass} rounded-3xl p-6`}>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-sm">1</span>
              캐릭터 & 스타일
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  주인공 선택
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(CHARACTER_TYPES).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => setCharacterType(key as keyof typeof CHARACTER_TYPES)}
                      className={`p-3 rounded-xl border-2 transition-all text-sm hover:scale-105 ${
                        characterType === key
                          ? 'border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/20'
                          : darkMode
                          ? 'border-gray-700 hover:border-violet-500/50 bg-gray-800/50'
                          : 'border-gray-200 hover:border-violet-300 bg-white/50'
                      }`}
                    >
                      <div>{value.name}</div>
                      <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{value.nameKr}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  그림체 선택
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(ART_STYLES).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => setArtStyle(key as keyof typeof ART_STYLES)}
                      className={`p-3 rounded-xl border-2 transition-all text-sm hover:scale-105 ${
                        artStyle === key
                          ? 'border-fuchsia-500 bg-fuchsia-500/10 shadow-lg shadow-fuchsia-500/20'
                          : darkMode
                          ? 'border-gray-700 hover:border-fuchsia-500/50 bg-gray-800/50'
                          : 'border-gray-200 hover:border-fuchsia-300 bg-white/50'
                      }`}
                    >
                      {value.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Story Input */}
          <section className={`${cardClass} rounded-3xl p-6`}>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-sm">2</span>
              스토리 설정
            </h2>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  주제 <span className="text-fuchsia-500">*</span>
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="예: 연금저축 ETF, 아침 루틴, 다이어트..."
                  className={`w-full px-4 py-3 rounded-xl transition focus:ring-2 focus:ring-violet-500 focus:outline-none ${
                    darkMode
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                  } border`}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    😰 고민/문제 (선택)
                  </label>
                  <textarea
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    placeholder="주인공이 겪는 어려움..."
                    className={`w-full px-4 py-3 rounded-xl transition focus:ring-2 focus:ring-violet-500 focus:outline-none h-20 resize-none ${
                      darkMode
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                    } border`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    💡 해결책 (선택)
                  </label>
                  <textarea
                    value={solution}
                    onChange={(e) => setSolution(e.target.value)}
                    placeholder="어떻게 해결했는지..."
                    className={`w-full px-4 py-3 rounded-xl transition focus:ring-2 focus:ring-violet-500 focus:outline-none h-20 resize-none ${
                      darkMode
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                    } border`}
                  />
                </div>
              </div>

              <button
                onClick={generateStoryboard}
                disabled={!topic}
                className="w-full relative py-4 rounded-xl font-bold text-white overflow-hidden transition-all hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600" />
                <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative">✨ 스토리보드 생성</span>
              </button>
            </div>
          </section>

          {/* Storyboard */}
          {cuts.length > 0 && (
            <section className={`${cardClass} rounded-3xl p-6`}>
              <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-sm">3</span>
                    스토리보드
                  </h2>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    주인공: {CHARACTER_TYPES[characterType].nameKr} | 시드: {seed}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="relative px-5 py-2.5 rounded-xl font-medium text-white overflow-hidden transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50 group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500" />
                    <span className="relative flex items-center gap-2">
                      {generating ? (
                        <>
                          <span className="animate-spin">⏳</span> 생성 중...
                        </>
                      ) : (
                        <>🎨 이미지 생성</>
                      )}
                    </span>
                  </button>
                  {cuts.some((c) => c.imageUrl && !c.error) && (
                    <button
                      onClick={handleDownload}
                      className={`px-5 py-2.5 rounded-xl font-medium transition-all hover:scale-105 ${
                        darkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                    >
                      📥 다운로드
                    </button>
                  )}
                </div>
              </div>

              {/* Progress */}
              {generating && (
                <div className="mb-6">
                  <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className={`text-xs mt-2 text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {Math.round(progress)}% 완료 (Rate limit 방지를 위해 천천히 생성됩니다)
                  </p>
                </div>
              )}

              {/* Cuts Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {cuts.map((cut, index) => (
                  <div
                    key={cut.id}
                    className={`rounded-2xl overflow-hidden transition-all hover:scale-[1.02] hover:shadow-xl ${
                      darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white/80 border border-gray-100 shadow-lg'
                    }`}
                  >
                    <div className="aspect-square relative">
                      {cut.loading ? (
                        <div className={`absolute inset-0 flex flex-col items-center justify-center ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                          <div className="w-10 h-10 border-3 border-violet-500 border-t-transparent rounded-full animate-spin mb-2" />
                          <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>생성 중...</span>
                        </div>
                      ) : cut.error ? (
                        <div className={`absolute inset-0 flex flex-col items-center justify-center ${darkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
                          <span className="text-2xl mb-2">⚠️</span>
                          <span className={`text-xs mb-2 ${darkMode ? 'text-red-400' : 'text-red-500'}`}>생성 실패</span>
                          <button
                            onClick={() => retryImage(index)}
                            className="text-xs bg-red-500/10 text-red-500 px-3 py-1 rounded-full hover:bg-red-500/20 transition"
                          >
                            다시 시도
                          </button>
                        </div>
                      ) : cut.imageUrl ? (
                        <img
                          src={cut.imageUrl}
                          alt={cut.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`absolute inset-0 flex flex-col items-center justify-center ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                          <span className="text-3xl mb-1 opacity-50">🖼️</span>
                          <span className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>대기 중</span>
                        </div>
                      )}
                    </div>

                    {/* Dialogue Box */}
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                          컷 {cut.id}
                        </span>
                        <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{cut.title}</span>
                      </div>
                      <div className={`rounded-lg p-2 ${darkMode ? 'bg-gray-900/50 border border-gray-700' : 'bg-gray-50 border border-gray-100'}`}>
                        <p className={`text-sm leading-snug ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          💬 &quot;{cut.dialogue}&quot;
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Caption */}
          {cuts.some((c) => c.imageUrl && !c.error) && (
            <section className={`${cardClass} rounded-3xl p-6`}>
              <h2 className="text-lg font-bold mb-4">📝 인스타그램 캡션</h2>
              <textarea
                readOnly
                value={`${topic} 이야기 📖

${CHARACTER_TYPES[characterType].nameKr}의 ${topic} 도전기!

"${problem || topic + '이 어려웠는데...'}"
➡️ "${solution || '알고보니 쉬웠어요!'}"

여러분도 오늘 바로 시작해보세요! 💪

저장 📌 하고 나중에 다시 보세요!

─────────────────
#인스타툰 #웹툰 #${topic.replace(/\s/g, '')}
#일상툰 #공감 #꿀팁 #정보공유`}
                className={`w-full h-48 px-4 py-3 rounded-xl text-sm resize-none ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 text-gray-300'
                    : 'bg-gray-50 border-gray-200 text-gray-700'
                } border`}
              />
            </section>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className={`border-t mt-8 py-6 ${darkMode ? 'border-gray-800 bg-gray-950/50' : 'border-gray-200 bg-white/30'}`}>
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Made with ❤️ by AI | Snow White Storyboard Method
          </div>
          <div className={`text-xs mt-1 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`}>
            Powered by Pollinations.ai
          </div>
        </div>
      </footer>
    </main>
  );
}
