# 项目体积排查与清理教程

## 问题：克隆项目时很慢，仓库体积高达50MB+？

当你发现 `git clone` 耗时很长，或项目目录很大时，需要系统排查。以下步骤适用于大多数前端/Node.js 项目。

---

## 步骤一：定位大文件

从项目根目录开始，逐层排查：

```bash
# 查看根目录各文件夹大小（排序从小到大）
du -sh .[^.]* * 2>/dev/null | sort -h

# 结果示例（可能是）：
# 1.1M  .git          ← 正常
# 100M  frontend      ← 异常！深入研究
# 584K  targets
```

发现 `frontend` 占 100M，继续深入：

```bash
cd frontend
du -sh .[^.]* * 2>/dev/null | sort -h

# 结果：
# 1.4M  dist          ← 构建产物，可忽略
# 98M   node_modules  ← 元凶！依赖目录
# 276K  src           ← 源码，很小
```

**结论**：`node_modules` 通常占 Node.js 项目的 80% 以上体积。

---

## 步骤二：判断 node_modules 是否在 git 跟踪中

检查 `.gitignore` 是否已排除：

```bash
cat .gitignore | grep node_modules
# 正常情况：应该看到 node_modules/ 或 node_modules
```

如果 `.gitignore` 已包含，但 `git log` 中仍有该文件历史，说明**早期提交时未忽略，已混入历史**。此时用：

```bash
# 确认 git 历史中有 node_modules
git rev-list --objects --all | grep "node_modules"
```

---

## 步骤三：从 git 历史清理（已推送的情况）

如果已经推送到 GitHub，普通的 `git rm` 无法减少远程仓库体积，必须**重写历史**：

```bash
# 1. 从所有提交中删除 node_modules 和 dist
FILTER_BRANCH_SQUELCH_WARNING=1 \
git filter-branch --force \
  --index-filter "git rm -rf --cached --ignore-unmatch frontend/node_modules frontend/dist" \
  --prune-empty \
  --tag-name-filter cat \
  -- --all

# 2. 清理临时数据
rm -rf .git/refs/original/ .git/logs/

# 3. 压缩仓库（关键：这一步能释放空间）
git reflog expire --expire=now --all
git gc --aggressive --prune=now
```

**原理**：`filter-branch` 会遍历每一个提交，将 `node_modules` 从 commit 中移除。`git gc` 则重新压缩，丢弃未引用的 blob。

---

## 步骤四：强制推送（改写远程历史）

```bash
git push origin --force --all
```

> ⚠️ 注意：这会重写 commit hash，协作者需要重新 clone。

---

## 步骤五：本地清理（可选）

如果你想彻底减少本地磁盘占用：

```bash
# 删除本地 node_modules（需要时再 npm install）
rm -rf frontend/node_modules

# 清理后从 ~100M 降至 ~2M
```

---

## 预防措施：正确的 .gitignore 配置

```
node_modules/
dist/
.env
*.log
```

**关键**：在第一次提交前就写好 `.gitignore`，否则一旦大文件入历史，永远占用空间。

---

## 验证：确认仓库是否瘦身成功

```bash
git count-objects -vH
# 理想输出：
# size-pack: 901.23 KiB  ← 不足 1MB，成功
```

| 检查项 | 通过标准 |
|--------|---------|
| .git 目录大小 | < 2MB |
| 无 node_modules 在历史中 | `git rev-list --objects --all | grep "node_modules"` 无输出 |
| .gitignore 已包含 | 至少包含 `node_modules/` 和 `dist/` |

---

## 本次排查结果（你当前的项目）

| 目录 | 本地大小 | 是否在 git 中 | 处理建议 |
|------|----------|-------------|---------|
| `frontend/node_modules` | 98M | ❌ 已清理出历史 | 可安全删除本地文件 |
| `frontend/dist` | 1.4M | ❌ 已清理出历史 | 构建产物，重新构建即可 |
| `.git` 仓库 | 1.1M | ✅ 是 | 正常 |
| `targets/` | 584K | ✅ 是 | 50 个 Python 靶机，正常 |
| `assets/` | 1.3M | ✅ 是 | 前端构建产物，部署到 GitHub Pages 需要 |

**GitHub 仓库当前体积**：约 1MB（已瘦身 99%）。