import React, { Suspense, lazy } from 'react';
import { ArrowRight, ArrowDown, Activity, PieChart, LineChart } from 'lucide-react';
import { useGsap, gsap, countUp, EASE } from '../design/motion';

// Three.js streams in after the hero paints; the intro fades it in regardless.
const Globe = lazy(() => import('./Globe').then((m) => ({ default: m.Globe })));

interface LandingPageProps {
  onEnter: () => void;
}

const STATS = [
  { value: 10, suffix: '', label: 'Years of records', sub: '2014 — 2023' },
  { value: 18, suffix: '', label: 'Causes of death', sub: 'tracked & compared' },
  { value: 5000, suffix: '+', label: 'Monthly records', sub: 'per query' },
  { value: 3, suffix: '', label: 'Authoritative sources', sub: 'CDC · WHO · Eurostat' },
];

const EXPLORE = [
  {
    n: '01',
    Icon: Activity,
    title: 'Mortality dashboard',
    body: 'Compare death counts across causes and years, then read the seasonal rhythm month by month.',
  },
  {
    n: '02',
    Icon: PieChart,
    title: 'Demographic breakdowns',
    body: 'See how mortality distributes across age groups and sex — where the burden actually falls.',
  },
  {
    n: '03',
    Icon: LineChart,
    title: 'Long-run trends',
    body: 'Track death rates and life expectancy across decades and populations, side by side.',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const root = useGsap<HTMLDivElement>((self) => {
    const q = gsap.utils.selector(self);

    // Hero intro choreography.
    const tl = gsap.timeline({ defaults: { ease: EASE } });
    tl.to(q('[data-hero-eyebrow]'), { autoAlpha: 1, y: 0, duration: 0.6 })
      .fromTo(
        q('[data-hero-line]'),
        { yPercent: 115, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 1.05, stagger: 0.1 },
        '-=0.25',
      )
      .to(q('[data-hero-sub]'), { autoAlpha: 1, y: 0, duration: 0.7 }, '-=0.55')
      .to(q('[data-hero-cta]'), { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1 }, '-=0.4')
      .fromTo(
        q('[data-hero-globe]'),
        { autoAlpha: 0, scale: 0.82 },
        { autoAlpha: 1, scale: 1, duration: 1.6, ease: 'power2.out' },
        0.15,
      )
      .to(q('[data-hero-scroll]'), { autoAlpha: 1, duration: 0.6 }, '-=0.3');

    // Globe drifts up and fades as the hero scrolls away.
    gsap.to(q('[data-hero-globe]'), {
      yPercent: -18,
      autoAlpha: 0.25,
      ease: 'none',
      scrollTrigger: {
        trigger: self.querySelector('[data-hero-section]'),
        start: 'top top',
        end: 'bottom top',
        scrub: 0.6,
      },
    });

    // Generic scroll reveals.
    q('[data-reveal]').forEach((el) => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 26 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          ease: EASE,
          scrollTrigger: { trigger: el as Element, start: 'top 86%' },
        },
      );
    });

    // Count-up stats.
    q('[data-count]').forEach((el) => {
      const node = el as HTMLElement;
      const end = parseFloat(node.dataset.count || '0');
      countUp(node, end, { suffix: node.dataset.suffix || '', decimals: 0 });
    });
  }, []);

  return (
    <div ref={root} className="grain min-h-screen bg-paper text-ink antialiased">
      {/* ---------------- HERO ---------------- */}
      <section
        data-hero-section
        className="relative isolate overflow-hidden"
        style={{ minHeight: '100svh' }}
      >
        {/* Globe — bleeds off the right on desktop, sits faint behind text on mobile.
            Outer div owns the responsive resting opacity; inner div is the GSAP target. */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.34] md:left-auto md:right-[-8%] md:top-1/2 md:h-[120vh] md:w-[62vw] md:-translate-y-1/2 md:opacity-100">
          <div data-hero-globe className="h-full w-full">
            <Suspense fallback={null}>
              <Globe className="h-full w-full" />
            </Suspense>
          </div>
        </div>

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between px-[var(--shell-x)] pt-7">
          <div className="flex items-center gap-2.5">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-ink text-paper">
              <Activity className="h-4 w-4" strokeWidth={2.2} />
            </span>
            <span className="font-mono text-sm font-medium tracking-[0.18em]">VITALIS</span>
          </div>
          <button
            data-hero-cta
            onClick={onEnter}
            className="hidden font-mono text-xs uppercase tracking-eyebrow text-ink-mute transition-colors hover:text-ink sm:inline-flex"
          >
            Enter&nbsp;→
          </button>
        </div>

        {/* Hero content */}
        <div className="relative z-10 mx-auto flex max-w-wide flex-col justify-center px-[var(--shell-x)] pb-24 pt-[12vh] md:pt-[16vh]">
          <p data-hero data-hero-eyebrow className="eyebrow mb-6" style={{ transform: 'translateY(12px)' }}>
            CDC · WHO · Eurostat — public-health data
          </p>

          <h1 className="max-w-[18ch] font-display text-[clamp(2.7rem,8.5vw,6.6rem)] font-normal leading-[0.98] tracking-tight">
            <span className="block overflow-hidden">
              <span data-hero data-hero-line className="block">
                Reading the world&rsquo;s
              </span>
            </span>
            <span className="block overflow-hidden">
              <span data-hero data-hero-line className="block italic text-brand-dark">
                vital signs.
              </span>
            </span>
          </h1>

          <p
            data-hero
            data-hero-sub
            className="mt-8 max-w-prose text-lg leading-relaxed text-ink-soft md:text-xl"
            style={{ transform: 'translateY(16px)' }}
          >
            Vitalis turns decades of mortality and public-health records into a clear, interactive
            picture — leading causes, seasonal rhythms, demographics, and the long arc of how
            populations live and die.
          </p>

          <div className="mt-11 flex flex-wrap items-center gap-x-7 gap-y-4">
            <button
              data-hero
              data-hero-cta
              onClick={onEnter}
              style={{ transform: 'translateY(16px)' }}
              className="group inline-flex items-center gap-3 rounded-pill bg-ink px-7 py-4 text-sm font-medium text-paper shadow-float transition-transform duration-300 ease-editorial hover:-translate-y-0.5"
            >
              Enter the observatory
              <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-editorial group-hover:translate-x-1" />
            </button>
            <a
              data-hero
              data-hero-cta
              href="#explore"
              style={{ transform: 'translateY(16px)' }}
              className="link-underline font-mono text-xs uppercase tracking-eyebrow text-ink-mute hover:text-ink"
            >
              Explore the data
            </a>
          </div>
        </div>

        {/* Scroll cue */}
        <div
          data-hero-scroll
          className="absolute bottom-7 left-[var(--shell-x)] z-10 flex items-center gap-3 text-ink-faint"
        >
          <ArrowDown className="h-4 w-4 animate-bounce" />
          <span className="font-mono text-[0.7rem] uppercase tracking-eyebrow">Scroll</span>
        </div>
      </section>

      {/* ---------------- STAT BAND ---------------- */}
      <section className="border-y border-ink-line bg-paper-raised">
        <div className="mx-auto max-w-wide px-[var(--shell-x)]">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                data-reveal
                className={`flex flex-col gap-2 py-10 lg:py-14 ${
                  i % 2 === 0 ? 'pr-6' : 'pl-6'
                } ${i < 2 ? 'border-b border-ink-line lg:border-b-0' : ''} ${
                  i % 2 === 1 ? 'border-l border-ink-line' : ''
                } lg:border-l lg:first:border-l-0`}
              >
                <span className="nums font-display text-[clamp(2.6rem,5vw,4rem)] font-medium leading-none text-ink">
                  <span data-count={s.value} data-suffix={s.suffix}>
                    {s.value.toLocaleString('en-US')}
                    {s.suffix}
                  </span>
                </span>
                <span className="mt-2 text-sm font-medium text-ink-soft">{s.label}</span>
                <span className="font-mono text-xs text-ink-faint">{s.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- EXPLORE ---------------- */}
      <section id="explore" className="mx-auto max-w-wide px-[var(--shell-x)] py-24 md:py-36">
        <div className="grid gap-x-12 gap-y-6 md:grid-cols-12">
          <div className="md:col-span-4">
            <p data-reveal className="eyebrow mb-5">
              What you can explore
            </p>
            <h2
              data-reveal
              className="font-display text-[clamp(2rem,4vw,3.25rem)] font-normal leading-[1.05]"
            >
              Three lenses on the same human story.
            </h2>
          </div>
          <div className="md:col-span-7 md:col-start-6">
            <div className="flex flex-col">
              {EXPLORE.map(({ n, Icon, title, body }) => (
                <div
                  key={n}
                  data-reveal
                  className="group grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-t border-ink-line py-9 first:border-t-0 first:pt-0"
                >
                  <span className="font-mono text-sm text-ink-faint">{n}</span>
                  <div>
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-brand" strokeWidth={1.8} />
                      <h3 className="font-display text-2xl font-medium md:text-[1.7rem]">{title}</h3>
                    </div>
                    <p className="mt-3 max-w-prose text-ink-soft">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- METHOD / SOURCES + CTA ---------------- */}
      <section className="border-t border-ink-line bg-ink text-paper">
        <div className="mx-auto max-w-wide px-[var(--shell-x)] py-24 md:py-32">
          <div className="grid gap-12 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <p data-reveal className="eyebrow mb-6 text-brand-light">
                Built on open data
              </p>
              <h2
                data-reveal
                className="max-w-[16ch] font-display text-[clamp(2.2rem,5vw,4.2rem)] font-normal leading-[1.02]"
              >
                Ready to look closer?
              </h2>
              <p data-reveal className="mt-6 max-w-prose text-lg leading-relaxed text-paper/70">
                Every figure is drawn directly from public records published by the Centers for
                Disease Control, the World Health Organization, and Eurostat. No estimates, no
                spin — just the data, rendered clearly.
              </p>
              <button
                data-reveal
                onClick={onEnter}
                className="group mt-10 inline-flex items-center gap-3 rounded-pill bg-paper px-7 py-4 text-sm font-medium text-ink transition-transform duration-300 ease-editorial hover:-translate-y-0.5"
              >
                Enter the observatory
                <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-editorial group-hover:translate-x-1" />
              </button>
            </div>
            <div className="md:col-span-4 md:col-start-9">
              <ul className="flex flex-col">
                {[
                  ['CDC', 'data.cdc.gov — U.S. mortality'],
                  ['WHO', 'Global health observatory'],
                  ['Eurostat', 'European life tables'],
                ].map(([k, v]) => (
                  <li
                    key={k}
                    data-reveal
                    className="flex items-baseline justify-between gap-4 border-t border-paper/15 py-5 first:border-t-0"
                  >
                    <span className="font-display text-xl">{k}</span>
                    <span className="text-right font-mono text-xs text-paper/55">{v}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="bg-ink text-paper/50">
        <div className="mx-auto flex max-w-wide flex-col gap-3 border-t border-paper/15 px-[var(--shell-x)] py-8 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-mono text-xs tracking-[0.16em]">VITALIS — PUBLIC-HEALTH OBSERVATORY</span>
          <span className="font-mono text-xs">Open public-health data · 2026</span>
        </div>
      </footer>
    </div>
  );
};
