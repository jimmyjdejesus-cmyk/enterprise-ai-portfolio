'use client';

import { useState } from 'react';
import ProjectCard from './ProjectCard';
import projectsData from '../data/projects.json';
import styles from './ProjectsGrid.module.css';

export default function ProjectsGrid() {
  const [filter, setFilter] = useState('all');

  const filteredProjects = filter === 'all'
    ? projectsData
    : projectsData.filter(project => project.category === filter);

  return (
    <section className="section" id="projects">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Selected Work</span>
          <h2 className="section-title">Explore my recent projects</h2>
        </div>

        <div className={styles.filterBar}>
          <button 
            className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            All Projects
          </button>
          <button 
            className={`${styles.filterBtn} ${filter === 'ai' ? styles.active : ''}`}
            onClick={() => setFilter('ai')}
          >
            Artificial Intelligence
          </button>
          <button 
            className={`${styles.filterBtn} ${filter === 'ds' ? styles.active : ''}`}
            onClick={() => setFilter('ds')}
          >
            Data Science
          </button>
          <button 
            className={`${styles.filterBtn} ${filter === 'ba' ? styles.active : ''}`}
            onClick={() => setFilter('ba')}
          >
            Business Intelligence
          </button>
        </div>

        <div className={styles.projectsGrid}>
          {filteredProjects.map(project => (
            <div key={project.id} className={styles.fadeSlide}>
              <ProjectCard {...project} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
