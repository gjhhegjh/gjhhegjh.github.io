---
title: '线性回归：最小二乘的几何意义'
description: '正规方程的推导、投影视角的解释，以及高斯噪声假设下它为什么等价于极大似然'
pubDate: '2026-09-10T00:00:00.000Z'
heroImage: '/blog-placeholder.jpg'
categories: ['机器学习导论']
tags: ['机器学习导论', '机器学习', '线性回归', '最小二乘']
author: '["葛佳惠"]'
---

# 线性回归：最小二乘的几何意义

线性回归通常是机器学习课的第一课，但很多人学完只知道「有现成公式可以用」。这篇文章想把三件事串起来：**正规方程怎么来的、它在几何上表示什么、以及为什么平方误差这个选择不是随意的**。

## 一、问题设定

给定 $m$ 个样本，每个样本有 $n$ 个特征：

$$
X = \begin{bmatrix}
\leftarrow & x_1^{\top} & \rightarrow \\
& \vdots & \\
\leftarrow & x_m^{\top} & \rightarrow
\end{bmatrix} \in \mathbb{R}^{m \times n},\qquad
y = \begin{bmatrix} y_1 \\ \vdots \\ y_m \end{bmatrix} \in \mathbb{R}^{m}
$$

寻找参数 $w \in \mathbb{R}^n$，使预测值 $\hat{y} = Xw$ 尽量接近真实值 $y$。

定义损失函数（均方误差的一半，加 $\tfrac12$ 是为了求导后系数为 1，纯属约定）：

$$
J(w) = \frac{1}{2}\|Xw - y\|_2^2 = \frac{1}{2}\sum_{i=1}^{m}\left(x_i^{\top}w - y_i\right)^2
$$

## 二、正规方程的推导

### 矩阵求导路径

展开目标函数：

$$
\begin{aligned}
J(w) &= \frac{1}{2}(Xw - y)^{\top}(Xw - y) \\
&= \frac{1}{2}\left(w^{\top}X^{\top}Xw - w^{\top}X^{\top}y - y^{\top}Xw + y^{\top}y\right)
\end{aligned}
$$

注意 $w^{\top}X^{\top}y$ 和 $y^{\top}Xw$ 都是标量且互为转置，两者相等，于是：

$$
J(w) = \frac{1}{2}w^{\top}X^{\top}Xw - w^{\top}X^{\top}y + \frac{1}{2}y^{\top}y
$$

对 $w$ 求导，用到两个常用结论 $\frac{\partial}{\partial w}(w^{\top}Aw) = 2Aw$（$A$ 对称）与 $\frac{\partial}{\partial w}(w^{\top}b) = b$：

$$
\nabla_w J = X^{\top}Xw - X^{\top}y
$$

令梯度为零：

$$
X^{\top}Xw = X^{\top}y \quad\Longrightarrow\quad \boxed{\ \hat{w} = (X^{\top}X)^{-1}X^{\top}y\ }
$$

这就是**正规方程**（normal equation）。$(X^{\top}X)^{-1}X^{\top}$ 也叫 $X$ 的 **Moore-Penrose 伪逆** $X^{\dagger}$。

> **💡 常用的矩阵求导公式速查**
>
> | 形式 | 结果 |
> | --- | --- |
> | $\frac{\partial}{\partial w}(a^{\top}w)$ | $a$ |
> | $\frac{\partial}{\partial w}(w^{\top}Aw)$ | $(A + A^{\top})w$，若 $A$ 对称则为 $2Aw$ |
> | $\frac{\partial}{\partial w}\|Aw - b\|^2$ | $2A^{\top}(Aw - b)$ |
>
> 推导时一个可靠办法：**回到标量形式求分量偏导，再重新组装成矩阵形式**。


## 三、几何视角：为什么是投影

这是我觉得最值得记住的部分。

### 关键观察

$Xw$ 是 $X$ 的**列向量的线性组合**，因此无论 $w$ 怎么取，$\hat{y} = Xw$ 都只能落在 $X$ 的**列空间** $\mathcal{C}(X)$ 中。

而真实的标签向量 $y$ 一般在 $\mathbb{R}^m$ 中，通常**不在**这个 $n$ 维子空间里（$m \gg n$ 时尤其如此，观测值有噪声）。

所以方程组 $Xw = y$ 是无解的。我们所能做到最好的事情是：

> 在 $\mathcal{C}(X)$ 中找到离 $y$ **最近**的那个点，作为预测值 $\hat{y}$。

最小化 $\|Xw - y\|$ 就是在找这个最近点，而最近点正是 **$y$ 在 $\mathcal{C}(X)$ 上的正交投影**。

### 由此重新推出正规方程

垂直投影的充要条件：**残差向量 $y - \hat{y} = y - X\hat{w}$ 必须垂直于整个列空间**。

空间中每个向量都形如 $Xv$，垂直条件是内积为零：

$$
(Xv)^{\top}(y - X\hat{w}) = 0,\quad \forall v
$$

$$
v^{\top}X^{\top}(y - X\hat{w}) = 0,\quad \forall v
$$

要对任意 $v$ 成立，括号里必须为零：

$$
X^{\top}(y - X\hat{w}) = \mathbf{0} \ \Longrightarrow\ X^{\top}X\hat{w} = X^{\top}y
$$

**得到了完全一样的方程**。两条完全不同的推理路径（求极小值 vs. 几何投影）殊途同归。

这个视角立刻解释了几件事：

| 现象 | 几何解释 |
| --- | --- |
| 残差之和为 0（含截距项时） | 残差垂直于列空间中的全 1 向量 |
| 增加特征一定能降低训练误差 | 扩大了子空间，最近点只可能更近 |
| 特征共线性让解不稳定 | 列向量接近平行，投影系数的解对扰动极其敏感 |

## 四、为什么偏偏是平方误差

损失函数可以选绝对值误差 $\|Xw - y\|_1$，也可以选 Huber。为什么最小二乘是默认选项？

### 概率视角给出答案

假设真实关系存在不可观测的噪声：

$$
y_i = x_i^{\top}w + \varepsilon_i,\qquad \varepsilon_i \sim \mathcal{N}(0, \sigma^2)
$$

即噪声服从零均值高斯分布。那么给定 $x_i$，观测到 $y_i$ 的似然密度为：

$$
p(y_i \mid x_i; w) = \frac{1}{\sqrt{2\pi}\sigma}\exp\left(-\frac{(y_i - x_i^{\top}w)^2}{2\sigma^2}\right)
$$

假设样本独立，**极大似然估计**（MLE）就是最大化所有样本密度的乘积：

$$
\begin{aligned}
L(w) &= \prod_{i=1}^{m} \frac{1}{\sqrt{2\pi}\sigma}\exp\left(-\frac{(y_i - x_i^{\top}w)^2}{2\sigma^2}\right)
\end{aligned}
$$

取对数（对数似然，乘积变求和）：

$$
\ell(w) = m\ln\frac{1}{\sqrt{2\pi}\sigma} - \frac{1}{2\sigma^2}\sum_{i=1}^{m}(y_i - x_i^{\top}w)^2
$$

前面那项和 $w$ 无关。**最大化 $\ell(w)$ 等价于最小化残差平方和**。

> **💡 结论很重要**
>
> **在高斯噪声假设下，最小二乘 = 极大似然估计**。
>
> 换一个噪声分布，损失函数的形式就变了：
>
> | 噪声假设 | 对应的损失函数 |
> | --- | --- |
> | 高斯分布 $\mathcal{N}(0,\sigma^2)$ | 平方误差 $\|\cdot\|_2^2$ |
> | 拉普拉斯分布 | 绝对值误差 $\|\cdot\|_1$（对离群点更鲁棒） |
> | 伯努利分布（分类） | 交叉熵（logistic 回归） |
>
> 所以"为什么用平方误差"的诚实回答是：**它对应高斯噪声假设**。数据里有强离群点时，这个假设不成立，就该换 Huber 或 L1。


## 五、什么时候不该用正规方程

正规方程是 $O(n^3)$ 的一步式精确解，看起来很美，但有实际约束：

| 情况 | 问题 |
| --- | --- |
| $n$ 很大（$> 10^4$） | 计算 $X^{\top}X$ 需要 $O(mn^2)$，$X^{\top}X$ 本身是 $n \times n$，内存和算力都吃紧 |
| $X^{\top}X$ 接近奇异 | 特征高度共线时求逆数值极不稳定，微小扰动引起解剧烈变化 |
| 稀疏特征 | $X$ 稀疏但 $X^{\top}X$ 可能变稠密，稀疏性被破坏 |

> **⚠️ 永远不要显式求 $(X^{\top}X)^{-1}$**
>
> 教科书公式写成 $(X^{\top}X)^{-1}X^{\top}y$，但**代码里千万不要先算矩阵再求逆**。正确做法是解线性方程组：
>
> ```python
> import numpy as np
>
> # ✗ 不要这样：显式求逆，数值误差大，速度也慢
> w = np.linalg.inv(X.T @ X) @ X.T @ y
>
> # ✓ 这样：lstsq 内部用 QR 或 SVD，数值稳定
> w, residuals, rank, sv = np.linalg.lstsq(X, y, rcond=None)
> ```
>
> `np.linalg.lstsq` 在 $X^{\top}X$ 奇异时也能给出最小范数解。


另外别忘了特征缩放：各特征量纲差异巨大时，$X^{\top}X$ 的**条件数**会很大，同样导致数值不稳定。标准化后再求解是个好习惯。

## 六、动手实践

```python
import numpy as np
from sklearn.datasets import make_regression

# 造个带噪声的数据集
X, y = make_regression(n_samples=200, n_features=3, noise=12.0, random_state=42)
m = X.shape[0]
X_aug = np.c_[np.ones(m), X]            # 加一列 1 作为截距项（bias）

# 正规方程
w_hat = np.linalg.lstsq(X_aug, y, rcond=None)[0]

y_pred = X_aug @ w_hat
residual = y - y_pred

# 评估
n, p = m, X_aug.shape[1]                 # p 含截距项
sigma2 = residual @ residual / (n - p)   # 噪声方差估计
cov = sigma2 * np.linalg.pinv(X_aug.T @ X_aug)
se = np.sqrt(np.diag(cov))               # 每个系数的标准误

rmse = np.sqrt(residual @ residual / n)
ss_res = residual @ residual
ss_tot = ((y - y.mean()) ** 2).sum()
r2 = 1 - ss_res / ss_tot

print(f"R² = {r2:.4f}   RMSE = {rmse:.3f}")
for i, (name, coef, s) in enumerate(zip(["bias", "w1", "w2", "w3"], w_hat, se)):
    print(f"{name:>5}: {coef:8.3f}  (标准误 {s:.3f})")
```

几个值得注意的细节：

- **加截距项**：图像上就是把 $X$ 增广一列全 1。没有它，模型就被强制过原点。
- **标准误与 t 检验**：`se` 给出系数估计的可靠性；$|w_i| / se_i$ 越大，说明该特征的影响越显著。$n - p$ 用于自由度校正。
- **自由度概念**：用 $n$ 而不是 $n-p$ 算 $\sigma^2$ 会低估噪声方差（因为拟合已经"吃掉"了 $p$ 个自由度）。
- **$R^2$ 含义**：模型解释掉的方差占比，取值不超过 1；训练集上随特征数单调上升，所以要警惕过拟合。

## 七、Recap

> **💡 三条等价的理解方式**
>
> 1. **代数**：令梯度为零 → 正规方程 $X^{\top}Xw = X^{\top}y$
> 2. **几何**：$y$ 在 $\mathcal{C}(X)$ 上的正交投影 → 残差垂直于列空间
> 3. **概率**：高斯噪声下的极大似然估计
>
> 三条路给出同一个解，不是巧合——它们是在不同层面上描述同一件事。


正规方程给出闭式解，但 $n$ 很大时这一步走不动。下一篇看解决这个问题的通用办法：梯度下降，以及它的各种改进版本。
