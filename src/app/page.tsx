'use client';

import { useState } from 'react';

interface Cut {
  id: number;
  title: string;
  text: string;
  prompt: string;
  imageUrl?: string;
  loading?: boolean;
}

// 캐릭터 타입 정의
const CHARACTER_TYPES = {
  human_male: {
    name: '👨 남자 직장인',
    description: 'young Korean male office worker in his 30s, short black hair, wearing glasses, navy blue suit, friendly face',
  },
  human_female: {
    name: '👩 여자 직장인',
    description: 'young Korean female office worker in her 30s, shoulder-length black hair, wearing white blouse and gray cardigan, warm smile',
  },
  cat: {
    name: '🐱 고양이',
    description: 'cute orange tabby cat character with big expressive eyes, standing upright like human, wearing tiny office clothes',
  },
  dog: {
    name: '🐶 강아지',
    description: 'adorable golden retriever puppy character with big eyes, standing upright like human, wearing tiny business casual clothes',
  },
  bear: {
    name: '🐻 곰돌이',
    description: 'cute brown bear character with round face and small ears, standing upright, wearing cozy sweater',
  },
  rabbit: {
    name: '🐰 토끼',
    description: 'cute white rabbit character with long ears and pink nose, standing upright, wearing casual clothes',
  },
};

// 아트 스타일 정의
const ART_STYLES = {
  webtoon: {
    name: '📱 웹툰 스타일',
    description: 'Korean webtoon style, clean line art, soft cel shading, pastel colors, manhwa illustration',
  },
  cute: {
    name: '🎀 귀여운 스타일',
    description: 'kawaii cute chibi style, big head small body, adorable expressions, soft pastel colors',
  },
  minimal: {
    name: '✨ 미니멀 스타일',
    description: 'minimalist flat illustration, simple shapes, limited color palette, clean design',
  },
  cartoon: {
    name: '🎨 카툰 스타일',
    description: 'western cartoon style, bold outlines, vibrant colors, expressive characters',
  },
};

export default function Home() {
  const [topic, setTopic] = useState('');
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');
  const [characterType, setCharacterType] = useState<keyof typeof CHARACTER_TYPES>('human_female');
  const [artStyle, setArtStyle] = useState<keyof typeof ART_STYLES>('webtoon');
  const [cuts, setCuts] = useState<Cut[]>([]);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [seed, setSeed] = useState<number>(0);

  // 일관된 캐릭터를 위한 시드 생성
  const generateSeed = () => {
    return Math.floor(Math.random() * 1000000);
  };

  const getCharacterPrompt = () => {
    const char = CHARACTER_TYPES[characterType];
    const style = ART_STYLES[artStyle];
    return `${char.description}, ${style.description}`;
  };

  const generateStoryboard = () => {
    if (!topic) return;

    // 새로운 스토리보드 생성 시 시드 고정
    const newSeed = generateSeed();
    setSeed(newSeed);

    const characterBase = getCharacterPrompt();

    const storyboard: Cut[] = [
      {
        id: 1,
        title: '문제 인식',
        text: problem || `${topic}... 어떻게 해야 할지 모르겠다`,
        prompt: `${characterBase}, looking confused and uncertain with tilted head, question marks floating around, hand on chin thinking pose, soft background, square format`,
      },
      {
        id: 2,
        title: '포기 상태',
        text: '모르겠다... 나중에 하지',
        prompt: `${characterBase}, sitting with arms crossed, disappointed giving up expression, slouching posture, gray muted background colors, thought bubble above head, square format`,
      },
      {
        id: 3,
        title: '경고',
        text: "그 '나중에'가 벌써 몇 년째...",
        prompt: `${characterBase}, shocked expression looking at calendar showing years passing by, sweat drop, red warning colors in background, dramatic lighting, square format`,
      },
      {
        id: 4,
        title: '전환점',
        text: solution || `${topic}, 사실 간단해요!`,
        prompt: `${characterBase}, excited aha moment expression with sparkling eyes, holding up one finger, bright lightbulb above head, warm happy colors, energetic pose, square format`,
      },
      {
        id: 5,
        title: '핵심 정보',
        text: '핵심만 알면 끝!',
        prompt: `${characterBase}, confident smile pointing at floating infographic icons and charts, teaching pose, clean organized background, professional mood, square format`,
      },
      {
        id: 6,
        title: '결론',
        text: '고민 끝! 지금 바로 시작하세요',
        prompt: `${characterBase}, thumbs up with big confident smile, green checkmark floating nearby, bright positive energy, success mood, warm lighting, square format`,
      },
      {
        id: 7,
        title: '실천 방법',
        text: 'Step 1. 첫 번째 단계',
        prompt: `${characterBase}, holding smartphone showing app interface, focused expression, step by step guide visual, clean UI elements floating around, square format`,
      },
      {
        id: 8,
        title: '마무리',
        text: '오늘 바로 시작하세요!',
        prompt: `${characterBase}, celebrating with both arms raised, super happy expression, confetti and sparkles around, warm golden lighting, victory pose, encouraging mood, square format`,
      },
    ];

    setCuts(storyboard);
  };

  const generateImage = async (prompt: string): Promise<string> => {
    const encodedPrompt = encodeURIComponent(prompt);
    // seed를 사용하여 일관된 캐릭터 생성
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1080&height=1080&nologo=true&seed=${seed}`;
    return url;
  };

  const handleGenerate = async () => {
    if (cuts.length === 0) return;

    setGenerating(true);
    setProgress(0);

    const updatedCuts = [...cuts];

    for (let i = 0; i < updatedCuts.length; i++) {
      updatedCuts[i].loading = true;
      setCuts([...updatedCuts]);

      try {
        const imageUrl = await generateImage(updatedCuts[i].prompt);

        // Preload image
        await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = reject;
          img.src = imageUrl;
        });

        updatedCuts[i].imageUrl = imageUrl;
        updatedCuts[i].loading = false;
      } catch (error) {
        console.error('Failed to generate image:', error);
        updatedCuts[i].loading = false;
      }

      setProgress(((i + 1) / updatedCuts.length) * 100);
      setCuts([...updatedCuts]);

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    setGenerating(false);
  };

  const handleDownload = async () => {
    for (let i = 0; i < cuts.length; i++) {
      const cut = cuts[i];
      if (cut.imageUrl) {
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            🎨 인스타툰 생성기
          </h1>
          <p className="text-gray-600 mt-1">AI로 웹툰 스타일 인스타툰을 자동 생성하세요!</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Style Selection Section */}
        <section className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">🎭 캐릭터 & 스타일 선택</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Character Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                캐릭터 타입
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(CHARACTER_TYPES).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setCharacterType(key as keyof typeof CHARACTER_TYPES)}
                    className={`p-3 rounded-xl border-2 transition-all text-sm ${
                      characterType === key
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {value.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Art Style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                아트 스타일
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(ART_STYLES).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setArtStyle(key as keyof typeof ART_STYLES)}
                    className={`p-3 rounded-xl border-2 transition-all text-sm ${
                      artStyle === key
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {value.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">선택된 스타일:</span>{' '}
              {CHARACTER_TYPES[characterType].name} + {ART_STYLES[artStyle].name}
            </p>
          </div>
        </section>

        {/* Input Section */}
        <section className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">📝 주제 입력</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                인스타툰 주제
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="예: 연금저축 ETF 투자 방법, 아침 루틴..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ❌ 문제/고민
                </label>
                <textarea
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="독자의 페인포인트..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-24"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ✅ 해결책
                </label>
                <textarea
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  placeholder="제공할 가치..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-24"
                />
              </div>
            </div>

            <button
              onClick={generateStoryboard}
              disabled={!topic}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              스토리보드 생성
            </button>
          </div>
        </section>

        {/* Storyboard Section */}
        {cuts.length > 0 && (
          <section className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold">🖼️ 스토리보드</h2>
                <p className="text-sm text-gray-500">시드: {seed} (캐릭터 일관성 유지)</p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition"
                >
                  {generating ? '생성 중...' : '🎨 이미지 생성'}
                </button>
                {cuts.some((c) => c.imageUrl) && (
                  <button
                    onClick={handleDownload}
                    className="bg-gray-800 text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                  >
                    📥 다운로드
                  </button>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            {generating && (
              <div className="mb-4">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1 text-center">
                  {Math.round(progress)}% 완료
                </p>
              </div>
            )}

            {/* Cuts Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {cuts.map((cut) => (
                <div
                  key={cut.id}
                  className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200"
                >
                  <div className="aspect-square relative">
                    {cut.loading ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
                      </div>
                    ) : cut.imageUrl ? (
                      <img
                        src={cut.imageUrl}
                        alt={cut.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
                        <span className="text-4xl">🖼️</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-purple-600 font-semibold">
                      컷 {cut.id}
                    </p>
                    <p className="text-sm font-medium truncate">{cut.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Caption Section */}
        {cuts.some((c) => c.imageUrl) && (
          <section className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">📝 인스타그램 캡션</h2>
            <textarea
              readOnly
              value={`${topic} 완벽 정리! 🎯

✅ 뭘 해야 할지 몰라서 방치하고 계신 분들!
✅ 복잡한 건 싫고 간단하게 시작하고 싶은 분들!

핵심만 정리했어요 👆

저장 📌 하고 나중에 다시 보세요!

─────────────────
#꿀팁 #정보공유 #인스타툰 #웹툰
#자기계발 #습관 #동기부여 #성장`}
              className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
            />
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-600">
          <p>Made with ❤️ using Next.js, Vercel & Supabase</p>
        </div>
      </footer>
    </main>
  );
}
