import { For, Match, Show, Switch, createMemo, createSignal } from 'solid-js';
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
};

const difficultyConfig: Record<
  Difficulty,
  { label: string; optionCount: number; description: string }
> = {
  easy: {
    label: 'Easy',
    optionCount: 4,
    description: 'まずは少ない札から、読み札の感覚を掴む。',
  },
  normal: {
    label: 'Normal',
    optionCount: 6,
    description: '日常的に Git を使う人向けの標準戦。',
  },
  hard: {
    label: 'Hard',
    optionCount: 8,
    description: '札数が増え、見切りの速さも試される。',
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

const splitReadingText = (text: string) =>
  Array.from(text).map((character, index) => ({
    character,
    index,
    isSpace: character === ' ',
  }));

export default function App() {
  const [screen, setScreen] = createSignal<Screen>('start');
  const [difficulty, setDifficulty] = createSignal<Difficulty>('normal');
  const [questionCount, setQuestionCount] = createSignal<number>(10);
  const [questions, setQuestions] = createSignal<GameQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = createSignal(0);
  const [results, setResults] = createSignal<RoundResult[]>([]);
  const [selectedId, setSelectedId] = createSignal<string | null>(null);

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

  const startGame = () => {
    const nextQuestions = buildQuestions(difficulty(), questionCount());

    setQuestions(nextQuestions);
    setResults([]);
    setCurrentIndex(0);
    setSelectedId(null);
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

    setSelectedId(cardId);
    setResults((prev) => [...prev, { selectedId: cardId, correct }]);
  };

  const goNext = () => {
    if (currentIndex() === totalQuestions() - 1) {
      setScreen('results');
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedId(null);
  };

  const resetToStart = () => {
    setScreen('start');
    setQuestions([]);
    setResults([]);
    setCurrentIndex(0);
    setSelectedId(null);
  };

  return (
    <main class="app-shell">
      <div class="paper-grain" aria-hidden="true" />
      <Switch>
        <Match when={screen() === 'start'}>
          <section class="screen screen-start">
            <div class="hero-copy">
              <p class="eyebrow">Git Command Karuta</p>
              <h1>札を取るたび、Git が手に馴染む。</h1>
              <p class="lede">
                説明文が静かに浮かび上がるあいだに、最もふさわしいコマンド札を見切る。
              </p>
              <div class="hero-notes" aria-label="遊び方の要点">
                <p>文章がすべて見える前でも札を取れます。</p>
                <p>回答は 1 問につき 1 回のみです。</p>
                <p>回答後は正解と解説を確認して次へ進みます。</p>
              </div>
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
                                'reading-char-space': item.isSpace,
                              }}
                              style={{
                                'animation-delay': `${item.index * 0.1}s`,
                              }}
                              aria-hidden="true"
                            >
                              {item.character}
                            </span>
                          )}
                        </For>
                      </p>
                    </div>
                  </article>

                  <section class="answer-column">
                    <div class="play-note">
                      <p>
                        説明文が浮かび上がる途中でも、思い切って札を取れます。
                      </p>
                    </div>
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
                            {result().correct ? '正解' : '不正解'}
                          </p>
                          <Show when={selectedCard()}>
                            {(selected) => (
                              <p class="result-command">
                                あなたの札: <code>{selected().command}</code>
                              </p>
                            )}
                          </Show>
                          <p class="result-command">
                            正しい札: <code>{question.prompt.command}</code>
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
                  <span>見切れた札</span>
                  <strong>{correctCount()}</strong>
                </div>
                <div>
                  <span>正答率</span>
                  <strong>{scoreRate()}%</strong>
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
