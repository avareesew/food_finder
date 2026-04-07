---

# Food Finder — Final Sprint Plan (Apr 1–8)

**Pivot:** Flyer scanning → Club president email/text ingestion with AI extraction + map/filtering
**Due:** April 8 (all presentation materials) | **Presentations:** April 8, 13, 15

---

## Person 1 — Customer Research (Critical Path)


| When        | What                                                                                                                                                                                                                                 |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Day 1–2** | Contact **Thomas Chappel** about GroupMe free food channel. Cold outreach to **3+ club presidents** you don't know (BYU org directory, walk into club offices).                                                                      |
| **Day 3–5** | **Interview 3 club presidents** (outside social circle). Ask: How do you announce food events? Would you forward an email to post to a feed? What would make you do this?                                                            |
| **Day 3–6** | **Run falsification tests:** (1) Would presidents forward emails? — ask 5, document yes/no. (2) Does map/filtering beat GroupMe? — show 5 students both, document. (3) Can AI extract from pasted email text? — test 10 real emails. |
| **Day 6–7** | Write up all findings in `ai/notes/` with dates, names, direct quotes. Feed to Person 4 for slides.                                                                                                                                  |


**Deliverable:** Documented interviews + falsification results with evidence

---

## Person 2 — Feature Developer (Demo)


| When        | What                                                                                                                                                                                             |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Day 1–3** | Build **club president submission form** — paste event text/email → OpenAI extracts title, location, date, food → event appears in feed with map pin. Wire through existing extraction pipeline. |
| **Day 4–5** | Polish full demo flow: submit → extract → feed → event detail → map. Test on mobile.                                                                                                             |
| **Day 6–7** | Full demo run-through. Prep 2–3 real test inputs. Have fallback screenshots. Make sure `npm run dev` starts clean.                                                                               |


**Deliverable:** Working live demo of the pivot feature

## Person 3 — Technical Process & Docs


| When        | What                                                                                                                                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Day 1**   | Create **CLAUDE.md** with behavioral guidance (rubric requires this).                                                                                                                                   |
| **Day 1–2** | Integrate **structured logging** into actual API routes (not just `logger.ts`). Verify `scripts/test.sh` works. Audit `.gitignore` (ai/, .env, MCP configs, .secrets/). Scan git for committed secrets. |
| **Day 3–5** | Update **PRD** to reflect pivot (customer = club presidents, input = email/text). Update **system diagram**. Ensure **changelog** shows midterm → feedback → pivot → build.                             |
| **Day 6–7** | Final review: all docs current, context.md up to date, roadmap tasks checked off.                                                                                                                       |


**Deliverable:** CLAUDE.md, logging integrated, all docs reflect the pivot, git clean

## Person 4 — Presentation & Narrative


| When        | What                                                                                                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Day 1–2** | Help Person 3 with doc updates. Draft updated **system design diagram** (before/after).                                                                                   |
| **Day 3–5** | Build **20-min presentation**: (1) midterm hypothesis, (2) what we learned, (3) pivot evidence, (4) what we built, (5) live demo woven throughout, (6) honest reflection. |
| **Day 5–6** | Prep **Q&A talking points**: Why not GroupMe? Security? Monetization? What would you do differently?                                                                      |
| **Day 7**   | **Full team rehearsal.** Every member practices their part. Time it.                                                                                                      |


**Deliverable:** Slides + demo script ready, all materials submitted April 8

---

## Timeline At a Glance


|             | Person 1 — Customer | Person 2 — Dev           | Person 3 — Process        | Person 4 — Pres.      |
| ----------- | ------------------- | ------------------------ | ------------------------- | --------------------- |
| **Apr 1–2** | Outreach + Thomas   | Build submission form    | CLAUDE.md + logging + git | System diagram + docs |
| **Apr 3–4** | Interviews          | Wire extraction pipeline | PRD pivot + changelog     | Start slides          |
| **Apr 5–6** | Falsification tests | Demo polish + mobile     | Doc review + final check  | Integrate demo + Q&A  |
| **Apr 7**   | Write up findings   | Demo run-through         | Final audit               | **Team rehearsal**    |
| **Apr 8**   | **Submit**          | **Submit**               | **Submit**                | **Submit**            |


**Everyone must be able to say:** *"At midterm we thought students would scan flyers. We learned clubs communicate digitally and the real customer is club presidents. So we pivoted to email/text ingestion with AI, and added map + filtering as our differentiator over GroupMe."*