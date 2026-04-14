'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/icons';
import { env } from '@/lib/env';

const FRAME_COUNT = 192;
const FRAME_SPEED = 1.9;
const IMAGE_SCALE = 0.86;
const SCROLL_HEIGHT = '900vh';

export default function LandingPage() {
  const canvasRef          = useRef<HTMLCanvasElement>(null);
  const canvasWrapRef      = useRef<HTMLDivElement>(null);
  const heroRef            = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const overlayRef         = useRef<HTMLDivElement>(null);
  const marqueeRef         = useRef<HTMLDivElement>(null);
  const loaderRef          = useRef<HTMLDivElement>(null);
  const loaderBarRef       = useRef<HTMLDivElement>(null);
  const loaderPctRef       = useRef<HTMLSpanElement>(null);

  const APP_URL = env.NEXT_PUBLIC_APP_URL ?? '';

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const canvas    = canvasRef.current!;
    const ctx       = canvas.getContext('2d')!;
    const wrap      = canvasWrapRef.current!;
    const hero      = heroRef.current!;
    const sc        = scrollContainerRef.current!;
    const overlay   = overlayRef.current!;
    const marqueeEl = marqueeRef.current!;
    const loader    = loaderRef.current!;
    const loaderBar = loaderBarRef.current!;
    const loaderPct = loaderPctRef.current!;

    // ── Canvas sizing ──────────────────────────────────────────────────────
    const dpr = window.devicePixelRatio || 1;
    function resizeCanvas() {
      canvas.width  = window.innerWidth  * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width  = window.innerWidth  + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.scale(dpr, dpr);
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // ── Frame loading ──────────────────────────────────────────────────────
    const frames: HTMLImageElement[] = new Array(FRAME_COUNT);
    let loaded = 0;
    let currentFrame = 0;
    let bgColor = '#080a0f';

    function pad(n: number) { return String(n).padStart(4, '0'); }

    function drawFrame(index: number) {
      const img = frames[index];
      if (!img?.complete) return;
      const cw = window.innerWidth, ch = window.innerHeight;
      const iw = img.naturalWidth,  ih = img.naturalHeight;
      const scale = Math.max(cw / iw, ch / ih) * IMAGE_SCALE;
      const dw = iw * scale, dh = ih * scale;
      const dx = (cw - dw) / 2, dy = (ch - dh) / 2;
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(img, dx, dy, dw, dh);
    }

    function sampleBgColor(img: HTMLImageElement) {
      const offscreen = document.createElement('canvas');
      offscreen.width = 4; offscreen.height = 4;
      const oc = offscreen.getContext('2d')!;
      oc.drawImage(img, 0, 0, 4, 4);
      const px = oc.getImageData(0, 0, 1, 1).data;
      bgColor = `rgb(${px[0]},${px[1]},${px[2]})`;
    }

    function updateProgress(n: number) {
      const pct = Math.round((n / FRAME_COUNT) * 100);
      loaderBar.style.width = pct + '%';
      loaderPct.textContent = pct + '%';
    }

    function loadFirstBatch() {
      let done = 0;
      for (let i = 1; i <= 10; i++) {
        const img = new Image();
        img.onload = () => {
          frames[i - 1] = img;
          loaded++;
          done++;
          updateProgress(loaded);
          if (i === 1) { drawFrame(0); sampleBgColor(img); }
          if (done === 10) loadRemainingBatch();
        };
        img.src = `/frames/frame_${pad(i)}.webp`;
      }
    }

    function loadRemainingBatch() {
      const remaining = FRAME_COUNT - 10;
      let doneSoFar = 0;
      for (let i = 11; i <= FRAME_COUNT; i++) {
        const img = new Image();
        const idx = i - 1;
        img.onload = () => {
          frames[idx] = img;
          loaded++;
          doneSoFar++;
          updateProgress(loaded);
          if (idx % 20 === 0) sampleBgColor(img);
          if (doneSoFar === remaining) onAllLoaded();
        };
        img.src = `/frames/frame_${pad(i)}.webp`;
      }
    }

    function onAllLoaded() {
      loader.style.opacity = '0';
      loader.style.pointerEvents = 'none';
      setTimeout(() => { loader.style.display = 'none'; }, 600);
      initGSAP();
    }

    loadFirstBatch();

    // ── GSAP + Lenis ───────────────────────────────────────────────────────
    async function initGSAP() {
      const { gsap }          = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      const Lenis             = (await import('lenis')).default;

      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time: number) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);

      // ── Hero word-split ──────────────────────────────────────────────────
      gsap.from('.hero-word', { y: 60, opacity: 0, stagger: 0.08, duration: 1.0, ease: 'power3.out', delay: 0.3 });
      gsap.from('.hero-tagline', { y: 30, opacity: 0, duration: 0.8, ease: 'power2.out', delay: 0.9 });
      gsap.from('.hero-scroll-hint', { opacity: 0, duration: 0.6, delay: 1.4 });

      // ── Hero fade + canvas circle-wipe ───────────────────────────────────
      ScrollTrigger.create({
        trigger: sc, start: 'top top', end: 'bottom bottom', scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          hero.style.opacity = String(Math.max(0, 1 - p * 15));
          const wp = Math.min(1, Math.max(0, (p - 0.01) / 0.06));
          wrap.style.clipPath = `circle(${wp * 80}% at 50% 50%)`;
        },
      });

      // ── Frame scrub ──────────────────────────────────────────────────────
      ScrollTrigger.create({
        trigger: sc, start: 'top top', end: 'bottom bottom', scrub: true,
        onUpdate: (self) => {
          const acc = Math.min(self.progress * FRAME_SPEED, 1);
          const idx = Math.min(Math.floor(acc * FRAME_COUNT), FRAME_COUNT - 1);
          if (idx !== currentFrame) {
            currentFrame = idx;
            requestAnimationFrame(() => drawFrame(currentFrame));
          }
        },
      });

      // ── Dark overlay ─────────────────────────────────────────────────────
      const OV_ENTER = 0.52, OV_LEAVE = 0.72, FADE = 0.04;
      ScrollTrigger.create({
        trigger: sc, start: 'top top', end: 'bottom bottom', scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          let op = 0;
          if (p >= OV_ENTER - FADE && p <= OV_ENTER)         op = (p - (OV_ENTER - FADE)) / FADE;
          else if (p > OV_ENTER && p < OV_LEAVE)             op = 0.92;
          else if (p >= OV_LEAVE && p <= OV_LEAVE + FADE)    op = 0.92 * (1 - (p - OV_LEAVE) / FADE);
          overlay.style.opacity = String(op);
        },
      });

      // ── Marquee ──────────────────────────────────────────────────────────
      const marqueeText = marqueeEl.querySelector('.marquee-text') as HTMLElement;
      gsap.to(marqueeText, {
        xPercent: -22, ease: 'none',
        scrollTrigger: { trigger: sc, start: 'top top', end: 'bottom bottom', scrub: true },
      });
      ScrollTrigger.create({
        trigger: sc, start: 'top top', end: 'bottom bottom', scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          const edge = 0.02;
          let op = 0;
          if (p >= 0.46 && p <= 0.48)      op = (p - 0.46) / edge;
          else if (p > 0.48 && p < 0.64)   op = 1;
          else if (p >= 0.64 && p <= 0.66) op = 1 - (p - 0.64) / edge;
          marqueeEl.style.opacity = String(op);
        },
      });

      // ── Fixed text panels ─────────────────────────────────────────────────
      // Each .scroll-section is position:absolute inside the fixed overlay.
      // We only animate opacity via GSAP — no top/transform calculations needed.
      document.querySelectorAll('.scroll-section').forEach((section) => {
        const el      = section as HTMLElement;
        const type    = el.dataset.animation ?? 'fade-up';
        const persist = el.dataset.persist === 'true';
        const enter   = parseFloat(el.dataset.enter ?? '0') / 100;
        const leave   = parseFloat(el.dataset.leave ?? '100') / 100;

        const children = Array.from(el.querySelectorAll(
          '.section-label, .section-heading, .section-body, .section-note, .cta-heading, .cta-body, .cta-button, .stat'
        ));

        const tl = gsap.timeline({ paused: true });
        switch (type) {
          case 'fade-up':
            tl.from(children, { y: 50, opacity: 0, stagger: 0.12, duration: 0.9, ease: 'power3.out' }); break;
          case 'slide-left':
            tl.from(children, { x: -80, opacity: 0, stagger: 0.14, duration: 0.9, ease: 'power3.out' }); break;
          case 'slide-right':
            tl.from(children, { x: 80, opacity: 0, stagger: 0.14, duration: 0.9, ease: 'power3.out' }); break;
          case 'scale-up':
            tl.from(children, { scale: 0.85, opacity: 0, stagger: 0.12, duration: 1.0, ease: 'power2.out' }); break;
          case 'rotate-in':
            tl.from(children, { y: 40, rotation: 3, opacity: 0, stagger: 0.1, duration: 0.9, ease: 'power3.out' }); break;
          case 'stagger-up':
            tl.from(children, { y: 60, opacity: 0, stagger: 0.15, duration: 0.8, ease: 'power3.out' }); break;
          case 'clip-reveal':
            tl.from(children, { clipPath: 'inset(100% 0 0 0)', opacity: 0, stagger: 0.15, duration: 1.2, ease: 'power4.inOut' }); break;
        }

        let isVisible = false;

        ScrollTrigger.create({
          trigger: sc, start: 'top top', end: 'bottom bottom',
          onUpdate: (self) => {
            const p = self.progress;
            const inRange = p >= enter && p <= leave;

            if (inRange && !isVisible) {
              // Entering range: fade in + play entrance animation once
              isVisible = true;
              gsap.to(el, { opacity: 1, duration: 0.5, ease: 'power2.out' });
              if (tl.progress() === 0) tl.play();
            } else if (!inRange && isVisible) {
              // Leaving range
              isVisible = false;
              if (persist && p > leave) {
                // CTA stays visible after its section ends
                gsap.to(el, { opacity: 1, duration: 0.3 });
              } else {
                gsap.to(el, { opacity: 0, duration: 0.4, ease: 'power2.in' });
                if (p < enter) tl.progress(0).pause(); // reset for scroll-back
              }
            }
          },
        });
      });

      // ── Counter animations ────────────────────────────────────────────────
      document.querySelectorAll('.stat-number').forEach((el) => {
        const num      = el as HTMLElement;
        const target   = parseFloat(num.dataset.value ?? '0');
        const decimals = parseInt(num.dataset.decimals ?? '0');
        const section  = num.closest('.scroll-section') as HTMLElement;
        const enter    = parseFloat(section?.dataset.enter ?? '0') / 100;

        ScrollTrigger.create({
          trigger: sc, start: 'top top', end: 'bottom bottom',
          onUpdate: (self) => {
            if (self.progress >= enter && !num.dataset.animated) {
              num.dataset.animated = 'true';
              gsap.fromTo(num, { textContent: 0 }, {
                textContent: target,
                duration: 2,
                ease: 'power1.out',
                snap: { textContent: decimals === 0 ? 1 : 0.01 },
                onUpdate() {
                  const val = parseFloat(num.textContent ?? '0');
                  num.textContent = decimals === 0 ? Math.round(val).toString() : val.toFixed(decimals);
                },
              });
            }
          },
        });
      });
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div style={{ fontFamily: "'JetBrains Mono', monospace", background: '#080a0f', color: '#e8edf2', overflowX: 'hidden' }}>

      {/* ── Loader ── */}
      <div ref={loaderRef} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#080a0f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px', transition: 'opacity 0.6s' }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.3em', color: '#ff3b3b', textTransform: 'uppercase' }}>
          GUARDM // SYSTEM ONLINE
        </div>
        <div style={{ width: '200px', height: '2px', background: 'rgba(255,59,59,0.15)', borderRadius: '2px', overflow: 'hidden' }}>
          <div ref={loaderBarRef} style={{ height: '100%', width: '0%', background: '#ff3b3b', transition: 'width 0.1s linear', borderRadius: '2px' }} />
        </div>
        <span ref={loaderPctRef} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'rgba(255,59,59,0.5)', letterSpacing: '0.2em' }}>0%</span>
      </div>

      {/* ── Header ── */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '6px', borderRadius: '4px', background: 'rgba(255,59,59,0.15)', border: '1px solid rgba(255,59,59,0.3)' }}>
            <Logo className="w-4 h-4 text-[#ff3b3b]" />
          </div>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: '15px', letterSpacing: '0.15em' }}>
            GRD<span style={{ color: '#ff3b3b' }}>[M]</span>
          </span>
        </div>
        <nav style={{ display: 'flex', gap: '32px', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          <Link href="/map" style={{ color: '#6b7a8d', textDecoration: 'none' }}>Map</Link>
          <Link href="/map" style={{ color: '#6b7a8d', textDecoration: 'none' }}>Reports</Link>
          <a href="https://github.com/Khoa-Dam/GuardM-api" target="_blank" rel="noreferrer" style={{ color: '#6b7a8d', textDecoration: 'none' }}>API</a>
        </nav>
        <Link href={APP_URL + '/dashboard'} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', padding: '8px 16px', border: '1px solid rgba(255,59,59,0.4)', borderRadius: '4px', background: 'rgba(255,59,59,0.1)', color: '#ff3b3b', textDecoration: 'none' }}>
          Open App →
        </Link>
      </header>

      {/* ── Hero (100vh, scrolls away naturally) ── */}
      <section ref={heroRef} style={{ position: 'relative', height: '100vh', background: '#080a0f', display: 'flex', alignItems: 'center', zIndex: 10 }}>
        <div style={{ paddingLeft: '8vw', maxWidth: '60vw' }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', letterSpacing: '0.3em', color: '#ff3b3b', textTransform: 'uppercase', marginBottom: '32px' }}>
            THREAT MONITOR / ACTIVE
          </div>
          <h1 style={{ fontSize: 'clamp(3rem, 8vw, 8rem)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: '32px' }}>
            {['Every', 'threat', 'leaves', 'a', 'trace'].map((w, i) => (
              <span key={i} className="hero-word" style={{ display: 'inline-block', marginRight: '0.25em' }}>{w}</span>
            ))}
          </h1>
          <p className="hero-tagline" style={{ fontFamily: "'Inter', sans-serif", fontSize: '1rem', color: '#6b7a8d', letterSpacing: '0.05em', lineHeight: 1.6 }}>
            Report incidents. Verify together. Alert in real time.
          </p>
        </div>
        <div className="hero-scroll-hint" style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.3em', color: 'rgba(107,122,141,0.6)', textTransform: 'uppercase' }}>
          <span>SCROLL TO ENGAGE</span>
          <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
            <path d="M5 0v12M1 8l4 5 4-5" stroke="currentColor" strokeWidth="1.2"/>
          </svg>
        </div>
      </section>

      {/* ── Canvas (fixed, full viewport) ── */}
      <div ref={canvasWrapRef} style={{ position: 'fixed', inset: 0, zIndex: 1, clipPath: 'circle(0% at 50% 50%)' }}>
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      </div>

      {/* ── Dark overlay ── */}
      <div ref={overlayRef} style={{ position: 'fixed', inset: 0, zIndex: 2, background: '#080a0f', opacity: 0, pointerEvents: 'none' }} />

      {/* ── Marquee ── */}
      <div ref={marqueeRef} style={{ position: 'fixed', top: '50%', left: 0, right: 0, zIndex: 3, transform: 'translateY(-50%)', opacity: 0, pointerEvents: 'none', overflow: 'hidden', whiteSpace: 'nowrap' }}>
        <div className="marquee-text" style={{ display: 'inline-block', fontSize: '11vw', fontWeight: 800, letterSpacing: '-0.02em', color: '#ff3b3b', opacity: 0.07, textTransform: 'uppercase' }}>
          LIVE THREAT DETECTION &nbsp;—&nbsp; COMMUNITY VERIFIED &nbsp;—&nbsp; GUARDM ACTIVE &nbsp;—&nbsp; SAFE ZONE NETWORK &nbsp;—&nbsp; ALERT DETECTED &nbsp;—&nbsp; LIVE THREAT DETECTION &nbsp;—&nbsp; COMMUNITY VERIFIED &nbsp;—&nbsp;
        </div>
      </div>

      {/* ── Fixed text overlay — panels are pinned to viewport center ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 10, pointerEvents: 'none' }}>

        {/* Section 1 — slide-left, left-aligned */}
        <section className="scroll-section" data-enter="8" data-leave="22" data-animation="slide-left"
          style={{ position: 'absolute', inset: 0, opacity: 0, display: 'flex', alignItems: 'center', paddingLeft: '8vw', paddingRight: '55vw' }}>
          <div>
            <div className="section-label" style={labelStyle}>001 / LIVE TRACKING</div>
            <h2 className="section-heading" style={headingStyle}>Live Real-Time Tracking</h2>
            <p className="section-body" style={bodyStyle}>WebSocket streams continuously push new report positions. The map reflects ground truth in under 200ms.</p>
            <div className="section-note" style={noteStyle}>LATENCY &lt; 200MS</div>
          </div>
        </section>

        {/* Section 2 — slide-right, right-aligned */}
        <section className="scroll-section" data-enter="22" data-leave="36" data-animation="slide-right"
          style={{ position: 'absolute', inset: 0, opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingLeft: '55vw', paddingRight: '8vw' }}>
          <div style={{ width: '100%' }}>
            <div className="section-label" style={labelStyle}>002 / THREAT SCORING</div>
            <h2 className="section-heading" style={headingStyle}>Trust Score —<br/>not rumor</h2>
            <p className="section-body" style={bodyStyle}>Every report is confirmed or disputed by the community. The trust score self-adjusts over time based on evidence.</p>
          </div>
        </section>

        {/* Section 3 — clip-reveal, left-aligned */}
        <section className="scroll-section" data-enter="36" data-leave="50" data-animation="clip-reveal"
          style={{ position: 'absolute', inset: 0, opacity: 0, display: 'flex', alignItems: 'center', paddingLeft: '8vw', paddingRight: '55vw' }}>
          <div>
            <div className="section-label" style={labelStyle}>003 / AI ANALYSIS</div>
            <h2 className="section-heading" style={headingStyle}>AI reads the map,<br/>people act</h2>
            <p className="section-body" style={bodyStyle}>Claude AI analyzes report density, generates a Safety Score, and delivers specific recommendations per area — updated by the hour.</p>
          </div>
        </section>

        {/* Stats — stagger-up, centered */}
        <section className="scroll-section" data-enter="54" data-leave="70" data-animation="stagger-up"
          style={{ position: 'absolute', inset: 0, opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '48px', padding: '0 8vw', width: '100%' }}>
            {[
              { value: '1247', suffix: '',   label: 'Reports Processed' },
              { value: '5',    suffix: 'km', label: 'Alert Radius' },
              { value: '98',   suffix: '%',  label: 'Verification Accuracy' },
              { value: '200',  suffix: 'ms', label: 'WebSocket Latency' },
            ].map((s, i) => (
              <div key={i} className="stat" style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px' }}>
                  <span className="stat-number" data-value={s.value} data-decimals="0"
                    style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 'clamp(2rem, 4vw, 4.5rem)', fontWeight: 800, color: '#e8edf2', lineHeight: 1 }}>0</span>
                  {s.suffix && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.5rem', fontWeight: 400, color: '#ff3b3b' }}>{s.suffix}</span>}
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', letterSpacing: '0.15em', color: '#6b7a8d', textTransform: 'uppercase', marginTop: '8px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4 — scale-up, right-aligned */}
        <section className="scroll-section" data-enter="70" data-leave="82" data-animation="scale-up"
          style={{ position: 'absolute', inset: 0, opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingLeft: '55vw', paddingRight: '8vw' }}>
          <div style={{ width: '100%' }}>
            <div className="section-label" style={labelStyle}>004 / COVERAGE</div>
            <h2 className="section-heading" style={headingStyle}>City-Wide Alert Network</h2>
            <p className="section-body" style={bodyStyle}>From the city center to the suburbs — anyone can report and receive alerts within a 5km radius.</p>
          </div>
        </section>

        {/* Section 5 — rotate-in, left-aligned */}
        <section className="scroll-section" data-enter="82" data-leave="92" data-animation="rotate-in"
          style={{ position: 'absolute', inset: 0, opacity: 0, display: 'flex', alignItems: 'center', paddingLeft: '8vw', paddingRight: '55vw' }}>
          <div>
            <div className="section-label" style={labelStyle}>005 / OPEN SOURCE</div>
            <h2 className="section-heading" style={headingStyle}>Transparent by Design,<br/>End to End</h2>
            <p className="section-body" style={bodyStyle}>Trust Score, heatmap, AI analysis — all open source and independently verifiable.</p>
          </div>
        </section>

        {/* CTA — fade-up, centered, persists */}
        <section className="scroll-section" data-enter="88" data-leave="100" data-animation="fade-up" data-persist="true"
          style={{ position: 'absolute', inset: 0, opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', maxWidth: '600px', padding: '0 24px' }}>
            <div className="section-label" style={{ ...labelStyle, textAlign: 'center', marginBottom: '24px' }}>GUARDM / JOIN</div>
            <h2 className="cta-heading" style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '20px' }}>
              Join the network.<br/>Protect your community.
            </h2>
            <p className="cta-body" style={{ fontFamily: "'Inter', sans-serif", fontSize: '1rem', color: '#6b7a8d', marginBottom: '40px', lineHeight: 1.6 }}>
              Free to use. No account required to view the threat map.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', pointerEvents: 'all' }}>
              <Link href="/map" className="cta-button"
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', padding: '14px 28px', border: '1px solid rgba(255,59,59,0.5)', borderRadius: '4px', background: 'rgba(255,59,59,0.12)', color: '#ff3b3b', textDecoration: 'none', display: 'inline-block' }}>
                OPEN MAP →
              </Link>
              <a href="https://github.com/Khoa-Dam/GuardM-api" target="_blank" rel="noreferrer" className="cta-button"
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', padding: '14px 28px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '4px', background: 'transparent', color: '#6b7a8d', textDecoration: 'none', display: 'inline-block' }}>
                VIEW ON GITHUB
              </a>
            </div>
          </div>
        </section>

      </div>{/* /text-overlay */}

      {/* ── Scroll driver — 900vh, no visible content, drives all scroll triggers ── */}
      <div ref={scrollContainerRef} id="scroll-container" style={{ height: SCROLL_HEIGHT, position: 'relative', zIndex: 5 }} />

    </div>
  );
}

// ── Shared style objects ──────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '10px',
  letterSpacing: '0.3em',
  color: '#ff3b3b',
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: '16px',
};

const headingStyle: React.CSSProperties = {
  fontSize: 'clamp(1.8rem, 3.5vw, 3.8rem)',
  fontWeight: 800,
  lineHeight: 1.1,
  letterSpacing: '-0.02em',
  color: '#e8edf2',
  marginBottom: '20px',
};

const bodyStyle: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '1rem',
  lineHeight: 1.7,
  color: '#8899aa',
  marginBottom: '16px',
};

const noteStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '9px',
  letterSpacing: '0.25em',
  color: 'rgba(255,59,59,0.5)',
  textTransform: 'uppercase',
  marginTop: '8px',
};
