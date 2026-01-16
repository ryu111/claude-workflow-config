#!/bin/bash
# Remind to call REVIEWER and TESTER after code changes
# This hook is triggered after Edit/Write operations

echo "⚠️ 程式碼已修改 → 記得 D→R→T"
echo "   🧪 TESTER 必須先跑回歸測試（pytest / npm test）再跑功能測試！"
