'use client';

import { useState, useEffect } from 'react';
import styles from './TelemetryHUD.module.css';

export default function TelemetryHUD() {
  const [timeStr, setTimeStr] = useState('');
  const [sessionDuration, setSessionDuration] = useState(0);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0').slice(0, 2));
    };

    const interval = setInterval(updateTime, 1000);
    updateTime();

    const durationInterval = setInterval(() => {
      setSessionDuration((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(durationInterval);
    };
  }, []);

  return (
    <aside aria-label="System Diagnostics HUD" className={styles.telemetryContainer}>
      <div className={styles.telemetryInner}>
        <div className={styles.statusItem}>
          <span className={styles.statusDot}></span>
          <span className={styles.statusLabel}>NEURAL_CORE:</span>
          <span className={styles.statusValue}>ACTIVE</span>
        </div>

        <div className={styles.divider}>|</div>

        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>MODEL:</span>
          <span className={styles.statusValue}>GEMINI-1.5 // SARIMAX</span>
        </div>

        <div className={styles.divider}>|</div>

        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>LATENCY:</span>
          <span className={styles.statusValue}>12ms</span>
        </div>

        <div className={styles.divider}>|</div>

        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>SESSION_DURATION:</span>
          <span className={styles.statusValue}>{sessionDuration}s</span>
        </div>

        <div className={styles.divider}>|</div>

        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>TIMESTAMP:</span>
          <span className={styles.statusValue}>{timeStr}</span>
        </div>
      </div>
    </aside>
  );
}
