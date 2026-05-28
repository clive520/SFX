# SFX Lab

一個可部署到 GitHub Pages 的純靜態音效網站。使用者可以直接在瀏覽器中播放長時間背景音效與短時間音效，聲音由 Web Audio API 即時合成，不需要額外音訊檔。

## 本機預覽

```powershell
npx serve .
```

或直接用任何靜態伺服器開啟此資料夾。

## GitHub Pages

1. 建立 GitHub repository。
2. 將這個資料夾 push 到 `main` branch。
3. 到 repository 的 `Settings > Pages`。
4. Source 選 `Deploy from a branch`，branch 選 `main`，資料夾選 `/root`。

GitHub Pages 啟用後，網站會在 repository 顯示的 Pages 網址上線。

## Project Docs

- `PROJECT_PLAN.md`: 網站目標、功能方向、部署策略與後續規劃。
- `WORK_LOG.md`: 每次功能變更與版本紀錄。
- `CREDITS.md`: 音檔來源與授權紀錄。
