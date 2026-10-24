---
title: "HUMANOID LOCOMOTION PLANNING FOR VISUALLY GUIDED TASKS"
authors: "JEAN-BERNARD HAYET, CLAUDIA ESTEVES, GUSTAVO ARECHAVALETA, OLIVIER STASSE, EIICHI YOSHIDA"
date: "2012-08-08"
doi: "10.1142/s0219843612500090"
paper_id: "journal-a83a7de9213be9e1c613"
source: "International Journal of Humanoid Robotics"
tags: ["query:humanoid"]
tldr: "联合考虑地标位置、可见性、几何及运动学约束，生成无碰撞路径和落脚点，再通过任务栈视觉伺服计算全身运动。HRP-2实验验证了地标导航与步态执行相结合的方案。"
evidence: "正式期刊记录已按 DOI 核对；简介为原摘要摘录，非 AI 全文解读。"
title_zh: "视觉引导任务中的人形机器人运动规划"
translation_source: "NLLB-200 600M · 免费离线机器翻译 · 机器人术语表v1"
translation_sha: "5176671b02c8f1369d65b0daf090788c56627236eac2f0990cc7881ea9bb2976"
---

<!-- dpr-offline-zh:start -->
## 中文摘要

在这项工作中，我们提出了一个基于地标的导航方法，该方法结合了 (1) 考虑到地标位置和可见性的高级运动规划能力，以及 (2) 基于足迹的可行的视觉服务任务.路径规划器计算一个无碰撞的路径，考虑人形机器人特定的感觉，几何和动力限制.基于运动神经科学最近的结果，表明大多数人类在开放空间中行走时表现出非全体制约，人形机器人方向盘行为被建模为差驱动轮式机器人 (DDR).获得的路径由几何原始物构成，在任务堆 (SoT) 框架内使用路径周围的足迹和目光必须向的地标的位置来计算人形机器人的全身运动.我们提供了一些实验，以验证拟议的战略在HRP-2平台上的有效性。

## 翻译说明

中文概述已依据原摘要核对整理；完整中文摘要由免费离线机器翻译生成，关键术语与数值请结合英文原文核对。
<!-- dpr-offline-zh:end -->

## Abstract

In this work, we propose a landmark-based navigation approach that integrates (1) high-level motion planning capabilities that take into account the landmarks position and visibility and (2) a stack of feasible visual servoing tasks based on footprints to follow. The path planner computes a collision-free path that considers sensory, geometric, and kinematic constraints that are specific to humanoid robots. Based on recent results in movement neuroscience that suggest that most humans exhibit nonholonomic constraints when walking in open spaces, the humanoid steering behavior is modeled as a differential-drive wheeled robot (DDR). The obtained paths are made of geometric primitives that are the shortest in distance in free spaces. The footprints around the path and the positions of the landmarks to which the gaze must be directed are used within a stack-of-tasks (SoT) framework to compute the whole-body motion of the humanoid. We provide some experiments that verify the effectiveness of the proposed strategy on the HRP-2 platform.

## 正式发表与阅读来源

- 期刊：International Journal of Humanoid Robotics
- DOI：[正式出版页面](https://doi.org/10.1142/s0219843612500090)
- 当前仅同步公开摘要；未获取论文全文，聊天不能据此声称已阅读完整论文。
