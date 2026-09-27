---
title: '排序算法：三种 O(n log n) 的分治思路'
description: '快排、归并、堆排序的核心差异，以及稳定性到底在决定什么'
pubDate: '2026-09-18T00:00:00.000Z'
heroImage: '/blog-placeholder.jpg'
categories: ['数据结构与算法']
tags: ['数据结构与算法', '排序', '分治']
author: '["葛佳惠"]'
---

# 排序算法：三种 $O(n \log n)$ 的分治思路

排序算法多到让人记不住，但真正高频的其实只有三个：快排、归并、堆排。它们都达到 $O(n \log n)$，但是从完全不同的角度达到的。

## 一、先理清整体版图

| 算法 | 最好 | 平均 | 最坏 | 空间 | 稳定 | 核心手段 |
| --- | --- | --- | --- | --- | --- | --- |
| 冒泡排序 | $O(n)$ | $O(n^2)$ | $O(n^2)$ | $O(1)$ | ✅ | 相邻交换，一趟浮出一个最大 |
| 插入排序 | $O(n)$ | $O(n^2)$ | $O(n^2)$ | $O(1)$ | ✅ | 逐个插入已排好的前缀 |
| 选择排序 | $O(n^2)$ | $O(n^2)$ | $O(n^2)$ | $O(1)$ | ❌ | 每趟选出最小放到前面 |
| **快速排序** | $O(n\log n)$ | $O(n\log n)$ | $O(n^2)$ | $O(\log n)$ | ❌ | 分区 + 递归两半 |
| **归并排序** | $O(n\log n)$ | $O(n\log n)$ | $O(n\log n)$ | $O(n)$ | ✅ | 分治 + 有序序列合并 |
| **堆排序** | $O(n\log n)$ | $O(n\log n)$ | $O(n\log n)$ | $O(1)$ | ❌ | 堆的取出最值 |
| 计数/桶/基数 | $O(n + k)$ | $O(n + k)$ | $O(n + k)$ | $O(k)$ | ✅ | 不基于比较，依赖数据特性 |

标粗的三个就是本文重点。

> **💡 基于比较的排序下界是 Ω(n log n)**
>
> 用**决策树**可以证明：任意基于比较的排序算法，都可以对应到一棵二叉树，叶子节点是所有可能的排列数 $n!$。树的高度 $h$ 满足 $2^h \ge n!$，由 Stirling 近似：
>
> $$
> h \ge \log_2(n!) = \Theta(n \log n)
> $$
>
> 这意味着**不可能存在**基于比较的 $O(n)$ 通用排序算法。计数排序、桶排序、基数排序之所以能突破这个下界，是因为它们没有用「比较两个元素」的方式获取信息。


## 二、快速排序：分区的艺术

快排的全部智慧集中在 **partition（分区）**，排序过程只是 recursively 调用它。

### 核心逻辑

1. 选一个元素作为 **pivot（基准）**
2. 重排数组：小于 pivot 的放左边，大于的放右边
3. 对左右两个子区间递归执行 1-2

递归终止条件：区间长度 $\le 1$。

### Lomuto 分区实现

```ts
function partition(arr: number[], lo: number, hi: number): number {
  const pivot = arr[hi]        // 取最右元素为 pivot
  let i = lo                   // i 指向"小于区"的右边界

  for (let j = lo; j < hi; j++) {
    if (arr[j] < pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]]
      i++
    }
  }
  [arr[i], arr[hi]] = [arr[hi], arr[i]]   // pivot 就位
  return i
}

function quickSort(arr: number[], lo = 0, hi = arr.length - 1): void {
  if (lo >= hi) return
  const p = partition(arr, lo, hi)
  quickSort(arr, lo, p - 1)
  quickSort(arr, p + 1, hi)
}
```

> **📌 这段代码在做什么（拖动 j 指针的过程）**
>
> `j` 是探索指针，`i` 是已确认「小于 pivot」区域的右边界。
>
> ```
> 初始:  [3, 7, 2, 9, 5 | 6]   pivot=6, i=0
> j=0:   3 < 6 → 交换自身, i→1   [3, 7, 2, 9, 5, 6]
> j=1:   7 ≥ 6 → 不动            
> j=2:   2 < 6 → 换到 i 位, i→2  [3, 2, 7, 9, 5, 6]
> j=3:   9 ≥ 6 → 不动
> j=4:   5 < 6 → 换到 i 位, i→3  [3, 2, 5, 9, 7, 6]
> 最后:  把 pivot 换到 i 位       [3, 2, 5, 6, 7, 9]
>                                       ↑ i，正好归位
> ```
>
> 循环结束后 `[lo, i)` 全小于 pivot，`[i, hi)` 全大于等于 pivot。


### 为什么平均是 $O(n \log n)$ 而最坏是 $O(n^2)$

关键在于**分区是否均衡**：

- **最好/平均**：每次分区大致对等 → 递归树高度 $\log n$，每层总分区代价 $O(n)$ → $O(n \log n)$
- **最坏**：每次选到的 pivot 恰好是当前最大或最小 → 一侧空，另一侧 $n-1$ → 递归树退化成链，高度 $n$ → $O(n^2)$

**最坏什么时候发生？** 对已经排好序的数组总是取最后一个元素当 pivot —— 这是初学者实现最容易踩的雷。

### 两个实用优化

```ts
function quickSortOptimized(arr: number[], lo = 0, hi = arr.length - 1): void {
  // 优化 1：小区间切换到插入排序
  // 原因：n 小时快排的递归开销占比大，插入排序的常数更小
  if (hi - lo <= 12) {
    insertionSortRange(arr, lo, hi)
    return
  }

  // 优化 2：随机化 pivot，打破"输入已排序"的最坏输入
  const r = lo + Math.floor(Math.random() * (hi - lo + 1))
  ;[arr[r], arr[hi]] = [arr[hi], arr[r]]

  const p = partition(arr, lo, hi)
  quickSortOptimized(arr, lo, p - 1)
  quickSortOptimized(arr, p + 1, hi)
}
```

> **💡 三数取中**
>
> 工程实践中更常用 **median-of-three**：取 `lo`、`mid`、`hi` 三个位置元素的中位数作为 pivot，比纯随机更可控，且不依赖随机数生成器。工业级实现（如 C++ `std::sort` 的内省排序 introsort）还会在递归过深时**自动切换成堆排序**，防止 $O(n^2)$ 退化。


## 三、归并排序：有价值的稳定选手

快排是「先辛苦分区，之后就轻松」，归正是反过来「分得轻松，合并时才干活」。

```ts
function mergeSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr

  const mid = arr.length >> 1
  const left = mergeSort(arr.slice(0, mid))
  const right = mergeSort(arr.slice(mid))

  return merge(left, right)
}

function merge(a: number[], b: number[]): number[] {
  const res: number[] = []
  let i = 0, j = 0

  while (i < a.length && j < b.length) {
    // ⬇ 相等时取左边 → 保证稳定性
    if (a[i] <= b[j]) res.push(a[i++])
    else res.push(b[j++])
  }
  return res.concat(a.slice(i)).concat(b.slice(j))
}
```

三个特点：

1. **稳定**：`a[i] <= b[j]` 的等号很关键，相等时优先取左半边的元素，保持了原有相对次序
2. **最坏仍是 $O(n \log n)$**：递归树形状只取决于 $n$，与输入数据无关，这是相对快排的决定性优势
3. **额外空间 $O(n)$**：这是唯一短板

> **💡 归并排序也是外部排序的基础**
>
> 数据量超过内存时（比如给 100GB 日志排序），只能把它切成能装进内存的块分别排序，再多路归并写回磁盘 —— 核心技术就是 merge 这一步。这种情况快排无法使用，因为它要求随机访问。


## 四、堆排序：省空间的 playstyle

```ts
function heapSort(arr: number[]): void {
  const n = arr.length

  // 建堆：从最后一个非叶节点开始下沉，O(n)
  for (let i = (n >> 1) - 1; i >= 0; i--) {
    siftDown(arr, i, n)
  }

  // 反复把堆顶最大值换到末尾，缩小堆范围
  for (let end = n - 1; end > 0; end--) {
    [arr[0], arr[end]] = [arr[end], arr[0]]
    siftDown(arr, 0, end)
  }
}

function siftDown(arr: number[], root: number, size: number): void {
  while (true) {
    let largest = root
    const l = 2 * root + 1
    const r = 2 * root + 2

    if (l < size && arr[l] > arr[largest]) largest = l
    if (r < size && arr[r] > arr[largest]) largest = r
    if (largest === root) break

    [arr[root], arr[largest]] = [arr[largest], arr[root]]
    root = largest
  }
}
```

堆排是**原地**的（$O(1)$ 额外空间）且**最坏情况仍是 $O(n \log n)$**，理论指标很好看。但实际用得不多，原因是：

- 访问模式是跳跃的（父子节点下标差约 2 倍），**缓存局部性差**，常数因子大
- 不稳定

> **⚠️ 注意一个容易搞混的结论**
>
> 堆排序**建堆**的复杂度是 $O(n)$ 而不是 $O(n \log n)$。
>
> 粗略理解为：最底层有约 $n/2$ 个节点但下沉高度为 0，倒数第二层 $n/4$ 个节点下沉高度为 1……总代价是
>
> $$
> \sum_{h=0}^{\log n} \frac{n}{2^{h+1}} \cdot h = O(n)
> $$
>
> 精确求和后会收敛到 $2n$ 左右。这是"直觉上以为该是 $O(n \log n)$、实际却是线性"的经典例子。


## 五、稳定性到底有什么用

稳定性 = 相等元素的相对次序在排序后保持不变。

它真正重要的场景是**多关键字排序**：

> 例：有一批学生记录，先按班级排，再按成绩排。如果第二次排序稳定，那么同成绩的学生自然保持了原来的班级顺序 —— 得到"成绩优先、同分按班级"的结果。

如果排序不稳定，这个技巧就失效，必须一次性用复合 key 比较。

| | 稳定 | 不稳定 |
| --- | --- | --- |
| $O(n^2)$ 级 | 冒泡、插入 | 选择 |
| $O(n\log n)$ 级 | 归并、计数 | 快排、堆排 |

**选择排序为什么不稳定？** 因为它采用"把最小值换到前面"的直接交换，可能跨越大量元素，把相等元素的前后关系打乱。反例：`[5a, 8, 5b, 2]` → 一趟后 `2` 和 `5a` 交换，`5a` 跑到 `5b` 后面。

## 六、Recap

> **💡 一句话总结**
>
> - 追求平均最快+省内存 → **快排**（记得随机化 pivot）
> - 要求稳定 or 担心最坏情况 → **归并**
> - 内存极度受限 or 需要 Top-K → **堆**
> - n 很小（< 20）→ **插入排序**反而最快


理解分治之后，下一步是把它套到更复杂的结构上 —— 平衡二叉搜索树就是在 "动态插入" 的约束下，维持分治结构的典型例子。
