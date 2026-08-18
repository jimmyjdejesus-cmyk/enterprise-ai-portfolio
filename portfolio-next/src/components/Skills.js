import styles from './Skills.module.css';

export default function Skills() {
  const skillCategories = [
    {
      title: "AI & Neural Architectures",
      id: "ai",
      code: "MODULE_01",
      skills: [
        { name: "Large Language Models (LLMs)", level: "98%" },
        { name: "Retrieval-Augmented Generation (RAG)", level: "96%" },
        { name: "LangChain / LlamaIndex", level: "94%" },
        { name: "Vector Databases (FAISS / Chroma)", level: "95%" },
        { name: "Gemini / OpenAI API", level: "99%" },
        { name: "Prompt Engineering & Evaluation", level: "97%" }
      ]
    },
    {
      title: "Data Science & Machine Learning",
      id: "ds",
      code: "MODULE_02",
      skills: [
        { name: "Python / Pandas / NumPy", level: "99%" },
        { name: "Scikit-Learn Algorithms", level: "95%" },
        { name: "K-Means & Unsupervised Clustering", level: "94%" },
        { name: "PCA Dimensionality Reduction", level: "92%" },
        { name: "NLTK VADER / Sentiment NLP", level: "93%" },
        { name: "Hypothesis Testing & Statistics", level: "91%" }
      ]
    },
    {
      title: "Business Intelligence & Forecasting",
      id: "ba",
      code: "MODULE_03",
      skills: [
        { name: "Streamlit Web Applications", level: "98%" },
        { name: "Plotly Interactive Visualizations", level: "96%" },
        { name: "SARIMAX / ARIMA Time-Series", level: "93%" },
        { name: "Customer Cohort Retention Matrices", level: "95%" },
        { name: "RFM Value Segmentation", level: "97%" },
        { name: "SQL Data Modeling & KPIs", level: "94%" }
      ]
    }
  ];

  return (
    <section className="section" id="skills">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">Neural Capability Matrix</div>
          <h2 className="section-title">Technical Expertise &amp; Tooling</h2>
        </div>

        <div className={styles.skillsContainer}>
          {skillCategories.map(cat => (
            <div key={cat.id} className={styles.skillCategory}>
              <div className={styles.categoryHeader}>
                <span className={styles.moduleCode}>{cat.code}</span>
                <h3 className={styles.categoryTitle}>{cat.title}</h3>
              </div>

              <div className={styles.skillList}>
                {cat.skills.map((skill, idx) => (
                  <div key={idx} className={styles.skillItem}>
                    <div className={styles.skillMeta}>
                      <span className={styles.skillName}>{skill.name}</span>
                      <span className={styles.skillLevel}>{skill.level}</span>
                    </div>
                    <div className={styles.levelTrack}>
                      <div className={styles.levelFill} style={{ width: skill.level }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
