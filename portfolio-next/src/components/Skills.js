import styles from './Skills.module.css';

export default function Skills() {
  const skillCategories = [
    {
      title: "AI & LLM Architectures",
      id: "ai",
      code: "MODULE_01",
      skills: [
        "Retrieval-Augmented Generation (RAG)",
        "Dense Vector Embeddings",
        "Hybrid Search (Dense + Sparse)",
        "Reciprocal Rank Fusion (RRF)",
        "Grounding & Hallucination Guardrails",
        "Contextual Query Rewriting",
        "Google Gemini API",
        "Prompt Engineering & Evaluation"
      ]
    },
    {
      title: "Machine Learning & Statistics",
      id: "ds",
      code: "MODULE_02",
      skills: [
        "Unsupervised K-Means Clustering",
        "PCA Dimensionality Reduction",
        "Cluster Validation (Silhouette, Davies-Bouldin)",
        "Fisher-Pearson Skewness Preprocessing",
        "NLTK VADER Sentiment Analysis",
        "TF-IDF N-Gram Keyphrase Extraction",
        "Hypothesis Testing & Feature Scaling",
        "Scikit-Learn / NumPy / Pandas"
      ]
    },
    {
      title: "Time-Series & Business Analytics",
      id: "ba",
      code: "MODULE_03",
      skills: [
        "SARIMAX Econometric Modeling",
        "Automated AIC Parameter Optimization",
        "Ljung-Box Residual Autocorrelation Tests",
        "Customer Lifetime Value (LTV) Modeling",
        "Monthly Cohort Retention Matrices",
        "RFM Behavioral Quantile Segmentation",
        "Streamlit Application Development",
        "Plotly Interactive Data Visualizations"
      ]
    },
    {
      title: "Engineering, Tooling & DevOps",
      id: "ops",
      code: "MODULE_04",
      skills: [
        "Python (OOP / Clean Architecture)",
        "Docker Containerization",
        "Next.js 16 / React / Modern Web",
        "Pytest Automated Test Suites",
        "uv Package & Environment Manager",
        "Git / GitHub Workflow & Actions",
        "Vercel Cloud CI/CD Deployment",
        "REST APIs & JSON Schemas"
      ]
    }
  ];

  return (
    <section className="section" id="skills">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">Technical Capability Matrix</div>
          <h2 className="section-title">Core Competencies &amp; Tooling</h2>
        </div>

        <div className={styles.skillsContainer}>
          {skillCategories.map(cat => (
            <div key={cat.id} className={styles.skillCategory}>
              <div className={styles.categoryHeader}>
                <span className={styles.moduleCode}>{cat.code} //</span>
                <h3 className={styles.categoryTitle}>{cat.title}</h3>
              </div>

              <div className={styles.tagGrid}>
                {cat.skills.map((skill, idx) => (
                  <span key={idx} className={styles.skillPill}>
                    <span className={styles.pillDot}></span>
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

