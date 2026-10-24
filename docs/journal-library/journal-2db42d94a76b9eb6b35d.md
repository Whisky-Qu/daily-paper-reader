---
title: "Dual‐View Representation Learning for Deployable Humanoid Whole‐Body Control"
authors: "Haolin Song, Wengang Zhou, Mingxiao Feng, Houqiang Li"
date: "2026-09-30"
doi: "10.1002/aisy.70563"
paper_id: "journal-2db42d94a76b9eb6b35d"
source: "Advanced Intelligent Systems"
tags: ["query:humanoid"]
tldr: "DVP用双视图潜在特征对齐，将仿真特权信息转化为训练监督，执行时只需本体输入。跨机器人仿真显示运动跟踪、动作平滑性和学习效率改善，并提供有限的LimX Oli实机演示。"
evidence: "正式期刊记录已按 DOI 核对；简介为原摘要摘录，非 AI 全文解读。"
pdf: "https://onlinelibrary.wiley.com/doi/pdfdirect/10.1002/aisy.70563"
title_zh: "面向可部署人形机器人全身控制的双视图表示学习"
translation_source: "NLLB-200 600M · 免费离线机器翻译 · 机器人术语表v1"
translation_sha: "54d0195d79b3f62f97c208d440d398bdf72bab9a90c74715bc0f804c716cafc0"
---

<!-- dpr-offline-zh:start -->
## 中文摘要

在执行时，人形机器人 全身控制政策获得有限的本体感觉，而模拟在培训期间暴露了更丰富的特权信息.这种信息可以改善政策学习，但用于可部署控制需要转移仅用于训练的线索，而不会改变执行时间感知接口.虽然现有的方法往往依赖于教师蒸留或明确预测物理数量，但这项工作将转移视为代表性学习问题.为了解决这一问题，DVP作为双视图本体感知 (DVP) 框架推出，将特权模拟状态转化为仅用于培训的潜伏监督.对于每个模拟状态，DVP将享有特权的状态对，只包含部署的参与者可用的输入.一个双色球目标则将特权和可部署的潜伏功能调整，而PPO则优化了控制政策.在执行时，演员只使用可用于部署的输入，并且取消了特权分支.在LimX Oli速度跟踪和全身运动跟踪上，DVP提高了学习进步，控制质量，行动的顺利性和跟踪精度.跨平台移动跟踪模拟在单元G1，增强K1和Noetix E1测试的概率跨形态尺度，而MuJoCo的sim-to-sim评估和有限的LimX Oli硬件示范显示通过可部署接口执行.来源代码可在DVP_code上找到 。

## 翻译说明

中文概述已依据原摘要核对整理；完整中文摘要由免费离线机器翻译生成，关键术语与数值请结合英文原文核对。
<!-- dpr-offline-zh:end -->

## Abstract

Humanoid whole‐body control policies receive limited proprioception at execution time, while simulation exposes richer privileged information during training. Such information can improve policy learning, but using it for deployable control requires transferring training‐only cues without changing the execution‐time sensing interface. While existing methods often rely on teacher distillation or explicit prediction of physical quantities, this work treats the transfer as a representation‐learning problem. To address this, DVP is introduced as a Dual‐View Proprioceptive (DVP) framework that turns privileged simulation states into training‐only latent supervision. For each simulated state, DVP pairs the privileged state with a view containing only the inputs available to the deployed actor. A dual‐cosine objective then aligns the privileged and deployable latent features while PPO optimizes the control policy. At execution time, the actor uses only deployment‐available inputs, and the privileged branch is removed. On LimX Oli velocity tracking and whole‐body motion tracking, DVP improves learning progress, control quality, action smoothness, and tracking accuracy over representative representation‐learning and privileged‐learning baselines. Cross‐platform motion‐tracking simulations on Unitree G1, Booster K1, and Noetix E1 test generality across morphology scales, while MuJoCo sim‐to‐sim evaluation and limited LimX Oli hardware demonstrations show execution through the deployable interface. Source code is available at DVP_code .

## 正式发表与阅读来源

- 期刊：Advanced Intelligent Systems
- DOI：[正式出版页面](https://doi.org/10.1002/aisy.70563)
- 当前仅同步公开摘要；未获取论文全文，聊天不能据此声称已阅读完整论文。
