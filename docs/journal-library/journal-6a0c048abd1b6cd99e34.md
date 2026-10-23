---
title: "Benchmarking Markerless Vision-Based Human Pose Estimation with an Upper-Limb Rehabilitation Exoskeleton"
authors: "André Gonçalves, Cláudia D. Rocha"
date: "2026-10-22"
doi: "10.3390/robotics15110212"
paper_id: "journal-6a0c048abd1b6cd99e34"
source: "Robotics"
tags: ["query:exo-vision"]
tldr: "原摘要摘录：Reliable Human Pose Estimation (HPE) is essential for vision-based monitoring of upper-limb movements in exoskeleton-assisted rehabilitation. However, the robotic structure, camera placement, and arm orientation may challenge pose-estimation performance, and widely used markerless models remain insufficiently benchmarked under these…"
evidence: "正式期刊记录已按 DOI 核对；简介为原摘要摘录，非 AI 全文解读。"
---

## Abstract

Reliable Human Pose Estimation (HPE) is essential for vision-based monitoring of upper-limb movements in exoskeleton-assisted rehabilitation. However, the robotic structure, camera placement, and arm orientation may challenge pose-estimation performance, and widely used markerless models remain insufficiently benchmarked under these conditions. This paper benchmarks 10 representative HPE models on video sequences of a healthy participant wearing an upper-limb exoskeleton (idle, with the collaborative manipulator locked), recorded with an OAK-D camera from frontal, top-down, and lateral placements, covering elbow flexion and extension under shoulder flexion and shoulder abduction. Performance is assessed across accuracy, robustness, temporal stability, and speed. RTMO-M achieved the highest accuracy (Percentage of Correct Keypoints (PCK) = 0.921 ± 0.081), while YOLO26m offered the best accuracy-throughput trade-off (PCK = 0.896 ± 0.125, 27.0 ± 3.5 frames per second). Camera placement influenced accuracy more than model selection: frontal placement achieved a mean PCK of 0.947 versus 0.719 for lateral, a gap exceeding the largest inter-model difference. An ablation across five YOLO size variants and three recording resolutions further characterizes accuracy–speed trade-offs and resolution sensitivity. Results highlight the importance of model and camera configuration for vision-based HPE with upper-limb exoskeletons in laboratory scenarios representing rehabilitation conditions.

## 正式发表与阅读来源

- 期刊：Robotics
- DOI：[正式出版页面](https://doi.org/10.3390/robotics15110212)
- 当前仅同步公开摘要；未获取论文全文，聊天不能据此声称已阅读完整论文。
