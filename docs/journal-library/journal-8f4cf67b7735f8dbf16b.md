---
title: "Feasibility-aware whole-body control for terrain-adaptive humanoid locomotion"
authors: "Hongtao Zhang, Lan Wu, Thomas Bräunl"
date: "2026-09-28"
doi: "10.1007/s10514-026-10263-6"
paper_id: "journal-8f4cf67b7735f8dbf16b"
source: "Autonomous Robots"
tags: ["query:humanoid"]
tldr: "仅利用关节编码器和机身IMU估计地形，通过摩擦锥可行性裕度调整全身控制权重。Unitree G1在不平地面和坡道上保持稳定，并在草地、木屑地及15°坡道完成实机验证。"
evidence: "正式期刊记录已按 DOI 核对；简介为原摘要摘录，非 AI 全文解读。"
pdf: "https://link.springer.com/content/pdf/10.1007/s10514-026-10263-6.pdf"
title_zh: "面向地形自适应人形行走的可行性感知全身控制"
translation_source: "NLLB-200 600M · 免费离线机器翻译 · 机器人术语表v1"
translation_sha: "566940c9aac21a406626fd315f163978d955cc4266b5ad343b4518dd4fe11e4b"
---

<!-- dpr-offline-zh:start -->
## 中文摘要

抽象人形机器人 运动在不同地形上通常依赖于外部感知感知或手动调节的控制收益，这两者都限制了鲁棒性在现实世界中部署.本文介绍了一种完全适应地形的本体感知控制方法，使人形机器人能够通过仅使用联合编码器和装载惯性测量单元穿过平坦，不均等和倾斜的表面，而无需任何外部传感或地形特定调整.我们的核心想法是，连续地形不需要被看到来处理:其本地几何仅可以从本体感知信号来推断，控制行为可以连续适应这一估计，以便机器人自动优先考虑斜坡上的接触安全，同时保留平面地面上的名义性能.这种适应是由可行性差距驱动的，它量化了对方形编程优化器的摩擦孔数量，并通过可行性意识的全体控制器 (FAWBC) 实现，从而调节其成本权重.在Unitree G1 人形机器人上的模拟实验显示，在平面地，不平面地形上运动是稳定的.这种方法在物理Unitree G1上进一步验证了平地，草地，木头地形和15美元左右的15美元的坡道，证实了其现实可行性.现实机器人实验的视频可在http://tinyurl.com/FAWBCexperiments上找到。

## 翻译说明

中文概述已依据原摘要核对整理；完整中文摘要由免费离线机器翻译生成，关键术语与数值请结合英文原文核对。
<!-- dpr-offline-zh:end -->

## Abstract

Abstract Humanoid locomotion over varying terrains typically relies on exteroceptive perception or manually tuned control gains, both of which limit robustness in real-world deployment. This paper presents a fully proprioceptive terrain-adaptive control approach that enables humanoid robots to walk across flat, uneven, and inclined surfaces using only joint encoders and a body-mounted inertial measurement unit, without any external sensing or terrain-specific tuning. Our central idea is that continuous terrain does not need to be seen to be handled: its local geometry can be inferred from proprioceptive signals alone, and control behavior can continuously adapt to this estimate so that the robot automatically prioritizes contact safety on inclines while preserving nominal performance on flat ground. This adaptation is driven by a feasibility margin that quantifies how much of the friction cone remains available to the quadratic programming optimizer, and is realized through a feasibility-aware whole-body controller (FAWBC) that modulates its cost weights accordingly. Simulation experiments on the Unitree G1 humanoid demonstrate stable locomotion across flat ground, uneven terrain, and a $$10^\circ $$ 10 ∘ ramp, where a fixed-weight baseline falls. The approach is further validated on the physical Unitree G1 across flat ground, grassland, wood-chip terrain, and a $$15^\circ $$ 15 ∘ ramp, confirming its real-world feasibility. The video of the real-robot experiments is available at https://tinyurl.com/FAWBCexperiments .

## 正式发表与阅读来源

- 期刊：Autonomous Robots
- DOI：[正式出版页面](https://doi.org/10.1007/s10514-026-10263-6)
- 当前仅同步公开摘要；未获取论文全文，聊天不能据此声称已阅读完整论文。
