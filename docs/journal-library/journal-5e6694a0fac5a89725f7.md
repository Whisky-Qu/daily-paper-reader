---
title: "SONIC: Supersizing motion tracking for natural humanoid whole-body control"
authors: "Zhengyi Luo, Ye Yuan, Tingwu Wang, Chenran Li, Fernando Castañeda, Sirui Chen, Zi-Ang Cao, Jiefeng Li, David Minor, Qingwei Ben, Jinhyung Park, David Sami, Zi Wang, Xingye Da, Runyu Ding, Cyrus Hogg, Lina Song, Edy Lim, Eugene Jeong, Tairan He, Haoru Xue, Wenli Xiao, Simon Yuen, Jan Kautz, Yan Chang, Umar Iqbal, Linxi “Jim” Fan, Yuke Zhu"
date: "2026-08-12"
doi: "10.1126/scirobotics.aed4592"
paper_id: "journal-5e6694a0fac5a89725f7"
source: "Science Robotics"
tags: ["query:humanoid"]
tldr: "原摘要摘录：Despite the rise of billion-parameter foundation models trained across thousands of graphical processing units (GPUs), similar scaling gains have not been shown for humanoid control. Current neural controllers for humanoids remain modest in size, target a limited set of behaviors, and are trained on a handful of GPUs."
evidence: "正式期刊记录已按 DOI 核对；简介为原摘要摘录，非 AI 全文解读。"
pdf: "https://arxiv.org/pdf/2511.07820"
---

## Abstract

Despite the rise of billion-parameter foundation models trained across thousands of graphical processing units (GPUs), similar scaling gains have not been shown for humanoid control. Current neural controllers for humanoids remain modest in size, target a limited set of behaviors, and are trained on a handful of GPUs. We show that scaling model capacity, data, and compute yields a generalist humanoid controller capable of natural, robust whole-body movements. We position motion tracking as a scalable task for humanoid control, leveraging dense supervision from diverse motion-capture data to acquire human motion priors without manual reward engineering. We build a foundation model for motion tracking by scaling along three axes: network size (1.2 to 42 million parameters), dataset volume (more than 100 million frames from 700 hours of motion capture), and compute (21,000 GPU hours). Beyond demonstrating the benefits of scale, we further show downstream utility through a real-time kinematic planner that bridges motion tracking to tasks such as navigation, enabling natural and interactive control, as well as a unified token space that supports virtual reality (VR) teleoperation and vision-language-action (VLA) models with a single policy. Through this interface, we demonstrate autonomous VLA-driven whole-body locomanipulation requiring coordinated hand and foot placement. Scaling motion tracking exhibits favorable properties: Performance improves steadily with compute and data diversity, and learned policies generalize to unseen motions, establishing motion tracking at scale as a practical foundation for humanoid control.

## 正式发表与阅读来源

- 期刊：Science Robotics
- DOI：[正式出版页面](https://doi.org/10.1126/scirobotics.aed4592)
- 当前仅同步公开摘要；未获取论文全文，聊天不能据此声称已阅读完整论文。
