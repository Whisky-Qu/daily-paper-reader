---
title: "Dual‐View Representation Learning for Deployable Humanoid Whole‐Body Control"
authors: "Haolin Song, Wengang Zhou, Mingxiao Feng, Houqiang Li"
date: "2026-09-30"
doi: "10.1002/aisy.70563"
paper_id: "journal-2db42d94a76b9eb6b35d"
source: "Advanced Intelligent Systems"
tags: ["query:humanoid"]
tldr: "原摘要摘录：Humanoid whole‐body control policies receive limited proprioception at execution time, while simulation exposes richer privileged information during training. Such information can improve policy learning, but using it for deployable control requires transferring training‐only cues without changing the execution‐time sensing interface."
evidence: "正式期刊记录已按 DOI 核对；简介为原摘要摘录，非 AI 全文解读。"
pdf: "https://onlinelibrary.wiley.com/doi/pdfdirect/10.1002/aisy.70563"
---

## Abstract

Humanoid whole‐body control policies receive limited proprioception at execution time, while simulation exposes richer privileged information during training. Such information can improve policy learning, but using it for deployable control requires transferring training‐only cues without changing the execution‐time sensing interface. While existing methods often rely on teacher distillation or explicit prediction of physical quantities, this work treats the transfer as a representation‐learning problem. To address this, DVP is introduced as a Dual‐View Proprioceptive (DVP) framework that turns privileged simulation states into training‐only latent supervision. For each simulated state, DVP pairs the privileged state with a view containing only the inputs available to the deployed actor. A dual‐cosine objective then aligns the privileged and deployable latent features while PPO optimizes the control policy. At execution time, the actor uses only deployment‐available inputs, and the privileged branch is removed. On LimX Oli velocity tracking and whole‐body motion tracking, DVP improves learning progress, control quality, action smoothness, and tracking accuracy over representative representation‐learning and privileged‐learning baselines. Cross‐platform motion‐tracking simulations on Unitree G1, Booster K1, and Noetix E1 test generality across morphology scales, while MuJoCo sim‐to‐sim evaluation and limited LimX Oli hardware demonstrations show execution through the deployable interface. Source code is available at DVP_code .

## 正式发表与阅读来源

- 期刊：Advanced Intelligent Systems
- DOI：[正式出版页面](https://doi.org/10.1002/aisy.70563)
- 当前仅同步公开摘要；未获取论文全文，聊天不能据此声称已阅读完整论文。
