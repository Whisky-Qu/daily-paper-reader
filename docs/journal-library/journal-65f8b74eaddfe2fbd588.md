---
title: "Control Barrier Function-based Whole-body Control Framework for Humanoid Robots"
authors: "Pin-Tsun Chen, Han-Pang Huang, Jia-Hsun Lo, Shun-Kai Chang"
date: "2025-05-06"
doi: "10.1142/s0219843625400018"
paper_id: "journal-65f8b74eaddfe2fbd588"
source: "International Journal of Humanoid Robotics"
tags: ["query:humanoid"]
tldr: "将控制障碍函数、自碰撞边界球与二次规划结合，在全身控制中同时处理任务执行和安全约束。框架还利用质心动量与力矩传感反馈改善行走稳定性，减少过度简化假设对实际部署的限制。"
evidence: "正式期刊记录已按 DOI 核对；简介为原摘要摘录，非 AI 全文解读。"
title_zh: "基于控制障碍函数的人形机器人全身控制框架"
translation_source: "NLLB-200 600M · 免费离线机器翻译 · 机器人术语表v1"
translation_sha: "592294e3140d6b787cb9ab8e3fe59ecda6ce90f1866bad748f4b3f89e26297fc"
---

<!-- dpr-offline-zh:start -->
## 中文摘要

本文解决了在现实世界中部署高自由度 (DoF) 人形机器人的挑战，这是机器人领域的关键问题.之前的方法往往依赖于过于简单的假设，限制了机器人的适应能力.这项工作强调了对运营效率和安全的灵活控制框架的必要性.显著的进步包括扩大机器人工作空间和稳定性的浮动动力学，以及对中心动力矩阵 (CMM) 的递归算法，增强了运动规划.采用边界球和控制屏障函数 (CBF) 的新型自我碰撞避免算法确保运营安全.一项主要贡献是基于控制障碍函数的四旋翼编程 (QP) 的控制框架的开发，以整合稳步步行的比例衍生控制 (PD).该论文通过分类运动任务来简化轨迹设计，并通过使用新的角度动力速率变化补偿方法提高动态稳定性.这些改进标志着人形机器人机器人领域的重大飞跃，提高了效率，功能和适应性，为其更广泛的融入人类社会铺平了道路。

## 翻译说明

中文概述已依据原摘要核对整理；完整中文摘要由免费离线机器翻译生成，关键术语与数值请结合英文原文核对。
<!-- dpr-offline-zh:end -->

## Abstract

This paper addresses the challenge of deploying high-Degree-of-Freedom (DoF) humanoid robots in real-world scenarios, a critical issue in robotics. Previous approaches often relied on oversimplified assumptions, limiting robots’ adaptability. This work emphasizes the need for a flexible control framework for operational efficacy and safety. Significant advancements include floating-based kinematics for expanded robot workspace and stability, and a recursive algorithm for the Centroidal Momentum Matrix (CMM), enhancing motion planning. A novel self-collision avoidance algorithm employing boundary spheres and Control Barrier Functions (CBFs) ensures operational safety. A major contribution is the development of a control barrier function-based Quadratic Programming (QP)-based control framework integrating Proportional-Derivative (PD) control for stable walking. The paper simplifies trajectory design by categorizing motion tasks and enhances dynamic stability using a new angular momentum rate change compensation method with force-torque sensor feedback. These improvements mark a substantial leap in humanoid robotics, enhancing efficiency, functionality, and adaptability, and paving the way for their broader integration into human society.

## 正式发表与阅读来源

- 期刊：International Journal of Humanoid Robotics
- DOI：[正式出版页面](https://doi.org/10.1142/s0219843625400018)
- 当前仅同步公开摘要；未获取论文全文，聊天不能据此声称已阅读完整论文。
