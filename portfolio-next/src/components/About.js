import styles from './About.module.css';

export default function About() {
  const pillars = [
    {
      num: "01",
      title: "Business Problem Solving & Automation",
      desc: "Rapidly translating business challenges into working tools — internal dashboards, workflow automations, API integrations, and data pipelines that reduce manual effort and drive measurable operational efficiency."
    },
    {
      num: "02",
      title: "Data Analytics & Business Intelligence",
      desc: "Writing SQL queries, building BI dashboards, and applying statistical models (clustering, time-series, LTV/cohort analysis) to surface insights that support strategic and operational decisions."
    },
    {
      num: "03",
      title: "AI-Powered Applications & Integrations",
      desc: "Building production AI tools including hybrid RAG knowledge assistants and LLM-augmented automation pipelines that connect internal systems with modern AI platforms via REST APIs."
    }
  ];

  return (
    <section className="section" id="about">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">Candidate Profile &amp; Background</div>
          <h2 className="section-title">Building practical technology solutions that make a real impact.</h2>
        </div>

        <div className={styles.aboutGrid}>
          <div className={styles.aboutText}>
            <p className={styles.leadText}>
              I'm Jimmy De Jesus — a software developer and applied AI/data engineer who builds practical solutions to real business problems.
            </p>
            <p>
              My focus is delivering production-grade applications, automation tools, and analytics systems that reduce manual effort and create measurable operational value — not just writing code for the sake of it.
            </p>
            <p>
              From automated revenue forecasting dashboards and document AI assistants to customer segmentation pipelines, I prototype quickly and ship cleanly-documented, well-tested solutions.
            </p>
            
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--accent)', background: 'var(--accent-soft)', padding: '0.35rem 0.75rem', borderRadius: '4px', border: '1px solid var(--border-bright)' }}>
                📍 OCALA, FL AREA — AVAILABLE IN-PERSON
              </span>
              <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--accent)', background: 'var(--accent-soft)', padding: '0.35rem 0.75rem', borderRadius: '4px', border: '1px solid var(--border-bright)' }}>
                ⚡ 22/22 UNIT TESTS PASSING ACROSS ALL PROJECTS
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

