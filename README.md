# Fudagit

百人一首風の UI で Git コマンドを学べる SolidJS 製のカルタゲームです。  
読み札の説明文が、音声読み上げの代わりに少しずつ浮かび上がる演出を中核体験にしています。

公開ページ:

- https://torifo.github.io/fudagit-web/

## Features

- `easy / normal / hard` の 3 難易度
- 問題数 `5 / 10 / 20` を開始前に選択可能
- 読み札の説明文が `blur + opacity` で徐々に出現
- 回答後に `正誤 / 選んだコマンド / 正解コマンド / 解説` を表示
- モバイル対応レイアウト
- GitHub Pages への自動デプロイ

## Tech Stack

- `SolidJS`
- `Vite`
- `TypeScript`
- `plain CSS`
- `ESLint`
- `Prettier`
- `GitHub Actions`

## Local Development

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:5173/fudagit-web/` を開きます。

## Available Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run format
npm run format:check
```

## Game Rules

1. スタート画面で難易度と問題数を選びます。
2. 読み札として Git コマンドの説明文が表示されます。
3. 説明文は最初から完全には見えず、数秒かけて浮かび上がります。
4. 複数の取り札から正しいコマンドを 1 つ選びます。
5. 回答後に正誤と解説を確認し、次の問題へ進みます。
6. 全問終了後に成績を表示します。

## Difficulty

| Difficulty | Cards | Notes                                |
| ---------- | ----: | ------------------------------------ |
| `easy`     |     4 | 札数を絞って遊びやすくしたモード     |
| `normal`   |     6 | 標準モード                           |
| `hard`     |     8 | 見切りと一覧性の両方が問われるモード |

## Project Structure

```text
.
├── .github/workflows/
├── src/
│   ├── data/
│   │   └── cards.ts
│   ├── styles/
│   │   └── app.css
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── spec.md
└── vite.config.ts
```

## Design Notes

- 和紙のような背景と緑基調の配色を採用
- 読み札は縦書き
- 取り札は可読性を優先して横書き
- `prefers-reduced-motion` に対応
- キーボードフォーカスが視認できるように調整

## Data

出題データは [src/data/cards.ts](src/data/cards.ts) にあります。  
`description / command / explanation / tags` を持つ問題カードを収録しています。

## Deployment

`main` ブランチへ push すると GitHub Actions が以下を実行します。

1. `npm ci`
2. `npm run format:check`
3. `npm run lint`
4. `npm run build`
5. `dist/` を `gh-pages` ブランチへ deploy

GitHub Pages 設定:

- Source: `Deploy from a branch`
- Branch: `gh-pages`
- Folder: `/ (root)`

## agent-browser

`agent-browser` を使うと、Codex から CLI ベースでブラウザを操作して画面確認できます。

インストール:

```bash
npm install -g agent-browser
agent-browser install
```

基本例:

```bash
agent-browser open https://torifo.github.io/fudagit-web/
agent-browser snapshot
agent-browser screenshot page.png
agent-browser close
```

ローカル確認例:

```bash
agent-browser open http://localhost:5173/fudagit-web/
agent-browser snapshot -i
agent-browser close
```

補足:

- `agent-browser` は Playwright ベースです
- 初回は `agent-browser install` で Chromium が必要です
- Codex でスキルとして使う場合は、対応 skill をインストールしてから Codex を再起動すると認識しやすくなります

## Specification

詳細仕様は [spec.md](spec.md) を参照してください。
