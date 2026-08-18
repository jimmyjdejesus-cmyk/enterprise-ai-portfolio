import styles from './About.module.css';

export default function About() {
  const pillars = [
    {
      num: "01",
      title: "Data Operations & Modeling",
      desc: "Engineering rigorous ETL pipelines, statistical skewness correction, and multi-dimensional RFM customer transaction matrices."
    },
    {
      num: "02",
      title: "Machine Learning & Forecasting",
      desc: "Training unsupervised K-Means algorithms, tuning SARIMAX econometric models over AIC, and evaluating cluster boundaries."
    },
    {
      num: "03",
      title: "Autonomous AI & Hybrid RAG",
      desc: "Constructing high-recall hybrid retrieval pipelines combining Dense Vector embeddings with Sparse TF-IDF via Reciprocal Rank Fusion."
    }
  ];

  return (
    <section className="section" id="about">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">Candidate Profile &amp; Background</div>
          <h2 className="section-title">Bridging Applied AI, Machine Learning, and Business Impact.</h2>
        </div>

        <div className={styles.aboutGrid}>
          <div className={styles.aboutText}>
            <p className={styles.leadText}>
              I'm Jimmy De Jesus — an applied AI/ML Engineer and Data Scientist dedicated to turning complex data streams into production-grade decision systems.
            </p>
            <p>
              My work centers on building reliable end-to-end applications: from parametric time-series revenue forecasting with statistical white-noise verification to conversational AI engines equipped with deterministic hallucination guardrails.
            </p>
            <p>
              Targeting roles as an <strong>AI/ML Engineer</strong>, <strong>Data Scientist</strong>, or <strong>Analytics Engineer</strong>, I prioritize clean architecture, automated unit test coverage, and transparent mathematical rigor over superficial wrappers.
            </p>
            
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--accent)', background: 'var(--accent-soft)', padding: '0.35rem 0.75rem', borderRadius: '4px', border: '1px solid var(--border-bright)' }}>
                📍 AVAILABLE FOR HYBRID / REMOTE
              </span>
              <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--accent)', background: 'var(--accent-soft)', padding: '0.35rem 0.75rem', borderRadius: '4px', border: '1px solid var(--border-bright)' }}>
                ⚡ 100% VERIFIED UNIT TEST COVERAGE
              </span>
            </div>
          </div>

          <div className={styles.pillarsGrid}>
            {pillars.map((p, i) => (
              <div key={i} className={styles.pillarCard}>
                <div className={styles.pillarNum}>{p.num} //</div>
                <h3 className={styles.pillarTitle}>{p.title}</h3>
                <p className={styles.pillarDesc}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

