---
title: "Accurate Perception and Association of Objects for Humanoid Robots Under Dynamic Visual SLAM"
authors: "Kaiqi Chen, Jialing Liu, Qiyi Tong, Xu Cheng, Jianhua Zhang"
date: "2023-10-31"
doi: "10.1142/s0219843623500196"
paper_id: "journal-9e4c927bdd4c8851862f"
source: "International Journal of Humanoid Robotics"
tags: ["query:humanoid"]
tldr: "区分动态和静态物体，分别利用语义地图点及物体位姿进行关联，并随观测增加持续验证关联结果。在仿真人形视角序列和KITTI数据集上，物体关联与轨迹估计的准确性和鲁棒性得到改善。"
evidence: "正式期刊记录已按 DOI 核对；简介为原摘要摘录，非 AI 全文解读。"
title_zh: "动态视觉SLAM下的人形机器人物体感知与关联"
translation_source: "NLLB-200 600M · 免费离线机器翻译 · 机器人术语表v1"
translation_sha: "37df3070fbdc01352283ee1d3fdd69d32825c032be7102087d1bde5e3204bf2b"
---

<!-- dpr-offline-zh:start -->
## 中文摘要

人形机器人仍然对其周围环境的感知很低，这对执行复杂任务是一个巨大的障碍.为了提高他们的感知能力，可以将高层次的语义信息纳入他们的感知框架，以便他们能够准确地推断和理解他们的环境.在可用的各种技术中，语义同步定位和映射 (SLAM) 成为实现这种感知增强的有前途.虽然语义SLAM可以提高机器人执行任务的能力，但在复杂和动态环境中，语义对象的准确感知和联系仍然具有挑战性.因此，需要一个能够快速精确地将物体测量与地标联系在一起的解决方案，为此，我们提出了一个针对动态环境明确设计的语义感知方法， 能够区分动态和静态物体.此外，我们提出了两种关联策略:基于语义地图点的动态对象关联和基于对象位置信息的静态对象关联.随着与标志相关的对象测量数量增加，我们执行了关联验证算法来验证关联的标志，拟议的方法在人形机器人视角和KITTI数据集中获得的模拟室内序列上进行了广泛评估.实验结果显示，我们的方法显著提高了鲁棒性和对象关联和轨迹估计的准确性。

## 翻译说明

中文概述已依据原摘要核对整理；完整中文摘要由免费离线机器翻译生成，关键术语与数值请结合英文原文核对。
<!-- dpr-offline-zh:end -->

## Abstract

Humanoid robots still have a low-level perception of their surroundings, which is a formidable obstacle to performing complex tasks. To improve their perceptual capabilities, high-level semantic information can be incorporated into their perceptual framework so that they can gain the ability to infer and understand their environment accurately. Among the various techniques available, semantic Simultaneous Localization and Mapping (SLAM) becomes a promising avenue for achieving this perception enhancement. While semantic SLAM can enhance a robot’s ability to perform tasks, the accurate perception, and association of semantic objects in complex and dynamic environments remain challenging. Hence, the need arises for a solution that swiftly and precisely associates object measurements with landmarks, considering their motion properties, and promptly rectifies erroneous associations in real time. To this end, we propose a semantic perception approach designed explicitly for dynamic environments, adept at distinguishing between dynamic and static objects. Furthermore, we propose two association strategies: dynamic object association based on semantic map points and static object association based on object pose information. And as the number of object measurements associated with the landmarks increases, we perform the association validation algorithm to verify the association for the landmark to improve the accuracy of the association. The proposed method is extensively evaluated on both simulated indoor sequences obtained from humanoid robot viewpoints and the KITTI dataset. Experimental results show that our approach significantly improves the robustness and accuracy of object association and trajectory estimation.

## 正式发表与阅读来源

- 期刊：International Journal of Humanoid Robotics
- DOI：[正式出版页面](https://doi.org/10.1142/s0219843623500196)
- 当前仅同步公开摘要；未获取论文全文，聊天不能据此声称已阅读完整论文。
