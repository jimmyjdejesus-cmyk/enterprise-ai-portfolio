'use client';

import { useState } from 'react';
import styles from './InteractiveLab.module.css';

export default function InteractiveLab() {
  const [activeTab, setActiveTab] = useState('rag');

  // RAG Simulator State
  const [ragQuery, setRagQuery] = useState('');
  const [ragResult, setRagResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Forecasting Simulator State
  const [growthRate, setGrowthRate] = useState(15);
  const [horizonWeeks, setHorizonWeeks] = useState(6);

  // Clustering Simulator State
  const [selectedCluster, setSelectedCluster] = useState('all');

  const handleRagSearch = (prompt) => {
    setIsSearching(true);
    setRagQuery(prompt);
    setRagResult(null);

    setTimeout(() => {
      if (prompt.includes('Revenue') || prompt.includes('KPI')) {
        setRagResult({
          answer: "Total Revenue reached $12.4M in FY25, reflecting a 14.5% YoY expansion driven by digital cohort initiatives across 142,500 orders.",
          sources: [
            { id: "SEC-EXCERPT-01", match: "97.4%", text: "Total Revenue: $12.4M (up from $10.8M in 2024), active client volume grew 9.8%." },
            { id: "SEC-EXCERPT-03", match: "89.1%", text: "Order Volume: 142,500 distinct orders with $87.01 Average Order Value." }
          ]
        });
      } else if (prompt.includes('Electronics') || prompt.includes('CAC')) {
        setRagResult({
          answer: "Electronics generated $5.2M (42% of sales), maintaining the largest revenue share, though Customer Acquisition Cost (CAC) remains higher than other categories.",
          sources: [
            { id: "SEC-EXCERPT-07", match: "95.8%", text: "Electronics: Remained highest revenue source accounting for 42% ($5.2M)." },
            { id: "SEC-EXCERPT-08", match: "91.2%", text: "CAC metrics were elevated in premium tech hardware categories." }
          ]
        });
      } else {
        setRagResult({
          answer: "At Risk/Inactive customers represent 23% of users. Sentiment analysis indicates shipping delays and defective units are the primary churn catalysts.",
          sources: [
            { id: "SEC-EXCERPT-12", match: "94.6%", text: "At Risk Customers (23%): Churn correlated with negative review sentiment regarding delivery latency." },
            { id: "SEC-EXCERPT-15", match: "86.3%", text: "NLP VADER sentiment scores averaged -0.42 for churned cohorts." }
          ]
        });
      }
      setIsSearching(false);
    }, 450);
  };

  // Generate SVG forecast points based on growth slider
  const generateForecastPoints = () => {
    const historical = [35, 42, 38, 48, 52, 49, 58, 62, 59, 68, 72, 70];
    const baseVal = historical[historical.length - 1];
    const multiplier = 1 + (growthRate / 100);
    
    const forecast = [];
    for (let i = 1; i <= horizonWeeks; i++) {
      const val = Math.round(baseVal * Math.pow(multiplier, i / 6) + (Math.sin(i) * 4));
      forecast.push(val);
    }
    return { historical, forecast };
  };

  const { historical, forecast } = generateForecastPoints();

  return (
    <section className="section" id="interactive-lab">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">Interactive Simulation Console</div>
          <h2 className="section-title">Neural Engine Playground</h2>
          <p style={{ marginTop: '0.75rem', fontSize: '1.05rem', color: 'var(--primary)', fontWeight: 'bold' }}>
            Interactive Demo / Simulation Preview
          </p>
          <p style={{ marginTop: '0.25rem', fontSize: '0.9rem', opacity: 0.8 }}>
            Note: These are UI demonstrations of algorithmic models, not live backends.
          </p>
          <p style={{ marginTop: '0.75rem', fontSize: '1.05rem' }}>
            Test live algorithmic models in real-time: run RAG semantic retrievals, recalibrate SARIMAX time-series forecasts, or inspect K-Means cluster spaces.
          </p>
        </div>

        <div className={styles.labContainer}>
          {/* Tab Navigation */}
          <div className={styles.tabNav} role="tablist">
            <button
              role="tab"
              aria-selected={activeTab === 'rag'}
              aria-controls="rag-panel"
              className={`${styles.tabBtn} ${activeTab === 'rag' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('rag')}
            >
              <span className={styles.tabIcon}>🤖</span>
              <span>RAG Vector Search</span>
            </button>

            <button
              role="tab"
              aria-selected={activeTab === 'forecast'}
              aria-controls="forecast-panel"
              className={`${styles.tabBtn} ${activeTab === 'forecast' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('forecast')}
            >
              <span className={styles.tabIcon}>📈</span>
              <span>SARIMAX Forecaster</span>
            </button>

            <button
              role="tab"
              aria-selected={activeTab === 'cluster'}
              aria-controls="cluster-panel"
              className={`${styles.tabBtn} ${activeTab === 'cluster' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('cluster')}
            >
              <span className={styles.tabIcon}>🧬</span>
              <span>K-Means Cluster Matrix</span>
            </button>
          </div>

          {/* Tab 1: RAG Neural Query Console */}
          {activeTab === 'rag' && (
            <div className={styles.labPanel} id="rag-panel" role="tabpanel">
              <div className={styles.panelHeader}>
                <span className={styles.panelTitle}>// RAG_RETRIEVAL_SYSTEM (GEMINI-1.5-FLASH EMBEDDINGS)</span>
                <span className={styles.badge}>READY</span>
              </div>

              <div className={styles.promptChips}>
                <span className={styles.chipLabel}>Sample Queries:</span>
                <button
                  className={styles.chip}
                  onClick={() => handleRagSearch('Summarize FY25 Revenue & KPI Growth')}
                >
                  &quot;Summarize FY25 Revenue & KPI Growth&quot;
                </button>
                <button
                  className={styles.chip}
                  onClick={() => handleRagSearch('What is Electronics performance & CAC?')}
                >
                  &quot;What is Electronics performance & CAC?&quot;
                </button>
                <button
                  className={styles.chip}
                  onClick={() => handleRagSearch('Identify Churn Drivers & Negative Sentiment')}
                >
                  &quot;Identify Churn Drivers & Negative Sentiment&quot;
                </button>
              </div>

              {isSearching && (
                <div className={styles.searchingState}>
                  <div className={styles.spinner}></div>
                  <span>Calculating Cosine Similarity & Vector Embeddings...</span>
                </div>
              )}

              {ragResult && (
                <div className={styles.ragOutput}>
                  <div className={styles.aiResponse}>
                    <div className={styles.responseHeader}>
                      <span className={styles.dot}></span>
                      <span>GENERATED RESPONSE (GROUNDED):</span>
                    </div>
                    <p>{ragResult.answer}</p>
                  </div>

                  <div className={styles.sourceGrid}>
                    {ragResult.sources.map((src, i) => (
                      <div key={i} className={styles.sourceCard}>
                        <div className={styles.sourceMeta}>
                          <span className={styles.sourceId}>{src.id}</span>
                          <span className={styles.sourceMatch}>MATCH: {src.match}</span>
                        </div>
                        <p className={styles.sourceText}>{src.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Predictive Forecasting */}
          {activeTab === 'forecast' && (
            <div className={styles.labPanel} id="forecast-panel" role="tabpanel">
              <div className={styles.panelHeader}>
                <span className={styles.panelTitle}>// SARIMAX_WEEKLY_REVENUE_PREDICTOR</span>
                <span className={styles.badge}>PARAMETRIC</span>
              </div>

              <div className={styles.controlsRow}>
                <div className={styles.controlItem}>
                  <label htmlFor="growth-rate-slider">Projected YoY Growth Rate: <strong>+{growthRate}%</strong></label>
                  <input
                    id="growth-rate-slider"
                    type="range"
                    min="5"
                    max="40"
                    value={growthRate}
                    onChange={(e) => setGrowthRate(Number(e.target.value))}
                    className={styles.slider}
                  />
                </div>

                <div className={styles.controlItem}>
                  <label htmlFor="forecast-horizon-slider">Forecast Horizon: <strong>{horizonWeeks} Weeks</strong></label>
                  <input
                    id="forecast-horizon-slider"
                    type="range"
                    min="2"
                    max="12"
                    value={horizonWeeks}
                    onChange={(e) => setHorizonWeeks(Number(e.target.value))}
                    className={styles.slider}
                  />
                </div>
              </div>

              <div className={styles.chartContainer}>
                <svg viewBox="0 0 600 200" className={styles.chartSvg}>
                  {/* Grid Lines */}
                  <line x1="40" y1="30" x2="580" y2="30" stroke="var(--border)" strokeDasharray="3,3" />
                  <line x1="40" y1="85" x2="580" y2="85" stroke="var(--border)" strokeDasharray="3,3" />
                  <line x1="40" y1="140" x2="580" y2="140" stroke="var(--border)" strokeDasharray="3,3" />
                  <line x1="40" y1="170" x2="580" y2="170" stroke="var(--border)" />

                  {/* Historical Path */}
                  <path
                    d={`M ${historical.map((val, i) => `${40 + i * 28},${170 - val * 1.5}`).join(' L ')}`}
                    fill="none"
                    stroke="#00d2ff"
                    strokeWidth="2.5"
                  />

                  {/* Historical Points */}
                  {historical.map((val, i) => (
                    <circle key={i} cx={40 + i * 28} cy={170 - val * 1.5} r="3" fill="#00d2ff" />
                  ))}

                  {/* Forecast Line */}
                  <path
                    d={`M ${40 + (historical.length - 1) * 28},${170 - historical[historical.length - 1] * 1.5} L ${forecast.map((val, i) => `${40 + (historical.length + i) * 28},${170 - val * 1.5}`).join(' L ')}`}
                    fill="none"
                    stroke="#00f5a0"
                    strokeWidth="3"
                    strokeDasharray="4,4"
                  />

                  {/* Forecast Points */}
                  {forecast.map((val, i) => (
                    <circle key={i} cx={40 + (historical.length + i) * 28} cy={170 - val * 1.5} r="4" fill="#00f5a0" />
                  ))}
                </svg>

                <div className={styles.chartLegend}>
                  <span className={styles.legendHist}>— Historical Weekly Sales ($k)</span>
                  <span className={styles.legendFore}>--- SARIMAX Predictive Horizon (+{growthRate}%)</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: K-Means Clustering */}
          {activeTab === 'cluster' && (
            <div className={styles.labPanel} id="cluster-panel" role="tabpanel">
              <div className={styles.panelHeader}>
                <span className={styles.panelTitle}>// K-MEANS_RFM_CUSTOMER_CLUSTERS (K=3)</span>
                <span className={styles.badge}>PCA PROJECTION</span>
              </div>

              <div className={styles.clusterFilterRow}>
                <button
                  className={`${styles.clusterBtn} ${selectedCluster === 'all' ? styles.activeCluster : ''}`}
                  onClick={() => setSelectedCluster('all')}
                >
                  All Cohorts (500 Nodes)
                </button>
                <button
                  className={`${styles.clusterBtn} ${selectedCluster === 'loyal' ? styles.activeCluster : ''}`}
                  onClick={() => setSelectedCluster('loyal')}
                  style={{ borderColor: '#00f5a0', color: selectedCluster === 'loyal' ? '#05080f' : '#00f5a0', background: selectedCluster === 'loyal' ? '#00f5a0' : 'transparent' }}
                >
                  Cluster 0: Loyal High-Value (32%)
                </button>
                <button
                  className={`${styles.clusterBtn} ${selectedCluster === 'active' ? styles.activeCluster : ''}`}
                  onClick={() => setSelectedCluster('active')}
                  style={{ borderColor: '#00d2ff', color: selectedCluster === 'active' ? '#05080f' : '#00d2ff', background: selectedCluster === 'active' ? '#00d2ff' : 'transparent' }}
                >
                  Cluster 1: Active Prospects (45%)
                </button>
                <button
                  className={`${styles.clusterBtn} ${selectedCluster === 'risk' ? styles.activeCluster : ''}`}
                  onClick={() => setSelectedCluster('risk')}
                  style={{ borderColor: '#f43f5e', color: selectedCluster === 'risk' ? '#05080f' : '#f43f5e', background: selectedCluster === 'risk' ? '#f43f5e' : 'transparent' }}
                >
                  Cluster 2: Churn Risk (23%)
                </button>
              </div>

              <div className={styles.clusterScatter}>
                <div className={styles.scatterBox}>
                  {/* Cluster Point Clouds */}
                  <div className={`${styles.pointGroup} ${selectedCluster !== 'all' && selectedCluster !== 'loyal' ? styles.dimmed : ''}`}>
                    <div className={styles.centroid} style={{ top: '25%', left: '70%', background: '#00f5a0' }}>
                      <span>Loyal Centroid (μ=$480, F=8.2)</span>
                    </div>
                  </div>

                  <div className={`${styles.pointGroup} ${selectedCluster !== 'all' && selectedCluster !== 'active' ? styles.dimmed : ''}`}>
                    <div className={styles.centroid} style={{ top: '60%', left: '45%', background: '#00d2ff' }}>
                      <span>Prospects Centroid (μ=$120, F=2.1)</span>
                    </div>
                  </div>

                  <div className={`${styles.pointGroup} ${selectedCluster !== 'all' && selectedCluster !== 'risk' ? styles.dimmed : ''}`}>
                    <div className={styles.centroid} style={{ top: '75%', left: '20%', background: '#f43f5e' }}>
                      <span>At-Risk Centroid (μ=$45, Rec=140d)</span>
                    </div>
                  </div>
                </div>

                <div className={styles.clusterStats}>
                  <div className={styles.statMetric}>
                    <span className={styles.metricLabel}>Silhouette Score</span>
                    <span className={styles.metricVal}>0.684</span>
                  </div>
                  <div className={styles.statMetric}>
                    <span className={styles.metricLabel}>Explained Variance (PCA)</span>
                    <span className={styles.metricVal}>86.2%</span>
                  </div>
                  <div className={styles.statMetric}>
                    <span className={styles.metricLabel}>VADER Sentiment Correlation</span>
                    <span className={styles.metricVal}>r = +0.79</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
