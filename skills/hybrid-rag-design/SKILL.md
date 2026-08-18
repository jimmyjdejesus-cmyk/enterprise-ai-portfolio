---
name: hybrid-rag-design
description: Design, implement, and benchmark production-grade Hybrid RAG (Retrieval-Augmented Generation) systems using Dense Vector Search, Sparse BM25 lexical search, Reciprocal Rank Fusion (RRF), and grounding guardrails.
---

# Hybrid RAG Architecture & Design Guide

This skill provides standard architectural blueprints for building enterprise-ready hybrid RAG systems that combine semantic vector embeddings with lexical keyword search.

## 1. Core Architecture Pattern

```
Query -> Context Rewriter -> Dense Search (Embeddings) + Sparse Search (BM25)
                          -> Reciprocal Rank Fusion (RRF) -> Top-K
                          -> Prompt Context Builder -> LLM Generation
                          -> Faithfulness & Grounding Guardrail
```

## 2. Reciprocal Rank Fusion (RRF) Implementation

```python
def reciprocal_rank_fusion(dense_ranks: dict, sparse_ranks: dict, k: int = 60) -> dict:
    """
    Fuses two ranked lists into an invariant ranking score.
    Formula: score(d) = 1/(k + dense_rank) + 1/(k + sparse_rank)
    """
    rrf_scores = {}
    all_keys = set(dense_ranks.keys()).union(set(sparse_ranks.keys()))
    for doc_id in all_keys:
        r_d = dense_ranks.get(doc_id, 1000)
        r_s = sparse_ranks.get(doc_id, 1000)
        rrf_scores[doc_id] = (1.0 / (k + r_d)) + (1.0 / (k + r_s))
    return rrf_scores
```

## 3. Grounding & Faithfulness Guardrail

Always compute citation overlap between the generated response and retrieved context to detect hallucinations:

```python
def compute_faithfulness(answer: str, context: str) -> float:
    ans_tokens = set(re.findall(r'\w+', answer.lower())) - STOP_WORDS
    ctx_tokens = set(re.findall(r'\w+', context.lower()))
    if not ans_tokens:
        return 1.0
    overlap = sum(1 for w in ans_tokens if w in ctx_tokens)
    return round(overlap / len(ans_tokens), 2)
```
