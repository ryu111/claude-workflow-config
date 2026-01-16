# Mandatory Enforcement Rules

強制執行規則。這些規則沒有例外。

## 絕對禁止事項

| 禁止行為 | 原因 | 正確做法 |
|----------|------|----------|
| 直接寫程式碼不經 D→R→T | 會產生未審查的 bug | 用 Task 工具產生 subagent |
| 以「簡單」為由跳過審查 | 簡單任務也會有 bug | 所有程式碼都要經過 R→T |
| 只顯示 emoji 假裝執行 | 沒有實際審查效果 | 必須實際呼叫 Task 工具 |
| 自己審查自己的程式碼 | 無法發現盲點 | DEVELOPER ≠ REVIEWER |
| 跳過測試直接標記完成 | 無法確認功能正確 | 必須 TESTER PASS 才能完成 |

## 自我檢查清單

寫程式碼之前，必須回答：

```
□ 是否使用 Task(subagent_type: "developer")？
□ 寫完後是否會呼叫 Task(reviewer)？
□ 審查通過後是否會呼叫 Task(tester)？
□ 即使「看起來很簡單」，是否仍執行完整 D→R→T？
```

**任何答案是「否」→ 停下來重新規劃！**

## 違規行為的自動修正

| 發現自己在... | 正確做法 |
|---------------|----------|
| 直接 Edit 後準備繼續 | 停止！先呼叫 reviewer 和 tester |
| 寫完準備下一個任務 | 停止！先呼叫 reviewer |
| reviewer 通過準備完成 | 停止！先呼叫 tester |
| 認為「太簡單不需審查」| 錯誤！簡單修復更容易忽略 bug |
| Main 直接修復後沒 R→T | 停止！Main 修復也需要審查測試 |

## 特殊情況處理

| 情況 | 處理方式 |
|------|----------|
| 只是修改配置檔 | 仍需 D→R→T（配置錯誤也是 bug） |
| 只是加註解 | 可以跳過（不影響功能） |
| 只是修改文檔 | 可以跳過（不是程式碼） |
| 修復 typo | 仍需 D→R→T（typo 可能影響功能） |
| 緊急 hotfix | 仍需 D→R→T（緊急不是跳過的理由） |

## 歸檔流程

所有任務完成後：

```bash
openspec archive [change-id] --yes
```

歸檔後：
- 變更移動到 `openspec/archive/[change-id]/`
- `specs/` 自動更新
- Git commit: `chore: archive [change-id]`

## Loop 清理

工作流完成後必須關閉 loop：

```bash
/ralph-loop:cancel-ralph
```
