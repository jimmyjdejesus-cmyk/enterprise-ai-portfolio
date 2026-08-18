'use client';

import { useState } from 'react';
import styles from './ContactForm.module.css';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('TRANSMITTING_MESSAGE...');
    
    // Construct mailto link for direct reliable dispatch
    const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
    const body = encodeURIComponent(`Sender: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
    const mailtoUrl = `mailto:jimmyjdejesus@outlook.com?subject=${subject}&body=${body}`;
    
    setTimeout(() => {
      setStatus(`UPLINK_READY: Opening your local email client for transmission...`);
      window.location.href = mailtoUrl;
    }, 400);
  };

  return (
    <section className="section" id="contact">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">Direct Transmission Channel</div>
          <h2 className="section-title">Establish Communication Uplink</h2>
        </div>

        <div className={styles.contactLayout}>
          <div className={styles.contactInfo}>
            <p className={styles.infoLead}>
              Open to full-time AI/ML Engineering, Applied Data Science, or Analytics Engineering roles. Let's discuss high-impact architectures, datasets, or opportunities.
            </p>

            <a href="mailto:jimmyjdejesus@outlook.com" className={styles.contactMethodLink}>
              <div className={styles.contactMethod}>
                <div className={styles.contactIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <div>
                  <div className={styles.contactLabel}>DIRECT_EMAIL [CLICK TO COMPOSE]</div>
                  <div className={styles.contactValue}>jimmyjdejesus@outlook.com</div>
                </div>
              </div>
            </a>

            <a href="https://github.com/jimmyjdejesus-cmyk" target="_blank" rel="noopener noreferrer" className={styles.contactMethodLink}>
              <div className={styles.contactMethod}>
                <div className={styles.contactIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                  </svg>
                </div>
                <div>
                  <div className={styles.contactLabel}>CODE_REPOSITORY</div>
                  <div className={styles.contactValue}>github.com/jimmyjdejesus-cmyk</div>
                </div>
              </div>
            </a>

            <a href="https://linkedin.com/in/jimmy-de-jesus" target="_blank" rel="noopener noreferrer" className={styles.contactMethodLink}>
              <div className={styles.contactMethod}>
                <div className={styles.contactIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </div>
                <div>
                  <div className={styles.contactLabel}>PROFESSIONAL_NETWORK</div>
                  <div className={styles.contactValue}>linkedin.com/in/jimmy-de-jesus</div>
                </div>
              </div>
            </a>

            <div className={styles.sysStatus}>
              <span className={styles.statusDot}></span>
              <span>AVAILABLE FOR FULL-TIME HIRE // RESPONSE &lt; 24H</span>
            </div>
          </div>

          <form className={styles.contactForm} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="form-name">SENDER_NAME [REQ]</label>
              <input 
                type="text" 
                id="form-name" 
                className={styles.formControl} 
                placeholder="Jane Doe" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="form-email">CONTACT_EMAIL [REQ]</label>
              <input 
                type="email" 
                id="form-email" 
                className={styles.formControl} 
                placeholder="jane@company.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="form-message">TRANSMISSION_PAYLOAD [REQ]</label>
              <textarea 
                id="form-message" 
                className={styles.formControl} 
                placeholder="Describe your objectives, dataset challenges, or role opportunity..." 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: 'fit-content' }}>
              <span>Transmit Signal</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>

            {status && (
              <div className={styles.statusAlert}>
                <span>&gt; {status}</span>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
