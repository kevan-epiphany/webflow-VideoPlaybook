(function () {
  'use strict';

  // ---------- Utilities ----------
  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }
  function addLink(attrs) {
    const el = document.createElement('link');
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    document.head.appendChild(el);
    return el;
  }
  function addStyle(cssText) {
    const el = document.createElement('style');
    el.type = 'text/css';
    el.appendChild(document.createTextNode(cssText));
    document.head.appendChild(el);
    return el;
  }
  function addScript(src, { async = false, defer = false } = {}) {
    return new Promise((resolve, reject) => {
      if ([...document.scripts].some(s => s.src === src)) {
        resolve();
        return;
      }
      const s = document.createElement('script');
      s.src = src;
      s.async = async;
      s.defer = defer;
      s.onload = () => resolve();
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  // ---------- External deps ----------
  let chartJsPromise = null;
  function ensureChartJs() {
    if (window.Chart) return Promise.resolve();
    if (!chartJsPromise) {
      chartJsPromise = addScript('https://cdn.jsdelivr.net/npm/chart.js', { defer: true });
    }
    return chartJsPromise;
  }

  function ensureTailwind() {
    // Avoid reloading if already present
    if (window.tailwind && window.tailwindcss) return Promise.resolve();

    // Fonts (Poppins)
    const hasPoppins = !![...document.styleSheets].find(ss => {
      try { return (ss.href || '').includes('fonts.googleapis.com/css2?family=Poppins'); } catch { return false; }
    });
    if (!hasPoppins) {
      addLink({ rel: 'preconnect', href: 'https://fonts.googleapis.com' });
      addLink({ rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' });
      addLink({
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap'
      });
    }

    // Tailwind config: disable preflight to avoid global CSS reset
    window.tailwind = window.tailwind || {};
    window.tailwind.config = window.tailwind.config || {
      corePlugins: { preflight: false },
      theme: {
        extend: {
          colors: { 'brand-accent': '#F5D251' }
        }
      }
    };
    return addScript('https://cdn.tailwindcss.com');
  }

  // ---------- Mount point ----------
  const ROOT_ID = 'playbook-root';
  function getRoot() {
    let root = document.getElementById(ROOT_ID);
    if (!root) {
      const footer = document.querySelector('footer');
      root = document.createElement('div');
      root.id = ROOT_ID;
      if (footer && footer.parentNode) {
        footer.parentNode.insertBefore(root, footer);
      } else {
        document.body.appendChild(root);
      }
    }
    return root;
  }

  // ---------- Scoped CSS ----------
  function injectScopedCss() {
    const css = `
#${ROOT_ID} { font-family:'Poppins',sans-serif; color:#E0E0E0; }
#${ROOT_ID} .tab-active { border-color:#F5D251; color:#F5D251; font-weight:600; }
#${ROOT_ID} .tab-inactive { border-color:transparent; color:#94a3b8; }
#${ROOT_ID} .content-section { display:none; }
#${ROOT_ID} .content-section.active { display:block; }
#${ROOT_ID} .accordion-content { max-height:0; overflow:hidden; transition:max-height .3s ease-out; }
#${ROOT_ID} .chart-container { position:relative; width:100%; max-width:400px; margin:1rem auto; height:400px; }
#${ROOT_ID} .matrix-cell { transition: all .2s ease-in-out; cursor:pointer; }
#${ROOT_ID} .matrix-cell.active, #${ROOT_ID} .matrix-cell:hover { background-color:#1f2937; transform:scale(1.05); box-shadow:0 0 20px rgba(245,210,81,.2); }
#${ROOT_ID} .prompt-code { white-space:pre-wrap; word-wrap:break-word; }
#${ROOT_ID} .month-tab { cursor:pointer; transition:all .2s ease-in-out; }
#${ROOT_ID} .month-tab.active { background-color:#F5D251; color:#101010; }
#${ROOT_ID} .month-tab:not(.active) { background-color:#1f2937; }
#${ROOT_ID} .month-content { display:none; }
#${ROOT_ID} .month-content.active { display:block; }
#${ROOT_ID} .matrix-selector button.active { background-color:#F5D251; color:#101010; }
#${ROOT_ID} .framework-example { display:none; }
#${ROOT_ID} .framework-example.active { display:block; }
#${ROOT_ID} .checklist-item input:checked + label svg { display:block; }
#${ROOT_ID} .bg-page { background-color:#101010; }`;
    addStyle(css);
  }

  // ---------- HTML Builder ----------
  function buildHtml() {
    return `
<div class="bg-page">
  <div class="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
    <!-- Part 1 -->
    <div id="part1-container" class="mb-16">
      <header class="mb-12 text-center">
        <h1 class="text-4xl sm:text-5xl font-extrabold text-white">The B2B Founder's Content & Video Playbook</h1>
        <p class="text-lg text-slate-400 mt-2 max-w-3xl mx-auto">Part 1: The Strategic Foundation</p>
      </header>
      <nav id="p1-main-nav" class="sticky top-0 bg-[#101010]/80 backdrop-blur-sm z-10 rounded-lg mb-8">
        <div class="border-b border-slate-700">
          <div class="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto px-4" aria-label="Tabs">
            <button class="tab-btn whitespace-nowrap py-4 px-1 border-b-2 text-sm tab-active" data-target="p1-content-philosophy">The KLT Philosophy</button>
            <button class="tab-btn whitespace-nowrap py-4 px-1 border-b-2 text-sm tab-inactive" data-target="p1-content-mindset">Mindset & Opportunity</button>
            <button class="tab-btn whitespace-nowrap py-4 px-1 border-b-2 text-sm tab-inactive" data-target="p1-content-pitfalls">Common Pitfalls</button>
          </div>
        </div>
      </nav>
      <main>
        <section id="p1-content-philosophy" class="content-section active">
          <div class="p-8 bg-slate-900 rounded-lg border border-slate-800 mb-8">
            <h2 class="text-3xl font-bold text-white mb-4">The New Imperative: Building Trust in a Low-Trust World</h2>
            <p class="text-slate-400 leading-relaxed text-lg">In today's B2B landscape, the old playbook is broken. Institutional trust is at an all-time low, and decision-makers are tuning out polished corporate messaging. They seek connection and credibility not from logos, but from people. This is the strategic imperative for founders, CEOs, and executives: to become the trusted voice of their organisation.</p>
            <p class="mt-4 text-slate-400 leading-relaxed text-lg">This playbook is your guide to navigating this new reality. It’s built on a simple yet powerful human principle—the <strong class="text-brand-accent">Know, Like, Trust</strong> framework—and supercharged with the most potent trust-building medium available today: <strong class="text-brand-accent">video</strong>.</p>
          </div>
          <div class="bg-slate-900 p-8 rounded-lg border border-slate-800">
            <h3 class="text-2xl font-bold text-white mb-6 text-center">The KLT Journey: From Stranger to Advocate</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div class="text-center border border-slate-700 p-6 rounded-lg">
                <div class="text-4xl font-bold text-brand-accent mb-3">1</div>
                <h4 class="text-xl font-bold text-white mb-2">KNOW</h4>
                <p class="text-slate-400">Before anyone can buy, they must know you exist. Earn attention with valuable, low-friction content that makes you a familiar presence.</p>
              </div>
              <div class="text-center border border-slate-700 p-6 rounded-lg">
                <div class="text-4xl font-bold text-brand-accent mb-3">2</div>
                <h4 class="text-xl font-bold text-white mb-2">LIKE</h4>
                <p class="text-slate-400">Familiarity evolves into affinity. Connect on a human level by sharing values, mission, and perspective. Personality builds preference.</p>
              </div>
              <div class="text-center border border-slate-700 p-6 rounded-lg">
                <div class="text-4xl font-bold text-brand-accent mb-3">3</div>
                <h4 class="text-xl font-bold text-white mb-2">TRUST</h4>
                <p class="text-slate-400">Trust is earned when your audience sees you as a credible authority who can solve their problems—where commercial conversations begin.</p>
              </div>
            </div>
          </div>
        </section>
        <section id="p1-content-mindset" class="content-section">
          <div class="p-8 bg-slate-900 rounded-lg border border-slate-800 mb-8">
            <h2 class="text-3xl font-bold text-white mb-4">The Founder's Mindset: Seizing the Trust Opportunity</h2>
            <p class="text-slate-400 leading-relaxed text-lg">You are not creating ads; you are building relationships. You are not chasing virality; you are building a predictable content engine. This section highlights the opportunity for leaders who embrace authenticity and systemisation.</p>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="bg-slate-900 p-6 rounded-lg border border-slate-800">
              <h3 class="text-xl font-bold text-white text-center mb-2">The B2B Trust Gap is Your Opportunity</h3>
              <p class="text-sm text-slate-400 text-center mb-4">Data shows a clear preference for human-led, authentic content.</p>
              <div class="chart-container"><canvas id="trustChart"></canvas></div>
            </div>
            <div class="bg-slate-900 p-6 rounded-lg border border-slate-800">
              <h3 class="text-xl font-bold text-white mb-4">Key Principles for Success</h3>
              <ul class="space-y-4">
                <li class="bg-slate-800 p-4 rounded-lg">
                  <h4 class="font-semibold text-brand-accent">Authenticity > Polish</h4>
                  <p class="text-sm text-slate-400 mt-1">Prioritise message clarity over cinematic production. Honest lessons build more trust than perfection.</p>
                </li>
                <li class="bg-slate-800 p-4 rounded-lg">
                  <h4 class="font-semibold text-brand-accent">Systems > Virality</h4>
                  <p class="text-sm text-slate-400 mt-1">Sustainable success comes from a systematic process, not one-off viral hits.</p>
                </li>
                <li class="bg-slate-800 p-4 rounded-lg">
                  <h4 class="font-semibold text-brand-accent">Distribution Multiplies Impact</h4>
                  <p class="text-sm text-slate-400 mt-1">Employee networks often outperform corporate channels. Pair great content with great distribution.</p>
                </li>
              </ul>
            </div>
          </div>
        </section>
        <section id="p1-content-pitfalls" class="content-section">
          <div class="p-8 bg-slate-900 rounded-lg border border-slate-800 mb-8">
            <h2 class="text-3xl font-bold text-white mb-4">Navigating the Pitfalls: The Traps That Kill Trust</h2>
            <p class="text-slate-400 leading-relaxed text-lg">Many leaders fall into traps that undermine credibility. The worst is obsessing over vanity metrics. True influence is measured by engagement and impact.</p>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="bg-slate-900 p-6 rounded-lg border border-slate-800">
              <h3 class="text-xl font-bold text-white text-center mb-2">The Vanity Metrics Trap</h3>
              <p class="text-sm text-slate-400 text-center mb-4">Focus on impact metrics instead.</p>
              <div class="chart-container" style="max-width:500px; height:400px;"><canvas id="metricsChart"></canvas></div>
            </div>
            <div class="bg-slate-900 p-6 rounded-lg border border-slate-800">
              <h3 class="text-xl font-bold text-white mb-4">Other Common Mistakes to Avoid</h3>
              <div class="space-y-3" id="pitfalls-accordion">
                <div class="accordion-item border border-slate-700 rounded-lg">
                  <button class="accordion-header w-full text-left p-3 font-semibold bg-slate-800 hover:bg-slate-700 flex justify-between items-center text-white"><span>Inconsistent Cadence</span><span class="accordion-icon text-xl text-slate-500">+</span></button>
                  <div class="accordion-content"><div class="p-3 border-t border-slate-700 text-sm text-slate-400"><strong>Trap:</strong> Sporadic posting fails to build familiarity. <strong>Fix:</strong> Commit to a realistic schedule and 90-day sprints.</div></div>
                </div>
                <div class="accordion-item border border-slate-700 rounded-lg">
                  <button class="accordion-header w-full text-left p-3 font-semibold bg-slate-800 hover:bg-slate-700 flex justify-between items-center text-white"><span>Poor Audio Quality</span><span class="accordion-icon text-xl text-slate-500">+</span></button>
                  <div class="accordion-content"><div class="p-3 border-t border-slate-700 text-sm text-slate-400"><strong>Trap:</strong> Bad audio kills credibility. <strong>Fix:</strong> Use a simple external mic (£50–£150).</div></div>
                </div>
                <div class="accordion-item border border-slate-700 rounded-lg">
                  <button class="accordion-header w-full text-left p-3 font-semibold bg-slate-800 hover:bg-slate-700 flex justify-between items-center text-white"><span>No Clear CTA or Next Step</span><span class="accordion-icon text-xl text-slate-500">+</span></button>
                  <div class="accordion-content"><div class="p-3 border-t border-slate-700 text-sm text-slate-400"><strong>Trap:</strong> No guidance after value. <strong>Fix:</strong> Always include a simple next step.</div></div>
                </div>
                <div class="accordion-item border border-slate-700 rounded-lg">
                  <button class="accordion-header w-full text-left p-3 font-semibold bg-slate-800 hover:bg-slate-700 flex justify-between items-center text-white"><span>Ignoring Accessibility</span><span class="accordion-icon text-xl text-slate-500">+</span></button>
                  <div class="accordion-content"><div class="p-3 border-t border-slate-700 text-sm text-slate-400"><strong>Trap:</strong> No captions excludes viewers. <strong>Fix:</strong> Mandate accurate captions on every video.</div></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>

    <!-- Part 2 -->
    <div id="part2-container" class="mb-16">
      <header class="mb-12 text-center">
        <h1 class="text-4xl sm:text-5xl font-extrabold text-white">The B2B Founder's Content & Video Playbook</h1>
        <p class="text-lg text-slate-400 mt-2 max-w-3xl mx-auto">Part 2: The Interactive Content Matrix</p>
      </header>
      <main>
        <section id="p2-content-matrix">
          <div class="p-6 bg-slate-900 rounded-lg border border-slate-800 mb-8">
            <h2 class="text-2xl font-bold text-white mb-4">The Content Matrix: Your Strategic Command Centre</h2>
            <p class="text-slate-400 leading-relaxed">Select a cell based on audience relationship stage (Know/Like/Trust) and your content goal (Entertain/Inspire/Educate). Details below update with ideas, structures, and an AI prompt starter.</p>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div class="lg:col-span-1 text-center py-4 flex items-center justify-end pr-4">
              <span class="font-bold text-slate-400">RELATIONSHIP STAGE →<br>CONTENT GOAL ↓</span>
            </div>
            <div class="lg:col-span-3 grid grid-cols-3 gap-4 text-center">
              <div class="py-4"><h3 class="text-xl font-bold text-white">KNOW</h3></div>
              <div class="py-4"><h3 class="text-xl font-bold text-white">LIKE</h3></div>
              <div class="py-4"><h3 class="text-xl font-bold text-white">TRUST</h3></div>
            </div>
            <div class="lg:col-span-1 bg-slate-800 p-4 rounded-lg flex items-center justify-center"><h3 class="text-xl font-bold text-brand-accent">ENTERTAIN & CONNECT</h3></div>
            <div class="lg:col-span-3 grid grid-cols-3 gap-4">
              <div class="matrix-cell bg-slate-900 border border-slate-800 rounded-lg p-4 text-center active" data-content="know-entertain"><p class="font-semibold">Get Seen</p><p class="text-xs text-slate-400">Low-friction, relatable content.</p></div>
              <div class="matrix-cell bg-slate-900 border border-slate-800 rounded-lg p-4 text-center" data-content="like-entertain"><p class="font-semibold">Show Personality</p><p class="text-xs text-slate-400">Behind-the-scenes content.</p></div>
              <div class="matrix-cell bg-slate-900 border border-slate-800 rounded-lg p-4 text-center" data-content="trust-entertain"><p class="font-semibold">Show Your Team</p><p class="text-xs text-slate-400">Humanise the business.</p></div>
            </div>
            <div class="lg:col-span-1 bg-slate-800 p-4 rounded-lg flex items-center justify-center"><h3 class="text-xl font-bold text-brand-accent">INSPIRE & ALIGN</h3></div>
            <div class="lg:col-span-3 grid grid-cols-3 gap-4">
              <div class="matrix-cell bg-slate-900 border border-slate-800 rounded-lg p-4 text-center" data-content="know-inspire"><p class="font-semibold">Share Your 'Why'</p><p class="text-xs text-slate-400">Introduce your mission.</p></div>
              <div class="matrix-cell bg-slate-900 border border-slate-800 rounded-lg p-4 text-center" data-content="like-inspire"><p class="font-semibold">Share Values</p><p class="text-xs text-slate-400">Connect on a human level.</p></div>
              <div class="matrix-cell bg-slate-900 border border-slate-800 rounded-lg p-4 text-center" data-content="trust-inspire"><p class="font-semibold">Showcase Success</p><p class="text-xs text-slate-400">Build social proof.</p></div>
            </div>
            <div class="lg:col-span-1 bg-slate-800 p-4 rounded-lg flex items-center justify-center"><h3 class="text-xl font-bold text-brand-accent">EDUCATE & PROVE</h3></div>
            <div class="lg:col-span-3 grid grid-cols-3 gap-4">
              <div class="matrix-cell bg-slate-900 border border-slate-800 rounded-lg p-4 text-center" data-content="know-educate"><p class="font-semibold">Offer a Quick Win</p><p class="text-xs text-slate-400">Initial value proposition.</p></div>
              <div class="matrix-cell bg-slate-900 border border-slate-800 rounded-lg p-4 text-center" data-content="like-educate"><p class="font-semibold">Challenge Norms</p><p class="text-xs text-slate-400">Provide a unique perspective.</p></div>
              <div class="matrix-cell bg-slate-900 border border-slate-800 rounded-lg p-4 text-center" data-content="trust-educate"><p class="font-semibold">Solve a Problem</p><p class="text-xs text-slate-400">Demonstrate deep expertise.</p></div>
            </div>
          </div>
          <div id="p2-matrix-details" class="mt-4 p-6 bg-slate-900 rounded-lg border border-slate-800 min-h-[300px]"></div>
        </section>
      </main>
    </div>

    <!-- Part 3 -->
    <div id="part3-container" class="mb-16">
      <header class="mb-12 text-center">
        <h1 class="text-4xl sm:text-5xl font-extrabold text-white">The B2B Founder's Content & Video Playbook</h1>
        <p class="text-lg text-slate-400 mt-2 max-w-3xl mx-auto">Part 3: The 6-Month Trust Campaign</p>
      </header>
      <main>
        <section id="p3-content-campaign">
          <div class="p-6 bg-slate-900 rounded-lg border border-slate-800 mb-8">
            <h2 class="text-2xl font-bold text-white mb-4">From Strategy to Schedule: Your 6-Month Roadmap</h2>
            <p class="text-slate-400 leading-relaxed">This roadmap provides a proven cadence and content mix to move your audience from awareness to advocacy.</p>
          </div>
          <div class="flex flex-col lg:flex-row gap-8">
            <div class="lg:w-1/4">
              <div class="sticky top-8">
                <h3 class="font-bold text-white mb-4">Campaign Phases</h3>
                <div class="space-y-2" id="month-tabs">
                  <button class="month-tab w-full text-left p-3 rounded-lg font-semibold active" data-target="month-1">Month 1: The Introduction</button>
                  <button class="month-tab w-full text-left p-3 rounded-lg font-semibold" data-target="month-2">Month 2: Building Familiarity</button>
                  <button class="month-tab w-full text-left p-3 rounded-lg font-semibold" data-target="month-3">Month 3: The Connection</button>
                  <button class="month-tab w-full text-left p-3 rounded-lg font-semibold" data-target="month-4">Month 4: Reinforcing Value</button>
                  <button class="month-tab w-full text-left p-3 rounded-lg font-semibold" data-target="month-5">Month 5: Establishing Authority</button>
                  <button class="month-tab w-full text-left p-3 rounded-lg font-semibold" data-target="month-6">Month 6: Solidifying Trust</button>
                </div>
              </div>
            </div>
            <div class="lg:w-3/4">
              <div id="month-details">
                <div id="month-1" class="month-content active bg-slate-900 p-6 rounded-lg border border-slate-800">
                  <h3 class="text-2xl font-bold text-white">Month 1: The Introduction</h3>
                  <p class="text-brand-accent font-semibold mt-1 mb-4">Goal: KNOW - High-volume, low-friction content.</p>
                  <p class="text-slate-400 mb-6">Become a familiar, positive presence. Keep it simple and relatable.</p>
                  <h4 class="font-bold text-white mb-3">Recommended Monthly Content Mix (8 Posts):</h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div class="bg-slate-800 p-3 rounded-lg"><p class="font-semibold text-white">4x Entertain Posts</p><p class="text-slate-400">Relatable anecdotes, team photos, observations.</p></div>
                    <div class="bg-slate-800 p-3 rounded-lg"><p class="font-semibold text-white">2x Inspire Posts</p><p class="text-slate-400">Mission, guiding quotes.</p></div>
                    <div class="bg-slate-800 p-3 rounded-lg"><p class="font-semibold text-white">1x Educate Post</p><p class="text-slate-400">One powerful tip or stat.</p></div>
                    <div class="bg-slate-800 p-3 rounded-lg"><p class="font-semibold text-white">1x "About You" Video</p><p class="text-slate-400">Behind-the-beliefs story.</p></div>
                  </div>
                </div>
                <div id="month-2" class="month-content bg-slate-900 p-6 rounded-lg border border-slate-800">
                  <h3 class="text-2xl font-bold text-white">Month 2: Building Familiarity</h3>
                  <p class="text-brand-accent font-semibold mt-1 mb-4">Goal: KNOW - Reinforce presence; add more value.</p>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div class="bg-slate-800 p-3 rounded-lg"><p class="font-semibold text-white">3x Entertain Posts</p><p class="text-slate-400">BTS, polls.</p></div>
                    <div class="bg-slate-800 p-3 rounded-lg"><p class="font-semibold text-white">2x Inspire Posts</p><p class="text-slate-400">Challenge, mentors.</p></div>
                    <div class="bg-slate-800 p-3 rounded-lg"><p class="font-semibold text-white">1x Educate Post</p><p class="text-slate-400">Framework in 90s.</p></div>
                    <div class="bg-slate-800 p-3 rounded-lg"><p class="font-semibold text-white">2x Conversion Videos</p><p class="text-slate-400">About You + Product video.</p></div>
                  </div>
                </div>
                <div id="month-3" class="month-content bg-slate-900 p-6 rounded-lg border border-slate-800">
                  <h3 class="text-2xl font-bold text-white">Month 3: The Connection</h3>
                  <p class="text-brand-accent font-semibold mt-1 mb-4">Goal: LIKE - Share values and perspective.</p>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div class="bg-slate-800 p-3 rounded-lg"><p class="font-semibold text-white">2x Entertain Posts</p><p class="text-slate-400">Keep human connection.</p></div>
                    <div class="bg-slate-800 p-3 rounded-lg"><p class="font-semibold text-white">3x Inspire Posts</p><p class="text-slate-400">Lessons, values.</p></div>
                    <div class="bg-slate-800 p-3 rounded-lg"><p class="font-semibold text-white">2x Educate Posts</p><p class="text-slate-400">Myth vs Fact, contrarian takes.</p></div>
                    <div class="bg-slate-800 p-3 rounded-lg"><p class="font-semibold text-white">1x Repurposed Landing Page Video</p></div>
                  </div>
                </div>
                <div id="month-4" class="month-content bg-slate-900 p-6 rounded-lg border border-slate-800">
                  <h3 class="text-2xl font-bold text-white">Month 4: Reinforcing Value</h3>
                  <p class="text-brand-accent font-semibold mt-1 mb-4">Goal: LIKE - Become a go-to source.</p>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div class="bg-slate-800 p-3 rounded-lg"><p class="font-semibold text-white">2x Entertain</p></div>
                    <div class="bg-slate-800 p-3 rounded-lg"><p class="font-semibold text-white">3x Inspire</p></div>
                    <div class="bg-slate-800 p-3 rounded-lg"><p class="font-semibold text-white">3x Educate</p></div>
                    <div class="bg-slate-800 p-3 rounded-lg"><p class="font-semibold text-white">1x Client Proof Capsule</p></div>
                  </div>
                </div>
                <div id="month-5" class="month-content bg-slate-900 p-6 rounded-lg border border-slate-800">
                  <h3 class="text-2xl font-bold text-white">Month 5: Establishing Authority</h3>
                  <p class="text-brand-accent font-semibold mt-1 mb-4">Goal: TRUST - Deep expertise.</p>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div class="bg-slate-800 p-3 rounded-lg"><p class="font-semibold text-white">1x Entertain</p></div>
                    <div class="bg-slate-800 p-3 rounded-lg"><p class="font-semibold text-white">2x Inspire</p><p class="text-slate-400">Include Client Proof Capsule.</p></div>
                    <div class="bg-slate-800 p-3 rounded-lg"><p class="font-semibold text-white">3x Educate</p><p class="text-slate-400">Deep-Dive Explainer, case study.</p></div>
                    <div class="bg-slate-800 p-3 rounded-lg"><p class="font-semibold text-white">1x Sales Page Video</p></div>
                  </div>
                </div>
                <div id="month-6" class="month-content bg-slate-900 p-6 rounded-lg border border-slate-800">
                  <h3 class="text-2xl font-bold text-white">Month 6: Solidifying Trust</h3>
                  <p class="text-brand-accent font-semibold mt-1 mb-4">Goal: TRUST - Authority and proof.</p>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div class="bg-slate-800 p-3 rounded-lg"><p class="font-semibold text-white">1x Entertain</p></div>
                    <div class="bg-slate-800 p-3 rounded-lg"><p class="font-semibold text-white">2x Inspire</p></div>
                    <div class="bg-slate-800 p-3 rounded-lg"><p class="font-semibold text-white">4x Educate</p></div>
                    <div class="bg-slate-800 p-3 rounded-lg"><p class="font-semibold text-white">1x Sales/Landing Page Video</p></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>

    <!-- Part 4 -->
    <div id="part4-container" class="mb-16">
      <header class="mb-12 text-center">
        <h1 class="text-4xl sm:text-5xl font-extrabold text-white">The B2B Founder's Content & Video Playbook</h1>
        <p class="text-lg text-slate-400 mt-2 max-w-3xl mx-auto">Part 4: Execution & Measurement</p>
      </header>
      <nav id="main-nav-p4" class="sticky top-0 bg-[#101010]/80 backdrop-blur-sm z-10 rounded-lg mb-8">
        <div class="border-b border-slate-700">
          <div class="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto px-4" aria-label="Tabs">
            <button class="tab-btn whitespace-nowrap py-4 px-1 border-b-2 text-sm tab-active" data-target="p4-content-matrix">Topic & Campaign Matrix</button>
            <button class="tab-btn whitespace-nowrap py-4 px-1 border-b-2 text-sm tab-inactive" data-target="p4-content-copywriting">Copywriting Blueprints</button>
            <button class="tab-btn whitespace-nowrap py-4 px-1 border-b-2 text-sm tab-inactive" data-target="p4-content-measurement">Measuring What Matters</button>
          </div>
        </div>
      </nav>
      <main>
        <section id="p4-content-matrix" class="content-section active">
          <div class="p-6 bg-slate-900 rounded-lg border border-slate-800 mb-8">
            <h2 class="text-2xl font-bold text-white mb-4">Interactive Content Planner</h2>
            <p class="text-slate-400 leading-relaxed">Select your primary Content Pillar and current Campaign Phase to generate aligned angles and post ideas.</p>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-1">
              <div class="bg-slate-900 p-6 rounded-lg border border-slate-800">
                <h3 class="font-bold text-white mb-4">1. Select Content Pillar:</h3>
                <div class="space-y-3 matrix-selector" id="pillar-selector">
                  <button class="w-full text-left p-3 rounded-lg font-semibold bg-slate-800 hover:bg-slate-700 transition-colors active" data-pillar="trends">Industry Trends & News</button>
                  <button class="w-full text-left p-3 rounded-lg font-semibold bg-slate-800 hover:bg-slate-700 transition-colors" data-pillar="pains">Client Problems & Pains</button>
                  <button class="w-full text-left p-3 rounded-lg font-semibold bg-slate-800 hover:bg-slate-700 transition-colors" data-pillar="culture">Team, Values & Culture</button>
                  <button class="w-full text-left p-3 rounded-lg font-semibold bg-slate-800 hover:bg-slate-700 transition-colors" data-pillar="proof">Client Success & Social Proof</button>
                </div>
                <h3 class="font-bold text-white mb-4 mt-6">2. Select Campaign Phase:</h3>
                <div class="space-y-3 matrix-selector" id="phase-selector">
                  <button class="w-full text-left p-3 rounded-lg font-semibold bg-slate-800 hover:bg-slate-700 transition-colors active" data-phase="know">Months 1-2 (Know)</button>
                  <button class="w-full text-left p-3 rounded-lg font-semibold bg-slate-800 hover:bg-slate-700 transition-colors" data-phase="like">Months 3-4 (Like)</button>
                  <button class="w-full text-left p-3 rounded-lg font-semibold bg-slate-800 hover:bg-slate-700 transition-colors" data-phase="trust">Months 5-6 (Trust)</button>
                </div>
              </div>
            </div>
            <div class="lg:col-span-2">
              <div id="matrix-output" class="bg-slate-900 p-6 rounded-lg border border-slate-800 min-h-[400px]"></div>
            </div>
          </div>
        </section>

        <section id="p4-content-copywriting" class="content-section">
          <div class="p-6 bg-slate-900 rounded-lg border border-slate-800 mb-8">
            <h2 class="text-2xl font-bold text-white mb-4">Copywriting Blueprints: From Blank Page to Engaging Post</h2>
            <p class="text-slate-400 leading-relaxed">Frameworks that provide structure and psychological triggers to turn simple posts into compelling communication.</p>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-1">
              <div class="bg-slate-900 p-6 rounded-lg border border-slate-800">
                <h3 class="font-bold text-white mb-4">Choose a Framework:</h3>
                <div class="space-y-3 matrix-selector" id="framework-selector">
                  <button class="w-full text-left p-3 rounded-lg font-semibold bg-slate-800 hover:bg-slate-700 transition-colors active" data-framework="pas">Problem-Agitate-Solve (PAS)</button>
                  <button class="w-full text-left p-3 rounded-lg font-semibold bg-slate-800 hover:bg-slate-700 transition-colors" data-framework="aida">Attention-Interest-Desire-Action (AIDA)</button>
                  <button class="w-full text-left p-3 rounded-lg font-semibold bg-slate-800 hover:bg-slate-700 transition-colors" data-framework="storybrand">StoryBrand Narrative Arc</button>
                </div>
              </div>
            </div>
            <div class="lg:col-span-2">
              <div class="bg-slate-900 p-6 rounded-lg border border-slate-800 min-h-[400px]">
                <div id="pas-example" class="framework-example active">
                  <h3 class="text-xl font-bold text-white mb-2">Framework: Problem-Agitate-Solve (PAS)</h3>
                  <p class="text-sm text-slate-400 mb-4"><strong>Best for:</strong> Quickly hooking the reader with a known pain point.</p>
                  <ul class="space-y-2 text-sm text-slate-300 list-disc list-inside">
                    <li><strong>Problem:</strong> Name the pain.</li>
                    <li><strong>Agitate:</strong> Stir the pot—consequences and frustrations.</li>
                    <li><strong>Solve:</strong> Offer relief with your framework or insight.</li>
                  </ul>
                  <div class="mt-4 pt-4 border-t border-slate-700">
                    <h4 class="font-semibold text-brand-accent mb-2">Example (Text Post):</h4>
                    <div class="text-sm p-4 bg-slate-800 rounded-lg">
                      <p class="text-slate-300"><strong class="text-white">[Problem]</strong> Ever feel like you're creating content that disappears into the void?</p>
                      <p class="text-slate-300 mt-2"><strong class="text-white">[Agitate]</strong> Hours of work, then silence. It's frustrating and demotivating.</p>
                      <p class="text-slate-300 mt-2"><strong class="text-white">[Solve]</strong> The issue is distribution. For every hour of creation, spend an hour on distribution. Start by preparing a 'Share Pack' for your team for each video.</p>
                    </div>
                  </div>
                </div>
                <div id="aida-example" class="framework-example">
                  <h3 class="text-xl font-bold text-white mb-2">Framework: AIDA</h3>
                  <p class="text-sm text-slate-400 mb-4"><strong>Best for:</strong> Journey from awareness to action.</p>
                  <ul class="space-y-2 text-sm text-slate-300 list-disc list-inside">
                    <li><strong>Attention</strong> → Hook</li>
                    <li><strong>Interest</strong> → Why it matters</li>
                    <li><strong>Desire</strong> → Vision of success</li>
                    <li><strong>Action</strong> → Clear next step</li>
                  </ul>
                  <div class="mt-4 pt-4 border-t border-slate-700">
                    <h4 class="font-semibold text-brand-accent mb-2">Example (Video Script Hook):</h4>
                    <div class="text-sm p-4 bg-slate-800 rounded-lg">
                      <p class="text-slate-300"><strong class="text-white">[Attention]</strong> "73% of B2B buyers say they trust content from a person more than from a brand."</p>
                      <p class="text-slate-300 mt-2"><strong class="text-white">[Interest]</strong> "Your profile may outperform your company page."</p>
                      <p class="text-slate-300 mt-2"><strong class="text-white">[Desire]</strong> "Imagine prospects trusting you before the first call."</p>
                      <p class="text-slate-300 mt-2"><strong class="text-white">[Action]</strong> "Here are the 3 content types to start this week."</p>
                    </div>
                  </div>
                </div>
                <div id="storybrand-example" class="framework-example">
                  <h3 class="text-xl font-bold text-white mb-2">Framework: StoryBrand Narrative Arc</h3>
                  <p class="text-sm text-slate-400 mb-4"><strong>Best for:</strong> Story-led content positioning your audience as hero.</p>
                  <ul class="space-y-2 text-sm text-slate-300 list-disc list-inside">
                    <li>A character with a problem meets a guide with a plan, who calls them to action, helps them avoid failure, and ends in success.</li>
                  </ul>
                  <div class="mt-4 pt-4 border-t border-slate-700">
                    <h4 class="font-semibold text-brand-accent mb-2">Example (Client Success Capsule):</h4>
                    <div class="text-sm p-4 bg-slate-800 rounded-lg">
                      <p class="text-slate-300">"A tech client struggled with demo attendance. We reframed the message using our 'Clarity First' framework, and in 90 days attendance doubled."</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="p4-content-measurement" class="content-section">
          <div class="p-6 bg-slate-900 rounded-lg border border-slate-800 mb-8">
            <h2 class="text-2xl font-bold text-white mb-4">Measuring What Matters: From Vanity to Value</h2>
            <p class="text-slate-400 leading-relaxed">Focus on metrics that signal real engagement and pipeline impact.</p>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="bg-slate-900 p-6 rounded-lg border border-slate-800">
              <h3 class="text-xl font-bold text-white mb-4">The Metrics That Build Trust</h3>
              <div class="space-y-4 text-sm">
                <div class="bg-red-900/30 border border-red-500/50 p-4 rounded-lg">
                  <h4 class="font-semibold text-red-400">Vanity Metrics (Low Impact)</h4>
                  <ul class="list-disc list-inside mt-2 text-slate-400"><li>Likes & Reactions</li><li>Follower Count</li><li>Impressions / Reach</li></ul>
                </div>
                <div class="bg-green-900/30 border border-green-500/50 p-4 rounded-lg">
                  <h4 class="font-semibold text-green-400">Impact Metrics (High Value)</h4>
                  <ul class="list-disc list-inside mt-2 text-slate-400">
                    <li><strong>Average Watch Time</strong> (video)</li>
                    <li><strong>Comment Quality</strong></li>
                    <li><strong>Shares & Saves</strong></li>
                    <li><strong>Inbound DMs from Target Accounts</strong></li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="bg-slate-900 p-6 rounded-lg border border-slate-800">
              <h3 class="text-xl font-bold text-white mb-2">Lightweight ROI Calculator</h3>
              <p class="text-sm text-slate-400 mb-4">Estimate the pipeline lift influenced by your content.</p>
              <div class="space-y-4 text-sm">
                <div><label for="acv" class="block font-medium text-slate-300">Average Contract Value (£)</label><input type="number" id="acv" class="mt-1 block w-full rounded-md border-slate-600 bg-slate-800 text-white shadow-sm focus:border-brand-accent focus:ring-brand-accent p-2" value="50000"></div>
                <div><label for="lift" class="block font-medium text-slate-300">Assumed Win-Rate Lift from Content (%)</label><input type="number" id="lift" class="mt-1 block w-full rounded-md border-slate-600 bg-slate-800 text-white shadow-sm focus:border-brand-accent focus:ring-brand-accent p-2" value="2"></div>
                <div><label for="opportunities" class="block font-medium text-slate-300">Influenced Opportunities / Year</label><input type="number" id="opportunities" class="mt-1 block w-full rounded-md border-slate-600 bg-slate-800 text-white shadow-sm focus:border-brand-accent focus:ring-brand-accent p-2" value="50"></div>
                <div class="pt-4 border-t border-slate-700">
                  <h4 class="font-semibold text-white">Estimated Annual Pipeline Lift:</h4>
                  <p id="roi-result" class="text-2xl font-bold text-brand-accent mt-1">£0</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>

    <!-- Part 5 -->
    <div id="part5-container" class="mb-4">
      <header class="mb-12 text-center">
        <h1 class="text-4xl sm:text-5xl font-extrabold text-white">The B2B Founder's Content & Video Playbook</h1>
        <p class="text-lg text-slate-400 mt-2 max-w-3xl mx-auto">Part 5: Advanced Strategy & Resources</p>
      </header>
      <main>
        <section id="content-advanced">
          <div class="p-6 bg-slate-900 rounded-lg border border-slate-800 mb-8">
            <h2 class="text-2xl font-bold text-white mb-4">Amplifying Your Impact: Advanced Strategy</h2>
            <p class="text-slate-400 leading-relaxed">Turn each asset into a company-wide resource; protect your brand with accessibility and compliance.</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div class="bg-slate-900 p-6 rounded-lg border border-slate-800">
              <h3 class="text-xl font-bold text-white mb-4">Internal Adoption & Distribution Checklist</h3>
              <div class="space-y-3 text-sm">
                <div class="checklist-item relative flex items-start"><input id="c1" type="checkbox" class="absolute w-4 h-4 opacity-0"><label for="c1" class="flex items-center cursor-pointer text-slate-300"><span class="w-4 h-4 inline-block mr-3 rounded border border-slate-500 bg-slate-800 flex-shrink-0"></span><svg class="hidden w-4 h-4 text-brand-accent absolute left-0" viewBox="0 0 16 16" fill="currentColor"><path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z"/></svg>Form a cross-functional content council (Sales, Comms, HR).</label></div>
                <div class="checklist-item relative flex items-start"><input id="c2" type="checkbox" class="absolute w-4 h-4 opacity-0"><label for="c2" class="flex items-center cursor-pointer text-slate-300"><span class="w-4 h-4 inline-block mr-3 rounded border border-slate-500 bg-slate-800 flex-shrink-0"></span><svg class="hidden w-4 h-4 text-brand-accent absolute left-0" viewBox="0 0 16 16" fill="currentColor"><path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z"/></svg>Create a simple 'Share Pack' for each key video.</label></div>
                <div class="checklist-item relative flex items-start"><input id="c3" type="checkbox" class="absolute w-4 h-4 opacity-0"><label for="c3" class="flex items-center cursor-pointer text-slate-300"><span class="w-4 h-4 inline-block mr-3 rounded border border-slate-500 bg-slate-800 flex-shrink-0"></span><svg class="hidden w-4 h-4 text-brand-accent absolute left-0" viewBox="0 0 16 16" fill="currentColor"><path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z"/></svg>Train sales team to use videos in outreach sequences.</label></div>
                <div class="checklist-item relative flex items-start"><input id="c4" type="checkbox" class="absolute w-4 h-4 opacity-0"><label for="c4" class="flex items-center cursor-pointer text-slate-300"><span class="w-4 h-4 inline-block mr-3 rounded border border-slate-500 bg-slate-800 flex-shrink-0"></span><svg class="hidden w-4 h-4 text-brand-accent absolute left-0" viewBox="0 0 16 16" fill="currentColor"><path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z"/></svg>Establish a repurposing workflow (video → blog, etc.).</label></div>
              </div>
            </div>
            <div class="bg-slate-900 p-6 rounded-lg border border-slate-800">
              <h3 class="text-xl font-bold text-white mb-4">Accessibility & Compliance Checklist</h3>
              <div class="space-y-3 text-sm">
                <div class="checklist-item relative flex items-start"><input id="c5" type="checkbox" class="absolute w-4 h-4 opacity-0"><label for="c5" class="flex items-center cursor-pointer text-slate-300"><span class="w-4 h-4 inline-block mr-3 rounded border border-slate-500 bg-slate-800 flex-shrink-0"></span><svg class="hidden w-4 h-4 text-brand-accent absolute left-0" viewBox="0 0 16 16" fill="currentColor"><path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z"/></svg>Human-reviewed captions for ALL videos.</label></div>
                <div class="checklist-item relative flex items-start"><input id="c6" type="checkbox" class="absolute w-4 h-4 opacity-0"><label for="c6" class="flex items-center cursor-pointer text-slate-300"><span class="w-4 h-4 inline-block mr-3 rounded border border-slate-500 bg-slate-800 flex-shrink-0"></span><svg class="hidden w-4 h-4 text-brand-accent absolute left-0" viewBox="0 0 16 16" fill="currentColor"><path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z"/></svg>Provide full transcripts for videos > 3 minutes.</label></div>
                <div class="checklist-item relative flex items-start"><input id="c7" type="checkbox" class="absolute w-4 h-4 opacity-0"><label for="c7" class="flex items-center cursor-pointer text-slate-300"><span class="w-4 h-4 inline-block mr-3 rounded border border-slate-500 bg-slate-800 flex-shrink-0"></span><svg class="hidden w-4 h-4 text-brand-accent absolute left-0" viewBox="0 0 16 16" fill="currentColor"><path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z"/></svg>Create agile review with legal/compliance.</label></div>
                <div class="checklist-item relative flex items-start"><input id="c8" type="checkbox" class="absolute w-4 h-4 opacity-0"><label for="c8" class="flex items-center cursor-pointer text-slate-300"><span class="w-4 h-4 inline-block mr-3 rounded border border-slate-500 bg-slate-800 flex-shrink-0"></span><svg class="hidden w-4 h-4 text-brand-accent absolute left-0" viewBox="0 0 16 16" fill="currentColor"><path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z"/></svg>Define editorial guidelines with required disclaimers.</label></div>
              </div>
            </div>
          </div>
          <div class="bg-slate-900 p-6 rounded-lg border border-slate-800">
            <h3 class="text-2xl font-bold text-white mb-4">Recommended Equipment Tiers</h3>
            <p class="text-sm text-slate-400 mb-6">Clarity beats charisma; audio quality matters most. Start lean and scale.</p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="border border-slate-700 rounded-lg p-4 bg-slate-800">
                <h4 class="font-bold text-brand-accent">Good: The Starter Kit</h4>
                <p class="text-xs text-slate-400 mb-2">Budget: < £500</p>
                <ul class="text-sm text-slate-300 list-disc list-inside space-y-1">
                  <li>Modern Smartphone</li><li>Wired Lavalier Mic</li><li>LED Ring Light</li><li>Basic Tripod</li>
                </ul>
              </div>
              <div class="border border-slate-700 rounded-lg p-4 bg-slate-800">
                <h4 class="font-bold text-brand-accent">Better: The Pro Kit</h4>
                <p class="text-xs text-slate-400 mb-2">Budget: £1,500 - £3,000</p>
                <ul class="text-sm text-slate-300 list-disc list-inside space-y-1">
                  <li>Mirrorless Camera</li><li>Wireless Lav/Shotgun Mic</li><li>Two-point LED Lighting</li><li>Teleprompter App</li>
                </ul>
              </div>
              <div class="border border-slate-700 rounded-lg p-4 bg-slate-800">
                <h4 class="font-bold text-brand-accent">Best: The Studio Kit</h4>
                <p class="text-xs text-slate-400 mb-2">Budget: > £5,000</p>
                <ul class="text-sm text-slate-300 list-disc list-inside space-y-1">
                  <li>Cinema/Full-Frame Camera</li><li>Shure SM7B (or similar)</li><li>Three-Point Lighting</li><li>Hardware Teleprompter</li>
                </ul>
              </div>
            </div>
          </div>
          <div class="mt-12 p-8 bg-brand-accent/10 rounded-lg border border-brand-accent/30 text-center">
            <h2 class="text-3xl font-bold text-white mb-4">Ready to Build Your Content Engine?</h2>
            <p class="text-slate-300 max-w-2xl mx-auto mb-6">The Epiphany Squared Process is our done-with-you service that turns your insights into a powerful, trust-building content engine.</p>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-left my-8 text-sm">
              <div class="bg-slate-800 p-4 rounded-lg"><h4 class="font-semibold text-brand-accent">1. Strategy</h4><p class="text-xs text-slate-400 mt-1">Message Architecture + 90-day plan.</p></div>
              <div class="bg-slate-800 p-4 rounded-lg"><h4 class="font-semibold text-brand-accent">2. Coaching</h4><p class="text-xs text-slate-400 mt-1">Find your authentic on-camera voice.</p></div>
              <div class="bg-slate-800 p-4 rounded-lg"><h4 class="font-semibold text-brand-accent">3. Production</h4><p class="text-xs text-slate-400 mt-1">Broadcast-quality filming and editing.</p></div>
              <div class="bg-slate-800 p-4 rounded-lg"><h4 class="font-semibold text-brand-accent">4. Management</h4><p class="text-xs text-slate-400 mt-1">Scheduling and distribution.</p></div>
            </div>
            <a href="mailto:kevan@epiphanycontent.com" class="inline-block bg-brand-accent text-slate-900 font-bold py-3 px-8 rounded-lg hover:bg-yellow-300 transition-colors text-lg">Let's Discuss Your Strategy</a>
          </div>
        </section>
      </main>
    </div>
  </div>
</div>`;
  }

  // ---------- Wiring ----------
  function wirePart1() {
    const container = document.getElementById('part1-container');
    if (!container) return;

    const mainNav = container.querySelector('#p1-main-nav');
    const tabs = mainNav ? mainNav.querySelectorAll('.tab-btn') : [];
    const sections = container.querySelectorAll('main > .content-section');
    const accordions = container.querySelectorAll('.accordion-header');
    let trustChart, metricsChart;

    function showSection(targetId) {
      tabs.forEach(tab => {
        const isActive = tab.dataset.target === targetId;
        tab.classList.toggle('tab-active', isActive);
        tab.classList.toggle('tab-inactive', !isActive);
      });
      sections.forEach(section => {
        section.classList.toggle('active', section.id === targetId);
      });

      if (targetId === 'p1-content-mindset' && !trustChart) {
        ensureChartJs().then(() => initTrustChart());
      }
      if (targetId === 'p1-content-pitfalls' && !metricsChart) {
        ensureChartJs().then(() => initMetricsChart());
      }
    }

    function initTrustChart() {
      const ctx = container.querySelector('#trustChart')?.getContext('2d');
      if (!ctx) return;
      trustChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Prefer Authentic Personal Content', 'Prefer Polished Corporate Ads'],
          datasets: [{ data: [73, 27], backgroundColor: ['#F5D251', '#475569'], borderColor: '#1e293b', borderWidth: 4 }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: '#E0E0E0', font: { family: "'Poppins', sans-serif" } } },
            title: { display: false },
            tooltip: {
              callbacks: { label: (c) => `${c.label}: ${c.raw}%` },
              backgroundColor: '#1f2937', titleColor: '#ffffff', bodyColor: '#cbd5e1',
              titleFont:{family:"'Poppins', sans-serif"}, bodyFont:{family:"'Poppins', sans-serif"}
            }
          },
          cutout: '60%'
        }
      });
    }

    function initMetricsChart() {
      const ctx = container.querySelector('#metricsChart')?.getContext('2d');
      if (!ctx) return;
      metricsChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Likes', 'Followers', 'Avg. Watch Time', 'Comment Quality', 'Pipeline Influence'],
          datasets: [{
            label: 'Impact on Trust', data: [10, 20, 75, 85, 95],
            backgroundColor: (context) => (context.dataset.data[context.dataIndex] < 50 ? '#475569' : '#F5D251'),
            borderColor: '#e4bf4a', borderWidth: 1, borderRadius: 4
          }]
        },
        options: {
          indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: { display: true, text: 'Vanity Metrics vs. Impact Metrics', color: '#E0E0E0', font: { size: 16, family: "'Poppins', sans-serif" } },
            tooltip: {
              callbacks: { label: (c) => `  ${c.raw}% Impact` },
              backgroundColor: '#1f2937', titleColor: '#ffffff', bodyColor: '#cbd5e1',
              titleFont:{family:"'Poppins', sans-serif"}, bodyFont:{family:"'Poppins', sans-serif"}
            }
          },
          scales: {
            x: { beginAtZero: true, max: 100, grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#94a3b8', callback: (v) => v + '%' } },
            y: { grid: { display: false }, ticks: { color: '#E0E0E0' } }
          }
        }
      });
    }

    if (mainNav) {
      mainNav.addEventListener('click', (e) => {
        const clickedTab = e.target.closest('.tab-btn');
        if (clickedTab) showSection(clickedTab.dataset.target);
      });
    }

    accordions.forEach(header => {
      header.addEventListener('click', () => {
        const content = header.closest('.accordion-item').querySelector('.accordion-content');
        const icon = header.querySelector('.accordion-icon');
        const isOpening = !content.style.maxHeight || content.style.maxHeight === '0px';
        content.style.maxHeight = isOpening ? content.scrollHeight + 'px' : '0px';
        if (icon) icon.textContent = isOpening ? '-' : '+';
      });
    });

    if (tabs.length > 0) showSection(tabs[0].dataset.target);
  }

  function wirePart2() {
    const container = document.getElementById('part2-container');
    if (!container) return;

    const cells = container.querySelectorAll('.matrix-cell');
    const details = container.querySelector('#p2-matrix-details');

    const contentMap = {
      know_entertain: {
        title:"KNOW + ENTERTAIN: Get Seen",
        video:"Video Idea: 'A Day in the Life' Snippet",
        video_desc:"A 30-second, phone-shot video showing a relatable moment—coffee, commute, or a pet interrupting a call.",
        scripting:"No script needed. Start with 'Here’s something you don’t see every day...' and end with a simple sign-off.",
        post:"Selfie at an industry event: 'The best part of [Event] isn’t the talks, it’s the hallway conversations.'",
        ai_prompt:"Act as a B2B content strategist. Write a short, relatable LinkedIn post (under 150 words) from a CEO in [Your Industry] about a humorous everyday work moment (e.g., pet interrupting a call). Entertaining, no sales, no CTA."
      },
      know_inspire: {
        title:"KNOW + INSPIRE: Share Your 'Why'",
        video:"Video Idea: 'Mission Motivation'",
        video_desc:"60 seconds on your company mission and why it matters to you.",
        scripting:"(StoryBrand) 1. Problem 2. Vision 3. Motivation (personal story).",
        post:"Share a breakthrough article with commentary: 'This moves us closer to [Your Vision].'",
        ai_prompt:"Act as a B2B storyteller. Draft a 60s script for a CEO in [Your Industry] on the company's mission. Use StoryBrand: problem, guiding vision, personal inspiration. Passionate, visionary."
      },
      like_entertain: {
        title:"LIKE + ENTERTAIN: Show Personality",
        video:"Video Idea: 'Behind the Scenes' Tour",
        video_desc:"Quick unscripted walk-through of your workspace or project.",
        scripting:"'A few of you asked what our office looks like...' Highlight one or two fun details.",
        post:"Run a playful poll comparing two overused industry buzzwords.",
        ai_prompt:"Act as a B2B content creator. Write a short LinkedIn post (under 150 words) with a playful poll pitting two industry buzzwords. Witty and personable."
      },
      like_inspire: {
        title:"LIKE + INSPIRE: Share Values",
        video:"Video Idea: 'A Lesson from a Mistake'",
        video_desc:"Share a mistake and the lesson. Vulnerability builds trust.",
        scripting:"1. Situation 2. Mistake 3. Lesson 4. Application today.",
        post:"Photo from a personal challenge (hike/marathon) linked to a value like resilience.",
        ai_prompt:"Act as an executive comms coach. Draft a 90s 'Lesson from a Mistake' video: Situation, Mistake, Lesson, Application. Humble yet confident."
      },
      like_educate: {
        title:"LIKE + EDUCATE: Challenge Norms",
        video:"Video Idea: 'Myth vs. Fact'",
        video_desc:"Debunk a common industry myth; show your thinking.",
        scripting:"Problem-Insight-Solution: Myth → Why wrong → Better way.",
        post:"Text post: 'Unpopular opinion: [counter-intuitive take]…' plus 3 bullets.",
        ai_prompt:"Act as a B2B thought leader. Create a 90s 'Myth vs. Fact' script using Problem-Agitate-Solve. Confident and insightful."
      },
      trust_entertain: {
        title:"TRUST + ENTERTAIN: Show Your Team",
        video:"Video Idea: 'Meet the Expert'",
        video_desc:"Casual interview with a team expert and one practical tip.",
        scripting:"'I'm here with [Name], our [Role]. What’s the #1 mistake you see in [topic]?'.",
        post:"Team group photo at a company event/volunteering with mission-aligned copy.",
        ai_prompt:"Act as a B2B strategist. Write a LinkedIn post introducing a team member, tagging them, and asking one insightful question they often get from clients."
      },
      trust_inspire: {
        title:"TRUST + INSPIRE: Showcase Success",
        video:"Video Idea: 'Client Proof Capsule'",
        video_desc:"45–90s anonymised client story with outcome and quote.",
        scripting:"Client Problem → Your Approach → Specific, quantifiable Result.",
        post:"Quote graphic with client testimonial (permission granted) and thanks.",
        ai_prompt:"Act as a case study writer. Draft a 75s script: Problem → Solution → Result. Include placeholder for on-screen client quote."
      },
      trust_educate: {
        title:"TRUST + EDUCATE: Solve a Problem",
        video:"Video Idea: 'Deep-Dive Explainer'",
        video_desc:"3–5 mins actionable advice on a complex topic for warm leads.",
        scripting:"Hook → Three actionable steps (with on-screen visual notes) → CTA (DM for template).",
        post:"Detailed how-to text post + free resource via comment/DM.",
        ai_prompt:"Act as an instructional designer. Create a 3-minute explainer: Hook with framework promise; 3 actionable steps (with visual placeholders); CTA to request resource via DM. Authoritative tone."
      }
    };

    function updateDetails(key) {
      const n = contentMap[key.replace('-', '_')];
      if (!n || !details) return;
      details.innerHTML = `
        <h3 class="text-2xl font-bold text-white mb-4">${n.title}</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div class="bg-slate-800 p-4 rounded-lg">
            <h4 class="font-semibold text-brand-accent mb-2">${n.video}</h4>
            <p class="text-slate-400 mb-3">${n.video_desc}</p>
            <h5 class="font-semibold text-white">Scripting & Structure:</h5>
            <p class="text-slate-400">${n.scripting}</p>
          </div>
          <div class="bg-slate-800 p-4 rounded-lg">
            <h4 class="font-semibold text-brand-accent mb-2">Text & Image Post Idea</h4>
            <p class="text-slate-400">${n.post}</p>
          </div>
        </div>
        <div class="mt-6 bg-slate-800 p-4 rounded-lg">
          <div class="flex justify-between items-center">
            <h4 class="font-semibold text-brand-accent">Generative AI Prompt Starter</h4>
            <button class="copy-btn bg-slate-700 text-xs text-white px-2 py-1 rounded hover:bg-slate-600 transition-colors">Copy Prompt</button>
          </div>
          <div class="mt-2 p-3 bg-slate-900 rounded">
            <code class="text-xs text-slate-300 prompt-code">${n.ai_prompt}</code>
          </div>
        </div>`;
    }

    cells.forEach(c => {
      c.addEventListener('click', () => {
        cells.forEach(el => el.classList.remove('active'));
        c.classList.add('active');
        updateDetails(c.dataset.content);
      });
    });
    updateDetails('know-entertain');

    container.addEventListener('click', function (e) {
      if (e.target.classList.contains('copy-btn')) {
        const code = e.target.closest('.bg-slate-800').querySelector('.prompt-code')?.innerText || '';
        navigator.clipboard.writeText(code).then(() => {
          const old = e.target.innerText;
          e.target.innerText = 'Copied!';
          setTimeout(() => { e.target.innerText = old; }, 2000);
        });
      }
    });
  }

  function wirePart3() {
    const container = document.getElementById('part3-container');
    if (!container) return;

    const tabs = container.querySelectorAll('.month-tab');
    const contents = container.querySelectorAll('.month-content');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const target = container.querySelector('#' + tab.dataset.target);
        if (target) target.classList.add('active');
      });
    });
  }

  function wirePart4() {
    const container = document.getElementById('part4-container');
    if (!container) return;

    const mainNav = container.querySelector('#main-nav-p4');
    const tabs = mainNav ? mainNav.querySelectorAll('.tab-btn') : [];
    const sections = container.querySelectorAll('main > section.content-section');
    const pillarSelector = container.querySelector('#pillar-selector');
    const phaseSelector = container.querySelector('#phase-selector');
    const matrixOutput = container.querySelector('#matrix-output');
    const frameworkSelector = container.querySelector('#framework-selector');
    const frameworkExamples = container.querySelectorAll('.framework-example');

    const matrixData = {
      trends: {
        know: { title:'Angle: Share a Surprising Statistic', video:'30s reaction video to a new industry report.', post:'Post a chart with a provocative question.' },
        like: { title:'Angle: Post an "Unpopular Opinion"', video:'"Myth vs. Fact" video debunking a trend.', post:'Text post starting with "Hot take:" + your view.' },
        trust: { title:'Angle: Publish a Predictive Analysis', video:'Deep-Dive Explainer on next 18 months.', post:'Long-form article/carousel with predictions.' }
      },
      pains: {
        know: { title:'Angle: Ask a Simple, Relatable Question', video:'Quick selfie: "What’s one task you wish you could automate?"', post:'Poll on the most time-consuming weekly task.' },
        like: { title:'Angle: Share a Relatable Struggle', video:'"Lesson from a Mistake" about their problem.', post:'Authentic story about a past failure and lesson.' },
        trust: { title:'Angle: Provide a Tangible Solution', video:'"Framework in 90s" naming problem + solution.', post:'How-to guide + downloadable checklist.' }
      },
      culture: {
        know: { title:'Angle: Show a Glimpse of Your World', video:'Fun "Day in the Life" snippet.', post:'Team outing photo with positive caption.' },
        like: { title:'Angle: Values in Action', video:'Celebrate a team member embodying a value.', post:'Post on mission and why it matters to you.' },
        trust: { title:'Angle: Showcase Team Expertise', video:'"Meet the Expert" interview.', post:'Highlight recent certification/achievement.' }
      },
      proof: {
        know: { title:'Angle: Anonymous Client Insight', video:'Share insight from a recent client chat.', post:'"Client said something brilliant today..."' },
        like: { title:'Angle: Client Testimonial', video:'Short video with on-screen quote.', post:'Quote graphic tagging the client (permission).' },
        trust: { title:'Angle: Release a Case Study', video:'Client Proof Capsule: Problem-Solution-Result.', post:'Detailed project breakdown showcasing process.' }
      }
    };

    function switchMainTab(targetId) {
      tabs.forEach(tab => {
        const isActive = tab.dataset.target === targetId;
        tab.classList.toggle('tab-active', isActive);
        tab.classList.toggle('tab-inactive', !isActive);
      });
      sections.forEach(section => {
        section.classList.toggle('active', section.id === targetId);
      });
    }

    function updateMatrix() {
      if (!pillarSelector || !phaseSelector || !matrixOutput) return;
      const pillarBtn = pillarSelector.querySelector('button.active');
      const phaseBtn = phaseSelector.querySelector('button.active');
      if (!pillarBtn || !phaseBtn) return;
      const pillar = pillarBtn.dataset.pillar;
      const phase = phaseBtn.dataset.phase;
      const data = (matrixData[pillar] || {})[phase];
      if (!data) return;
      matrixOutput.innerHTML = `
        <h3 class="text-xl font-bold text-white mb-4">${data.title}</h3>
        <div class="space-y-4">
          <div class="bg-slate-800 p-4 rounded-lg">
            <h4 class="font-semibold text-brand-accent mb-2">Video Idea</h4>
            <p class="text-sm text-slate-400">${data.video}</p>
          </div>
          <div class="bg-slate-800 p-4 rounded-lg">
            <h4 class="font-semibold text-brand-accent mb-2">Text/Image Post Idea</h4>
            <p class="text-sm text-slate-400">${data.post}</p>
          </div>
        </div>`;
    }

    function setupSelector(selector, callback) {
      if (!selector) return;
      selector.addEventListener('click', e => {
        const button = e.target.closest('button');
        if (button) {
          selector.querySelectorAll('button').forEach(b => b.classList.remove('active'));
          button.classList.add('active');
          callback();
        }
      });
    }

    if (mainNav) {
      mainNav.addEventListener('click', (e) => {
        const clickedTab = e.target.closest('.tab-btn');
        if (clickedTab) switchMainTab(clickedTab.dataset.target);
      });
    }

    setupSelector(pillarSelector, updateMatrix);
    setupSelector(phaseSelector, updateMatrix);

    if (frameworkSelector) {
      frameworkSelector.addEventListener('click', e => {
        const button = e.target.closest('button');
        if (button) {
          frameworkSelector.querySelectorAll('button').forEach(b => b.classList.remove('active'));
          button.classList.add('active');
          const frameworkId = button.dataset.framework + '-example';
          frameworkExamples.forEach(ex => ex.classList.toggle('active', ex.id === frameworkId));
        }
      });
    }

    function calcRoi() {
      const acv = parseFloat(container.querySelector("#acv")?.value) || 0;
      const lift = parseFloat(container.querySelector("#lift")?.value) || 0;
      const opportunities = parseFloat(container.querySelector("#opportunities")?.value) || 0;
      const resultEl = container.querySelector("#roi-result");
      if(resultEl) {
        const result = acv * (lift / 100) * opportunities;
        resultEl.textContent = "£" + result.toLocaleString("en-GB", {minimumFractionDigits:0, maximumFractionDigits:0});
      }
    }
    ['acv', 'lift', 'opportunities'].forEach(id => {
      const el = container.querySelector('#' + id);
      if (el) el.addEventListener('input', calcRoi);
    });

    if (tabs.length > 0) switchMainTab(tabs[0].dataset.target);
    updateMatrix();
    calcRoi();
  }

  // ---------- Init ----------
  onReady(async function () {
    await ensureTailwind();
    injectScopedCss();
    const root = getRoot();
    root.innerHTML = buildHtml();

    // Wire parts
    wirePart1();
    wirePart2();
    wirePart3();
    wirePart4();
  });
})();
