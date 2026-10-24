---
title: "Time-Series Models for Joint-Angle Prediction in Human–Exoskeleton Locomotion"
authors: "Emmanuel Assare-Mokwah, Arunkumar Subbaiah"
date: "2026-10-17"
doi: "10.3390/robotics15100200"
paper_id: "journal-62e3b3c5742eaf76fa32"
source: "Robotics"
tags: ["query:exo-vision"]
tldr: "比较ARMA、ARIMA、RNN、LSTM和GRU对外骨骼行走关节轨迹的预测。深度模型优于传统统计方法，RNN精度最高，GRU的精度与计算开销更均衡；结果来自仿真数据，尚需真实外骨骼实验验证。"
evidence: "正式期刊记录已按 DOI 核对；简介为原摘要摘录，非 AI 全文解读。"
title_zh: "人机协同行走中的关节角度时序预测模型比较"
translation_source: "NLLB-200 600M · 免费离线机器翻译 · 机器人术语表v1"
translation_sha: "749aee6f18f22c2af70ce65363ef38d4f449d4c8a3a67fbda7db505dbea08471"
---

<!-- dpr-offline-zh:start -->
## 中文摘要

随着外骨骼技术的进步，对于有效的人体与外骨骼互动，需要对用户的运动进行精确的适应.因此，预测下肢关节轨迹，包括髋关节，膝关节和踝关节关节，是运动期间外骨骼控制的关键方面.虽然关节角度预测传统上依赖于实验和生物机械模型，但机器学习方法在时间序列数据中模拟复杂的时间关系方面表现出了强大的能力.本研究提供了ARMA (2,2)，ARIMA (2,1,2)，RNN，LSTM和GRU模型的比较评估，用于人体与外骨骼 (HEXO) 运动期间预测关节角度.这些模型采用R2，MAE，RMSE，培训时间和推断时间进行了评估.研究结果显示，深度学习模式始终优于传统的统计方法.在所有评估的模型中，RNN实现了最高的预测精度，为HEXO 髋关节 关节角度轨道达到R2 ≈99.41%.在所有深度学习架构中，GRU证明了预测准确性和计算成本之间的最有利平衡.这些发现表明，预测精度的提高可能会提高外骨骼 ?? 对复杂运动模式的响应能力，并改善生物机械同步.此外，这些发现为智能外骨骼控制系统的开发提供了有用的见解，并确定了未来研究的机会.然而，这些发现基于模拟的关节角度数据，并且需要在实体部署之前使用实验性外骨骼数据集进行验证。

## 翻译说明

中文概述已依据原摘要核对整理；完整中文摘要由免费离线机器翻译生成，关键术语与数值请结合英文原文核对。
<!-- dpr-offline-zh:end -->

## Abstract

With the advancement of exoskeleton technology, the need for accurate adaptation to users’ movements for effective human–exoskeleton interaction is paramount. Therefore, predicting lower-limb joint trajectories, including hip, knee and ankle joints, is a critical aspect of exoskeleton control during locomotion. While joint-angle prediction has traditionally relied on empirical and biomechanical models, machine learning approaches have demonstrated strong capabilities in modeling complex temporal relationships in time-series data. This study presents a comparative evaluation of ARMA (2,2), ARIMA (2,1,2), RNN, LSTM and GRU models for predicting joint angles during human–exoskeleton (HEXO) locomotion. The models were evaluated utilizing R2, MAE, RMSE, training time and inference time. The results showed that the deep learning models consistently outperformed the traditional statistical approaches. Among all of the evaluated models, the RNN achieved the highest predictive accuracy, attaining an R2 ≈ 99.41% for the HEXO hip joint-angle trajectory. Among all of the deep learning architectures, the GRU proved the most favorable balance between prediction accuracy and computational cost. These findings suggest that improvements in predictive accuracy may enhance an exoskeleton’s responsiveness to complex movement patterns and improve biomechanical synchronization. Additionally, the findings provide useful insights for the development of intelligent exoskeleton control systems and identification of opportunities for future research. However, the findings are based on simulated joint-angle data and require validation using experimental exoskeleton datasets before real-world deployment.

## 正式发表与阅读来源

- 期刊：Robotics
- DOI：[正式出版页面](https://doi.org/10.3390/robotics15100200)
- 当前仅同步公开摘要；未获取论文全文，聊天不能据此声称已阅读完整论文。
