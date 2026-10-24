---
title: "Initialized Model Reference Adaptive Control for Lower Limb Exoskeleton"
authors: "Mohammad Soleimani Amiri, Rizauddin Ramli, Mohd Faisal Ibrahim"
date: "2019"
doi: "10.1109/access.2019.2954110"
paper_id: "journal-3db2b8ce836b260004c3"
source: "IEEE Access"
tags: ["query:hip-exo"]
tldr: "以Ziegler-Nichols方法初始化PID参数，再通过梯度自适应机制在线调整，并用李雅普诺夫分析验证稳定性。相比未初始化的模型参考自适应控制，所提方案收敛更快，适用于外骨骼PID在线整定。"
evidence: "正式期刊记录已按 DOI 核对；简介为原摘要摘录，非 AI 全文解读。"
pdf: "https://ieeexplore.ieee.org/ielx7/6287639/8600701/08906124.pdf"
title_zh: "下肢外骨骼的初始化模型参考自适应控制"
translation_source: "NLLB-200 600M · 免费离线机器翻译 · 机器人术语表v1"
translation_sha: "a64c600cd33edd5656685da1eefb1abc94b9a79bb01166774e4dc4b9aa576f0a"
---

<!-- dpr-offline-zh:start -->
## 中文摘要

在本文中，为下肢 外骨骼 (LLE) 介绍了由初始化模型参考适应控制 (IMRAC) 调节控制器比例整体衍生物 (PID) 调整方案.LLE结构的数学表达方法是使用拉格兰基方程和基尔乔夫方程来确定的.基于链接的物理特征和执行器的结构转移功能在运动范围 (RoM) 条件下建立.在闭环控制系统中调节LLE的PID控制器，使用Ziegler-Nichols (Z-N) 来初始化IMRAC参数.调整机制是一个基于梯度的方法，用于实时调整调整PID控制器.为了确认IMRAC的稳定性，已应用Lyapunov函数.与传统的非初始化模型参考适应控制相比，拟议的IMRAC显示了更快的融合.可以确定拟议的调整方案适用于实时调整LLE的PID控制器。

## 翻译说明

中文概述已依据原摘要核对整理；完整中文摘要由免费离线机器翻译生成，关键术语与数值请结合英文原文核对。
<!-- dpr-offline-zh:end -->

## Abstract

In this paper, a Proportional-Integral-Derivative (PID) controller tuning scheme by Initialized Model Reference Adaptive Control (IMRAC) for a Lower Limb Exoskeleton (LLE) is presented. Mathematical expression of the LLE structure is determined using Lagrangian and Kirchoff’s equations. The transfer function of the structure based on the physical features of the links, and actuators is established under Range of Motion (RoM) condition. The PID controller of the LLE is tuned in a closed-loop control system using Ziegler-Nichols (Z-N) for initializing parameters of IMRAC. Adjustment mechanism is a gradient based method for real-time adaptation of tuned PID controller. A Lyapunov function has been applied to confirm the stability of IMRAC. The proposed IMRAC shows faster convergence in comparison with conventional non-initialized model reference adaptive control. It can be ascertained the proposed tuning scheme is applicable for real-time tuning of PID controller of LLE.

## 正式发表与阅读来源

- 期刊：IEEE Access
- DOI：[正式出版页面](https://doi.org/10.1109/access.2019.2954110)
- 当前仅同步公开摘要；未获取论文全文，聊天不能据此声称已阅读完整论文。
