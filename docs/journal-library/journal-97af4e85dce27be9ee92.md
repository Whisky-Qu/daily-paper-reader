---
title: "Real-Time Continuous Locomotion Mode Recognition and Transition Prediction for Human With Lower Limb Exoskeleton"
authors: "Xunju Ma, Yali Liu, Xiaohui Zhang, Lorenzo Masia, Qiuzhi Song"
date: "2025-02"
doi: "10.1109/jbhi.2024.3462826"
paper_id: "journal-97af4e85dce27be9ee92"
source: "IEEE Journal of Biomedical and Health Informatics"
tags: ["query:exo-vision"]
tldr: "仅使用外骨骼IMU信号，结合CNN-BiLSTM与多数滤波识别稳态步态和模式切换。六人实验中，多数切换可提前预测，平均提前353毫秒；滤波降低了切换误判，并在Jetson Nano验证实时性。"
evidence: "正式期刊记录已按 DOI 核对；简介为原摘要摘录，非 AI 全文解读。"
title_zh: "下肢外骨骼的实时连续运动模式识别与切换预测"
translation_source: "NLLB-200 600M · 免费离线机器翻译 · 机器人术语表v1"
translation_sha: "b96d05cc21014037ef331be82a7594112161b0b4fd145e8e7f7b944bca7217ba"
---

<!-- dpr-offline-zh:start -->
## 中文摘要

对于外骨骼机器人来说，实时连续运动模式识别和无 ?? 的及时过渡检测至关重要.本研究旨在为运动模式识别和过渡预测提供全面和创新的框架，仅利用外骨骼的惯性测量单位 (IMU) 信号.在此框架内，开发并培训了CNN-BiLSTM模型作为分类器，并设计了一种新的多数过 ?? 器，以减少过渡误判率.此外，提出了一套全面的评估系统，包括了分类器的八个维度，并包含了专门用于过渡错误判断的评估指标.我们收集了运动的运动数据，来自6名使用外骨骼的6个IMU传感器的外骨骼机器人.在过渡决定后的六个科目中，拟议的方法实现了高水平的识别精度，在五种稳定的运动模式 (水平地面步行 (LG)，楼梯上/下 (SA/SD) 和坡道上/下 (RA/RD) 中，总体平均达到99.58.所有的过渡都是可识别的，大多数可以提前预测，平均预测时间为353ms.此外，大多数过度器的实施导致六个学科中过渡错误判断率平均减少了87.04，从而使过渡错误判断率平均降至4.82.最后，该模型在Jetson Nano上进行了测试，以验证其实时性能.上面提出的结果是在任何一条腿都可以作为第一个过渡腿的条件下获得的，并显示，开发的系统能够实现精确的运动模式识别及时的过渡预测，并具有高实时性能。

## 翻译说明

中文概述已依据原摘要核对整理；完整中文摘要由免费离线机器翻译生成，关键术语与数值请结合英文原文核对。
<!-- dpr-offline-zh:end -->

## Abstract

Real-time continuous locomotion mode recognition and seamless timely transition detection is critical for the exoskeleton robot. This study aims to present a comprehensive and innovative framework for locomotion mode recognition and transition prediction, exclusively utilizing inertial measurement unit (IMU) signals from the exoskeleton. In this framework, a CNN-BiLSTM model was developed and trained to be the classifier and a novel majority filter was designed to reduce the transition misjudgment rate. Moreover, a comprehensive evaluation system encompassing eight dimensions for the classifier, incorporating evaluation metrics specifically for transition misjudgment, was proposed. We collected locomotion motion data from six subjects wearing a rigid exoskeleton robot using six IMU sensors on the exoskeleton. The proposed method achieves a high level of recognition accuracy, with an overall average of 99.58 for the five steady locomotion modes (level ground walking (LG), stair ascent/descent (SA/SD), and ramp ascent/descent (RA/RD)) across six subjects following the transition decision. All transitions are recognizable, and the majority can be predicted in advance, with an average prediction time of 353 ms. Furthermore, the implementation of majority filter resulted in an average 87.04 reduction in the transition misjudgment rate among six subjects, thereby decreasing the average transition misjudgment rate to 4.82. Finally, the model was tested on a Jetson Nano to verify its real-time performance. The results presented above were obtained under the condition where either leg could function as the first transition leg and revealed that the developed system was capable of achieving precise locomotion mode recognition and timely transition prediction, with high real-time performance.

## 正式发表与阅读来源

- 期刊：IEEE Journal of Biomedical and Health Informatics
- DOI：[正式出版页面](https://doi.org/10.1109/jbhi.2024.3462826)
- 当前仅同步公开摘要；未获取论文全文，聊天不能据此声称已阅读完整论文。
