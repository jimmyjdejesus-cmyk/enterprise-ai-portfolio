import styles from './About.module.css';

export default function About() {
  const pillars = [
    {
      num: "01",
      title: "Data Operations & Analytics",
      desc: "Architecting ingestion pipelines, RFM customer analytics, and multivariate transaction processing systems."
    },
    {
      num: "02",
      title: "Machine Learning & Forecasting",
      desc: "Training K-Means segmentation algorithms, SARIMAX econometric time-series models, and dimensional PCA projections."
    },
    {
      num: "03",
      title: "Autonomous AI & RAG Agents",
      desc: "Constructing high-precision retrieval augmented generation pipelines with vector databases and Google Gemini LLMs."
    }
  ];

  return (
    <section className="section" id="about">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">System Architecture &amp; Methodology</div>
          <h2 className="section-title">Turning raw datasets into autonomous intelligence.</h2>
        </div>

        <div className={styles.aboutGrid}>
          <div className={styles.aboutText}>
            <p className={styles.leadText}>
              I specialize in bridging the gap between cutting-edge artificial intelligence and high-stakes business decisions.
            </p>
            <p>
              My approach focuses on creating end-to-end intelligence systems: turning messy transactional logs, unstructured text documents, and user feedback streams into robust APIs, predictive models, and intuitive decision dashboards.
            </p>
            <p>
              Whether deploying RAG engines with context-grounded citations or modeling seasonal retail spikes with SARIMAX time-series mathematics, every system is engineered for measurable real-world performance.
            </p>
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
