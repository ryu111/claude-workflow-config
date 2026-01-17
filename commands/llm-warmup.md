---
description: 載入 Local LLM 模型（從 🔴 紅燈變成 🟢 綠燈）
user-invocable: true
---

# LLM Model Warmup

載入 Local LLM 模型到記憶體。

## 執行步驟

1. 呼叫 LLM Service 的 warmup API
2. 等待模型載入完成
3. 回報狀態

```bash
curl -X POST http://127.0.0.1:8765/warmup
```

## 注意

- 模型約 25GB，載入需要數秒
- 載入後會佔用約 25GB RAM
- 載入完成後狀態變為 🟢 綠燈
