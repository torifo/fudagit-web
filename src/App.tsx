import {
  For,
  Match,
  Show,
  Switch,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
} from 'solid-js';
import type { Card } from './data/cards';
import { cards } from './data/cards';

type Difficulty = 'easy' | 'normal' | 'hard';
type Screen = 'start' | 'playing' | 'results';
type GameQuestion = {
  prompt: Card;
  options: Card[];
};
type RoundResult = {
  selectedId: string;
  correct: boolean;
  outcome: 'answer' | 'timeout';
};

const difficultyConfig: Record<
  Difficulty,
  {
    label: string;
    optionCount: number;
    description: string;
    timeLimitSeconds: number | null;
  }
> = {
  easy: {
    label: 'Easy',
    optionCount: 4,
    description: 'まずは少ない札から、読み札の感覚を掴む。',
    timeLimitSeconds: null,
  },
  normal: {
    label: 'Normal',
    optionCount: 6,
    description: '日常的に Git を使う人向けの標準戦。',
    timeLimitSeconds: 12,
  },
  hard: {
    label: 'Hard',
    optionCount: 8,
    description: '札数が増え、見切りの速さも試される。',
    timeLimitSeconds: 8,
  },
};

const questionCountOptions = [5, 10, 20] as const;
const difficultyEntries = Object.entries(difficultyConfig) as [
  Difficulty,
  (typeof difficultyConfig)[Difficulty],
][];

const shuffle = <T,>(items: T[]) => {
  const list = [...items];

  for (let index = list.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [list[index], list[swapIndex]] = [list[swapIndex], list[index]];
  }

  return list;
};

const buildQuestions = (
  difficulty: Difficulty,
  questionCount: number,
): GameQuestion[] => {
  const prompts = shuffle(cards).slice(0, questionCount);
  const optionCount = difficultyConfig[difficulty].optionCount;

  return prompts.map((prompt) => {
    const distractors = shuffle(
      cards.filter((card) => card.id !== prompt.id),
    ).slice(0, optionCount - 1);

    return {
      prompt,
      options: shuffle([prompt, ...distractors]),
    };
  });
};

const accuracy = (correctCount: number, total: number) => {
  if (total === 0) {
    return 0;
  }

  return Math.round((correctCount / total) * 100);
};

const formatElapsedTime = (totalMs: number) => {
  const totalSeconds = Math.max(0, Math.round(totalMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds}秒`;
  }

  return `${minutes}分 ${seconds}秒`;
};

type ReadingToken = {
  value: string;
  index: number;
  kind: 'char' | 'space' | 'word';
};

const splitReadingText = (text: string) => {
  const tokens: ReadingToken[] = [];
  const asciiWordPattern = /[A-Za-z0-9][A-Za-z0-9._/-]*/y;
  let cursor = 0;
  let index = 0;

  while (cursor < text.length) {
    asciiWordPattern.lastIndex = cursor;
    const wordMatch = asciiWordPattern.exec(text);

    if (wordMatch) {
      tokens.push({
        value: wordMatch[0],
        index,
        kind: 'word',
      });
      cursor += wordMatch[0].length;
      index += 1;
      continue;
    }

    const character = text[cursor];
    tokens.push({
      value: character,
      index,
      kind: character === ' ' ? 'space' : 'char',
    });
    cursor += 1;
    index += 1;
  }

  return tokens;
};

const createBrowserTts = () => {
  const isSupported = () =>
    typeof window !== 'undefined' && 'speechSynthesis' in window;

  const stop = () => {
    if (!isSupported()) {
      return;
    }

    window.speechSynthesis.cancel();
  };

  const pickVoice = () => {
    const voices = window.speechSynthesis.getVoices();

    return (
      voices.find((voice) => voice.lang.startsWith('ja')) ??
      voices.find((voice) => voice.default) ??
      voices[0]
    );
  };

  const speak = (text: string) => {
    if (!isSupported()) {
      return;
    }

    stop();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = pickVoice();

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = 'ja-JP';
    }

    utterance.rate = 0.94;
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  };

  return {
    isSupported,
    speak,
    stop,
  };
};

export default function App() {
  const tts = createBrowserTts();
  const [screen, setScreen] = createSignal<Screen>('start');
  const [difficulty, setDifficulty] = createSignal<Difficulty>('normal');
  const [questionCount, setQuestionCount] = createSignal<number>(10);
  const [questions, setQuestions] = createSignal<GameQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = createSignal(0);
  const [results, setResults] = createSignal<RoundResult[]>([]);
  const [selectedId, setSelectedId] = createSignal<string | null>(null);
  const [voiceEnabled, setVoiceEnabled] = createSignal(false);
  const [remainingTime, setRemainingTime] = createSignal<number | null>(null);
  const [roundStartedAt, setRoundStartedAt] = createSignal<number | null>(null);
  const [totalElapsedMs, setTotalElapsedMs] = createSignal(0);

  const currentQuestion = createMemo(() => questions()[currentIndex()]);
  const totalQuestions = createMemo(() => questions().length);
  const answeredCount = createMemo(() => results().length);
  const correctCount = createMemo(
    () => results().filter((result) => result.correct).length,
  );
  const currentResult = createMemo(() => results()[currentIndex()]);
  const scoreRate = createMemo(() =>
    accuracy(correctCount(), totalQuestions()),
  );
  const selectedCard = createMemo(() => {
    const current = currentQuestion();
    const currentSelection = selectedId();

    if (!current || !currentSelection) {
      return null;
    }

    return (
      current.options.find((option) => option.id === currentSelection) ?? null
    );
  });
  const canUseQuestionCount = createMemo(() =>
    questionCountOptions.filter((count) => count <= cards.length),
  );
  const currentTimeLimit = createMemo(
    () => difficultyConfig[difficulty()].timeLimitSeconds,
  );
  const formattedElapsedTime = createMemo(() =>
    formatElapsedTime(totalElapsedMs()),
  );

  const captureRoundElapsed = () => {
    const startedAt = roundStartedAt();

    if (startedAt === null) {
      return;
    }

    setTotalElapsedMs((prev) => prev + (Date.now() - startedAt));
    setRoundStartedAt(null);
  };

  const startGame = () => {
    const nextQuestions = buildQuestions(difficulty(), questionCount());

    tts.stop();
    setQuestions(nextQuestions);
    setResults([]);
    setCurrentIndex(0);
    setSelectedId(null);
    setRoundStartedAt(null);
    setTotalElapsedMs(0);
    setScreen('playing');
  };

  const handleAnswer = (cardId: string) => {
    if (selectedId()) {
      return;
    }

    const prompt = currentQuestion()?.prompt;

    if (!prompt) {
      return;
    }

    const correct = prompt.id === cardId;

    tts.stop();
    captureRoundElapsed();
    setSelectedId(cardId);
    setResults((prev) => [
      ...prev,
      { selectedId: cardId, correct, outcome: 'answer' },
    ]);
  };

  const goNext = () => {
    tts.stop();

    if (currentIndex() === totalQuestions() - 1) {
      setScreen('results');
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedId(null);
  };

  const resetToStart = () => {
    tts.stop();
    setScreen('start');
    setQuestions([]);
    setResults([]);
    setCurrentIndex(0);
    setSelectedId(null);
    setRoundStartedAt(null);
    setTotalElapsedMs(0);
  };

  const toggleVoice = () => {
    const next = !voiceEnabled();

    if (!next) {
      tts.stop();
    }

    setVoiceEnabled(next);
  };

  createEffect(() => {
    const question = currentQuestion();

    if (screen() !== 'playing' || !question || selectedId() !== null) {
      setRoundStartedAt(null);
      return;
    }

    setRoundStartedAt(Date.now());
  });

  createEffect(() => {
    const question = currentQuestion();

    if (
      screen() !== 'playing' ||
      !question ||
      selectedId() ||
      !voiceEnabled()
    ) {
      tts.stop();
      return;
    }

    tts.speak(question.prompt.description);
  });

  createEffect(() => {
    const question = currentQuestion();
    const timeLimit = currentTimeLimit();

    if (
      screen() !== 'playing' ||
      !question ||
      selectedId() !== null ||
      timeLimit === null
    ) {
      setRemainingTime(timeLimit);
      return;
    }

    const deadline = Date.now() + timeLimit * 1000;

    const tick = () => {
      const secondsLeft = Math.max(
        0,
        Math.ceil((deadline - Date.now()) / 1000),
      );
      setRemainingTime(secondsLeft);

      if (secondsLeft > 0) {
        return;
      }

      tts.stop();
      captureRoundElapsed();
      setSelectedId('__timeout__');
      setResults((prev) => [
        ...prev,
        { selectedId: '__timeout__', correct: false, outcome: 'timeout' },
      ]);
    };

    tick();
    const timerId = window.setInterval(tick, 250);

    onCleanup(() => {
      window.clearInterval(timerId);
    });
  });

  onCleanup(() => {
    tts.stop();
  });

  return (
    <main class="app-shell">
      <div class="paper-grain" aria-hidden="true" />
      <Switch>
        <Match when={screen() === 'start'}>
          <section class="screen screen-start">
            <div class="hero-copy">
              <p class="eyebrow">Git Command Karuta</p>
              <h1>詠みを追って、見切れ。</h1>
              <p class="lede">Git コマンドの詠み札が、静かに浮かび上がる。</p>
            </div>

            <div class="panel">
              <div class="panel-block">
                <h2>難易度</h2>
                <div class="choice-grid difficulty-grid">
                  <For each={difficultyEntries}>
                    {([key, config]) => (
                      <button
                        type="button"
                        classList={{
                          choice: true,
                          selected: difficulty() === key,
                        }}
                        onClick={() => setDifficulty(key)}
                      >
                        <span class="choice-title">{config.label}</span>
                        <span class="choice-text">{config.description}</span>
                        <span class="choice-meta">
                          {config.optionCount} 枚勝負
                        </span>
                        <span class="choice-meta">
                          {config.timeLimitSeconds === null
                            ? '時間制限なし'
                            : `${config.timeLimitSeconds} 秒制限`}
                        </span>
                      </button>
                    )}
                  </For>
                </div>
              </div>

              <div class="panel-block">
                <h2>問題数</h2>
                <div class="chip-row">
                  <For each={canUseQuestionCount()}>
                    {(count) => (
                      <button
                        type="button"
                        classList={{
                          chip: true,
                          selected: questionCount() === count,
                        }}
                        onClick={() => setQuestionCount(count)}
                      >
                        {count}問
                      </button>
                    )}
                  </For>
                </div>
              </div>

              <div class="panel-block">
                <h2>読み上げ</h2>
                <button
                  type="button"
                  classList={{
                    'toggle-button': true,
                    enabled: voiceEnabled(),
                  }}
                  onClick={toggleVoice}
                  disabled={!tts.isSupported()}
                  aria-pressed={voiceEnabled()}
                >
                  {tts.isSupported()
                    ? voiceEnabled()
                      ? '音声 ON'
                      : '音声 OFF'
                    : 'このブラウザでは非対応'}
                </button>
              </div>

              <button type="button" class="primary-button" onClick={startGame}>
                いざ開始
              </button>
            </div>
          </section>
        </Match>

        <Match when={screen() === 'playing'}>
          <Show when={currentQuestion()} keyed>
            {(question) => (
              <section class="screen screen-play">
                <header class="status-bar">
                  <div class="status-item">
                    <span class="status-label">問題</span>
                    <strong>
                      {currentIndex() + 1} / {totalQuestions()}
                    </strong>
                  </div>
                  <div class="status-item">
                    <span class="status-label">正解</span>
                    <strong>{correctCount()}</strong>
                  </div>
                  <div class="status-item">
                    <span class="status-label">正答率</span>
                    <strong>
                      {accuracy(correctCount(), answeredCount())}%
                    </strong>
                  </div>
                  <div class="status-item">
                    <span class="status-label">難易度</span>
                    <strong>{difficultyConfig[difficulty()].label}</strong>
                  </div>
                  <div class="status-item">
                    <span class="status-label">制限時間</span>
                    <strong>
                      {remainingTime() === null
                        ? 'なし'
                        : `${remainingTime()}秒`}
                    </strong>
                  </div>
                  <div class="status-item status-item-audio">
                    <span class="status-label">読み上げ</span>
                    <button
                      type="button"
                      classList={{
                        'toggle-button': true,
                        'toggle-button-compact': true,
                        enabled: voiceEnabled(),
                      }}
                      onClick={toggleVoice}
                      disabled={!tts.isSupported()}
                      aria-pressed={voiceEnabled()}
                    >
                      {voiceEnabled() ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </header>

                <div class="play-layout">
                  <article class="reading-card">
                    <p class="reading-label">読み札</p>
                    <div class="reading-frame">
                      <p
                        class="reading-text"
                        aria-label={question.prompt.description}
                      >
                        <For
                          each={splitReadingText(question.prompt.description)}
                        >
                          {(item) => (
                            <span
                              classList={{
                                'reading-char': true,
                                'reading-char-space': item.kind === 'space',
                                'reading-char-word': item.kind === 'word',
                              }}
                              style={{
                                'animation-delay': `${item.index * 0.1}s`,
                              }}
                              aria-hidden="true"
                            >
                              {item.value}
                            </span>
                          )}
                        </For>
                      </p>
                    </div>
                  </article>

                  <section class="answer-column">
                    <div class="card-grid" data-difficulty={difficulty()}>
                      <For each={question.options}>
                        {(option) => {
                          const isAnswered = () => selectedId() !== null;
                          const isSelected = () => selectedId() === option.id;
                          const isCorrect = () =>
                            question.prompt.id === option.id;

                          return (
                            <button
                              type="button"
                              classList={{
                                'command-card': true,
                                selected: isSelected(),
                                correct: isAnswered() && isCorrect(),
                                wrong:
                                  isAnswered() && isSelected() && !isCorrect(),
                              }}
                              onClick={() => handleAnswer(option.id)}
                              disabled={isAnswered()}
                              aria-pressed={isSelected()}
                            >
                              <span class="command-card-label">取り札</span>
                              <strong>{option.command}</strong>
                            </button>
                          );
                        }}
                      </For>
                    </div>

                    <Show when={currentResult()}>
                      {(result) => (
                        <section class="result-panel">
                          <p
                            classList={{
                              verdict: true,
                              correct: result().correct,
                              wrong: !result().correct,
                            }}
                          >
                            {result().correct
                              ? '正解'
                              : result().outcome === 'timeout'
                                ? '時間切れ'
                                : '不正解'}
                          </p>
                          <Show when={selectedCard()}>
                            {(selected) => (
                              <p class="result-command">
                                選んだコマンド:{' '}
                                <code>{selected().command}</code>
                              </p>
                            )}
                          </Show>
                          <p class="result-command">
                            正解コマンド: <code>{question.prompt.command}</code>
                          </p>
                          <p class="result-explanation">
                            {question.prompt.explanation}
                          </p>
                          <button
                            type="button"
                            class="primary-button next-button"
                            onClick={goNext}
                          >
                            {currentIndex() === totalQuestions() - 1
                              ? '結果を見る'
                              : '次の問題へ'}
                          </button>
                        </section>
                      )}
                    </Show>
                  </section>
                </div>
              </section>
            )}
          </Show>
        </Match>

        <Match when={screen() === 'results'}>
          <section class="screen screen-results">
            <div class="result-summary panel">
              <p class="eyebrow">Result</p>
              <h2>{correctCount()} 問正解</h2>
              <p class="summary-score">{scoreRate()}%</p>
              <p class="summary-copy">
                {difficultyConfig[difficulty()].label} / {questionCount()}
                問での成績です。
              </p>

              <div class="summary-grid">
                <div>
                  <span>挑戦した札数</span>
                  <strong>{questionCount()}</strong>
                </div>
                <div>
                  <span>正解</span>
                  <strong>{correctCount()}</strong>
                </div>
                <div>
                  <span>正答率</span>
                  <strong>{scoreRate()}%</strong>
                </div>
                <div>
                  <span>累計時間</span>
                  <strong>{formattedElapsedTime()}</strong>
                </div>
              </div>

              <div class="result-actions">
                <button
                  type="button"
                  class="primary-button"
                  onClick={startGame}
                >
                  同条件でもう一局
                </button>
                <button
                  type="button"
                  class="secondary-button"
                  onClick={resetToStart}
                >
                  設定を変える
                </button>
              </div>
            </div>
          </section>
        </Match>
      </Switch>
    </main>
  );
}
