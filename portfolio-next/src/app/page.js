import BackgroundCanvas from '../components/BackgroundCanvas';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import InteractiveLab from '../components/InteractiveLab';
import About from '../components/About';
import ProjectsGrid from '../components/ProjectsGrid';
import Skills from '../components/Skills';
import ContactForm from '../components/ContactForm';
import styles from './page.module.css';

export default function Home() {
  return (
    <>
      <BackgroundCanvas />
      <Navbar />

      <main className={styles.main}>
        <Hero />
        <InteractiveLab />
        <About />
        <ProjectsGrid />
        <Skills />
        <ContactForm />
      </main>

      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerContent}>
            <div className={styles.footerBrand}>
              <span className={styles.glowDot}>◆</span>
              <span className="mono">Jimmy De Jesus // AI_ENGINEERING_&amp;_DATA_SCIENCE</span>
            </div>
            
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <a 
                href="https://github.com/jimmyjdejesus-cmyk" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="mono" 
                style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s' }}
              >
                GitHub
              </a>
              <a 
                href="https://linkedin.com/in/jimmy-de-jesus" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="mono" 
                style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s' }}
              >
                LinkedIn
              </a>
              <a 
                href="mailto:jimmyjdejesus@outlook.com" 
                className="mono" 
                style={{ color: 'var(--accent)', fontSize: '0.85rem', textDecoration: 'none' }}
              >
                jimmyjdejesus@outlook.com
              </a>
            </div>

            <p className="mono" style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
              &copy; {new Date().getFullYear()} Jimmy De Jesus // NEXT.JS 16
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
