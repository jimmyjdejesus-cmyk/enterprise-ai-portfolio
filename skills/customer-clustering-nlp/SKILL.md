---
name: customer-clustering-nlp
description: Unsupervised learning workflow for customer RFM behavioral segmentation, multi-metric cluster validation, PCA projections, and NLP sentiment keyphrase extraction.
---

# Customer Segmentation & NLP Mining Workflow

A reusable blueprint for combining quantitative transactional metrics (RFM) with qualitative natural language customer feedback.

## 1. Core Workflow

1. **Skewness Detection & Normalization**: Compute Fisher-Pearson skewness; apply $\log(1+x)$ where $|g_1| \ge 0.75$ to prevent distance distortion.
2. **Multi-Metric Cluster Validation**:
   - Within-Cluster Sum of Squares (Elbow / Inertia)
   - Silhouette Score ($[-1, +1]$)
   - Davies-Bouldin Index (lower is better)
   - Calinski-Harabasz Criterion (higher is better)
3. **Dimensionality Reduction**: Project standard scaled features to 2D using PCA.
4. **NLP Topic Extraction**: Extract N-Grams (bi-grams & tri-grams) using TF-IDF per cluster to discover specific complaint or praise themes.
5. **Persona Profiling**: Attribute revenue and customer shares to generate strategic marketing playbooks.
