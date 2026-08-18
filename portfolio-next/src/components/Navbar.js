'use client';

import { useState, useEffect } from 'react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [theme, setTheme] = useState('dark');
  const [activeLink, setActiveLink] = useState('about');

  useEffect(() => {
    const savedTheme = localStorage.getItem('portfolio-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light'); // Default to dark for futuristic vibe
    setTheme(initialTheme);
    document.body.className = `${initialTheme}-theme`;
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('portfolio-theme', nextTheme);
    document.body.className = `${nextTheme}-theme`;
  };

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const sections = ['about', 'interactive-lab', 'projects', 'skills', 'contact'];
          const scrollPosition = window.scrollY + 120;
          
          for (const sectionId of sections) {
            const el = document.getElementById(sectionId);
            if (el) {
              const top = el.offsetTop;
              const height = el.offsetHeight;
              if (scrollPosition >= top && scrollPosition < top + height) {
                setActiveLink(sectionId);
                break;
              }
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarContent}>
        <a href="/" className={styles.logo}>
          <span className={styles.logoGlow}>◆</span>
          <span>Jimmy De Jesus</span>
        </a>

        <ul className={styles.navLinks}>
          <li>
            <a 
              href="#about" 
              className={`${styles.navLink} ${activeLink === 'about' ? styles.active : ''}`}
            >
              Overview
            </a>
          </li>
          <li>
            <a 
              href="#interactive-lab" 
              className={`${styles.navLink} ${activeLink === 'interactive-lab' ? styles.active : ''}`}
            >
              Interactive Demo <span className={styles.navBadge}>LIVE</span>
            </a>
          </li>
          <li>
            <a 
              href="#projects" 
              className={`${styles.navLink} ${activeLink === 'projects' ? styles.active : ''}`}
            >
              Projects
            </a>
          </li>
          <li>
            <a 
              href="#skills" 
              className={`${styles.navLink} ${activeLink === 'skills' ? styles.active : ''}`}
            >
              Skills
            </a>
          </li>
          <li>
            <a 
              href="#contact" 
              className={`${styles.navLink} ${activeLink === 'contact' ? styles.active : ''}`}
            >
              Contact
            </a>
          </li>
          <li>
            <a
              href="https://linkedin.com/in/jimmy-de-jesus"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.navLink}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              aria-label="Jimmy De Jesus LinkedIn Profile"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
              <span>LinkedIn</span>
            </a>
          </li>
          <li>
            <button 
              className={styles.themeToggleBtn} 
              onClick={toggleTheme}
              aria-label="Toggle light and dark theme"
            >
              {theme === 'dark' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
