export type Card = {
  id: string;
  command: string;
  description: string;
  explanation: string;
  tags: string[];
};

export const cards: Card[] = [
  {
    id: 'git-status',
    command: 'git status',
    description:
      '作業ツリーやステージングの現在地をざっと確認したいときに使う。',
    explanation:
      '変更済みファイル、ステージ済みの内容、現在のブランチ状況をまとめて確認できる。',
    tags: ['basic', 'working-tree'],
  },
  {
    id: 'git-add',
    command: 'git add',
    description: 'コミットに含めたい変更をステージングへ載せたいときに使う。',
    explanation:
      '作業中の変更をステージ領域へ追加し、次のコミット候補として確定できる。',
    tags: ['basic', 'staging'],
  },
  {
    id: 'git-commit',
    command: 'git commit',
    description:
      'ステージ済みの変更をひとまとまりの履歴として記録したいときに使う。',
    explanation: 'ステージされた変更をコミットとして保存し、履歴に残せる。',
    tags: ['basic', 'history'],
  },
  {
    id: 'git-push',
    command: 'git push',
    description:
      'ローカルで進めたコミットをリモートリポジトリへ反映したいときに使う。',
    explanation:
      '現在のブランチの更新をリモートへ送信し、共有できる状態にする。',
    tags: ['remote'],
  },
  {
    id: 'git-pull',
    command: 'git pull',
    description:
      'リモートの最新変更を取得し、手元のブランチへ取り込みたいときに使う。',
    explanation:
      '通常は fetch と merge または rebase をまとめて実行し、ローカルを更新する。',
    tags: ['remote', 'sync'],
  },
  {
    id: 'git-fetch',
    command: 'git fetch',
    description:
      'リモートの更新だけを先に確認用として取り込み、まだ作業ブランチへは混ぜたくないときに使う。',
    explanation:
      'リモートの履歴を取得するが、現在のブランチには自動で反映しない。',
    tags: ['remote', 'sync'],
  },
  {
    id: 'git-switch',
    command: 'git switch',
    description:
      '別のブランチへ移動したい、あるいは新しいブランチへ切り替えたいときに使う。',
    explanation:
      'ブランチ移動に特化したコマンドで、checkout より意図が明確になる。',
    tags: ['branch'],
  },
  {
    id: 'git-checkout',
    command: 'git checkout',
    description:
      '過去のコミットや既存ブランチへ移動したいときに使う、やや多用途な古参コマンド。',
    explanation:
      'ブランチ切り替えや特定状態のチェックアウトに使えるが、現在は用途別コマンドへの分離が進んでいる。',
    tags: ['branch', 'history'],
  },
  {
    id: 'git-branch',
    command: 'git branch',
    description:
      'ローカルにあるブランチ一覧を見たり、新しいブランチを作ったりしたいときに使う。',
    explanation: 'ブランチの表示、作成、削除などの基本操作を担う。',
    tags: ['branch'],
  },
  {
    id: 'git-merge',
    command: 'git merge',
    description: '別ブランチの変更を現在のブランチへ統合したいときに使う。',
    explanation: '履歴を保ちながら変更を取り込む代表的な統合方法。',
    tags: ['branch', 'integration'],
  },
  {
    id: 'git-rebase',
    command: 'git rebase',
    description:
      '自分のコミット列を別の履歴の先頭へ積み直して、履歴を直線的に整えたいときに使う。',
    explanation:
      '履歴を書き換える操作なので、共有済みブランチでは慎重な運用が必要。',
    tags: ['history', 'integration'],
  },
  {
    id: 'git-stash',
    command: 'git stash',
    description:
      '今の作業をいったん脇に避けて、別の作業へ切り替えたいときに使う。',
    explanation:
      '未コミットの変更を一時退避し、作業ツリーをきれいな状態に戻せる。',
    tags: ['working-tree', 'temporary'],
  },
  {
    id: 'git-stash-pop',
    command: 'git stash pop',
    description:
      '一時退避していた作業内容を戻し、その退避記録を同時に消したいときに使う。',
    explanation:
      'stash の内容を適用し、成功すれば stash 一覧からその項目を取り除く。',
    tags: ['working-tree', 'temporary'],
  },
  {
    id: 'git-restore',
    command: 'git restore',
    description:
      '作業ツリー上の変更を取り消して、ファイルを以前の状態へ戻したいときに使う。',
    explanation:
      '主にワークツリーの内容を戻す用途で使い、checkout より役割が明快。',
    tags: ['undo', 'working-tree'],
  },
  {
    id: 'git-restore-staged',
    command: 'git restore --staged',
    description:
      'ステージしてしまった変更を、コミット前にいったんステージから外したいときに使う。',
    explanation: 'ファイル内容は残したまま、ステージ状態だけを解除できる。',
    tags: ['undo', 'staging'],
  },
  {
    id: 'git-reset',
    command: 'git reset',
    description:
      'コミット位置やステージ状態を巻き戻したいときに使う、取り扱い注意のコマンド。',
    explanation:
      'オプション次第で履歴やステージ、作業ツリーへの影響が変わるため慎重に使う。',
    tags: ['undo', 'history'],
  },
  {
    id: 'git-log',
    command: 'git log',
    description: 'これまでのコミット履歴を時系列で確認したいときに使う。',
    explanation:
      'コミットメッセージ、作者、日時などを確認し、履歴の流れを追える。',
    tags: ['history'],
  },
  {
    id: 'git-diff',
    command: 'git diff',
    description: 'どこがどう変わったかを行単位で確認したいときに使う。',
    explanation: '作業ツリー、ステージ、コミット間などの差分確認に使える。',
    tags: ['working-tree', 'review'],
  },
  {
    id: 'git-remote-v',
    command: 'git remote -v',
    description:
      'このリポジトリがどのリモート先につながっているかを確認したいときに使う。',
    explanation: 'origin などのリモート名と URL を一覧で確認できる。',
    tags: ['remote'],
  },
  {
    id: 'git-tag',
    command: 'git tag',
    description:
      'リリース地点など、特定のコミットへわかりやすい印を付けたいときに使う。',
    explanation:
      'タグを付けることで、重要なコミットを名前付きで参照しやすくできる。',
    tags: ['release', 'history'],
  },
  {
    id: 'git-clone',
    command: 'git clone',
    description:
      'まだ手元にないリモートリポジトリを、ローカルへ丸ごと複製したいときに使う。',
    explanation: '新しく作業を始める際に、履歴ごとリポジトリをコピーできる。',
    tags: ['remote', 'setup'],
  },
  {
    id: 'git-init',
    command: 'git init',
    description: '新しいディレクトリで Git 管理を開始したいときに使う。',
    explanation: '空のリポジトリを初期化し、履歴管理を始められる状態にする。',
    tags: ['setup'],
  },
  {
    id: 'git-rm',
    command: 'git rm',
    description:
      'ファイルを削除し、その削除も Git の変更として記録したいときに使う。',
    explanation: '作業ツリーから削除しつつ、削除をステージへ反映できる。',
    tags: ['working-tree', 'staging'],
  },
  {
    id: 'git-mv',
    command: 'git mv',
    description:
      'ファイル名や配置を変更し、その移動を Git の変更として扱いたいときに使う。',
    explanation: '移動や名前変更を Git に認識させながら作業できる。',
    tags: ['working-tree'],
  },
  {
    id: 'git-show',
    command: 'git show',
    description: '特定のコミットやタグの内容を詳細に確認したいときに使う。',
    explanation: '対象オブジェクトのメタ情報と差分をまとめて表示できる。',
    tags: ['history', 'review'],
  },
  {
    id: 'git-blame',
    command: 'git blame',
    description: 'この行を誰がいつ変更したかを追いたいときに使う。',
    explanation: 'ファイルの各行に対応するコミットと作者を確認できる。',
    tags: ['history', 'review'],
  },
  {
    id: 'git-cherry-pick',
    command: 'git cherry-pick',
    description:
      '別ブランチの特定コミットだけを選んで今のブランチへ取り込みたいときに使う。',
    explanation: '必要な変更だけをピンポイントで反映できる。',
    tags: ['integration', 'history'],
  },
  {
    id: 'git-revert',
    command: 'git revert',
    description:
      '公開済み履歴を壊さずに、あるコミットの変更を打ち消す新しいコミットを作りたいときに使う。',
    explanation:
      '履歴を書き換えずに取り消しを表現できるため、共有ブランチ向き。',
    tags: ['undo', 'history'],
  },
  {
    id: 'git-clean',
    command: 'git clean',
    description: 'Git 管理外の不要ファイルをまとめて掃除したいときに使う。',
    explanation: '未追跡ファイルを削除できるが、実行前に対象確認が重要。',
    tags: ['working-tree', 'cleanup'],
  },
  {
    id: 'git-bisect',
    command: 'git bisect',
    description:
      'どのコミットで不具合が入り込んだかを二分探索で絞り込みたいときに使う。',
    explanation: '正常と異常の境界を効率よく特定できる。',
    tags: ['debug', 'history'],
  },
  {
    id: 'git-commit-amend',
    command: 'git commit --amend',
    description:
      '直前のコミットメッセージや内容を少しだけ修正したいときに使う。',
    explanation:
      '最後のコミットを作り直す操作であり、共有後の使用は注意が必要。',
    tags: ['history', 'undo'],
  },
  {
    id: 'git-diff-staged',
    command: 'git diff --staged',
    description: '次のコミットに入る予定の差分だけを先に確認したいときに使う。',
    explanation:
      'ステージ済み変更だけに絞って確認できるため、コミット前の見直しに向く。',
    tags: ['staging', 'review'],
  },
  {
    id: 'git-log-oneline',
    command: 'git log --oneline',
    description:
      '履歴を短く一覧で眺めて、流れだけを素早く把握したいときに使う。',
    explanation: '各コミットを一行で簡潔に表示し、全体像を掴みやすい。',
    tags: ['history'],
  },
  {
    id: 'git-branch-d',
    command: 'git branch -d',
    description:
      '役目を終えたローカルブランチを、安全寄りに削除したいときに使う。',
    explanation:
      'マージ済みブランチのみ削除しようとするため、誤削除の抑止になる。',
    tags: ['branch', 'cleanup'],
  },
  {
    id: 'git-switch-c',
    command: 'git switch -c',
    description:
      '新しいブランチを作成し、そのまま即座に切り替えたいときに使う。',
    explanation: 'ブランチ作成と移動を一度で行える。',
    tags: ['branch'],
  },
  {
    id: 'git-pull-rebase',
    command: 'git pull --rebase',
    description:
      'リモート更新を取り込む際に、余計なマージコミットを避けて自分の履歴を積み直したいときに使う。',
    explanation: 'pull 時に rebase を使うことで、履歴を直線的に保ちやすい。',
    tags: ['remote', 'integration'],
  },
  {
    id: 'git-stash-list',
    command: 'git stash list',
    description:
      '退避していた作業の一覧を確認し、どの stash が残っているか見たいときに使う。',
    explanation: 'stash の内容を番号付きで一覧できる。',
    tags: ['temporary', 'working-tree'],
  },
  {
    id: 'git-remote-add-origin',
    command: 'git remote add origin',
    description:
      'ローカルリポジトリに新しいリモート先を origin として登録したいときに使う。',
    explanation: '最初に GitHub などと接続する場面でよく使う。',
    tags: ['remote', 'setup'],
  },
];
