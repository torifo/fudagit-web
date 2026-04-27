# Fudagit Polish B — 設計書

日付: 2026-04-27

## 概要

GitHub Pages で公開中の Fudagit Web に対して、以下の3点を修正する。

1. コピー（文言）の見直しと「README感」の排除
2. 読み札アニメーションのバグ修正
3. 問題数選択チップの選択状態UIの改善

スコープは App.tsx と app.css のみ。データ・ロジック・ルーティングは変更しない。

---

## 1. コピー

### 削除

`hero-notes` ブロック（スタート画面の3行箇条書き）を完全に削除する。

```html
<!-- 削除対象 -->
<div class="hero-notes" aria-label="遊び方の要点">
  <p>文章がすべて見える前でも札を取れます。</p>
  <p>回答は 1 問につき 1 回のみです。</p>
  <p>回答後は正解と解説を確認して次へ進みます。</p>
</div>
```

`play-note` ブロック（プレイ画面の案内文）も削除する。

```html
<!-- 削除対象 -->
<div class="play-note">
  <p>説明文が浮かび上がる途中でも、思い切って札を取れます。</p>
</div>
```

### 書き換え

| 対象 | 現在 | 変更後 |
|---|---|---|
| h1 | `札を取るたび、Git が手に馴染む。` | `読んで、見切れ。` |
| lede | `説明文が静かに浮かび上がるあいだに、最もふさわしいコマンド札を見切る。` | `Git コマンドの説明文が、静かに浮かび上がる。` |
| 結果: 正解数ラベル | `見切れた札` | `正解` |
| 結果: 選択コマンドラベル | `あなたの札:` | `選んだコマンド:` |
| 結果: 正解コマンドラベル | `正しい札:` | `正解:` |

### CSS追加

h1 に `text-wrap: balance` を適用し、どの画面幅でも自然な折り返しにする。

```css
h1 {
  text-wrap: balance;
}
```

---

## 2. 読み札アニメーション

### 問題

`.reading-char` の初期 CSS に `opacity: 0.08` が設定されており、アニメーション開始前から全文字が薄く表示される。`animation-fill-mode: forwards` は終了後の状態を保持するだけで、遅延中の初期状態を変えない。結果として全文字が同時に薄く見え、バラバラに明るくなるだけ — 文字ごとの浮かび上がりに見えない。

### 修正

```css
/* 変更前 */
.reading-char {
  opacity: 0.08;
  filter: blur(10px);
  animation: reveal-reading-char 0.65s ease-out forwards;
}

/* 変更後 */
.reading-char {
  opacity: 0;
  filter: blur(8px);
  animation: reveal-reading-char 1.2s ease-out both;
}
```

`animation-fill-mode: both` により、遅延中も 0% キーフレームの状態（opacity: 0）を維持する。文字ごとのアニメーション開始まで完全に非表示となり、順番に浮かび上がる効果が明確になる。

```css
/* 変更前 */
@keyframes reveal-reading-char {
  0%   { opacity: 0.08; filter: blur(10px); transform: translateY(10px); }
  60%  { opacity: 0.55; filter: blur(5px); }
  100% { opacity: 1;    filter: blur(0);   transform: translateY(0); }
}

/* 変更後 */
@keyframes reveal-reading-char {
  0%   { opacity: 0; filter: blur(8px); transform: translateY(4px); }
  60%  { opacity: 0.6; filter: blur(3px); }
  100% { opacity: 1;   filter: blur(0);  transform: translateY(0); }
}
```

`translateY` を 10px → 4px に縮小する（縦書きモードでの干渉を軽減）。

### 遅延の刻み

```tsx
/* 変更前 */
'animation-delay': `${item.index * 0.08}s`

/* 変更後 */
'animation-delay': `${item.index * 0.1}s`
```

0.08s → 0.1s に変更し、文字間のずれを明確にする。

**20文字の場合の時間分布:**
- 0文字目: 0〜1.2s
- 9文字目: 0.9〜2.1s
- 19文字目: 1.9〜3.1s（仕様の2.5〜4秒に収まる）

### prefers-reduced-motion

変更なし。既存の即時表示ルールはそのまま維持する。

---

## 3. 問題数選択チップUI

### 問題

`.chip.selected` は `.selected` の共通スタイル（薄い緑グラデーション + 細いボーダー）を継承しており、未選択との視覚差が小さい。チップはサイズが小さいため変化がほぼ気づかれない。

### 修正

`.chip.selected` を専用スタイルで上書きし、primary-button と同じ視覚言語（アクセントカラーの塗りつぶし）を使う。

```css
.chip.selected {
  background: var(--accent);
  color: #f8f6f0;
  border-color: transparent;
  font-weight: 700;
  box-shadow: none;
}
```

難易度の `.choice.selected` は現状維持（カード型なので現行スタイルで十分）。

---

## 変更対象ファイル

- `src/App.tsx` — コピー変更、animation-delay 刻み変更
- `src/styles/app.css` — animation、chip selected、h1 text-wrap

## 対象外

- ゲームロジック
- データ（cards.ts）
- レイアウト構造（CはBの後に判断）
