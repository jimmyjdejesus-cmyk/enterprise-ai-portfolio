import styles from './Hero.module.css';

export default function Hero() {
  const stats = [
    { label: "REVENUE_MODELED", val: "$4.78M", sub: "SARIMAX & Cohort Analytics" },
    { label: "RAG_FAITHFULNESS", val: "86.0%", sub: "Hallucination Guardrail Gate" },
    { label: "CLUSTERING_OPTIMAL_K", val: "K=3", sub: "Silhouette & PCA Separation" },
    { label: "TEST_SUITE_PASS_RATE", val: "100%", sub: "22/22 Automated Pytest Units" }
  ];

  return (
    <header className={styles.hero}>
      <div className="container">
        <div className={styles.heroLayout}>
          {/* Professional Tag Badge */}
          <div className={styles.tagline}>
            <span className={styles.taglineDot}></span>
            <span className={styles.taglineText}>JIMMY DE JESUS • AI ENGINEER &amp; DATA SCIENTIST</span>
          </div>

          <h1 className={styles.heroTitle}>
            Engineering production AI, <span className={styles.glowWord}>machine learning</span> &amp; forecasting systems.
          </h1>

          <p className={styles.heroDescription}>
            Building high-recall Hybrid RAG architectures, econometrically tuned SARIMAX time-series engines, and unsupervised customer segmentation pipelines.
          </p>

          <div className={styles.heroActions}>
            <a href="#interactive-lab" className="btn btn-primary">
              <span>View Interactive Demo</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </a>
            <a href="#projects" className="btn btn-secondary">
              <span>Explore Standalone Repositories [4]</span>
            </a>
          </div>

          {/* Futuristic KPI Grid */}
          <div className={styles.kpiGrid}>
            {stats.map((stat, i) => (
              <div key={i} className={styles.kpiCard}>
                <div className={styles.kpiHeader}>
                  <span className={styles.kpiLabel}>{stat.label}</span>
                </div>
                <div className={styles.kpiVal}>{stat.val}</div>
                <div className={styles.kpiSub}>{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

