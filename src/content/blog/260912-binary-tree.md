---
title: '二叉树的四种遍历：从递归到 Morris'
description: 'DFS 的三种顺序、迭代写法怎么思考，以及不用栈的 Morris 遍历'
pubDate: '2026-09-12T00:00:00.000Z'
heroImage: '/blog-placeholder.jpg'
categories: ['数据结构与算法']
tags: ['数据结构与算法', '树', 'DFS', 'BFS']
author: '["葛佳惠"]'
---

# 二叉树的四种遍历：从递归到 Morris

遍历二叉树看起来是入门题，但把递归、迭代、Morris 三种写法都理解通透，对「递归的本质是栈」这件事会有很不一样的认识。

约定：本文讨论的遍历结果都是**节点值序列**，`NIL` 表示空子树。

## 一、先建立直觉

四种遍历的区别只在于**访问根节点的时机**：

| 遍历 | 访问顺序 | 递归理解 |
| --- | --- | --- |
| 前序 Pre-order | 根 → 左 → 右 | 先处理当前节点，再递归左子、右子 |
| 中序 In-order | 左 → 根 → 右 | 左子处理完才轮到根 |
| 后序 Post-order | 左 → 右 → 根 | 两个孩子都处理完才处理根 |
| 层序 Level-order | 从上到下、从左到右 | BFS，按层铺开 |

记忆诀窍：前中后指的是**根节点在三者中的相对位置**。

> **💡 中序遍历的特殊性**
>
> 对**二叉搜索树（BST）** 做中序遍历，得到的序列是**升序**的。这是 BST 最重要的性质，很多 BST 题目（验证是否合法、第 k 小元素、恢复被交换的两个节点）都是从这个性质出发的。


## 二、递归写法

递归最直观，几乎就是把定义翻译成代码：

```ts
interface TreeNode {
  val: number
  left: TreeNode | null
  right: TreeNode | null
}

// 前序：根 左 右
function preorder(root: TreeNode | null, out: number[] = []): number[] {
  if (!root) return out
  out.push(root.val)          // 1. 访问根
  preorder(root.left, out)    // 2. 左子树
  preorder(root.right, out)   // 3. 右子树
  return out
}

// 中序：左 根 右
function inorder(root: TreeNode | null, out: number[] = []): number[] {
  if (!root) return out
  inorder(root.left, out)
  out.push(root.val)
  inorder(root.right, out)
  return out
}

// 后序：左 右 根
function postorder(root: TreeNode | null, out: number[] = []): number[] {
  if (!root) return out
  postorder(root.left, out)
  postorder(root.right, out)
  out.push(root.val)
  return out
}
```

三段代码唯一的区别是 `out.push` 的位置。三种遍历**访问每个节点恰好一次**，所以：

- 时间复杂度：$\Theta(n)$
- 空间复杂度：$\Theta(h)$，$h$ 是树高

> **⚠️ 空间复杂度为什么是树高不是节点数**
>
> 递归调用栈的深度等于**当前递归路径的长度**，而不是节点总数。平衡树 $h = \log n$，退化为链表的斜树 $h = n$（这时容易栈溢出）。


## 三、迭代写法：用栈模拟递归

面试官爱考这个，但死记模板很容易忘。理解原理后能自己推出来。

### 中序遍历的推导

递归做的事情是：走到最左边 → 访问 → 转向右子树。显式栈写法：

```ts
function inorderIter(root: TreeNode | null): number[] {
  const res: number[] = []
  const stack: TreeNode[] = []
  let cur = root

  while (cur || stack.length) {
    // 一路向左，沿途节点入栈（模拟递归进入）
    while (cur) {
      stack.push(cur)
      cur = cur.left
    }
    // 到最左端，弹栈访问（模拟递归返回）
    cur = stack.pop()!
    res.push(cur.val)
    // 转向右子树，重复同一过程
    cur = cur.right
  }
  return res
}
```

### 前序遍历：改造中序

前序是"根左右"，那么不应该走到最左才访问，**入栈时就立即访问**：

```ts
function preorderIter(root: TreeNode | null): number[] {
  const res: number[] = []
  const stack: TreeNode[] = []
  let cur = root

  while (cur || stack.length) {
    while (cur) {
      res.push(cur.val)     // ← 唯一差别：入栈即刻访问
      stack.push(cur)
      cur = cur.left
    }
    cur = stack.pop()!
    cur = cur.right
  }
  return res
}
```

另外还有一种更常见的写法（先压右孩子再压左孩子，利用栈的后进先出）：

```ts
function preorderIterStack(root: TreeNode | null): number[] {
  if (!root) return []
  const res: number[] = []
  const stack: TreeNode[] = [root]

  while (stack.length) {
    const node = stack.pop()!
    res.push(node.val)
    if (node.right) stack.push(node.right)  // 右后进先出 → 后访问
    if (node.left) stack.push(node.left)    // 左先进后出 → 先访问
  }
  return res
}
```

### 后序遍历：前序的镜像技巧

后序"左右根"，如果把它**整体反转**得到"根右左"。而"根右左"正好是前序遍历"根左右"把左右孩子顺序对调的版本。

```ts
function postorderIter(root: TreeNode | null): number[] {
  if (!root) return []
  const res: number[] = []
  const stack: TreeNode[] = [root]

  while (stack.length) {
    const node = stack.pop()!
    res.push(node.val)
    if (node.left) stack.push(node.left)   // 先压左
    if (node.right) stack.push(node.right) // 后压右 → 先访问右
  }
  return res.reverse()   // 根右左 反序 → 左右根
}
```

> **📌 这个技巧为什么成立**
>
> 前序 `根左右`，压栈先右后左 → 弹出顺序是**根左右**。
> 把压栈改成先左后右 → 弹出顺序变成**根右左**。
> `根右左` 翻转正好是 `左右根` = 后序。
>
> 代价：`reverse()` 需要 $O(n)$ 额外空间（或者用一个双端队列从头部插入）。


## 四、层序遍历：BFS

层序遍历用**队列**而非栈：

```ts
function levelOrder(root: TreeNode | null): number[][] {
  if (!root) return []
  const res: number[][] = []
  const queue: TreeNode[] = [root]

  while (queue.length) {
    const size = queue.length   // ← 关键：先固定当前层的节点数
    const level: number[] = []

    for (let i = 0; i < size; i++) {
      const node = queue.shift()!
      level.push(node.val)
      if (node.left) queue.push(node.left)
      if (node.right) queue.push(node.right)
    }
    res.push(level)
  }
  return res
}
```

`size = queue.length` 这一个赋值是分层的关键：循环开始前冻结当前层节点数量，循环内新入队的都是下一层的节点，不会被本轮处理。

> **⚠️ shift() 的性能陷阱**
>
> JS 数组 `shift()` 是 $O(n)$ 操作（需要搬移后续元素），整体会退化到 $O(n^2)$。节点多的时候改用手写队列指针：
>
> ```ts
> let head = 0
> const queue: TreeNode[] = [root]
> // 用 queue[head++] 代替 shift()
> ```
> Python 里对应地用 `collections.deque` 而不是 `list.pop(0)`。


## 五、Morris 遍历：O(1) 空间

Morris 中序遍历是 1979 年由 J.H. Morris 提出的方法，不用递归也不用栈，把空间压到 $O(1)$。

核心思想：**利用叶子节点的空闲右指针，临时建立指回祖先的"线索"**（threaded binary tree 的经典手法），走完再拆除恢复原结构。

```ts
function morrisInorder(root: TreeNode | null): number[] {
  const res: number[] = []
  let cur = root

  while (cur) {
    if (!cur.left) {
      // 没有左子树，直接访问并转向右子树
      res.push(cur.val)
      cur = cur.right
    } else {
      // 找到当前节点左子树中的"最右节点"（中序前驱）
      let pred = cur.left
      while (pred.right && pred.right !== cur) {
        pred = pred.right
      }

      if (!pred.right) {
        // 第一次到达：建立线索，进入左子树
        pred.right = cur
        cur = cur.left
      } else {
        // 第二次到达：线索还在说明左子树已走完，拆掉线索
        pred.right = null
        res.push(cur.val)
        cur = cur.right
      }
    }
  }
  return res
}
```

### 为什么只需要 O(1)

每个节点的左子树右链被"走两遍"：第一遍是为了找前驱并建立线索，第二遍是沿线索回到祖先。每条边最多被经过常数次，因此总时间是 $O(n)$，辅助空间只有一个指针变量。

> **💡 什么时候真的用得上**
>
> Morris 遍历在面试里属于加分项，工程上用得不多，因为**它会临时修改树结构**，在并发环境或者树被多处引用的场景下很危险。但它的思路（**复用数据结构里闲置的指针**）在内存极度受限的嵌入式场景是有价值的。


## 六、Recap

| 写法 | 时间 | 空间 | 优点 | 缺点 |
| --- | --- | --- | --- | --- |
| 递归 | $O(n)$ | $O(h)$ | 代码最短，最自然 | 树深时栈溢出 |
| 迭代（显式栈） | $O(n)$ | $O(h)$ | 有完全掌控力 | 代码长，易写错 |
| Morris | $O(n)$ | $O(1)$ | 省空间 | 临时改树，难读懂 |
| 层序 BFS | $O(n)$ | $O(w)$，$w$ 为最大宽度 | 按层处理问题必备 | 队列会较宽 |

选择建议：**默认写递归**，代码最不容易出错；担心栈溢出或需要中途暂停/恢复遍历时用迭代；面试追求「空间最低」或处理超大规模数据时再考虑 Morris。

> **🚨 常见失分点**
>
> 1. 迭代写法里 `while` 条件是 `cur || stack.length` 而不是只写 `cur` —— 后者会在弹完最后一个节点后立即退出，漏掉右子树。
> 2. 后序反转技巧忘记 `reverse()`。
> 3. BFS 分层忘了固定 `size`。
> 4. Morris 遍历结束后忘了检查树是否被复原（短链 pointers 没拆干净会导致后续操作死循环）。

