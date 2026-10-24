---
title: "SONIC: Supersizing motion tracking for natural humanoid whole-body control"
authors: "Zhengyi Luo, Ye Yuan, Tingwu Wang, Chenran Li, Fernando Castañeda, Sirui Chen, Zi-Ang Cao, Jiefeng Li, David Minor, Qingwei Ben, Jinhyung Park, David Sami, Zi Wang, Xingye Da, Runyu Ding, Cyrus Hogg, Lina Song, Edy Lim, Eugene Jeong, Tairan He, Haoru Xue, Wenli Xiao, Simon Yuen, Jan Kautz, Yan Chang, Umar Iqbal, Linxi “Jim” Fan, Yuke Zhu"
date: "2026-08-12"
doi: "10.1126/scirobotics.aed4592"
paper_id: "journal-5e6694a0fac5a89725f7"
source: "Science Robotics"
tags: ["query:humanoid"]
tldr: "同时扩大模型、动捕数据与训练算力，构建通用人形运动跟踪控制器。策略可泛化到未见动作，并通过实时规划和统一接口连接导航、VR遥操作及视觉语言动作模型，支持全身移动操作。"
evidence: "正式期刊记录已按 DOI 核对；简介为原摘要摘录，非 AI 全文解读。"
pdf: "https://arxiv.org/pdf/2511.07820"
title_zh: "SONIC：通过规模化运动跟踪实现自然的人形全身控制"
translation_source: "NLLB-200 600M · 免费离线机器翻译 · 机器人术语表v1"
translation_sha: "3ca63279bc566b5c8ce7ce3e1372dfb3260d9f8aba2c884c8149559ced5c6b4e"
---

<!-- dpr-offline-zh:start -->
## 中文摘要

尽管在成千上万的图形处理单元 (GPU) 中训练了数十亿参数基础模型的兴起，但对人形机器人控制没有显示出类似的扩展收益.目前人形机器人的神经控制器规模仍然很小，目标是有限的行为，并使用少数GPU训练.我们表明，扩展模型容量，数据和计算产生了一般化的人形机器人控制器，能够实现自然，强大的全身运动.我们将运动跟踪定位为人形机器人控制的可扩展任务，利用来自各种运动捕捉数据的密集监督，我们通过沿三个轴进行扩展来构建运动跟踪的基础模型:网络大小 (1.2至4200万参数)，数据集容量 (从700小时的移动捕获中超过1亿个框架) 和计算 (21,000个GPU小时).除了展示规模的好处外，我们还通过实时动画规划器进一步展示下游的实用性，将运动跟踪连接到导航等任务，实现自然和互动控制，以及支持虚拟现实 (VR) 远程操作和视觉语言行动 (VLA) 模型的统一代币空间.通过这个接口，我们展示了自主 VLA驱动的全身定位操纵，需要协调的手脚定位.扩展运动跟踪表现出有利的属性:性能随着计算和数据多样性稳步提高，并将所学到的政策概括为未见的运动，使运动跟踪在规模上成为人形机器人控制的实际基础。

## 翻译说明

中文概述已依据原摘要核对整理；完整中文摘要由免费离线机器翻译生成，关键术语与数值请结合英文原文核对。
<!-- dpr-offline-zh:end -->

## Abstract

Despite the rise of billion-parameter foundation models trained across thousands of graphical processing units (GPUs), similar scaling gains have not been shown for humanoid control. Current neural controllers for humanoids remain modest in size, target a limited set of behaviors, and are trained on a handful of GPUs. We show that scaling model capacity, data, and compute yields a generalist humanoid controller capable of natural, robust whole-body movements. We position motion tracking as a scalable task for humanoid control, leveraging dense supervision from diverse motion-capture data to acquire human motion priors without manual reward engineering. We build a foundation model for motion tracking by scaling along three axes: network size (1.2 to 42 million parameters), dataset volume (more than 100 million frames from 700 hours of motion capture), and compute (21,000 GPU hours). Beyond demonstrating the benefits of scale, we further show downstream utility through a real-time kinematic planner that bridges motion tracking to tasks such as navigation, enabling natural and interactive control, as well as a unified token space that supports virtual reality (VR) teleoperation and vision-language-action (VLA) models with a single policy. Through this interface, we demonstrate autonomous VLA-driven whole-body locomanipulation requiring coordinated hand and foot placement. Scaling motion tracking exhibits favorable properties: Performance improves steadily with compute and data diversity, and learned policies generalize to unseen motions, establishing motion tracking at scale as a practical foundation for humanoid control.

## 正式发表与阅读来源

- 期刊：Science Robotics
- DOI：[正式出版页面](https://doi.org/10.1126/scirobotics.aed4592)
- 当前仅同步公开摘要；未获取论文全文，聊天不能据此声称已阅读完整论文。
