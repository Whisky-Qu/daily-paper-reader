---
title: "Lower-Limb Exoskeleton With Compliant Actuators: Human Cooperative Control"
authors: "Lukas Bergmann, Daniel Voss, Steffen Leonhardt, Chuong Ngo"
date: "2023-08"
doi: "10.1109/tmrb.2023.3290982"
paper_id: "journal-6f7a46a75a056bbba103"
source: "IEEE Transactions on Medical Robotics and Bionics"
tags: ["query:hip-exo"]
tldr: "分别用无迹卡尔曼滤波和逆运动学估计摆动期与支撑期的人体关节力矩，并按步态调节驱动刚度。L2Exo-SE实验显示人体髋、膝关节平均力矩降低，兼顾柔顺交互与支撑期控制带宽。"
evidence: "正式期刊记录已按 DOI 核对；简介为原摘要摘录，非 AI 全文解读。"
title_zh: "柔顺驱动下肢外骨骼的人机协同控制"
translation_source: "NLLB-200 600M · 免费离线机器翻译 · 机器人术语表v1"
translation_sha: "d07d70c87dd68bc1f98bd7ed8900f28b5db9db1cf1ca4213dce088d13c9215a6"
---

<!-- dpr-offline-zh:start -->
## 中文摘要

在康复治疗中越来越多地使用下肢活性外骨骼.在开发这些辅助设备的重要研究领域之一是确保人类与机器的安全互动，这需要安全的机械系统和有效的辅助控制框架.因此，我们为外骨骼提供了一个新的人类合作控制框架，具有可变的硬度执行器，控制框架根据使用未闻的卡尔曼过 ?? 器 (UKF) 和反动动力学来估计用户在旋转和立场阶段的关节扭矩.采用下肢 外骨骼带连续弹性动机 (L2Exo-SE) 为例，验证了对外骨骼的适用性.验证结果显示，在步态中平均用户的关节扭矩减少了髋关节的63.6%-78.4%和膝关节的40.8%-50.2%与无助步行相比.此外，我们还推出了基于步态阶段和活跃人类关节扭矩的可变硬度执行器 (VSA) 序列弹性的自动硬度选择.硬度变化在旋转阶段增加了人与机器人的物理互动，同时在立场阶段保持了高控制带宽。

## 翻译说明

中文概述已依据原摘要核对整理；完整中文摘要由免费离线机器翻译生成，关键术语与数值请结合英文原文核对。
<!-- dpr-offline-zh:end -->

## Abstract

Active exoskeletons for the lower extremities are increasingly being used in rehabilitation therapy. One of the key areas of research in developing these assistive devices is ensuring safe human-machine interaction, which requires both a safe mechanical system and an effective assistive control framework. Therefore, we present a novel human cooperative control framework for exoskeletons with variable stiffness actuators to assist users during both the swing and stance phases of walking and other motion sequences such as sit-to-stand. The control framework estimates the user’s joint torques during the swing and stance phases using an Unscented Kalman Filter (UKF) and inverse kinematics, respectively. Using the Lower-Limb Exoskeleton with Serial Elastic Actuators (L2Exo-SE) as an example, the control approach was validated for its applicability to exoskeletons with compliant actuators. The validation results reveal a reduction of the average user’s joint torque during gait by 63.6%-78.4% for the hip and 40.8%-50.2% for the knee compared to non-assisted walking. Furthermore, we introduce an automatic stiffness selection for the serial elasticity of the variable stiffness actuator (VSA) based on the gait phases and the active human joint torque. The stiffness variation increases the physical human-robot interaction during the swing phase while maintaining a high control bandwidth during the stance phase.

## 正式发表与阅读来源

- 期刊：IEEE Transactions on Medical Robotics and Bionics
- DOI：[正式出版页面](https://doi.org/10.1109/tmrb.2023.3290982)
- 当前仅同步公开摘要；未获取论文全文，聊天不能据此声称已阅读完整论文。
