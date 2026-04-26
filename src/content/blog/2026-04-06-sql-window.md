---
title: "SQL 窓関数を勘違いしていた"
description: "PARTITION BY は GROUP BY の親戚じゃなかった。ROW_NUMBER() で救われた日の記録。"
publishedAt: 2026-04-06
tags: ["db", "sql"]
featured: true
pickupBadge: top
---

## 勘違い

`PARTITION BY` は、行を集約せずに、グループ内の順位や累計を取るためのもの。集約じゃない。`GROUP BY` とは別物。

## 救われた瞬間

```sql
SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS rn
FROM events;
```

これで、ユーザーごとに最新N件、が一発で取れる。
