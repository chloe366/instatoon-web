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

interface GeneratedContent {
  dialogues: string[];
  tips?: string[];
}

// 툰 종류 정의
const TOON_TYPES = {
  info: {
    name: '💡 정보/꿀팁',
    description: '유용한 정보나 팁을 전달하는 교육형 콘텐츠',
    color: 'blue',
    template: [
      { phase: 'hook', emotion: 'curious', title: '궁금증' },
      { phase: 'problem', emotion: 'frustrated', title: '문제' },
      { phase: 'tip1', emotion: 'surprised', title: '핵심팁 1' },
      { phase: 'tip2', emotion: 'excited', title: '핵심팁 2' },
      { phase: 'tip3', emotion: 'determined', title: '핵심팁 3' },
      { phase: 'action', emotion: 'focused', title: '실천법' },
      { phase: 'result', emotion: 'happy', title: '효과' },
      { phase: 'ending', emotion: 'satisfied', title: 'CTA' },
    ],
    hashtags: ['꿀팁', '정보공유', '알면좋은것', '생활꿀팁'],
  },
  empathy: {
    name: '🥹 공감툰',
    description: '누구나 공감할 수 있는 일상 속 감정 이야기',
    color: 'pink',
    template: [
      { phase: 'situation', emotion: 'neutral', title: '상황' },
      { phase: 'feeling', emotion: 'frustrated', title: '감정' },
      { phase: 'inner', emotion: 'sad', title: '속마음' },
      { phase: 'peak', emotion: 'crying', title: '절정' },
      { phase: 'turn', emotion: 'thinking', title: '전환' },
      { phase: 'accept', emotion: 'calm', title: '수용' },
      { phase: 'resolve', emotion: 'hopeful', title: '다짐' },
      { phase: 'ending', emotion: 'warm', title: '위로' },
    ],
    hashtags: ['공감', '위로', '일상', '마음', '힐링'],
  },
  daily: {
    name: '📅 일상툰',
    description: '소소한 일상을 재미있게 풀어낸 이야기',
    color: 'green',
    template: [
      { phase: 'morning', emotion: 'sleepy', title: '시작' },
      { phase: 'event', emotion: 'surprised', title: '사건' },
      { phase: 'reaction', emotion: 'shocked', title: '반응' },
      { phase: 'chaos', emotion: 'panicked', title: '혼란' },
      { phase: 'attempt', emotion: 'determined', title: '시도' },
      { phase: 'fail', emotion: 'embarrassed', title: '실패' },
      { phase: 'accept', emotion: 'laughing', title: '받아들임' },
      { phase: 'ending', emotion: 'happy', title: '마무리' },
    ],
    hashtags: ['일상툰', '일상', '웃긴일상', 'daily', '소소한일상'],
  },
  review: {
    name: '⭐ 리뷰툰',
    description: '제품이나 서비스 후기를 생생하게 전달',
    color: 'yellow',
    template: [
      { phase: 'intro', emotion: 'curious', title: '발견' },
      { phase: 'purchase', emotion: 'excited', title: '구매' },
      { phase: 'unbox', emotion: 'anticipating', title: '개봉' },
      { phase: 'first', emotion: 'surprised', title: '첫인상' },
      { phase: 'use', emotion: 'happy', title: '사용' },
      { phase: 'pros', emotion: 'satisfied', title: '장점' },
      { phase: 'cons', emotion: 'thinking', title: '아쉬운점' },
      { phase: 'verdict', emotion: 'confident', title: '총평' },
    ],
    hashtags: ['리뷰', '후기', '솔직리뷰', '추천', '언박싱'],
  },
  challenge: {
    name: '🔥 챌린지',
    description: '목표 도전과 변화 과정을 담은 콘텐츠',
    color: 'orange',
    template: [
      { phase: 'before', emotion: 'tired', title: '시작 전' },
      { phase: 'decide', emotion: 'determined', title: '결심' },
      { phase: 'day1', emotion: 'excited', title: 'Day 1' },
      { phase: 'struggle', emotion: 'exhausted', title: '고비' },
      { phase: 'almost', emotion: 'frustrated', title: '포기할뻔' },
      { phase: 'push', emotion: 'fierce', title: '극복' },
      { phase: 'after', emotion: 'proud', title: '변화' },
      { phase: 'ending', emotion: 'glowing', title: '결과' },
    ],
    hashtags: ['챌린지', '도전', '변화', '성장', '갓생'],
  },
  cooking: {
    name: '🍳 레시피툰',
    description: '요리 과정을 쉽게 따라할 수 있게 설명',
    color: 'red',
    template: [
      { phase: 'intro', emotion: 'excited', title: '소개' },
      { phase: 'ingredients', emotion: 'happy', title: '재료' },
      { phase: 'step1', emotion: 'focused', title: 'Step 1' },
      { phase: 'step2', emotion: 'determined', title: 'Step 2' },
      { phase: 'step3', emotion: 'careful', title: 'Step 3' },
      { phase: 'cooking', emotion: 'anticipating', title: '조리' },
      { phase: 'done', emotion: 'proud', title: '완성' },
      { phase: 'taste', emotion: 'delighted', title: '시식' },
    ],
    hashtags: ['레시피', '요리', '집밥', '자취요리', '간단요리'],
  },
};

// 캐릭터 타입 정의
const CHARACTER_TYPES = {
  human_male: {
    name: '👨 남자',
    description: 'young Korean male office worker in his 30s with short black hair and glasses wearing navy suit',
    nameKr: '민수',
  },
  human_female: {
    name: '👩 여자',
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
  handdrawn: {
    name: '✏️ 손그림',
    description: 'cute hand-drawn sketch style with pencil texture, simple doodle art, warm and friendly feel, soft lines, notebook paper aesthetic',
  },
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

// 감정별 표현
const EMOTIONS: { [key: string]: string } = {
  curious: 'curious tilted head interested expression',
  frustrated: 'frustrated stressed holding head annoyed expression',
  confused: 'confused question marks around puzzled expression',
  surprised: 'surprised wide eyes amazed expression lightbulb moment',
  excited: 'excited happy sparkling eyes big smile energetic',
  determined: 'determined focused serious confident expression',
  happy: 'happy cheerful bright smile warm expression',
  satisfied: 'satisfied peaceful content proud smile success',
  neutral: 'neutral calm normal expression',
  sad: 'sad melancholy downcast eyes slight frown',
  crying: 'crying tears streaming emotional expression',
  thinking: 'thinking pondering chin in hand thoughtful',
  calm: 'calm serene peaceful expression soft smile',
  hopeful: 'hopeful optimistic bright eyes gentle smile',
  warm: 'warm heartfelt loving caring expression',
  sleepy: 'sleepy drowsy half-closed eyes yawning',
  shocked: 'shocked jaw dropped wide eyes stunned',
  panicked: 'panicked sweating nervous frantic expression',
  embarrassed: 'embarrassed blushing shy awkward smile',
  laughing: 'laughing joyful tears of laughter big grin',
  anticipating: 'anticipating eager expectant sparkling eyes',
  tired: 'tired exhausted dark circles slouching',
  fierce: 'fierce intense burning eyes motivated',
  proud: 'proud confident accomplished beaming smile',
  glowing: 'glowing radiant successful triumphant',
  focused: 'focused concentrated serious working',
  careful: 'careful attentive precise gentle hands',
  delighted: 'delighted overjoyed ecstatic happy tears',
  confident: 'confident assured self-assured proud stance',
  exhausted: 'exhausted worn out sweating tired but pushing through',
};

// 예시 갤러리 데이터
const EXAMPLE_GALLERY = [
  { topic: '연금저축 ETF', toonType: 'info', image: '💡💰' },
  { topic: '월요병', toonType: 'empathy', image: '🥹😴' },
  { topic: '출근길 해프닝', toonType: 'daily', image: '📅🚇' },
  { topic: '다이어트 30일', toonType: 'challenge', image: '🔥💪' },
];

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [toonType, setToonType] = useState<keyof typeof TOON_TYPES>('info');
  const [topic, setTopic] = useState('');
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');
  const [characterType, setCharacterType] = useState<keyof typeof CHARACTER_TYPES>('bear');
  const [artStyle, setArtStyle] = useState<keyof typeof ART_STYLES>('handdrawn');
  const [cuts, setCuts] = useState<Cut[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [progress, setProgress] = useState(0);
  const [seed, setSeed] = useState<number>(0);
  const [showHero, setShowHero] = useState(true);

  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDark);
  }, []);

  const generateSeed = () => Math.floor(Math.random() * 999999);

  // AI를 사용해 정보성 콘텐츠 생성
  const generateInfoContent = async (topic: string): Promise<GeneratedContent> => {
    const prompt = `You are a Korean content creator. Create an informative Instagram toon script about "${topic}".

Return ONLY a JSON object (no markdown, no explanation) with this exact format:
{
  "dialogues": [
    "궁금증을 유발하는 첫 문장 (15자 이내)",
    "많은 사람들이 겪는 문제점 (20자 이내)",
    "핵심 팁 1: 구체적인 정보 (25자 이내)",
    "핵심 팁 2: 실용적인 조언 (25자 이내)",
    "핵심 팁 3: 꿀팁 또는 주의사항 (25자 이내)",
    "바로 실천할 수 있는 방법 (20자 이내)",
    "이렇게 하면 얻는 효과 (20자 이내)",
    "저장을 유도하는 마무리 (15자 이내)"
  ]
}

Requirements:
- All text must be in Korean
- Include specific numbers, percentages, or facts when possible
- Make it practical and actionable
- Keep each line short for speech bubbles`;

    try {
      const response = await fetch(
        `https://text.pollinations.ai/${encodeURIComponent(prompt)}`,
        {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        }
      );
      const text = await response.text();

      // JSON 추출 시도
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.dialogues && parsed.dialogues.length === 8) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('AI content generation failed:', error);
    }

    // 폴백: 기본 템플릿
    return {
      dialogues: [
        `${topic}... 이거 어떻게 하는 거지?`,
        `${topic} 시작이 막막해...`,
        `첫째, 기초부터 차근차근!`,
        `둘째, 꾸준히 하는 게 핵심!`,
        `셋째, 전문가 조언을 참고하세요`,
        `오늘부터 바로 시작해보자!`,
        `3개월 후면 달라진 내가 될 거야`,
        `저장하고 나중에 꼭 해보세요! 📌`,
      ],
    };
  };

  // AI를 사용해 공감 콘텐츠 생성
  const generateEmpathyContent = async (topic: string): Promise<GeneratedContent> => {
    const prompt = `You are a Korean emotional content creator. Create a deeply touching and relatable Instagram toon script about "${topic}".

Return ONLY a JSON object (no markdown, no explanation) with this exact format:
{
  "dialogues": [
    "상황을 설명하는 담담한 문장 (15자 이내)",
    "힘든 감정을 표현 (15자 이내)",
    "혼자만 그런 것 같은 외로움 (15자 이내)",
    "감정의 절정, 가장 힘든 순간 (15자 이내)",
    "작은 깨달음의 순간 (20자 이내)",
    "스스로를 다독이는 말 (20자 이내)",
    "희망적인 다짐 (20자 이내)",
    "따뜻한 위로와 응원의 메시지 (25자 이내)"
  ]
}

Requirements:
- All text in Korean
- Be genuine and emotionally resonant
- The last message should be warm and comforting
- Use gentle, understanding tone
- Make readers feel understood and less alone`;

    try {
      const response = await fetch(
        `https://text.pollinations.ai/${encodeURIComponent(prompt)}`,
        {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        }
      );
      const text = await response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.dialogues && parsed.dialogues.length === 8) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('AI content generation failed:', error);
    }

    return {
      dialogues: [
        `오늘도 ${topic}...`,
        `왜 이렇게 힘들지...`,
        `나만 이런 걸까...?`,
        `정말 지친다...`,
        `다들 이렇게 느끼는 거 아닐까?`,
        `괜찮아, 잘하고 있어`,
        `내일은 조금 더 나아질 거야`,
        `오늘 하루도 정말 수고했어요 💕`,
      ],
    };
  };

  // AI를 사용해 일상 콘텐츠 생성
  const generateDailyContent = async (topic: string): Promise<GeneratedContent> => {
    const prompt = `You are a Korean webtoon creator. Create a funny daily life Instagram toon script about "${topic}".

Return ONLY a JSON object (no markdown, no explanation) with this exact format:
{
  "dialogues": [
    "평화로운 시작 (10자 이내)",
    "갑자기 벌어진 사건 (15자 이내)",
    "놀란 반응 (10자 이내)",
    "당황하는 모습 (12자 이내)",
    "해결하려는 시도 (12자 이내)",
    "실패하는 모습 (12자 이내)",
    "받아들이는 모습 (15자 이내)",
    "긍정적 마무리 (15자 이내)"
  ]
}

Requirements:
- All text in Korean
- Be humorous and relatable
- Use casual, conversational tone
- Include some ㅋㅋㅋ or emoticons naturally`;

    try {
      const response = await fetch(
        `https://text.pollinations.ai/${encodeURIComponent(prompt)}`,
        {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        }
      );
      const text = await response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.dialogues && parsed.dialogues.length === 8) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('AI content generation failed:', error);
    }

    return {
      dialogues: [
        `평화로운 하루~`,
        `엥?! ${topic}이?!`,
        `이게 뭔 일이야?!`,
        `어떡해 어떡해!`,
        `일단 해보자!`,
        `...역시 안 되네 ㅋㅋ`,
        `에라 모르겠다~`,
        `이것도 추억이지 뭐 😂`,
      ],
    };
  };

  // AI를 사용해 리뷰 콘텐츠 생성
  const generateReviewContent = async (topic: string): Promise<GeneratedContent> => {
    const prompt = `You are a Korean product reviewer. Create an honest review Instagram toon script about "${topic}".

Return ONLY a JSON object (no markdown, no explanation) with this exact format:
{
  "dialogues": [
    "제품을 발견한 순간 (12자 이내)",
    "구매 결정 (12자 이내)",
    "개봉하는 설렘 (12자 이내)",
    "첫인상 (15자 이내)",
    "실제 사용 후기 (20자 이내)",
    "가장 좋았던 장점 (20자 이내)",
    "아쉬운 점 (15자 이내)",
    "최종 평가와 추천 (15자 이내)"
  ]
}

Requirements:
- All text in Korean
- Be honest and balanced
- Include specific details about the product
- End with a clear recommendation`;

    try {
      const response = await fetch(
        `https://text.pollinations.ai/${encodeURIComponent(prompt)}`,
        {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        }
      );
      const text = await response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.dialogues && parsed.dialogues.length === 8) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('AI content generation failed:', error);
    }

    return {
      dialogues: [
        `${topic} 드디어 샀다!`,
        `고민 끝에 결제!`,
        `두근두근 개봉기~`,
        `오... 첫인상 좋은데?`,
        `실제로 써보니까 만족!`,
        `이 부분이 진짜 좋아요`,
        `이건 좀 아쉽네요`,
        `결론: 추천해요! ⭐⭐⭐⭐`,
      ],
    };
  };

  // AI를 사용해 챌린지 콘텐츠 생성
  const generateChallengeContent = async (topic: string): Promise<GeneratedContent> => {
    const prompt = `You are a Korean fitness/lifestyle content creator. Create a motivating challenge Instagram toon script about "${topic}".

Return ONLY a JSON object (no markdown, no explanation) with this exact format:
{
  "dialogues": [
    "시작 전 상태 (12자 이내)",
    "결심하는 순간 (12자 이내)",
    "첫날의 각오 (12자 이내)",
    "중간의 고비 (15자 이내)",
    "포기하고 싶은 순간 (15자 이내)",
    "다시 마음 다잡기 (15자 이내)",
    "변화가 보이는 순간 (15자 이내)",
    "성공 후 메시지 (20자 이내)"
  ]
}

Requirements:
- All text in Korean
- Be motivating and inspiring
- Show real struggle and triumph
- End with encouragement for others`;

    try {
      const response = await fetch(
        `https://text.pollinations.ai/${encodeURIComponent(prompt)}`,
        {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        }
      );
      const text = await response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.dialogues && parsed.dialogues.length === 8) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('AI content generation failed:', error);
    }

    return {
      dialogues: [
        `이대로는 안 돼...`,
        `${topic} 시작한다!`,
        `첫날! 할 수 있어!`,
        `힘들다... 왜 시작했지`,
        `그만둘까...?`,
        `아니야! 포기 못해!`,
        `와... 진짜 달라졌어!`,
        `도전은 배신하지 않아요 🔥`,
      ],
    };
  };

  // AI를 사용해 레시피 콘텐츠 생성
  const generateCookingContent = async (topic: string): Promise<GeneratedContent> => {
    const prompt = `You are a Korean cooking content creator. Create a simple recipe Instagram toon script for "${topic}".

Return ONLY a JSON object (no markdown, no explanation) with this exact format:
{
  "dialogues": [
    "오늘의 메뉴 소개 (12자 이내)",
    "필요한 재료 (20자 이내, 구체적으로)",
    "첫 번째 단계 (20자 이내, 구체적 조리법)",
    "두 번째 단계 (20자 이내, 구체적 조리법)",
    "세 번째 단계 (20자 이내, 구체적 조리법)",
    "마무리 조리 (15자 이내)",
    "완성된 모습 (12자 이내)",
    "맛 평가 (15자 이내)"
  ]
}

Requirements:
- All text in Korean
- Include specific ingredients and amounts
- Give clear, actionable cooking steps
- Make it sound delicious`;

    try {
      const response = await fetch(
        `https://text.pollinations.ai/${encodeURIComponent(prompt)}`,
        {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        }
      );
      const text = await response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.dialogues && parsed.dialogues.length === 8) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('AI content generation failed:', error);
    }

    return {
      dialogues: [
        `오늘의 메뉴: ${topic}!`,
        `재료: 기본 재료들 준비~`,
        `먼저 재료를 손질해요`,
        `팬에 볶아주세요`,
        `양념을 넣고 섞어요`,
        `불 조절하며 마무리~`,
        `완성! 예쁘게 담기`,
        `대성공! 맛있어요 🍽️`,
      ],
    };
  };

  // 콘텐츠 생성 함수 선택
  const generateContent = async (type: keyof typeof TOON_TYPES, topic: string): Promise<GeneratedContent> => {
    switch (type) {
      case 'info':
        return generateInfoContent(topic);
      case 'empathy':
        return generateEmpathyContent(topic);
      case 'daily':
        return generateDailyContent(topic);
      case 'review':
        return generateReviewContent(topic);
      case 'challenge':
        return generateChallengeContent(topic);
      case 'cooking':
        return generateCookingContent(topic);
      default:
        return generateInfoContent(topic);
    }
  };

  const generateStoryboard = async () => {
    if (!topic) return;

    setGeneratingContent(true);
    const newSeed = generateSeed();
    setSeed(newSeed);

    try {
      // AI로 콘텐츠 생성
      const content = await generateContent(toonType, topic);

      const toon = TOON_TYPES[toonType];
      const char = CHARACTER_TYPES[characterType];
      const style = ART_STYLES[artStyle];

      const storyboard: Cut[] = toon.template.map((template, index) => {
        const dialogue = content.dialogues[index] || `${topic} 이야기`;
        const emotion = EMOTIONS[template.emotion] || EMOTIONS.happy;

        return {
          id: index + 1,
          title: template.title,
          dialogue: dialogue,
          emotion: template.emotion,
          prompt: `${char.description}, ${emotion}, comic panel with white speech bubble containing Korean text, ${style.description}, single character, clean background, webtoon panel style, square format 1:1 ratio, high quality illustration`,
        };
      });

      setCuts(storyboard);
      setShowHero(false);
    } catch (error) {
      console.error('Failed to generate storyboard:', error);
    } finally {
      setGeneratingContent(false);
    }
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

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      blue: 'from-blue-500 to-cyan-500',
      pink: 'from-pink-500 to-rose-500',
      green: 'from-green-500 to-emerald-500',
      yellow: 'from-yellow-500 to-amber-500',
      orange: 'from-orange-500 to-red-500',
      red: 'from-red-500 to-pink-500',
    };
    return colors[type] || 'from-violet-500 to-fuchsia-500';
  };

  const bgClass = darkMode
    ? 'bg-gray-950 text-white'
    : 'bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 text-gray-900';

  const cardClass = darkMode
    ? 'bg-gray-900/80 backdrop-blur-xl border border-gray-800'
    : 'bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl';

  const selectedToon = TOON_TYPES[toonType];

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
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                아이디어를 웹툰으로
              </span>
            </h2>
            <p className={`text-lg md:text-xl mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              AI가 주제를 분석해 알찬 정보와 감동적인 스토리를 만들어드려요
            </p>
            <p className={`text-sm mb-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              ✨ NEW: AI가 주제에 맞는 실제 정보와 팁을 자동 생성합니다
            </p>

            {/* 3-Step Workflow */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-12">
              {[
                { icon: '✍️', title: '주제 입력', desc: '주제와 툰 종류 선택' },
                { icon: '🤖', title: 'AI 분석', desc: '정보 검색 & 스토리 생성' },
                { icon: '🎨', title: '이미지 생성', desc: '8컷 웹툰 완성' },
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

            {/* Toon Types Preview */}
            <div className="mb-8">
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                다양한 종류의 인스타툰을 만들 수 있어요
              </p>
              <div className="flex justify-center gap-2 flex-wrap">
                {Object.entries(TOON_TYPES).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setToonType(key as keyof typeof TOON_TYPES);
                      setShowHero(false);
                    }}
                    className={`${cardClass} px-4 py-2 rounded-full text-sm hover:scale-105 transition-all`}
                  >
                    {value.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Example Gallery */}
            <div className="mb-8">
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                예시 주제
              </p>
              <div className="flex justify-center gap-3 flex-wrap">
                {EXAMPLE_GALLERY.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setTopic(ex.topic);
                      setToonType(ex.toonType as keyof typeof TOON_TYPES);
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
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600" />
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
          <button
            onClick={() => setShowHero(true)}
            className={`text-sm ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} transition`}
          >
            ← 메인으로
          </button>

          {/* Toon Type Selection */}
          <section className={`${cardClass} rounded-3xl p-6`}>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getTypeColor(selectedToon.color)} flex items-center justify-center text-white text-sm`}>1</span>
              툰 종류 선택
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(TOON_TYPES).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setToonType(key as keyof typeof TOON_TYPES)}
                  className={`p-4 rounded-xl border-2 transition-all text-left hover:scale-[1.02] ${
                    toonType === key
                      ? `border-transparent bg-gradient-to-br ${getTypeColor(value.color)} text-white shadow-lg`
                      : darkMode
                      ? 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                      : 'border-gray-200 hover:border-gray-300 bg-white/50'
                  }`}
                >
                  <div className="font-semibold">{value.name}</div>
                  <div className={`text-xs mt-1 ${toonType === key ? 'text-white/80' : darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {value.description}
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Character & Style Selection */}
          <section className={`${cardClass} rounded-3xl p-6`}>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getTypeColor(selectedToon.color)} flex items-center justify-center text-white text-sm`}>2</span>
              캐릭터 & 스타일
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  주인공
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
                  그림체
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
              <span className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getTypeColor(selectedToon.color)} flex items-center justify-center text-white text-sm`}>3</span>
              스토리 설정
              <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500'}`}>
                🤖 AI가 정보를 검색해 채워드려요
              </span>
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
                  placeholder={
                    toonType === 'info' ? '예: 연금저축 ETF, 세금 절약 방법, 비타민 효능...' :
                    toonType === 'empathy' ? '예: 월요병, 야근, 눈치, 번아웃...' :
                    toonType === 'daily' ? '예: 출근길, 점심시간, 퇴근, 주말...' :
                    toonType === 'review' ? '예: 에어팟, 맥북, 화장품, 앱...' :
                    toonType === 'challenge' ? '예: 다이어트 30일, 금연, 미라클모닝...' :
                    toonType === 'cooking' ? '예: 계란찜, 김치볶음밥, 파스타...' :
                    '예: 주제를 입력하세요...'
                  }
                  className={`w-full px-4 py-3 rounded-xl transition focus:ring-2 focus:ring-violet-500 focus:outline-none ${
                    darkMode
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                  } border`}
                />
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  💡 구체적인 주제일수록 더 정확한 정보가 생성됩니다
                </p>
              </div>

              <button
                onClick={generateStoryboard}
                disabled={!topic || generatingContent}
                className={`w-full relative py-4 rounded-xl font-bold text-white overflow-hidden transition-all hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${getTypeColor(selectedToon.color)}`} />
                <span className="relative flex items-center justify-center gap-2">
                  {generatingContent ? (
                    <>
                      <span className="animate-spin">🤖</span> AI가 정보를 분석하고 있어요...
                    </>
                  ) : (
                    <>✨ AI로 스토리보드 생성</>
                  )}
                </span>
              </button>
            </div>
          </section>

          {/* Storyboard */}
          {cuts.length > 0 && (
            <section className={`${cardClass} rounded-3xl p-6`}>
              <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <span className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getTypeColor(selectedToon.color)} flex items-center justify-center text-white text-sm`}>4</span>
                    스토리보드
                    <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${getTypeColor(selectedToon.color)} text-white`}>
                      {selectedToon.name}
                    </span>
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

              {generating && (
                <div className="mb-6">
                  <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <div
                      className={`h-full bg-gradient-to-r ${getTypeColor(selectedToon.color)} transition-all duration-500`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className={`text-xs mt-2 text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {Math.round(progress)}% 완료 (Rate limit 방지를 위해 천천히 생성됩니다)
                  </p>
                </div>
              )}

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

                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold bg-gradient-to-r ${getTypeColor(selectedToon.color)} bg-clip-text text-transparent`}>
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
                value={`${topic} ${selectedToon.name.split(' ')[0]}

${CHARACTER_TYPES[characterType].nameKr}의 ${topic} 이야기

${cuts.slice(2, 5).map(c => `✅ ${c.dialogue}`).join('\n')}

${toonType === 'empathy' ? '오늘도 수고했어요 💕' :
  toonType === 'challenge' ? '여러분도 도전해보세요! 🔥' :
  toonType === 'review' ? '도움이 됐다면 저장해주세요! ⭐' :
  toonType === 'cooking' ? '맛있게 만들어보세요! 🍽️' :
  '저장하고 나중에 꼭 해보세요! 💪'}

─────────────────
#인스타툰 #${selectedToon.name.replace(/[^\w가-힣]/g, '')} #${topic.replace(/\s/g, '')}
${selectedToon.hashtags.map(tag => `#${tag}`).join(' ')}`}
                className={`w-full h-64 px-4 py-3 rounded-xl text-sm resize-none ${
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
            Made with ❤️ by AI | Powered by Pollinations.ai
          </div>
        </div>
      </footer>
    </main>
  );
}
