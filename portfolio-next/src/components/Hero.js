import styles from './Hero.module.css';

export default function Hero() {
  const stats = [
    { label: "REVENUE_MODELED", val: "$12.4M", sub: "SARIMAX & Cohort Analytics" },
    { label: "RAG_RETRIEVAL_ACCURACY", val: "99.4%", sub: "Vector Grounding Score" },
    { label: "FORECAST_HORIZON", val: "30-Day", sub: "Time-Series Predictive Window" },
    { label: "COHORTS_CLUSTERED", val: "500+", sub: "K-Means RFM Segment Space" }
  ];

  return (
    <header className={styles.hero}>
      <div className="container">
        <div className={styles.heroLayout}>
          {/* Futuristic Cyber Badge */}
          <div className={styles.tagline}>
            <span className={styles.taglineDot}></span>
            <span className={styles.taglineText}>SYSTEM_CORE // AI_DATA_INTELLIGENCE // V2.6</span>
          </div>

          <h1 className={styles.heroTitle}>
            Engineering next-gen AI &amp; <span className={styles.glowWord}>predictive intelligence</span> systems.
          </h1>

          <p className={styles.heroDescription}>
            Bridging autonomous neural RAG pipelines, production time-series forecasting algorithms, and customer intelligence matrices into high-velocity business impact.
          </p>

          <div className={styles.heroActions}>
            <a href="#interactive-lab" className="btn btn-primary">
              <span>Launch Neural Lab</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </a>
            <a href="#projects" className="btn btn-secondary">
              <span>Explore Projects [3]</span>
            </a>
          </div>

          {/* Futuristic KPI Grid */}
          <div className={styles.kpiGrid}>
            {stats.map((stat, i) => (
              <div key={i} className={styles.kpiCard}>
                <div className={styles.kpiHeader}>
                  <span className={styles.kpiCross}>+</span>
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
