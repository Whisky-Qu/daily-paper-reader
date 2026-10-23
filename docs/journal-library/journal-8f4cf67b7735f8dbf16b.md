---
title: "Feasibility-aware whole-body control for terrain-adaptive humanoid locomotion"
authors: "Hongtao Zhang, Lan Wu, Thomas Bräunl"
date: "2026-09-28"
doi: "10.1007/s10514-026-10263-6"
paper_id: "journal-8f4cf67b7735f8dbf16b"
source: "Autonomous Robots"
tags: ["query:humanoid"]
tldr: "原摘要摘录：Abstract Humanoid locomotion over varying terrains typically relies on exteroceptive perception or manually tuned control gains, both of which limit robustness in real-world deployment."
evidence: "正式期刊记录已按 DOI 核对；简介为原摘要摘录，非 AI 全文解读。"
pdf: "https://link.springer.com/content/pdf/10.1007/s10514-026-10263-6.pdf"
---

## Abstract

Abstract Humanoid locomotion over varying terrains typically relies on exteroceptive perception or manually tuned control gains, both of which limit robustness in real-world deployment. This paper presents a fully proprioceptive terrain-adaptive control approach that enables humanoid robots to walk across flat, uneven, and inclined surfaces using only joint encoders and a body-mounted inertial measurement unit, without any external sensing or terrain-specific tuning. Our central idea is that continuous terrain does not need to be seen to be handled: its local geometry can be inferred from proprioceptive signals alone, and control behavior can continuously adapt to this estimate so that the robot automatically prioritizes contact safety on inclines while preserving nominal performance on flat ground. This adaptation is driven by a feasibility margin that quantifies how much of the friction cone remains available to the quadratic programming optimizer, and is realized through a feasibility-aware whole-body controller (FAWBC) that modulates its cost weights accordingly. Simulation experiments on the Unitree G1 humanoid demonstrate stable locomotion across flat ground, uneven terrain, and a $$10^\circ $$ 10 ∘ ramp, where a fixed-weight baseline falls. The approach is further validated on the physical Unitree G1 across flat ground, grassland, wood-chip terrain, and a $$15^\circ $$ 15 ∘ ramp, confirming its real-world feasibility. The video of the real-robot experiments is available at https://tinyurl.com/FAWBCexperiments .

## 正式发表与阅读来源

- 期刊：Autonomous Robots
- DOI：[正式出版页面](https://doi.org/10.1007/s10514-026-10263-6)
- 当前仅同步公开摘要；未获取论文全文，聊天不能据此声称已阅读完整论文。
