'use client';

import { useRef } from 'react';
import styles from './ProjectCard.module.css';

export default function ProjectCard({ id, title, description, tech, categoryLabel, link, svgPath }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div 
      ref={cardRef}
      className={styles.projectCard}
      onMouseMove={handleMouseMove}
    >
      <div className={styles.spotlightOverlay} />

      <div className={styles.cardHeader}>
        <div className={styles.categoryBadge}>
          <span className={styles.badgeDot}></span>
          <span>{categoryLabel}</span>
        </div>
        <span className={styles.sysId}>ID: {id?.toUpperCase() || 'SYS_01'}</span>
      </div>

      <div className={styles.projectCardImage}>
        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d={svgPath}></path>
        </svg>
      </div>

      <div className={styles.projectCardBody}>
        <h3 className={styles.projectTitle}>{title}</h3>
        <p className={styles.projectText}>{description}</p>

        <div className={styles.projectTech}>
          {tech.map((t, idx) => (
            <span key={idx} className={styles.techBadge}>{t}</span>
          ))}
        </div>

        <div className={styles.cardFooter}>
          <a href={link} className={styles.projectLink}>
            <span>ACCESS REPOSITORY</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
