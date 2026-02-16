# Scavenger 🍕

**Campus Food Finder Platform**

Make invisible campus food discoverable in real-time. Scavenger uses AI-powered flyer parsing to create a searchable feed of free food events on campus.

---

## 🎯 Project Status

**Phase:** Planning & Documentation Complete  
**Next:** MVP Development (2-3 weeks)  
**Target Launch:** BYU Campus Pilot

---

## 📁 Project Structure

```
project-root/
├── aiDocs/              # 📚 TRACKED: Product documentation
│   ├── context.md       # ⭐ START HERE - Project overview
│   ├── prd.md           # Product requirements
│   ├── mvp.md           # MVP specification
│   ├── architecture.md  # Technical architecture
│   ├── coding-style.md  # Code standards
│   └── changelog.md     # Change history
│
├── ai/                  # 🚫 GITIGNORED: Working artifacts
│   ├── guides/          # Research, library docs
│   ├── roadmaps/        # Task checklists
│   └── notes/           # Brainstorming
│
├── scripts/             # 🛠️ CLI utilities
│
└── src/ (coming soon)   # 💻 Application code
```

---

## 🚀 Quick Start

### For New Team Members

1. **Read the context document first:**
   ```bash
   open aiDocs/context.md
   ```

2. **Review the PRD and MVP spec:**
   ```bash
   open aiDocs/prd.md
   open aiDocs/mvp.md
   ```

3. **Check the technical architecture:**
   ```bash
   open aiDocs/architecture.md
   ```

### For Development (Coming Soon)

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Add your API keys

# Run dev server
npm run dev
```

---

## 📊 Key Metrics (MVP Goals)

- **30+** posts per week
- **150+** unique visitors
- **<5%** "ghost chase" rate
- **25%** repeat usage rate
- **5+** organic posts (non-team)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 + React + Tailwind CSS |
| Backend | Next.js API Routes (Serverless) |
| Database | Firestore (Firebase) |
| AI/ML | Gemini 2.0 Flash API |
| Hosting | Vercel |

---

## 📖 Documentation

All documentation lives in `aiDocs/` and is tracked in git:

- **[context.md](aiDocs/context.md)** - Project overview, status, mission ⭐ START HERE
- **[prd.md](aiDocs/prd.md)** - Full product requirements document
- **[mvp.md](aiDocs/mvp.md)** - MVP demo specification
- **[architecture.md](aiDocs/architecture.md)** - System architecture and tech decisions
- **[coding-style.md](aiDocs/coding-style.md)** - Code standards and patterns
- **[changelog.md](aiDocs/changelog.md)** - Version history

---

## 🎓 The Problem We're Solving

- **41% of college students** experience food insecurity
- **Thousands of pounds** of free food go to waste daily on campus
- **Information gap:** Food exists, but students can't find it

**Solution:** AI-powered flyer scanning + real-time feed = zero food waste, zero hungry students.

---

## 🤝 Contributing

1. Read `aiDocs/context.md` for project overview
2. Follow `aiDocs/coding-style.md` for code standards
3. Update `aiDocs/changelog.md` with significant changes
4. Test on mobile (we're mobile-first!)

---

## 📞 Contact

- **Product Lead:** Ava Williams
- **GitHub:** [github.com/avareesew/food_finder](https://github.com/avareesew/food_finder)

---

## 📜 License

TBD

---

**Built with 💙 by BYU students, for students.**
