'use client';

import { useState } from 'react';

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
    name: '📱 웹툰 스타일',
    description: 'Korean webtoon manhwa style clean line art soft pastel colors',
  },
  cute: {
    name: '🎀 귀여운 스타일',
    description: 'kawaii chibi style big head adorable expressions pastel colors',
  },
  minimal: {
    name: '✨ 미니멀 스타일',
    description: 'minimalist flat illustration simple shapes clean design',
  },
  cartoon: {
    name: '🎨 카툰 스타일',
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

export default function Home() {
  const [topic, setTopic] = useState('');
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');
  const [characterType, setCharacterType] = useState<keyof typeof CHARACTER_TYPES>('bear');
  const [artStyle, setArtStyle] = useState<keyof typeof ART_STYLES>('webtoon');
  const [cuts, setCuts] = useState<Cut[]>([]);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [seed, setSeed] = useState<number>(0);

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
        prompt: `${char.description}, ${emotion}, speech bubble with text, ${style.description}, single character, white background, webtoon panel, square format`,
      };
    });

    setCuts(storyboard);
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
    // 각 컷마다 고유하지만 일관된 시드 사용
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

        // 이미지 프리로드 with timeout
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

      // Rate limit 방지: 5초 대기
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
      // 새로운 시드로 재시도
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            🎨 인스타툰 생성기
          </h1>
          <p className="text-gray-500 text-sm">Snow White 스토리보드 방식으로 웹툰을 만들어보세요</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Style Selection */}
        <section className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            🎭 캐릭터 & 스타일
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">주인공</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(CHARACTER_TYPES).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setCharacterType(key as keyof typeof CHARACTER_TYPES)}
                    className={`p-3 rounded-xl border-2 transition-all text-sm ${
                      characterType === key
                        ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-md'
                        : 'border-gray-100 hover:border-purple-200 hover:bg-purple-50/50'
                    }`}
                  >
                    <div>{value.name}</div>
                    <div className="text-xs text-gray-400">{value.nameKr}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">그림체</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(ART_STYLES).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setArtStyle(key as keyof typeof ART_STYLES)}
                    className={`p-3 rounded-xl border-2 transition-all text-sm ${
                      artStyle === key
                        ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-md'
                        : 'border-gray-100 hover:border-pink-200 hover:bg-pink-50/50'
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
        <section className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            📖 스토리 설정
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                주제 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="예: 연금저축 ETF, 아침 루틴, 다이어트..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  😰 고민/문제
                </label>
                <textarea
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="주인공이 겪는 어려움..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent transition h-20 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  💡 해결책
                </label>
                <textarea
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  placeholder="어떻게 해결했는지..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent transition h-20 resize-none"
                />
              </div>
            </div>

            <button
              onClick={generateStoryboard}
              disabled={!topic}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
            >
              ✨ 스토리보드 생성
            </button>
          </div>
        </section>

        {/* Storyboard */}
        {cuts.length > 0 && (
          <section className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
              <div>
                <h2 className="text-lg font-semibold">🎬 스토리보드</h2>
                <p className="text-xs text-gray-400">
                  주인공: {CHARACTER_TYPES[characterType].nameKr} | 시드: {seed}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-2 rounded-xl font-medium hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {generating ? (
                    <>
                      <span className="animate-spin">⏳</span> 생성 중...
                    </>
                  ) : (
                    <>🎨 이미지 생성</>
                  )}
                </button>
                {cuts.some((c) => c.imageUrl && !c.error) && (
                  <button
                    onClick={handleDownload}
                    className="bg-gray-800 text-white px-5 py-2 rounded-xl font-medium hover:bg-gray-700 transition"
                  >
                    📥 다운로드
                  </button>
                )}
              </div>
            </div>

            {/* Progress */}
            {generating && (
              <div className="mb-6">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  {Math.round(progress)}% 완료 (Rate limit 방지를 위해 천천히 생성됩니다)
                </p>
              </div>
            )}

            {/* Cuts Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {cuts.map((cut, index) => (
                <div
                  key={cut.id}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition"
                >
                  <div className="aspect-square relative">
                    {cut.loading ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
                        <div className="animate-spin w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full mb-2" />
                        <span className="text-xs text-gray-400">생성 중...</span>
                      </div>
                    ) : cut.error ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50">
                        <span className="text-2xl mb-2">⚠️</span>
                        <span className="text-xs text-red-400 mb-2">생성 실패</span>
                        <button
                          onClick={() => retryImage(index)}
                          className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full hover:bg-red-200 transition"
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
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
                        <span className="text-3xl mb-1">🖼️</span>
                        <span className="text-xs text-gray-400">대기 중</span>
                      </div>
                    )}
                  </div>

                  {/* Dialogue Box */}
                  <div className="p-3 bg-white">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-purple-600">컷 {cut.id}</span>
                      <span className="text-xs text-gray-400">{cut.title}</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                      <p className="text-sm text-gray-700 leading-snug">
                        💬 "{cut.dialogue}"
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
          <section className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">📝 인스타그램 캡션</h2>
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
              className="w-full h-48 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm"
            />
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white/50 border-t mt-8 py-4">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-400 text-sm">
          Made with ❤️ | Snow White Storyboard Method
        </div>
      </footer>
    </main>
  );
}
