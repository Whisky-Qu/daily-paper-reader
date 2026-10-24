---
title: "Vision Assisted Control of Lower Extremity Exoskeleton for Obstacle Avoidance With Dynamic Constraint Based Piecewise Nonlinear MPC"
authors: "Yuxiang Hua, He Zhang, Yinghui Li, Jie Zhao, Yanhe Zhu"
date: "2022-10"
doi: "10.1109/lra.2022.3207552"
paper_id: "journal-4661819e1baaccb4643e"
source: "IEEE Robotics and Automation Letters"
tags: ["query:exo-vision"]
tldr: "从部分遮挡的多障碍场景中提取几何特征，再利用人在环规划和分段NMPC调整跨越步态。实验显示足尖与足跟的安全裕度增大、跨障时间缩短，为人机系统多障碍通行提供控制方法。"
evidence: "正式期刊记录已按 DOI 核对；简介为原摘要摘录，非 AI 全文解读。"
title_zh: "结合动态约束分段非线性MPC的视觉避障外骨骼控制"
translation_source: "NLLB-200 600M · 免费离线机器翻译 · 机器人术语表v1"
translation_sha: "67ad4329b20593ed7a58d4ddd3f38324bc89154a8a075d7f76387cd1d8adc6a5"
---

<!-- dpr-offline-zh:start -->
## 中文摘要

本文提出了人形机器人障碍可行性战略 (OPS)，以增强人体与外骨骼集成系统，以在三角形平面上跨越多障碍.综合L形部分的近距离回归和凸体搜索中的同步融合 (HBB-LC) 的混合界限盒，旨在识别部分表面被封闭的阶段障碍物的几何特征.基于非线性模型预测控制 (NMPC) 的人体循环步态模式规划机制，旨在分离地图.为了克服本地振荡，并在NMPC优化过程中实现人形机器人行为过渡，基于瞬间捕获点 (ICP) 转移原则和指导插曲曲率的中间切换标准建立，以触发零件NMPC模型的外部干预.运用OPS的贡献如下: 1) 精确提取空间多障碍物的部分立场和尺寸特征，尺寸偏差在3.4-16.1毫米内，识别精度在89.2%-96.8%内. 2) 旋转脚/后背轨道 (SHO/STO) 过渡避开区域增长28.7%-86.8% (带上/侧路范围 (UR/SR) 0.071-0.154 m/0.057-0.092 m). 3) STO/SHO与障碍顶点之间的安全边缘增长0.0%.4) 过渡障碍的时间缩短0.62-1.03秒 (步态阶段36.2%-43.5%).实验验证表明，OPS对跨越障碍物进行了显著增强。

## 翻译说明

中文概述已依据原摘要核对整理；完整中文摘要由免费离线机器翻译生成，关键术语与数值请结合英文原文核对。
<!-- dpr-offline-zh:end -->

## Abstract

This article proposed a humanoid obstacle passability strategy (OPS) to enhance human-exoskeleton integrated system to cross over multi-obstacle in sagittal plane. A hybrid bounding box integrated with closeness regression in L-shape section and synchronous convergence in convex hull search (HBB-LC) is designed to recognize geometric features of staggered obstacles with partial surface occluded. A human-in-the-loop gait pattern planning mechanism based on nonlinear model predictive control (NMPC) is designed for decoupling mapping. To overcome local oscillation and achieve humanoid behavior transition during NMPC optimization, an intermediate switching criterion based on instantaneous capture point (ICP) transfer principle and guiding interpolation inflection is established to trigger the external intervention of piecewise NMPC models. Exploitation of OPS achieves the contributions below: 1) Sectional attitude and dimension features of spatial multi-obstacle are accurately extracted, with size deviation within 3.4–16.1 mm, recognition accuracy within 89.2%–96.8%. 2) Traversal avoidance region of swing toe/heel orbit (SHO/STO) is enhanced by 28.7%–86.8% (with uplift/sidesway range (UR/SR) by 0.071–0.154 m/0.057–0.092 m). 3) Security margin between STO/SHO and obstacle vertex is improved by 0.05–0.19 m (53.3%–161.1%). 4) Elapsed time of crossing obstacles is reduced by 0.62–1.03 s (with gait phase by 36.2%–43.5%). Experimental verification proves significant augmentation for crossing obstacles by OPS.

## 正式发表与阅读来源

- 期刊：IEEE Robotics and Automation Letters
- DOI：[正式出版页面](https://doi.org/10.1109/lra.2022.3207552)
- 当前仅同步公开摘要；未获取论文全文，聊天不能据此声称已阅读完整论文。
