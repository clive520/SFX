# Work Log

## 2026-05-28

- 建立 SFX Lab 純靜態網站基礎架構：`index.html`、`styles.css`、`app.js`。
- 建立長時間背景音效與短時間音效兩大區。
- 使用 Web Audio API 建立初版合成音效。
- 建立主音量控制與音訊視覺化。
- 初始化 Git repository，branch 設為 `main`。
- 新增 `.gitignore` 與 `README.md`。
- Commit: `86648a5 Create SFX Lab static site`

- 改善主音量靜音狀態，讓狀態更明顯。
- Commit: `f8836db Clarify master mute state`

- 將主音量靜音按鈕改為滑動開關。
- Commit: `5988c68 Replace mute button with sound switch`

- 簡化主音量開關旁文字，只保留「主音量」。
- Commit: `6d110a0 Simplify master switch label`

- 新增長時間背景音效：颱風強風、快樂純音樂、悲傷純音樂、沉重純音樂。
- Commit: `191d7f3 Add more ambient sound generators`

- 改用下載到本機的 Mixkit MP3 音檔，取代不滿意的合成音樂。
- 新增 `assets/audio/` 音檔資料夾。
- 新增 `CREDITS.md` 記錄音檔來源與授權。
- Commit: `c39ebfb Use downloaded ambient audio loops`

- 將音效卡片改為緊湊顯示。
- 說明文字改為 hover / focus 時浮現。
- 新增拖曳排序功能，排序保存在 localStorage。
- 手機版調整為兩欄緊湊顯示。
- Commit: `f6484f1 Add compact draggable sound cards`

- 新增網站計畫書 `PROJECT_PLAN.md`。
- 新增工作日誌 `WORK_LOG.md`。
- 確認目前尚未設定 GitHub remote，需建立 GitHub repository 後再推送。

- 檢查 GitHub CLI 設定需求。
- 確認此 Windows 環境已有 `winget` 與 Scoop，但尚未安裝 `gh`。
- 確認官方建議可用 `winget install --id GitHub.cli --source winget` 安裝 GitHub CLI。
- 下一步需安裝 `gh`，再執行 `gh auth login` 完成 GitHub 登入。

- 使用者透過 `winget install --id GitHub.cli --source winget` 安裝 GitHub CLI 2.93.0。
- 確認 `gh.exe` 安裝於 `C:\Program Files\GitHub CLI\gh.exe`。
- 將 `C:\Program Files\GitHub CLI` 加入使用者 PATH，並確認 `gh --version` 可正常執行。

- 使用者完成 `gh auth login --web --git-protocol https` GitHub 授權。
- 確認 GitHub CLI 已登入 `clive520`，Git protocol 使用 HTTPS。
- 使用 `gh repo create SFX --public --source=. --remote=origin --push` 建立 GitHub repository。
- GitHub repository: https://github.com/clive520/SFX
- 啟用 GitHub Pages，來源為 `main` branch `/` root。
- GitHub Pages URL: https://clive520.github.io/SFX/

- 將工作日誌更新推送到 GitHub。
- 等待 GitHub Pages 建置完成，狀態由 `building` / 短暫 `errored` 轉為 `built`。
- 驗證公開網站首頁、`app.js`、`styles.css` 與 MP3 音檔均可從 GitHub Pages 回傳 HTTP 200。

- 移除音效卡片 hover / focus 時浮出的說明文字，避免影響快速操作與拖曳排序。

- 收集並下載 6 個 Mixkit 短音效：來回踱步、乒乓掉落、打雷聲、強勁風聲、電話鈴聲、手機鈴聲。
- 新增 `assets/audio/short/` 保存短音效 MP3。
- 將 6 個新音效加入短時間音效區，並更新 `CREDITS.md` 授權來源。
- 推送到 GitHub 後等待 Pages 重新部署完成，確認 6 個短音效 MP3 均可從 GitHub Pages 回傳 HTTP 200。

- 檢查新短音效長度，確認多個音檔超過 3 秒。
- 將短音效播放邏輯限制為最多 3 秒，超過時自動淡出停止，避免聲音混亂。

## 2026-05-29

- 將剩餘 4 個長時間背景音效改成真實 Mixkit MP3：城市細雨、低潮海岸、夜間蟲鳴、科幻環境。
- 新增 `assets/audio/city-rain.mp3`、`assets/audio/ocean-coast.mp3`、`assets/audio/night-crickets.mp3`、`assets/audio/sci-fi-ambience.mp3`。
- 移除不再使用的背景音合成函式，長時間背景音效目前皆使用真實 MP3 或已下載音檔。
- 更新 `CREDITS.md` 授權來源。

- 評估後續短音效擴充方向：掌聲、成功提示、錯誤提示、門鈴、敲門、倒數嗶聲、相機快門、警報、笑聲、驚訝音、爆炸、煞車聲。
- 新增 2 個 Mixkit 短音效：玻璃破碎、物品落地。
- 新增 `assets/audio/short/glass-break.mp3` 與 `assets/audio/short/object-drop-floor.mp3`。
- 更新 `CREDITS.md` 授權來源。
