import BackgroundCanvas from '../components/BackgroundCanvas';
import TelemetryHUD from '../components/TelemetryHUD';
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
      <div className="cyber-scanlines" />
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
              <span className="mono">Jimmy De Jesus // AUTONOMOUS_INTELLIGENCE_PORTFOLIO</span>
            </div>
            <p className="mono" style={{ fontSize: '0.78rem' }}>
              &copy; {new Date().getFullYear()} Jimmy De Jesus // NEXT.JS 16 // DEPLOYED WITH NEURAL PRECISION
            </p>
          </div>
        </div>
      </footer>

      <TelemetryHUD />
    </>
  );
}
