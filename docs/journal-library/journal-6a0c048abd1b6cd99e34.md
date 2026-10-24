---
title: "Benchmarking Markerless Vision-Based Human Pose Estimation with an Upper-Limb Rehabilitation Exoskeleton"
authors: "André Gonçalves, Cláudia D. Rocha"
date: "2026-10-22"
doi: "10.3390/robotics15110212"
paper_id: "journal-6a0c048abd1b6cd99e34"
source: "Robotics"
tags: ["query:exo-vision"]
tldr: "比较10种姿态估计模型，评估相机位置和手臂姿态对外骨骼康复监测的影响。正面拍摄的准确率优于侧面，相机布置的影响大于模型选择；RTMO-M精度最高，YOLO26m在准确率与速度之间更均衡。"
evidence: "正式期刊记录已按 DOI 核对；简介为原摘要摘录，非 AI 全文解读。"
title_zh: "上肢康复外骨骼场景中的无标记视觉人体姿态估计评测"
translation_source: "NLLB-200 600M · 免费离线机器翻译 · 机器人术语表v1"
translation_sha: "9250f3ac8b3807ef93cac4629d65183d7cd41e97ab9af5093f3b15d0cdb53f17"
---

<!-- dpr-offline-zh:start -->
## 中文摘要

在外骨骼辅助康复中，可靠的人体姿态估计 (HPE) 对于基于视觉对上肢运动的监测至关重要.然而，机器人结构，摄像头的放置和臂部的定向可能会挑战姿势估计性能，广泛使用的无标记模型在这些条件下仍然没有足够的基准.本文将10个代表性的HPE模型与健康参与者穿着上肢 外骨骼的视频序列进行了比较 (空置，协作操纵器锁定)，使用OAK-D摄像头从前面，上下面和侧面位置录制，覆盖肘关节 屈曲和伸展在肩关节 屈曲和肩关节 外展下.性能通过精度，鲁棒性，时间稳定性和速度来评估.RTMO-M实现了最高精度 (正确关键点百分比 (PCK) = 0.921 ± 0.081)，而YOLO26m提供了最佳精度吞吐量交易 (PCK = 0.896 ± 0.125，每秒27.0 ± 3.5 架).摄像头的放置对精度的影响比模型选择更大:前置实现了0.947的平均PCK，而侧面的PCK为0.719，差距超过了最大的模型之间的差异.在五种YOLO尺寸变体和三种录音分辨率中进行了排放，进一步标志着精度速度的折衷和分辨率敏感性.结果突出了基于视觉 HPE和上肢 外骨骼的模型和摄像头配置在代表康复条件的实验室场景中的重要性。

## 翻译说明

中文概述已依据原摘要核对整理；完整中文摘要由免费离线机器翻译生成，关键术语与数值请结合英文原文核对。
<!-- dpr-offline-zh:end -->

## Abstract

Reliable Human Pose Estimation (HPE) is essential for vision-based monitoring of upper-limb movements in exoskeleton-assisted rehabilitation. However, the robotic structure, camera placement, and arm orientation may challenge pose-estimation performance, and widely used markerless models remain insufficiently benchmarked under these conditions. This paper benchmarks 10 representative HPE models on video sequences of a healthy participant wearing an upper-limb exoskeleton (idle, with the collaborative manipulator locked), recorded with an OAK-D camera from frontal, top-down, and lateral placements, covering elbow flexion and extension under shoulder flexion and shoulder abduction. Performance is assessed across accuracy, robustness, temporal stability, and speed. RTMO-M achieved the highest accuracy (Percentage of Correct Keypoints (PCK) = 0.921 ± 0.081), while YOLO26m offered the best accuracy-throughput trade-off (PCK = 0.896 ± 0.125, 27.0 ± 3.5 frames per second). Camera placement influenced accuracy more than model selection: frontal placement achieved a mean PCK of 0.947 versus 0.719 for lateral, a gap exceeding the largest inter-model difference. An ablation across five YOLO size variants and three recording resolutions further characterizes accuracy–speed trade-offs and resolution sensitivity. Results highlight the importance of model and camera configuration for vision-based HPE with upper-limb exoskeletons in laboratory scenarios representing rehabilitation conditions.

## 正式发表与阅读来源

- 期刊：Robotics
- DOI：[正式出版页面](https://doi.org/10.3390/robotics15110212)
- 当前仅同步公开摘要；未获取论文全文，聊天不能据此声称已阅读完整论文。
