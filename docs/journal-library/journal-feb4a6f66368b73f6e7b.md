---
title: "Multivariate CNN Model for Human Locomotion Activity Recognition with a Wearable Exoskeleton Robot"
authors: "Chang-Sik Son, Won-Seok Kang"
date: "2023-09-13"
doi: "10.3390/bioengineering10091082"
paper_id: "journal-feb4a6f66368b73f6e7b"
source: "Bioengineering"
tags: ["query:exo-vision"]
tldr: "利用关节角度、速度和姿态等多变量信号识别五类步行活动，并比较单头、多头CNN及混合网络。研究数据来自500名健康成年人，所提模型F值达到96.17%，摘要报告推理时间为1.14秒。"
evidence: "正式期刊记录已按 DOI 核对；简介为原摘要摘录，非 AI 全文解读。"
pdf: "https://www.mdpi.com/2306-5354/10/9/1082/pdf?version=1694598613"
title_zh: "可穿戴外骨骼运动活动识别的多变量CNN模型"
translation_source: "NLLB-200 600M · 免费离线机器翻译 · 机器人术语表v1"
translation_sha: "6e57ac5b3613ddd595fee2199e9d19680a74737fd60272704c18121e3291369b"
---

<!-- dpr-offline-zh:start -->
## 中文摘要

这项研究介绍了一种新型卷积神经网络 (CNN) 架构，包括单头和多头设计，用于使用可穿戴的下肢机器人时识别用户的运动活动.我们的研究涉及500名健康成年参与日常生活活动 (ADL) 领域，从2022年9月1日至11月30日进行.我们收集了前景数据，以识别五项运动活动 (平面地面步行，楼梯上/下，坡道上/下) 在三个地形:平面地面，楼梯和坡道.为了评估拟议的CNN架构的预测能力，我们将其性能与其他三个模型进行了比较:一个CNN和两个混合模型 (CNN-LSTM和LSTM-CNN).实验采用从电脑仪表 (EMG) 和可穿戴机器人获得的各种类型的多变信号进行.我们的结果显示，深层次的CNN架构显著超过了三个竞争型号的性能.该模型利用编码器数据，如髋关节的角度和速度，以及可穿戴的下肢机器人滚动，发射和滑动等姿势信号，以1.14秒的推断速度实现了卓越的性能.具体而言，拟议型号的F测量性能达到96.17%，相比之下，DDLMI的性能为90.68%，DeepConvLSTM的性能为94.41%，LSTM-CNN的性能为95.57%。

## 翻译说明

中文概述已依据原摘要核对整理；完整中文摘要由免费离线机器翻译生成，关键术语与数值请结合英文原文核对。
<!-- dpr-offline-zh:end -->

## Abstract

This study introduces a novel convolutional neural network (CNN) architecture, encompassing both single and multi-head designs, developed to identify a user’s locomotion activity while using a wearable lower limb robot. Our research involved 500 healthy adult participants in an activities of daily living (ADL) space, conducted from 1 September to 30 November 2022. We collected prospective data to identify five locomotion activities (level ground walking, stair ascent/descent, and ramp ascent/descent) across three terrains: flat ground, staircase, and ramp. To evaluate the predictive capabilities of the proposed CNN architectures, we compared its performance with three other models: one CNN and two hybrid models (CNN-LSTM and LSTM-CNN). Experiments were conducted using multivariate signals of various types obtained from electromyograms (EMGs) and the wearable robot. Our results reveal that the deeper CNN architecture significantly surpasses the performance of the three competing models. The proposed model, leveraging encoder data such as hip angles and velocities, along with postural signals such as roll, pitch, and yaw from the wearable lower limb robot, achieved superior performance with an inference speed of 1.14 s. Specifically, the F-measure performance of the proposed model reached 96.17%, compared to 90.68% for DDLMI, 94.41% for DeepConvLSTM, and 95.57% for LSTM-CNN, respectively.

## 正式发表与阅读来源

- 期刊：Bioengineering
- DOI：[正式出版页面](https://doi.org/10.3390/bioengineering10091082)
- 当前仅同步公开摘要；未获取论文全文，聊天不能据此声称已阅读完整论文。
