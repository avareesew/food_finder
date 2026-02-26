---
marp: true
theme: gaia
paginate: true
style: |
  /* ── Base ─────────────────────────────────────── */
  section {
    font-family: Poppins, 'Segoe UI', system-ui, sans-serif;
    background: #FDFBF7;
    color: #1A1A1A;
    padding: 24px 48px;
    font-size: 26px;
    line-height: 1.6;
  }

  /* ── Headings ─────────────────────────────────── */
  h1 {
    color: #1A1A1A;
    font-size: 1.4em;
    font-weight: 700;
    border-bottom: 2px solid #FFD5C2;
    padding-bottom: 0.25em;
    margin-top: 0;
    margin-bottom: 0.5em;
    letter-spacing: -0.01em;
  }
  h2 {
    color: #8C8C8C;
    font-size: 1em;
    font-weight: 500;
    margin: 0 0 0.4em;
  }
  h3 {
    color: #FF5A1F;
    font-size: 0.9em;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin: 0 0 0.3em;
  }

  /* ── Lists ────────────────────────────────────── */
  ul, ol {
    padding-left: 1.35em;
    margin: 0.2em 0;
  }
  li {
    margin-bottom: 0.35em;
    line-height: 1.6;
    font-size: 1em;
  }
  li::marker { color: #FF5A1F; }

  /* ── Emphasis ─────────────────────────────────── */
  strong { color: #FF5A1F; font-weight: 600; }

  /* ── Tables ───────────────────────────────────── */
  table {
    font-size: 0.78em;
    width: 100%;
    border-collapse: collapse;
    margin-top: 0.3em;
  }
  thead tr { background: #1A1A1A; color: #ffffff; }
  th {
    padding: 8px 14px;
    text-align: left;
    font-weight: 600;
    letter-spacing: 0.02em;
  }
  td {
    padding: 7px 14px;
    border-bottom: 1px solid #E0E0E0;
    color: #2D2D2D;
  }
  tr:nth-child(even) td { background: #F5F5F5; }

  /* ── Inline code ──────────────────────────────── */
  code {
    background: #F5F5F5;
    color: #1A1A1A;
    font-size: 0.78em;
    padding: 2px 7px;
    border-radius: 4px;
    font-family: 'Fira Code', 'SF Mono', monospace;
  }

  /* ── Code blocks ──────────────────────────────── */
  pre {
    background: #1A1A1A;
    color: #FDFBF7;
    padding: 0.85em 1.1em;
    border-radius: 8px;
    font-size: 0.68em;
    overflow: hidden;
    margin: 0.4em 0;
  }
  pre code { background: none; color: inherit; padding: 0; font-size: 1em; }

  /* ── Blockquote ───────────────────────────────── */
  blockquote {
    background: #FFF5F0;
    border-left: 3px solid #FF5A1F;
    padding: 0.45em 1em;
    font-size: 0.83em;
    color: #E64A19;
    margin: 0.5em 0;
    border-radius: 0 6px 6px 0;
    font-style: normal;
  }

  /* ── Two-column grid ──────────────────────────── */
  .cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2.5em;
    margin-top: 0.3em;
  }
  .cols-wide {
    display: grid;
    grid-template-columns: 3fr 2fr;
    gap: 2em;
    margin-top: 0.3em;
  }

  /* ── Section divider label ────────────────────── */
  .section-label {
    display: inline-block;
    background: #FFE8DC;
    color: #FF5A1F;
    padding: 1px 10px;
    border-radius: 999px;
    font-size: 0.7em;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    margin-bottom: 0.5em;
  }

  /* ── Stat callout ─────────────────────────────── */
  .stat { font-size: 3.8em; font-weight: 800; color: #FF5A1F; line-height: 1; margin: 0; }
  .stat-label { font-size: 0.8em; color: #8C8C8C; margin-top: 6px; }

  /* ── Card ─────────────────────────────────────── */
  .card {
    background: #FFF5F0;
    border: 1px solid #FFD5C2;
    border-radius: 10px;
    padding: 14px 16px;
  }
  .card-dark {
    background: #1A1A1A;
    color: #FDFBF7;
    border-radius: 10px;
    padding: 14px 16px;
  }
  .card-dark strong { color: #FF8A65; }

  /* ── Numbered badge ───────────────────────────── */
  .num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    height: 28px;
    background: #FF5A1F;
    color: #fff;
    border-radius: 50%;
    font-size: 0.78em;
    font-weight: 700;
    flex-shrink: 0;
  }

  /* ── Row item ─────────────────────────────────── */
  .row-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    background: #F5F5F5;
    border-radius: 8px;
    padding: 12px 16px;
    font-size: 0.92em;
  }

  /* ── Centered title slide ─────────────────────── */
  section.lead {
    display: flex !important;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    background: linear-gradient(to bottom, #FDFBF7 45%, #FFEEE3 75%, #FFE0CC 100%) !important;
  }
  section.lead h1 { border-bottom: none; text-align: center; }

  /* ── Page number ──────────────────────────────── */
  section::after { color: #8C8C8C; font-size: 0.7em; }
---

<!-- _class: lead -->

<div style="font-size:3.4em;font-weight:800;color:#1A1A1A;line-height:1.1;">Scavenger 🍕</div>
<div style="width:500px;height:4px;background:#FF5A1F;border-radius:2px;margin:16px auto;"></div>
<div style="font-size:1.1em;color:#8C8C8C;margin-bottom:32px;">Making invisible campus food discoverable in real time</div>
<div style="font-size:0.82em;color:#8C8C8C;">
  Midterm Validation Pitch &nbsp;&nbsp;|&nbsp;&nbsp; <strong style="color:#1A1A1A;">Team 8:</strong> &nbsp;Ryan Tetro &nbsp;·&nbsp; Ava Williams &nbsp;·&nbsp; Allie Marshall &nbsp;·&nbsp; Eddy Gonzalez
</div>

---

# Visibility Failure

<div class="cols" style="margin-top:14px;">
<div style="display:flex;flex-direction:column;gap:12px;">
  <div style="background:#FFF5F0;border:1px solid #FFD5C2;border-radius:12px;padding:18px;text-align:center;">
    <div class="stat">41%</div>
    <div class="stat-label">of college students face food insecurity</div>
  </div>
  <div style="background:#F5F5F5;border-radius:12px;padding:18px;text-align:center;">
    <div style="font-size:2em;font-weight:800;color:#1A1A1A;line-height:1;">Every Day</div>
    <div class="stat-label">Tons of catered leftovers tossed — not from lack of supply</div>
  </div>
</div>
<div style="display:flex;flex-direction:column;justify-content:center;gap:10px;font-size:0.88em;">
  <div class="row-item">📌 <span>Flyers aren't searchable — trapped in the physical world</span></div>
  <div class="row-item">👥 <span>Group chats only reach existing in-groups</span></div>
  <div class="row-item">📱 <span>Instagram posts decay before students see them</span></div>
  <div class="card-dark" style="margin-top:4px;text-align:center;font-size:0.95em;">This is a <strong>data problem</strong>, not a food problem</div>
</div>
</div>

---

# BYU: The Perfect Pilot

<div style="text-align:center;margin:10px 0 18px;">
  <div class="stat">37,205</div>
  <div class="stat-label">students — Fall 2025 enrollment with hundreds of active clubs</div>
</div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;font-size:0.84em;">
  <div class="card" style="text-align:center;">
    <div style="font-size:1.5em;margin-bottom:6px;">📱</div>
    <strong style="color:#1A1A1A">@byufreefood</strong>
    <div style="color:#8C8C8C;margin-top:4px;">Instagram demand signal — proof the appetite already exists</div>
  </div>
  <div class="card" style="text-align:center;">
    <div style="font-size:1.5em;margin-bottom:6px;">🤝</div>
    <strong style="color:#1A1A1A">Service Culture</strong>
    <div style="color:#8C8C8C;margin-top:4px;">Community orientation reduces stigma around free food</div>
  </div>
  <div class="card" style="text-align:center;">
    <div style="font-size:1.5em;margin-bottom:6px;">🏃</div>
    <strong style="color:#1A1A1A">On-Campus Team</strong>
    <div style="color:#8C8C8C;margin-top:4px;">Rapid, live iteration and validation possible</div>
  </div>
</div>

---

# The "Ghost Chase" Problem

<div style="display:grid;gap:9px;margin-top:14px;">
  <div class="row-item"><span class="num">1</span><span><strong style="color:#1A1A1A">Flyers aren't digitized</strong> — trapped in the physical world, not searchable</span></div>
  <div class="row-item"><span class="num">2</span><span><strong style="color:#1A1A1A">Insider bias</strong> — announcements only reach existing in-groups</span></div>
  <div class="row-item"><span class="num">3</span><span><strong style="color:#1A1A1A">No source of truth</strong> — once food is gone, no one updates the record</span></div>
  <div class="row-item"><span class="num">4</span><span><strong style="color:#1A1A1A">Information decays instantly</strong> — by the time you hear, it's already gone</span></div>
</div>

<div class="card-dark" style="margin-top:14px;text-align:center;">Students arrive to empty rooms. The food was there — they just never knew. <strong>The Ghost Chase.</strong></div>

---

# Our Solution: The Scavenger Loop

<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;font-size:0.82em;margin:16px 0;">
  <div class="card" style="border-width:2px;text-align:center;padding:16px 12px;">
    <div style="font-size:1.8em;margin-bottom:8px;">📸</div>
    <strong style="color:#FF5A1F;display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.05em;font-size:0.85em">Upload</strong>
    <span style="color:#1A1A1A">Take a photo of any flyer on campus</span>
  </div>
  <div class="card" style="border-width:2px;text-align:center;padding:16px 12px;">
    <div style="font-size:1.8em;margin-bottom:8px;">✨</div>
    <strong style="color:#FF5A1F;display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.05em;font-size:0.85em">Extract</strong>
    <span style="color:#1A1A1A">AI pulls time, location, and food type automatically</span>
  </div>
  <div class="card" style="border-width:2px;text-align:center;padding:16px 12px;">
    <div style="font-size:1.8em;margin-bottom:8px;">📢</div>
    <strong style="color:#FF5A1F;display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.05em;font-size:0.85em">Broadcast</strong>
    <span style="color:#1A1A1A">Post appears on the real-time campus-wide feed</span>
  </div>
  <div class="card" style="border-width:2px;text-align:center;padding:16px 12px;">
    <div style="font-size:1.8em;margin-bottom:8px;">✅</div>
    <strong style="color:#FF5A1F;display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.05em;font-size:0.85em">Verify</strong>
    <span style="color:#1A1A1A">"Mark as Gone" prevents ghost chases instantly</span>
  </div>
</div>

<div style="display:flex;gap:10px;font-size:0.8em;">
  <div style="background:#F5F5F5;border-radius:8px;padding:8px 14px;flex:1;text-align:center;">🚫 <strong style="color:#1A1A1A">No accounts</strong> — browse like Instagram</div>
  <div style="background:#F5F5F5;border-radius:8px;padding:8px 14px;flex:1;text-align:center;">⚡ <strong style="color:#1A1A1A">60-second</strong> post flow</div>
  <div style="background:#F5F5F5;border-radius:8px;padding:8px 14px;flex:1;text-align:center;">🔄 <strong style="color:#1A1A1A">Real-time sync</strong> via Firestore</div>
</div>

---

# The Core Hypothesis

<div class="card-dark" style="text-align:center;padding:22px 28px;margin:10px 0 18px;">
  <p style="font-size:1.15em;font-style:italic;line-height:1.5;margin:0;">"If we make food discovery <strong>instant</strong> and browsing <strong>anonymous</strong>, students will repeatedly use Scavenger weekly."</p>
</div>

<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;font-size:0.78em;">
  <div class="card" style="text-align:center;padding:12px 8px;">
    <div style="font-size:1.4em;">⏱️</div>
    <strong style="color:#1A1A1A;display:block;margin:4px 0">&lt; 60 sec</strong>
    <span style="color:#8C8C8C">to post leftovers</span>
  </div>
  <div class="card" style="text-align:center;padding:12px 8px;">
    <div style="font-size:1.4em;">🚫</div>
    <strong style="color:#1A1A1A;display:block;margin:4px 0">No login</strong>
    <span style="color:#8C8C8C">to browse the feed</span>
  </div>
  <div class="card" style="text-align:center;padding:12px 8px;">
    <div style="font-size:1.4em;">📍</div>
    <strong style="color:#1A1A1A;display:block;margin:4px 0">30-min window</strong>
    <span style="color:#8C8C8C">for students to act</span>
  </div>
  <div class="card" style="text-align:center;padding:12px 8px;">
    <div style="font-size:1.4em;">📅</div>
    <strong style="color:#1A1A1A;display:block;margin:4px 0">Weekly volume</strong>
    <span style="color:#8C8C8C">to sustain the feed</span>
  </div>
</div>

---

# Voice of the Customer

<div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;margin:14px 0;">
  <div style="background:#FFF5F0;border-left:4px solid #FF5A1F;border-radius:0 10px 10px 0;padding:18px 20px;">
    <p style="font-size:0.92em;color:#1A1A1A;font-style:italic;margin:0 0 14px;line-height:1.5">"Any exposure is good exposure. I'm fine with people coming just for food if they sit through the event."</p>
    <strong style="color:#FF5A1F;font-size:0.8em">Kendall Castellaw</strong><br/>
    <span style="color:#8C8C8C;font-size:0.72em">Past Finance Society President · Marriott School</span>
  </div>
  <div style="background:#FFF5F0;border-left:4px solid #FF5A1F;border-radius:0 10px 10px 0;padding:18px 20px;">
    <p style="font-size:0.92em;color:#1A1A1A;font-style:italic;margin:0 0 14px;line-height:1.5">"If it got more people to go to the club, then maybe. Sure — no harm in it."</p>
    <strong style="color:#FF5A1F;font-size:0.8em">Carson Fellows</strong><br/>
    <span style="color:#8C8C8C;font-size:0.72em">Current Management Consulting President</span>
  </div>
</div>

<div class="card-dark" style="font-size:0.85em;text-align:center;">Liability = non-issue · Motivation = <strong>recruitment</strong>, not waste reduction · Friction reduction is the unlock</div>

---

# What We Learned

| Assumption | Status | Evidence |
|---|---|---|
| 70%+ of events have physical flyers | ⚠️ At Risk | Tanner is mostly digital — non-Tanner unknown, more interviews needed |
| Leftover supply is reliable | ⚠️ At Risk | Both clubs rarely have leftovers; orders conservative |
| Organizers will post willingly | ⚠️ Nuanced | Won't go out of their way — recruitment framing required (2/2) |
| Liability is a supply-side blocker | ✅ Falsified | Zero concerns — 2 independent interviews |
| Food events are frequent | ✅ Confirmed | Both clubs have food at events regularly |

<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px;font-size:0.82em;">
  <div style="background:#dcfce7;border:1px solid #86efac;border-radius:8px;padding:10px 14px;">
    <strong style="color:#15803d">🔬 Falsification Test #1</strong><br/>
    <em>Hypothesis:</em> Liability would block organizers from posting<br/>
    <strong style="color:#15803d">Result: Decisively falsified</strong> — zero concerns across 2 independent interviews
  </div>
  <div class="card" style="font-size:1em;">⚡ <strong style="color:#1A1A1A">The pivot signal:</strong> Feed must surface food available <em>during</em> events, not just post-event scraps. Posting must be near-effortless or supply won't participate.</div>
</div>

---

# Competitive Mapping

<div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:0;font-size:0.82em;margin:12px 0 10px;">
  <div style="background:#1A1A1A;color:#fff;padding:8px 14px;font-weight:600;border-radius:8px 0 0 0;">Solution</div>
  <div style="background:#1A1A1A;color:#fff;padding:8px 14px;font-weight:600;text-align:center;">Target</div>
  <div style="background:#1A1A1A;color:#fff;padding:8px 14px;font-weight:600;text-align:center;">Post Friction</div>
  <div style="background:#1A1A1A;color:#fff;padding:8px 14px;font-weight:600;text-align:center;border-radius:0 8px 0 0;">Campus UX</div>
  <div style="padding:8px 14px;border-bottom:1px solid #E0E0E0;color:#8C8C8C;">Olio</div>
  <div style="padding:8px 14px;border-bottom:1px solid #E0E0E0;text-align:center;color:#8C8C8C;">Community</div>
  <div style="padding:8px 14px;border-bottom:1px solid #E0E0E0;text-align:center;color:#8C8C8C;">Manual</div>
  <div style="padding:8px 14px;border-bottom:1px solid #E0E0E0;text-align:center;color:#8C8C8C;">Generic</div>
  <div style="padding:8px 14px;border-bottom:1px solid #E0E0E0;color:#8C8C8C;">Too Good To Go</div>
  <div style="padding:8px 14px;border-bottom:1px solid #E0E0E0;text-align:center;color:#8C8C8C;">Retail</div>
  <div style="padding:8px 14px;border-bottom:1px solid #E0E0E0;text-align:center;color:#8C8C8C;">Semi-Structured</div>
  <div style="padding:8px 14px;border-bottom:1px solid #E0E0E0;text-align:center;color:#8C8C8C;">Paid</div>
  <div style="padding:8px 14px;border-bottom:1px solid #E0E0E0;color:#8C8C8C;">Group Chats</div>
  <div style="padding:8px 14px;border-bottom:1px solid #E0E0E0;text-align:center;color:#8C8C8C;">Social</div>
  <div style="padding:8px 14px;border-bottom:1px solid #E0E0E0;text-align:center;color:#8C8C8C;">Manual</div>
  <div style="padding:8px 14px;border-bottom:1px solid #E0E0E0;text-align:center;color:#8C8C8C;">Fragmented</div>
  <div style="background:#FFF5F0;border:2px solid #FF5A1F;border-right:none;padding:8px 14px;border-radius:8px 0 0 8px;font-weight:700;color:#FF5A1F;">⭐ Scavenger</div>
  <div style="background:#FFF5F0;border-top:2px solid #FF5A1F;border-bottom:2px solid #FF5A1F;padding:8px 14px;text-align:center;font-weight:700;color:#FF5A1F;">Campus</div>
  <div style="background:#FFF5F0;border-top:2px solid #FF5A1F;border-bottom:2px solid #FF5A1F;padding:8px 14px;text-align:center;font-weight:700;color:#FF5A1F;">AI-Assisted</div>
  <div style="background:#FFF5F0;border:2px solid #FF5A1F;border-left:none;padding:8px 14px;text-align:center;border-radius:0 8px 8px 0;font-weight:700;color:#FF5A1F;">Native</div>
</div>

<div style="font-size:0.82em;color:#8C8C8C;text-align:center;">Our wedge: Campus UX + AI ingestion + trust loop — none of the alternatives have all three</div>

---

# System & Leverage Points

<div class="cols" style="margin-top:10px;">
<div style="display:flex;flex-direction:column;align-items:center;gap:10px;font-size:1em;">
  <div style="background:#FFF5F0;border:2px solid #FF5A1F;border-radius:10px;padding:12px 40px;text-align:center;"><strong>📱 Next.js · TypeScript · React</strong></div>
  <span style="color:#8C8C8C;font-size:1.2em;">↓</span>
  <div style="background:#1A1A1A;color:#fff;border-radius:10px;padding:12px 40px;text-align:center;"><strong>▲ Vercel · Next.js API</strong></div>
  <span style="color:#8C8C8C;font-size:1.2em;">↓ &nbsp;&nbsp; ↓ &nbsp;&nbsp; ↓</span>
  <div style="display:flex;gap:12px;">
    <div style="background:#fef9c3;border:1px solid #fde047;border-radius:10px;padding:12px 16px;text-align:center;">✨ <strong>Gemini</strong><br/><span style="color:#d97706;font-size:0.85em;">⏳ pending</span></div>
    <div style="background:#dcfce7;border:1px solid #86efac;border-radius:10px;padding:12px 16px;text-align:center;">🔥 <strong>Firestore</strong><br/><span style="color:#16a34a;font-size:0.85em;">✅ active</span></div>
    <div style="background:#dcfce7;border:1px solid #86efac;border-radius:10px;padding:12px 16px;text-align:center;">🗄️ <strong>Storage</strong><br/><span style="color:#16a34a;font-size:0.85em;">✅ active</span></div>
  </div>
</div>
<div style="display:flex;flex-direction:column;gap:12px;justify-content:center;font-size:0.9em;">
  <div class="row-item"><span class="num">1</span><span><strong style="color:#1A1A1A">Digitize instantly</strong> — Gemini removes ingestion friction (30× cheaper than GPT-4o)</span></div>
  <div class="row-item"><span class="num">2</span><span><strong style="color:#1A1A1A">Real-time truth</strong> — Firestore listeners provide the "Now" view</span></div>
  <div class="row-item"><span class="num">3</span><span><strong style="color:#1A1A1A">Trust mechanism</strong> — "Mark as Gone" eliminates ghost chases</span></div>
</div>
</div>

---

# Built & Tested

<div class="cols" style="margin-top:10px;">
<div style="display:flex;flex-direction:column;gap:8px;font-size:0.82em;">
  <div style="background:#dcfce7;border:1px solid #86efac;border-radius:8px;padding:10px 14px;"><strong style="color:#15803d">✅ Shipped</strong><br/>Homepage · Leaflet map · feed preview<br/>Feed + event detail pages<br/>Upload API: Storage → Firestore<br/>Upload form · Structured logger</div>
  <div style="background:#fef9c3;border:1px solid #fde047;border-radius:8px;padding:10px 14px;"><strong style="color:#d97706">⏳ In Progress</strong><br/>Gemini extraction · "Mark as Gone" · `onSnapshot`</div>
</div>
<div style="display:flex;flex-direction:column;gap:8px;font-size:0.8em;">
  <div class="card-dark" style="padding:10px 14px;font-size:0.85em;"><code style="background:transparent;color:#FF8A65;padding:0;">[Scavenger][info]</code> <code style="background:transparent;color:#FDFBF7;padding:0;">{"event":"upload-success",...}</code></div>
  <div class="row-item">📋 3 documented build cycles in changelog</div>
  <div class="row-item">📦 7 commits · `feat:` / `chore:` prefixes</div>
  <div class="row-item">🧪 `scripts/test.sh` → lint → build → `logs/*.log`</div>
</div>
</div>
<div style="background:#FF5A1F;border-radius:10px;padding:16px;text-align:center;margin-top:36px;">
  <div style="font-size:1.3em;font-weight:700;color:#fff;">▶ Live Demo</div>
</div>

---

# The Ask

<div style="display:grid;gap:8px;margin-top:12px;font-size:0.85em;">
  <div style="display:flex;align-items:center;gap:14px;background:#dcfce7;border-radius:8px;padding:11px 16px;border:1px solid #86efac;">
    <span style="font-size:1.1em;flex-shrink:0;">✅</span>
    <div><strong style="color:#15803d">Done</strong> — Two interviews completed; recruitment framing and falsification confirmed</div>
  </div>
  <div style="display:flex;align-items:center;gap:14px;background:#F5F5F5;border-radius:8px;padding:11px 16px;">
    <span style="font-size:0.75em;font-weight:700;color:#FF5A1F;min-width:52px;flex-shrink:0;">WEEK 2</span>
    <div>Wire Gemini · confirmation form · demo becomes real</div>
  </div>
  <div style="display:flex;align-items:center;gap:14px;background:#F5F5F5;border-radius:8px;padding:11px 16px;">
    <span style="font-size:0.75em;font-weight:700;color:#FF5A1F;min-width:52px;flex-shrink:0;">WEEK 3</span>
    <div>Add "Mark as Gone" + `onSnapshot` · end-to-end pipeline complete</div>
  </div>
  <div style="display:flex;align-items:center;gap:14px;background:#F5F5F5;border-radius:8px;padding:11px 16px;">
    <span style="font-size:0.75em;font-weight:700;color:#FF5A1F;min-width:52px;flex-shrink:0;">WK 4–5</span>
    <div>Deploy to Vercel · 5–10 alpha testers · seed 10–15 real events</div>
  </div>
  <div style="display:flex;align-items:flex-start;gap:14px;background:#1A1A1A;border-radius:8px;padding:11px 16px;">
    <span style="font-size:0.75em;font-weight:700;color:#FF8A65;min-width:52px;flex-shrink:0;margin-top:2px;">GATE</span>
    <div style="color:#FDFBF7;font-size:0.9em;">
      <strong style="color:#86efac">If traction:</strong> Expand to more buildings · add Slack/email ingestion · gamify organizer posting<br/>
      <strong style="color:#fca5a5">If supply fails:</strong> Narrow to 2–3 high-volume clubs · add SMS/push alerts · incentivize with food access perks
    </div>
  </div>
</div>

<div style="font-size:0.72em;color:#8C8C8C;margin-top:10px;">GitHub: <code>avareesew/food_finder</code> &nbsp;·&nbsp; Deliverables: <code>aiDocs/prd.md</code> · <code>aiDocs/architecture.md</code> · <code>aiDocs/changelog.md</code></div>

---

<!-- _backgroundColor: #F5F5F5 -->

# Appendix

Supporting reference material

---

# A — Personas

- **Tyler (Demand)** — Needs stigma-free, instant, anonymous food discovery on the go
  *Product decision: no login required*

- **Sarah (Supply)** — Wants club attendance + less waste guilt. Posting must be fast.
  *Product decision: FDIA 2023 disclaimer built into post flow*

- **Marcus (Advocate)** — Wants sustainability impact + easy floor broadcast
  *Product decision: quantified impact visible in the feed*

---

# B — Founding Hypothesis: Full Assumption Set

| Assumption | Test | Status |
|---|---|---|
| Organizers post when friction < 60 sec | Club president interviews | ⏳ 2/3+ done |
| Students act on alerts within 30 min | Alpha tester tracking — Weeks 4–5 | ⏳ Pending |
| No login is an adoption unlock | No-auth MVP; measure conversion | ⏳ Pending |
| Enough events to sustain daily feed | Feed volume audit during alpha | ⏳ Pending |

---

# C — System Map

<div style="display:flex;align-items:center;gap:8px;font-size:0.75em;margin:10px 0;flex-wrap:nowrap;justify-content:center;">
  <div style="background:#dcfce7;border:1px solid #86efac;border-radius:8px;padding:8px 12px;text-align:center;">🎉 <strong>Club Events</strong><br/><span style="color:#8C8C8C">~50/week at BYU</span></div>
  <span style="color:#8C8C8C;font-size:1.4em">→</span>
  <div style="background:#fef9c3;border:1px solid #fde047;border-radius:8px;padding:8px 12px;text-align:center;">🍕 <strong>Leftover Food</strong><br/><span style="color:#8C8C8C">Available</span></div>
  <span style="color:#8C8C8C;font-size:1.4em">→</span>
  <div style="background:#1A1A1A;color:#fff;border-radius:8px;padding:8px 12px;text-align:center;"><strong>📱 Scavenger</strong><br/><span style="color:#FF8A65;font-size:0.85em">⭐ Leverage Point</span></div>
  <span style="color:#8C8C8C;font-size:1.4em">→</span>
  <div style="background:#FFF5F0;border:1px solid #FFD5C2;border-radius:8px;padding:8px 12px;text-align:center;">📢 <strong>Real-Time Feed</strong><br/><span style="color:#8C8C8C">+ Campus Map</span></div>
  <span style="color:#8C8C8C;font-size:1.4em">→</span>
  <div style="background:#dcfce7;border:1px solid #86efac;border-radius:8px;padding:8px 12px;text-align:center;">👥 <strong>Students in Need</strong><br/><span style="color:#8C8C8C">41% food insecure</span></div>
</div>
<div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:7px 16px;font-size:0.75em;color:#991b1b;text-align:center;margin-top:2px;">
  <strong>Without Scavenger today:</strong> Food → 🗑️ Wasted or informally shared — no real-time channel exists
</div>

---

# D — Differentiation Grid

<div style="display:flex;flex-direction:column;gap:20px;font-size:0.78em;margin:10px 0;">
  <div style="position:relative;width:420px;height:260px;margin:0 auto;background:#FDFBF7;border:2px solid #1A1A1A;border-radius:8px;">
    <div style="position:absolute;left:50%;top:0;bottom:0;width:1px;background:#E0E0E0;"></div>
    <div style="position:absolute;top:50%;left:0;right:0;height:1px;background:#E0E0E0;"></div>
    <div style="position:absolute;left:6px;top:50%;transform:translateY(-50%);color:#8C8C8C;">Slow</div>
    <div style="position:absolute;right:6px;top:50%;transform:translateY(-50%);color:#8C8C8C;">Fast</div>
    <div style="position:absolute;top:6px;left:50%;transform:translateX(-50%);color:#8C8C8C;">Expensive</div>
    <div style="position:absolute;bottom:6px;left:50%;transform:translateX(-50%);color:#8C8C8C;">Free</div>
    <div style="position:absolute;left:25%;top:25%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:3px;">
      <span style="font-size:0.9em;white-space:nowrap;">Food Pantry</span>
      <div style="width:8px;height:8px;background:#8C8C8C;border-radius:50%;"></div>
    </div>
    <div style="position:absolute;left:75%;top:25%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:3px;">
      <span style="font-size:0.9em;white-space:nowrap;">Too Good To Go</span>
      <div style="width:8px;height:8px;background:#8C8C8C;border-radius:50%;"></div>
    </div>
    <div style="position:absolute;left:25%;top:75%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:3px;">
      <div style="width:8px;height:8px;background:#8C8C8C;border-radius:50%;"></div>
      <span style="font-size:0.9em;white-space:nowrap;">Group Chats</span>
    </div>
    <div style="position:absolute;left:75%;top:75%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:3px;">
      <div style="width:10px;height:10px;background:#FF5A1F;border-radius:50%;border:2px solid #1A1A1A;"></div>
      <span style="font-size:0.9em;white-space:nowrap;font-weight:700;color:#FF5A1F;">⭐ OURS</span>
    </div>
  </div>
  <div>
    <div style="font-size:1.05em;font-weight:700;color:#1A1A1A;margin-bottom:8px;">Scavenger's position on key attributes</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
    <div><div style="color:#8C8C8C;font-size:0.9em;margin-bottom:2px;">Complicated ←→ Simple</div><div style="position:relative;height:6px;"><div style="height:6px;background:linear-gradient(to right,#8C8C8C,#FF5A1F);border-radius:3px;"></div><div style="position:absolute;right:8%;top:50%;transform:translate(50%,-50%);width:14px;height:14px;background:#FF5A1F;border-radius:50%;border:2px solid #1A1A1A;"></div></div></div>
    <div><div style="color:#8C8C8C;font-size:0.9em;margin-bottom:2px;">Manual ←→ Automatic</div><div style="position:relative;height:6px;"><div style="height:6px;background:linear-gradient(to right,#8C8C8C,#FF5A1F);border-radius:3px;"></div><div style="position:absolute;right:22%;top:50%;transform:translate(50%,-50%);width:14px;height:14px;background:#FF5A1F;border-radius:50%;border:2px solid #1A1A1A;"></div></div></div>
    <div><div style="color:#8C8C8C;font-size:0.9em;margin-bottom:2px;">Slow ←→ Fast</div><div style="position:relative;height:6px;"><div style="height:6px;background:linear-gradient(to right,#8C8C8C,#FF5A1F);border-radius:3px;"></div><div style="position:absolute;right:12%;top:50%;transform:translate(50%,-50%);width:14px;height:14px;background:#FF5A1F;border-radius:50%;border:2px solid #1A1A1A;"></div></div></div>
    <div><div style="color:#8C8C8C;font-size:0.9em;margin-bottom:2px;">Expensive ←→ Free</div><div style="position:relative;height:6px;"><div style="height:6px;background:linear-gradient(to right,#8C8C8C,#FF5A1F);border-radius:3px;"></div><div style="position:absolute;right:0%;top:50%;transform:translate(50%,-50%);width:14px;height:14px;background:#FF5A1F;border-radius:50%;border:2px solid #1A1A1A;"></div></div></div>
    </div>
  </div>
</div>

<div style="background:#FFF5F0;border:2px solid #FF5A1F;border-radius:8px;padding:10px 16px;text-align:center;font-weight:700;color:#1A1A1A;margin-top:16px;">⭐ Scavenger occupies <strong style="color:#FF5A1F">Fast + Free</strong></div>

---

# E — Success & Failure Framework

| Metric | Target | Failure Trigger | Response |
|---|---|---|---|
| Posts / week | 30+ | < 10 by Week 5 | Club outreach · incentive experiment |
| Unique visitors | 150+ | — | Social media push |
| **Weekly repeat users ⭐** | **25%** | **< 15% after Week 4** | **Improve CTA · RA partnerships** |
| Ghost chase rate | < 5% | > 10% | Tighten human verification |

**Week 5 alpha gate:** 70%+ of testers say "yes, I would use this regularly" — hard go/no-go

---

# F — Documentation Pipeline

- **`aiDocs/prd.md`** — personas, competitive table, success/failure criteria, pivot plans
- **`aiDocs/architecture.md`** — verified API docs, tech decisions log with alternatives considered
- **`aiDocs/changelog.md`** — every update logged with test artifacts and customer discovery
- **`ai/` gitignored** — raw working artifacts stay local; only decisions surface to tracked docs

> Raw notes → `ai/notes/` → decisions → `aiDocs/changelog.md` → code

---

# G — Structured Logging & CLI Pipeline

```
[Scavenger][info] {"timestamp":"2026-02-24T18:35:11.000Z","level":"info","event":"upload-success","details":{"flyerId":"abc123","storagePath":"flyers/..."}}
```

<div style="display:flex;align-items:center;gap:8px;font-size:0.72em;margin:12px 0;flex-wrap:nowrap;justify-content:center;">
  <div style="background:#FF5A1F;color:#fff;border-radius:6px;padding:7px 12px;text-align:center;"><strong style="color:#fff">scripts/test.sh</strong></div>
  <span style="color:#8C8C8C;font-size:1.3em">→</span>
  <div style="background:#F5F5F5;border:1px solid #E0E0E0;border-radius:6px;padding:7px 12px;text-align:center;"><code>npm run lint</code></div>
  <span style="color:#8C8C8C;font-size:1.3em">→</span>
  <div style="background:#F5F5F5;border:1px solid #E0E0E0;border-radius:6px;padding:7px 12px;text-align:center;"><code>next build --webpack</code></div>
  <span style="color:#8C8C8C;font-size:1.3em">→</span>
  <div style="background:#1A1A1A;color:#FDFBF7;border-radius:6px;padding:7px 12px;text-align:center;"><code>logs/test-TIMESTAMP.log</code></div>
  <span style="color:#8C8C8C;font-size:1.3em">→</span>
  <div style="background:#FFF5F0;border:1px solid #FFD5C2;border-radius:6px;padding:7px 12px;text-align:center;"><strong>aiDocs/changelog.md</strong></div>
</div>

3 documented build cycles · 7 commits · `architecture.md` revised across 3 sessions · 18 files touched by logging layer

---

# H — Alternative Problems We Rejected

<div style="display:grid;gap:9px;font-size:0.82em;margin-top:10px;">
  <div style="background:#F5F5F5;border-radius:8px;padding:11px 16px;border-left:3px solid #8C8C8C;">
    <strong style="color:#1A1A1A">🏥 AI Recovery Coach</strong> — AI chatbot with guardrails for post-surgery/pregnancy recovery, integrated with biometric wearables<br/>
    <span style="color:#8C8C8C"><em>Rejected:</em> High regulatory risk, healthcare liability, and integration complexity put MVP far out of reach in this timeframe</span>
  </div>
  <div style="background:#F5F5F5;border-radius:8px;padding:11px 16px;border-left:3px solid #8C8C8C;">
    <strong style="color:#1A1A1A">💃 Dance Studio Attendance Manager</strong> — Text-based system to auto-update attendance, issue make-up credits, enforce policies<br/>
    <span style="color:#8C8C8C"><em>Rejected:</em> Narrow niche, low team familiarity, no direct access to target customers for fast validation</span>
  </div>
  <div style="background:#F5F5F5;border-radius:8px;padding:11px 16px;border-left:3px solid #8C8C8C;">
    <strong style="color:#1A1A1A">📄 Syllabus Parser</strong> — Extract every deadline from uploaded course PDFs and push to Google Calendar automatically<br/>
    <span style="color:#8C8C8C"><em>Rejected:</em> Solves a friction problem, not a real pain — students already have multiple calendar tools; adoption would be low</span>
  </div>
  <div style="background:#FFF5F0;border-radius:8px;padding:11px 16px;border-left:3px solid #FF5A1F;">
    <strong style="color:#FF5A1F">Why Scavenger won:</strong> On-campus team = fast iteration · existing demand signal (@byufreefood) · tractable MVP · real emotional pain point we've all felt
  </div>
</div>

