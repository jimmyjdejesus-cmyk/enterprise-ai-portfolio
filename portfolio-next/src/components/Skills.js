import styles from './Skills.module.css';

export default function Skills() {
  const skillCategories = [
    {
      title: "AI & Automation Engineering",
      id: "ai",
      code: "MODULE_01",
      skills: [
        "Retrieval-Augmented Generation (RAG)",
        "Dense Vector Embeddings & Hybrid Search",
        "Reciprocal Rank Fusion (RRF)",
        "Workflow Automation & Integration Tools",
        "Grounding & Hallucination Guardrails",
        "Contextual Query Rewriting",
        "Google Gemini API / LLM APIs",
        "Prompt Engineering & Evaluation"
      ]
    },
    {
      title: "Data, SQL & Business Intelligence",
      id: "ds",
      code: "MODULE_02",
      skills: [
        "SQL Queries, Reports & Stored Procedures",
        "Power BI / Dashboards & Visualizations",
        "RFM Customer Segmentation & Analytics",
        "K-Means Clustering & PCA",
        "NLTK VADER Sentiment Analysis",
        "TF-IDF N-Gram Keyphrase Extraction",
        "ETL Pipeline Design & Data Quality",
        "Scikit-Learn / NumPy / Pandas"
      ]
    },
    {
      title: "Application Development & BI Reporting",
      id: "ba",
      code: "MODULE_03",
      skills: [
        "Python Business Utilities, Scripts & APIs",
        "Streamlit Web Application Development",
        "SARIMAX Time-Series Forecasting",
        "Plotly Interactive Data Visualizations",
        "Customer Lifetime Value (LTV) Modeling",
        "Cohort Retention & Revenue Analytics",
        "What-If Scenario Simulation Tools",
        "Rapid Prototyping & Proof-of-Concept"
      ]
    },
    {
      title: "Full-Stack, Integrations & DevOps",
      id: "ops",
      code: "MODULE_04",
      skills: [
        "Python (OOP / Clean Architecture)",
        "JavaScript / HTML / CSS",
        "REST API Design & Third-Party Integrations",
        "Docker Containerization",
        "Next.js 16 / React / Modern Web Stack",
        "Pytest Automated Test Suites (22/22 passing)",
        "Git / GitHub Actions CI/CD",
        "Vercel Cloud Deployment"
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

