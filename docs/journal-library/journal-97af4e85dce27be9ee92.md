---
title: "Real-Time Continuous Locomotion Mode Recognition and Transition Prediction for Human With Lower Limb Exoskeleton"
authors: "Xunju Ma, Yali Liu, Xiaohui Zhang, Lorenzo Masia, Qiuzhi Song"
date: "2025-02"
doi: "10.1109/jbhi.2024.3462826"
paper_id: "journal-97af4e85dce27be9ee92"
source: "IEEE Journal of Biomedical and Health Informatics"
tags: ["query:exo-vision"]
tldr: "原摘要摘录：Real-time continuous locomotion mode recognition and seamless timely transition detection is critical for the exoskeleton robot. This study aims to present a comprehensive and innovative framework for locomotion mode recognition and transition prediction, exclusively utilizing inertial measurement unit (IMU) signals from the exoskeleton."
evidence: "正式期刊记录已按 DOI 核对；简介为原摘要摘录，非 AI 全文解读。"
---

## Abstract

Real-time continuous locomotion mode recognition and seamless timely transition detection is critical for the exoskeleton robot. This study aims to present a comprehensive and innovative framework for locomotion mode recognition and transition prediction, exclusively utilizing inertial measurement unit (IMU) signals from the exoskeleton. In this framework, a CNN-BiLSTM model was developed and trained to be the classifier and a novel majority filter was designed to reduce the transition misjudgment rate. Moreover, a comprehensive evaluation system encompassing eight dimensions for the classifier, incorporating evaluation metrics specifically for transition misjudgment, was proposed. We collected locomotion motion data from six subjects wearing a rigid exoskeleton robot using six IMU sensors on the exoskeleton. The proposed method achieves a high level of recognition accuracy, with an overall average of 99.58 for the five steady locomotion modes (level ground walking (LG), stair ascent/descent (SA/SD), and ramp ascent/descent (RA/RD)) across six subjects following the transition decision. All transitions are recognizable, and the majority can be predicted in advance, with an average prediction time of 353 ms. Furthermore, the implementation of majority filter resulted in an average 87.04 reduction in the transition misjudgment rate among six subjects, thereby decreasing the average transition misjudgment rate to 4.82. Finally, the model was tested on a Jetson Nano to verify its real-time performance. The results presented above were obtained under the condition where either leg could function as the first transition leg and revealed that the developed system was capable of achieving precise locomotion mode recognition and timely transition prediction, with high real-time performance.

## 正式发表与阅读来源

- 期刊：IEEE Journal of Biomedical and Health Informatics
- DOI：[正式出版页面](https://doi.org/10.1109/jbhi.2024.3462826)
- 当前仅同步公开摘要；未获取论文全文，聊天不能据此声称已阅读完整论文。
