# **Comprehensive Market Viability Assessment: The Scavenger Platform and the Strategic Digitization of Campus Food Redistribution**

The higher education sector in 2025 and 2026 faces a dual crisis of escalating operational costs and a systemic failure in student basic needs security. Within this volatile landscape, the Scavenger Platform emerges as a technologically sophisticated intervention designed to bridge the "dark data" gap—the chasm between available, unconsumed campus resources and the student populations that require them. This report provides a deep-dive market research analysis of the platform's viability, integrating macroeconomic trends, comparative artificial intelligence benchmarks, and complex legal frameworks to evaluate the potential for a centralized food discovery engine.

## **The Macroeconomic Context: The Crisis of Collegiate Affordability**

The primary market driver for the Scavenger Platform is the widening "affordability gap" that characterizes the contemporary American university experience. For the 2025-2026 academic year, a student attending a public four-year institution while living on campus requires an estimated average of $30,990 to cover the total cost of attendance, which includes tuition, fees, housing, and nutrition.1 At private, nonprofit institutions, this requirement escalates to $65,470.1 These figures represent more than just financial strain; they signify a fundamental barrier to degree completion, as 31% of students who previously "stopped out" of college cite an unexpected financial expense or emergency as the primary catalyst for their departure.2

The financial fragility of the modern student body is further underscored by the reality that 56% of students would struggle to meet an unplanned bill of $500, a figure that rises to 61% for those enrolled in online programs.3 This environment has transformed food insecurity from a peripheral concern into a core determinant of institutional retention and student health. National surveys indicate that 59% of college students have experienced at least one basic needs insecurity, with 41% specifically experiencing food insecurity within the previous year.3

| National Basic Needs Statistics (2024-2026) | Estimated Prevalence | Relevant Data Group | Source |
| :---- | :---- | :---- | :---- |
| General Basic Needs Insecurity | 59% | Total U.S. College Population | 2 |
| Annual Food Insecurity | 41% | Total U.S. College Population | 2 |
| Housing Insecurity | 48% | Total U.S. College Population | 2 |
| Homelessness Experience | 14% | Total U.S. College Population | 3 |
| Struggle with $500 Emergency Bill | 56% \- 61% | On-campus vs. Online Students | 3 |
| Eligibility-to-Receipt Gap (SNAP) | 67% | Eligible Students Not Receiving Benefits | 2 |

The systemic failure to provide consistent nutrition is particularly acute among marginalized demographics. Statistics from 2025 highlight that 75% of surveyed Black and Indigenous students experience basic needs insecurity, compared to 55% of White students.3 Furthermore, 70% of Pell Grant recipients and 74% of parenting students report facing food or housing insecurity.2 These figures suggest that the Scavenger Platform is not merely a convenience tool but a vital social infrastructure for students who are disproportionately affected by the current economic climate.

### **The Problem of the SNAP Participation Gap**

A significant secondary driver for the platform's market entry is the inefficiency of federal food assistance programs. Although the Supplemental Nutrition Assistance Program (SNAP) is the primary anti-hunger mechanism in the United States, approximately 2.2 million to 3.3 million eligible college students fail to receive benefits.2 This participation gap is driven by a combination of "convoluted exemptions" for students and a general lack of direct outreach from financial aid offices, with only 25% of administrators reporting active efforts to connect students with federal benefits.1

This institutional "blind spot" creates a massive, underserved segment. While university-run pantries have expanded—with 95% of institutions now operating some form of food pantry—many resources remain underutilized due to the psychological barriers of stigma, restrictive hours, and the requirement for appointments.6 The Scavenger Platform, by focusing on a frictionless, real-time "flyer-to-feed" pipeline, addresses the immediacy of the hunger gap without the institutional friction or social baggage often associated with traditional aid.7

## **Technical Feasibility: The Vision LLM as a Scavenger Engine**

The viability of the Scavenger Platform is tethered to the recent and rapid advancements in multimodal Large Language Models (LLMs), particularly those optimized for high-throughput, low-latency tasks. The platform's core proposition is to solve the "Dark Data" problem by making physical flyers searchable in real-time.8 Historically, crowdsourced data apps have suffered from "high-friction" entry requirements; users are rarely willing to manually type in event details, locations, and food types. The Scavenger Platform's "Vision Engine" removes this barrier by automating the extraction of structured JSON metadata from a single photograph.

### **Benchmarking Gemini 1.5 and 2.0 Flash for Data Extraction**

The selection of Google’s Gemini family, particularly the "Flash" variants, is strategically sound based on current industry benchmarks. For the platform’s requirement to parse stylized, artistic, or handwritten flyers, the Word Error Rate (WER) and Character Error Rate (CER) are the most critical performance indicators.

| Vision LLM OCR Benchmarking (2024-2025) | Accuracy / Metric | Competitive Comparison | Source |
| :---- | :---- | :---- | :---- |
| Gemini 1.5 Pro (Overall OCR) | 76.13% | Equivalent to GPT-4o (76.22%) | 9 |
| Gemini 1.5 Pro (Word Error Rate) | 0.2385 | **Superior** (GPT-4o is 0.5117) | 9 |
| Gemini 2.0 Flash (Medical Diagnosis) | 84.38% | **Superior** (Gemini 1.5 is 56.25%) | 10 |
| Gemini 2.0 Flash (PDF-to-Markdown) | \~6,000 Pages/$ | **Dominant** (GPT-4o is \~200 Pages/$) | 11 |
| Gemini 1.5 Flash (Latency) | 2.24s | **Faster** (GPT-4o is 13s) | 12 |

The data indicates that Gemini 1.5 Pro and Flash demonstrate a Word Error Rate (WER) that is less than half that of GPT-4o in complex OCR tasks.9 This is a critical distinction for the Scavenger Platform, as "hallucinations" in room numbers (e.g., misreading "TNRB 210" as "TNRB 218") can lead to "ghost chases," where users arrive at the wrong location and quickly lose trust in the service.9 Furthermore, the pricing advantage of Gemini 2.0 Flash—which is approximately 25 times cheaper per million tokens than GPT-4o—makes high-volume document parsing economically sustainable for a platform intended to be free for students.14

### **Addressing Hallucinations and Extraction Errors**

Despite high performance, "representation drift" and errors on dense visual inputs remain a risk. Gemini models have exhibited error rates of approximately 14% on labeled charts, significantly higher than human experts.17 In the context of the Scavenger Platform, the system might misinterpret "AM" for "PM" on a flyer or miss dietary allergen warnings hidden in small text.17

The solution proposed in the MVP roadmap—a "human-in-the-loop" review where the AI populates a form for the user to confirm before posting—is an essential mitigation strategy.8 This hybrid approach leverages the speed of the Vision LLM while maintaining a verification layer that prevents systemic data corruption. The use of a "Vibe Check" or "Still There?" toggle further creates a secondary real-time feedback loop, allowing the community to self-correct for errors or stale data.8

## **Market Size and Segmentation: Identifying the Early Adopters**

The total addressable market (TAM) for a campus food finder is vast, given the roughly 19.6 million students enrolled in U.S. postsecondary institutions.13 However, a more refined strategic focus highlights the serviceable addressable market (SAM) of 7.8 million students who are either actively experiencing food insecurity or who demonstrate the technological literacy required to navigate campus-wide digital resources.13

| Market Segment Analysis | Estimated Population | Strategic Priority | Source |
| :---- | :---- | :---- | :---- |
| Total Addressable Market (TAM) | 19.6 Million | Long-term Expansion | 13 |
| Serviceable Addressable Market (SAM) | 7.8 Million | Core User Base | 13 |
| Serviceable Obtainable Market (SOM) | 15k \- 20k | Year 1 Alpha/Beta (BYU/Vanderbilt) | 13 |

The platform targets three distinct user personas that represent the supply and demand sides of the campus food ecosystem. The "Hungry Hustler" represents the primary consumer—a student like Tyler (20) who faces high pressure from both a heavy course load and a limited budget, needing reliable, high-calorie, zero-cost options to sustain long days on campus.13

On the supply side, the "Club Recruiter" and the "Eco-Conscious RA" are the primary data contributors. Sarah (22), a club president, faces "attendance anxiety" and needs to justify her organization's budget by ensuring high engagement metrics. Posting event flyers to the Scavenger Platform guarantees that the food she has purchased will attract attendees, even if they are not core members of the organization.13 Marcus (24), an RA, serves as a "surplus champion," using the platform to alert his residents to leftover catering from floor meetings or departmental events, thereby reducing the psychological and environmental burden of food waste.13

## **The Competitive Landscape: Professional Logistics vs. Crowdsourced Ephemerality**

The Scavenger Platform occupies a unique niche between professional food-sharing apps and unofficial campus workarounds. Its viability depends on its ability to provide higher data density than the former and better reliability than the latter.

### **Direct and Indirect Competition**

Direct competitors like "Freebites" and "Free Food Alert" have established a precedent for real-time campus alerts.13 Freebites, a nonprofit app originating at Tufts University, has achieved over 1,500 downloads and 560 postings, demonstrating that there is a proven appetite for this specific utility.19 However, such apps often suffer from "stale data" if they lack a robust, automated mechanism for expiring old posts or verifying that food remains available.13

Indirect competitors like Too Good To Go (TGTG) and Karma offer a more professionalized experience by connecting users with commercial surplus from restaurants and bakeries.20 While TGTG is a dominant force in the "eco-consumer" market, its model requires a monetary exchange (albeit at a discount), which may still be a barrier for the most food-insecure students.13 Furthermore, TGTG has been criticized for only operating in wealthier urban zip codes and lacking a delivery option, making it less accessible to students without reliable transportation.21

| Platform Comparison | Value Proposition | Primary Revenue / Model | Target Segment |
| :---- | :---- | :---- | :---- |
| Too Good To Go | B2C Surplus (Paid) | Transaction Fee | Eco-Conscious Consumers |
| Olio | Community Sharing (Free) | Nonprofit / Sharing Economy | Local Neighbors |
| Freebites | Campus Specific (Free) | Student-Run / Nonprofit | Tufts University Students |
| Scavenger Platform | AI-Ingested Feed (Free) | Data/ESG Sustainability B2B | Broad Campus Ecosystem |
| Too Good To Go (Nashville) | Local Restaurant Deals | B2C Marketplace | Urban Professionals / Students |

The Scavenger Platform distinguishes itself by focusing on "unofficial" food—the surplus that is typically thrown away because it does not fit into a commercial or formal charitable distribution model.13 By targeting the "Dark Data" of club meetings and departmental leftovers, the platform accesses a supply stream that is currently invisible to apps like TGTG.

## **Regulatory and Legal Frameworks: Navigating the Liability Landscape**

A primary risk cited by university administrators and event organizers is the potential for legal liability should a student become ill from redistributed leftover food.13 However, a detailed analysis of the legal landscape reveals that the Scavenger Platform is supported by strong federal and state protections.

### **The Bill Emerson Good Samaritan Food Donation Act**

The federal Bill Emerson Good Samaritan Food Donation Act provides a standard of protection for businesses and nonprofit organizations that donate "apparently wholesome food" in good faith.22 A critical update occurred in 2023 with the signing of the Food Donation Improvement Act (FDIA). This legislation expanded liability protections to cover "qualified direct donors"—including schools, caterers, and restaurants—who donate food directly to individuals rather than through a 501(c)(3) nonprofit, provided the food is offered free of charge.24

| Legal Pillar | Scope of Protection | Relevancy to Scavenger |
| :---- | :---- | :---- |
| Good Samaritan Act (1996) | Donors and Nonprofits | Covers 501(c)(3) partnerships. |
| FDIA (2023) | Direct-to-Individual | **Crucial** for student-to-student sharing. |
| Liability Floor | "Gross Negligence" | Only intentional harm is punishable. |
| Tennessee Code § 53-13-102 | State-level Immunity | Mirrors federal Good Samaritan standards. |

In Tennessee, the "Liability of Free Food Distributors" statute specifically protects organizations that donate food to nonprofits for people in need, provided the donation is not the result of "negligence, recklessness, or intentional misconduct".26 For the Scavenger Platform, these protections are foundational. They allow the uploader (the "Club Recruiter") to share leftovers without the threat of civil or criminal litigation, provided they act in good faith and follow basic safety standards.

### **Health Department Mandates and Food Safety**

While liability is low, adherence to health department guidelines is necessary for institutional buy-in. The Nashville Department of Health outlines specific cooling and maintenance requirements for "potentially hazardous foods" (e.g., meats, cooked items, dairy). Hot food must be maintained at ![][image1] or above or cooled to ![][image2] within two hours and ![][image3] within a total of six hours.27

The Scavenger Platform's "Real-Time Status Tracking" 13 serves as an informal safety feature in this regard. By encouraging immediate pickup, the platform reduces the time food spends in the "danger zone" (the temperature range where bacteria proliferate). The uploader can use the platform to specify when the food was first served, providing the "date of preparation" required by Tennessee labeling guidelines for prepared food donations.27

## **Case Study: The Nashville Micro-Market (Vanderbilt, Belmont, TSU)**

The Nashville higher education landscape provides a microcosm of the challenges and opportunities for a food discovery platform. Analysis of three major institutions—Vanderbilt University, Belmont University, and Tennessee State University (TSU)—reveals a fragmented ecosystem ripe for centralization.

### **Vanderbilt University: The Institutional Partner Model**

Vanderbilt’s Campus Dining is highly proactive, partnering with local nonprofits like "Room in the Inn" and "Operation Stand Down Tennessee" to redirect approximately 20 pounds of protein, starches, and vegetables weekly from its Rand Dining Center.28 The university also utilizes a "Text and Tell" program, which allows students to provide real-time feedback via unique location codes (e.g., "VUrand," "VUkissam").28

Vanderbilt’s "Swipes for a Cause" and "Meal Money" donation programs demonstrate a high degree of student willingness to participate in food redistribution efforts.28 However, these programs are primarily focused on the Nashville community at large rather than addressing the immediate "pizza alert" needs of the on-campus student population. A tool like Scavenger could complement these formal programs by handling the hyper-local, spontaneous leftovers that the university's formal donation partnerships might miss.

### **Belmont University: Addressing the Stigma Barrier**

Belmont University recently launched "The Pantry" in the Lila D. Bunch Library to address the findings of a 2022 survey showing that 40% of Belmont students experience food insecurity.7 The defining feature of Belmont's approach is the removal of barriers: there are no applications, no appointments, and no explanations necessary.7

Belmont's student care coordinators emphasize that previous resources were underutilized due to the "stigma often associated with asking for help".7 The Scavenger Platform’s proposed MVP strategy of avoiding user accounts and mandatory profiles aligns perfectly with this "autonomy and privacy" philosophy.8 By allowing students to anonymously browse a feed of available food, the platform eliminates the psychological barrier identified as a primary reason for resource underutilization at Belmont.

### **Tennessee State University: The Emergency Lifeline**

TSU’s "Tiger Pantry" operates as a lifeline for over 1,200 students and staff seeking emergency assistance since 2015\.30 Unlike Vanderbilt's expansive dining services, TSU students often face "temporary hardships" and may not have reliable transportation to grocery stores.30 The Tiger Pantry relies heavily on corporate partners like HCA and Dollar General for restocking.30 The Scavenger Platform would be particularly valuable in this environment, where the scarcity of resources makes every available meal—whether from a club event or a departmental meeting—critical for student success.

| Nashville Campus Comparison | Food Insecurity Rate | Primary Resource | Redistribution Logic |
| :---- | :---- | :---- | :---- |
| Vanderbilt University | (Data Unavailable) | Swipes for a Cause | External (Second Harvest) |
| Belmont University | 40% | The Pantry (Library) | Internal / Barrier-Free |
| Tennessee State University | (High Need) | Tiger Pantry | Emergency Assistance |

## **Strategic Risks: The Swarm Effect and Data Decay**

The primary operational risks for the Scavenger Platform involve "The Swarm Effect" and "Stale Data Decay."

### **The Swarm Effect and Over-Attendance**

The "Swarm Effect" occurs when high-quality food (e.g., a full catering spread) attracts a crowd that exceeds the supply or disrupts the organizer's primary event.13 Simulation studies in the restaurant industry suggest that "pooling reservations" can increase efficiency by 15% during peak periods.32 Applying this logic to the Scavenger Platform, the app could implement a "reservation cap" or a "claim" button to prevent over-attendance.

However, the "Rebound Effect" identified in research on Gen Z food-sharing app usage suggests a paradox: more frequent app usage can sometimes correlate with *greater* food waste if users over-consume or take more than they need.33 To mitigate this, the platform must focus its messaging on "society-related benefits" (environmental sustainability) rather than just "self-related benefits" (free food), as the former has been shown to curb overconsumption.33

### **Managing Data Decay through Gamification**

Data decay—where a listing remains on the feed long after the food is gone—is the primary driver of user churn. To combat this, the platform can leverage the "Theory of Planned Behavior" (TPB) by integrating self-monitoring and gamification.34 Research on household food waste apps indicates that gamified elements like points, badges, and leaderboards can reduce waste by up to 45% by increasing user motivation and decreasing the perceived burden of data entry.35

The Scavenger Platform could reward "Super Scavengers" who are the first to report an empty box or verify a food spread with a photo.13 By turning the task of data verification into a "game," the platform ensures its feed remains accurate without requiring a dedicated moderator team.

## **Product Roadmap: The 7-Week Lean Sprint**

The proposed 7-week sprint for a team of three is highly aggressive but achievable through the use of a "Serverless" architecture and off-the-shelf AI components.

| MVP Phase | Timeline | Core Deliverable | Technical Stack |
| :---- | :---- | :---- | :---- |
| Phase 1: Discovery | Weeks 1-2 | Scope Definition / Tech Setup | Next.js / Vercel |
| Phase 2: Design | Weeks 2-3 | High-Fidelity Prototypes | Figma / UI/UX |
| Phase 3: Core Dev | Weeks 3-5 | AI Vision Engine Integration | Gemini 2.0 Flash / Firestore |
| Phase 4: Alpha Test | Week 6 | Building-Specific Pilot | Manual Seed Data |
| Phase 5: Release | Week 7 | Public Web Dashboard | Social Outreach |

### **Technical Stack Selection**

The choice of Firestore for the database is optimal for real-time applications, as it handles live updates natively, ensuring that when a uploader taps "Gone," every student on the dashboard sees the change instantly without refreshing.8 Hosting on Vercel or Firebase allows for one-click deployments, which is essential for a 7-week cycle where infrastructure management should be minimized.8

By explicitly cutting features like "User Accounts" and "Map Integration" (P2/Nice-to-Have), the team can focus 100% on the "Flyer-to-Feed" pipeline.8 The long-term scalability plan includes transitioning to the "Inbox Parser" and "The Crumb" (automated scraper) to ensure the platform remains the "Single Source of Truth" as it expands to multiple campuses.13

## **Economic Sustainability and Social Impact**

While the Scavenger Platform is designed as a free tool for students, its long-term viability requires a sustainable funding model.

### **B2B "Fullness API" for Universities**

Universities are increasingly prioritized by their Environmental, Social, and Governance (ESG) performance. The platform could offer a "Fullness API" or a B2B sustainability dashboard to university administrations.13 This would provide data-driven insights into campus food waste patterns, helping dining services adjust production based on real consumption data.37 AI demand prediction models have already shown the ability to reduce campus food waste by up to 28% by balancing production with actual demand.39

### **The Social Return on Investment (SROI)**

For every 1,000 meals successfully redistributed via the platform, the community avoids significant environmental and financial costs. A single "Surprise Bag" of saved food (similar to the TGTG model) avoids approximately 2.7 kg of CO2e emissions and 810 liters of water.41 By digitizing the "Scavenger" process, the platform provides a measurable metric for university sustainability goals, turning a student-led initiative into a valuable institutional asset.

## **Conclusion: The Actionable Verdict**

The Scavenger Platform is a highly viable product idea with a clear market entry point. The combination of high-precision, low-cost Vision LLMs (Gemini 2.0 Flash) and the documented 41% student food insecurity rate creates a unique window for a centralized "Dark Data" aggregator.

### **Recommendations for Immediate Action**

1. **Prioritize Nashville as the Alpha Site:** The presence of Vanderbilt, Belmont, and TSU provides three distinct models of student need and institutional support.  
2. **Focus on the "Stigma-Free" UI:** Maintain the "no-auth" browser-based dashboard to ensure students in the "Hungry Hustler" segment can access resources with zero social or digital friction.  
3. **Implement the FDIA Legal Shield:** Frame the platform for organizers as a "Waste Reduction Portal" that operates under the explicit protections of the 2023 Food Donation Improvement Act.  
4. **Incentivize "First Responder" Verification:** Use simple gamification to ensure the first student at a location confirms the food type and quality, effectively acting as a decentralized moderator.

The Scavenger Platform solves the "information gap" that currently allows thousands of pounds of usable food to go to waste while students go hungry. By treating this as a data problem rather than just a logistics problem, the platform is positioned to become the definitive "Single Source of Truth" for the 19.6 million students navigating the modern campus economy.

#### **Works cited**

1. 4 story ideas to help you cover food insecurity among college students, accessed February 16, 2026, [https://journalistsresource.org/education/college-students-food-insecurity-news-story-ideas/](https://journalistsresource.org/education/college-students-food-insecurity-news-story-ideas/)  
2. The Hope Center's 2025 Federal Policy Priorities, accessed February 16, 2026, [https://hope.temple.edu/policy-advocacy/hope-centers-2025-federal-policy-priorities](https://hope.temple.edu/policy-advocacy/hope-centers-2025-federal-policy-priorities)  
3. BASIC NEEDS GAPS INCREASE THE RISK OF COLLEGE STOP, accessed February 16, 2026, [https://www.chepp.org/wp-content/uploads/2026/02/CHEPP\_BASIC-NEED\_FACTSHEET.pdf](https://www.chepp.org/wp-content/uploads/2026/02/CHEPP_BASIC-NEED_FACTSHEET.pdf)  
4. Research & Data from External Partners and Organizations, accessed February 16, 2026, [https://schoolhouseconnection.org/article/research-data-from-external-partners-and-organizations-higher-education](https://schoolhouseconnection.org/article/research-data-from-external-partners-and-organizations-higher-education)  
5. GAO Report on Students' Food Insecurity Highlights SNAP Gap, accessed February 16, 2026, [https://todaysstudents.org/gao-report-on-students-food-insecurity-highlights-snap-gap/](https://todaysstudents.org/gao-report-on-students-food-insecurity-highlights-snap-gap/)  
6. Closing the hunger gap: Addressing food insecurity on college, accessed February 16, 2026, [https://wellfleetstudent.com/campus-health-360/closing-the-hunger-gap-addressing-food-insecurity-on-college-campuses/](https://wellfleetstudent.com/campus-health-360/closing-the-hunger-gap-addressing-food-insecurity-on-college-campuses/)  
7. Belmont Opens Student Food Pantry | Belmont University, accessed February 16, 2026, [https://www.belmont.edu/stories/articles/2026/belmont-opens-student-food-pantry.html](https://www.belmont.edu/stories/articles/2026/belmont-opens-student-food-pantry.html)  
8. MVP Roadmap: Campus Food Finder  
9. Gemini beats everyone is OCR benchmarking tasks in videos. Full, accessed February 16, 2026, [https://www.reddit.com/r/LocalLLaMA/comments/1ioikl0/gemini\_beats\_everyone\_is\_ocr\_benchmarking\_tasks/](https://www.reddit.com/r/LocalLLaMA/comments/1ioikl0/gemini_beats_everyone_is_ocr_benchmarking_tasks/)  
10. evaluating the performance of google's gemini 1.5 flash and gemini, accessed February 16, 2026, [https://www.researchgate.net/publication/389720084\_EVALUATING\_THE\_PERFORMANCE\_OF\_GOOGLE'S\_GEMINI\_15\_FLASH\_AND\_GEMINI\_20\_FLASH\_LARGE\_LANGUAGE\_MODELS\_IN\_DIFFERENTIAL\_DIAGNOSIS](https://www.researchgate.net/publication/389720084_EVALUATING_THE_PERFORMANCE_OF_GOOGLE'S_GEMINI_15_FLASH_AND_GEMINI_20_FLASH_LARGE_LANGUAGE_MODELS_IN_DIFFERENTIAL_DIAGNOSIS)  
11. Ingesting Millions of PDFs and why Gemini 2.0 Changes Everything, accessed February 16, 2026, [https://www.sergey.fyi/articles/gemini-flash-2](https://www.sergey.fyi/articles/gemini-flash-2)  
12. Evaluating Gemini models for vision \- Blog \- Braintrust, accessed February 16, 2026, [https://www.braintrust.dev/blog/gemini](https://www.braintrust.dev/blog/gemini)  
13. Market Research: Campus Food Finder  
14. Gemini 2.0 Flash vs GPT-4o: AI Model Comparison 2025 \- Miniloop, accessed February 16, 2026, [https://www.miniloop.ai/blog/compare-gemini-2-flash-vs-gpt-4o](https://www.miniloop.ai/blog/compare-gemini-2-flash-vs-gpt-4o)  
15. Gemini 2.0 Flash vs GPT-4o Comparison: Benchmarks, Pricing, accessed February 16, 2026, [https://llm-stats.com/models/compare/gemini-2.0-flash-vs-gpt-4o-2024-05-13](https://llm-stats.com/models/compare/gemini-2.0-flash-vs-gpt-4o-2024-05-13)  
16. GPT-4o vs Gemini 2.0 Flash \- DocsBot AI, accessed February 16, 2026, [https://docsbot.ai/models/compare/gpt-4o/gemini-2-0-flash](https://docsbot.ai/models/compare/gpt-4o/gemini-2-0-flash)  
17. Gemini 1.5 Flash: Multimodal Transformer Insights \- Emergent Mind, accessed February 16, 2026, [https://www.emergentmind.com/topics/gemini-1-5-flash](https://www.emergentmind.com/topics/gemini-1-5-flash)  
18. PRD: Campus Food Finder  
19. Freebites: Eliminating College Food Waste and Insecurity | Gordon ..., accessed February 16, 2026, [https://gordon.tufts.edu/idea-impact/freebites-eliminating-college-food-waste-and-insecurity](https://gordon.tufts.edu/idea-impact/freebites-eliminating-college-food-waste-and-insecurity)  
20. Top Apps to Reduce Food Waste and Save Money, accessed February 16, 2026, [https://sustainablebusinessmagazine.net/eco-review/top-apps-to-reduce-food-waste-and-save-money-discover-apps-like-too-good-to-go-karma/](https://sustainablebusinessmagazine.net/eco-review/top-apps-to-reduce-food-waste-and-save-money-discover-apps-like-too-good-to-go-karma/)  
21. A Solution for Items that are “Too Good to Go” – Food, Fiber, and, accessed February 16, 2026, [https://iu.pressbooks.pub/foodfiberfashionfa21/chapter/a-potential-solution-for-items-that-are-too-good-to-go/](https://iu.pressbooks.pub/foodfiberfashionfa21/chapter/a-potential-solution-for-items-that-are-too-good-to-go/)  
22. Bill Emerson Good Samaritan Food Donation Act, accessed February 16, 2026, [https://ntfb.org/wp-content/uploads/2024/11/Good-Samaritan-Food-Donation-Act-2023-Updated.pdf](https://ntfb.org/wp-content/uploads/2024/11/Good-Samaritan-Food-Donation-Act-2023-Updated.pdf)  
23. Good Samaritan Act Provides Liability Protection For Food Donations, accessed February 16, 2026, [https://www.usda.gov/about-usda/news/blog/good-samaritan-act-provides-liability-protection-food-donations](https://www.usda.gov/about-usda/news/blog/good-samaritan-act-provides-liability-protection-food-donations)  
24. Federal Food Donation Liability Protections, accessed February 16, 2026, [https://zerofoodwastecoalition.org/federal-food-donation-liability-protections/](https://zerofoodwastecoalition.org/federal-food-donation-liability-protections/)  
25. Federal Liability Protection : ReFED | Rethink Food Waste, accessed February 16, 2026, [https://policyfinder.refed.org/federal-policy/federal-liability-protection](https://policyfinder.refed.org/federal-policy/federal-liability-protection)  
26. Legal Fact Sheet for Food Donation in Tennessee: Liability Protections, accessed February 16, 2026, [https://www.foodrescue.net/uploads/4/3/2/6/43260919/opsp\_gfstn\_legal-fact-sheet-for-food-donation-in-tennessee-liability-protections\_pdf.pdf](https://www.foodrescue.net/uploads/4/3/2/6/43260919/opsp_gfstn_legal-fact-sheet-for-food-donation-in-tennessee-liability-protections_pdf.pdf)  
27. GUIDELINES FOR DONATING AND HANDLING SURPLUS FOODS, accessed February 16, 2026, [https://www.nashville.gov/sites/default/files/2025-09/Guidelines\_for\_Donating\_Food\_20191023.pdf?ct=1757182717](https://www.nashville.gov/sites/default/files/2025-09/Guidelines_for_Donating_Food_20191023.pdf?ct=1757182717)  
28. Local Food Donation | Campus Dining | Vanderbilt University, accessed February 16, 2026, [https://www.vanderbilt.edu/dining/programs-services/community-care/local-food-donation/](https://www.vanderbilt.edu/dining/programs-services/community-care/local-food-donation/)  
29. Community Support | Campus Dining \- Vanderbilt University, accessed February 16, 2026, [https://www.vanderbilt.edu/dining/programs-services/sustainability/community-support/](https://www.vanderbilt.edu/dining/programs-services/sustainability/community-support/)  
30. Corporate Partners Rally Behind TSU's Tiger Food Pantry, accessed February 16, 2026, [https://tnstatenewsroom.com/corporate-partners-rally-behind-tsus-tiger-food-pantry/](https://tnstatenewsroom.com/corporate-partners-rally-behind-tsus-tiger-food-pantry/)  
31. Tiger Pantry \- Tennessee State University, accessed February 16, 2026, [https://www.tnstate.edu/wellness\_center/tigerpantry.aspx](https://www.tnstate.edu/wellness_center/tigerpantry.aspx)  
32. Pooling Restaurant Reservations to Increase Service Efficiency, accessed February 16, 2026, [https://ecommons.cornell.edu/server/api/core/bitstreams/f5a0445a-f718-437e-afae-506e759ee09d/content](https://ecommons.cornell.edu/server/api/core/bitstreams/f5a0445a-f718-437e-afae-506e759ee09d/content)  
33. Reducing Food Waste Through Sharing Platforms \- ResearchGate, accessed February 16, 2026, [https://www.researchgate.net/publication/399528286\_Reducing\_Food\_Waste\_Through\_Sharing\_Platforms\_Unveiling\_the\_Rebound\_Effect](https://www.researchgate.net/publication/399528286_Reducing_Food_Waste_Through_Sharing_Platforms_Unveiling_the_Rebound_Effect)  
34. Managing Food Waste Through Gamification and Serious Games, accessed February 16, 2026, [https://www.mdpi.com/2078-2489/16/3/246](https://www.mdpi.com/2078-2489/16/3/246)  
35. Effects of a Gamified Self-Monitoring App on Household Food Waste, accessed February 16, 2026, [https://www.preprints.org/manuscript/202510.2155](https://www.preprints.org/manuscript/202510.2155)  
36. (PDF) Effects of a Gamified Self-Monitoring App on Household Food, accessed February 16, 2026, [https://www.researchgate.net/publication/400259263\_Effects\_of\_a\_Gamified\_Self-Monitoring\_App\_on\_Household\_Food\_Waste\_Reduction](https://www.researchgate.net/publication/400259263_Effects_of_a_Gamified_Self-Monitoring_App_on_Household_Food_Waste_Reduction)  
37. Reducing Food Waste in Hospitality with AI | The AI Journal, accessed February 16, 2026, [https://aijourn.com/how-ai-is-solving-hotel-food-waste-problems/](https://aijourn.com/how-ai-is-solving-hotel-food-waste-problems/)  
38. Food Sharing Platforms as a Technology to Reduce Food Waste at, accessed February 16, 2026, [https://www.researchgate.net/publication/390853470\_Food\_Sharing\_Platforms\_as\_a\_Technology\_to\_Reduce\_Food\_Waste\_at\_Food\_Service\_Level\_Recommendations\_for\_Businesses\_and\_Society](https://www.researchgate.net/publication/390853470_Food_Sharing_Platforms_as_a_Technology_to_Reduce_Food_Waste_at_Food_Service_Level_Recommendations_for_Businesses_and_Society)  
39. Reducing Food Waste in Campus Dining: A Data-Driven ... \- MDPI, accessed February 16, 2026, [https://www.mdpi.com/2071-1050/17/2/379](https://www.mdpi.com/2071-1050/17/2/379)  
40. (PDF) Reducing Food Waste in Campus Dining: A Data-Driven, accessed February 16, 2026, [https://www.researchgate.net/publication/387813175\_Reducing\_Food\_Waste\_in\_Campus\_Dining\_A\_Data-Driven\_Approach\_to\_Demand\_Prediction\_and\_Sustainability](https://www.researchgate.net/publication/387813175_Reducing_Food_Waste_in_Campus_Dining_A_Data-Driven_Approach_to_Demand_Prediction_and_Sustainability)  
41. How Food Waste Apps Are Reshaping Grocery Retail \- The Packer, accessed February 16, 2026, [https://www.thepacker.com/news/sustainability/how-food-waste-apps-are-reshaping-grocery-retail](https://www.thepacker.com/news/sustainability/how-food-waste-apps-are-reshaping-grocery-retail)

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADQAAAAYCAYAAAC1Ft6mAAACFElEQVR4Xu2WTyhnURTHD5lYGM0UK2VBkyULpSbJwsLS2tpikD8TNbGylGQltiIpioiJkBJrJWVLRhhpFiPyb8b5Oven8877vee9X1Z6n/r27vme++fd+9679xElJCS8NT2sFmsqZlj/WbesHyYHFlijrDJWFquCtcKqVHXyWY+sVdau8i19JGNFkYdp1p1LQK3e9AvIFZgY7TTbztea8tQg2jPxTxNb0t60o4OCc88ETaiWJLehvD/OK1feJus7a5LVrXxNg4nPTWzBGA/WVITlAieUQ5IbVN618/RTWyd51cLYeSXWVJGMMWD8z6q8pco+giaUjnSvwhq9PqEi1l/WCOvI5CxLJGN8VN5XVrOKi1XZR5QJ4Wnts/6R/+bxoXeSfFvjJP190xViYhcNi2EXMRRUbrOmook1RvLeL5ocgNev4jySPuuVF4fUhKwig8rt1gzgjKS+fUqW2DfhqCZpN2z83yYOBR1gK4wCdjHUP1XeB1VOkemEcH6h3SflfaHwc9IHOuiyJjNB/u2xhrw3W+LKyy81hEwnlGk7D+gA54gl1Xmd8rDTwDtxcamL7fcCzy5GFNDu3ppxKCTpZMgmmHny7/dXJPVzlYc4W8W9zsPmEIdGknbYgGIzy7pg/WIduyt2MftbM0cyyKG73pB3MgCTQTusbOqp4t8tKjgysFD4C7l0VxzgB7pSQkJCQsK74Ak2B58vaPKDCAAAAABJRU5ErkJggg==>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAYCAYAAACMcW/9AAABXUlEQVR4Xu2UvyuGURTHj7KJ0SwMxMqgpEz+AxQbA+9/YLBZKLPVbJCSyc5AskmZJBshlB9xTvc+HF/n3k69z0DdT33q3HPOvc/pve/zEBUK/4NT9pBtsLPsNDvFTkaRVvYFk5ENCmc9s/1Q03w4Xao2CFjU3qq+M6ghM2ybWi+r2GKYwjnrWIhIbQwTo+wA28t2R61hhHuya/JLIn2YUOxSOKcDC5EjCrf3xbFeRA7YQUxGUoPO08+DF1VsYd1Mp4pPVGwywm5hUpEaVNhht9kLdhxqiJzxauQqJlRskhqiIjeolyEKZ6yq3Ap7rdZZNqM56hh0j76vXrugm3JIcxcmgToGtf6fN2wL5Ezm6Pdmi7oGfTdyLs7J19zsoPKyyv41LHixrsOi2UH3Kexvx4IX76BP5OtL4X1OEtn8hknFA4XPx2X0isIL0KObMjyydxT2iBLnnlcoFAp/nU95i3O4YyV9jQAAAABJRU5ErkJggg==>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAYCAYAAACMcW/9AAABYElEQVR4Xu2Vv0oDQRCHf4KdaCOkUixs9AG0SCNY+RC2FvoIFnY2CtYGfAVRQRREbGwERVsbKxEtRFBRwT/oDHtzmZub5BIPDgL7wQezM7uTSZa7AJFIbzJG/tqkop/8tMmETfKM/CAnTU3D/TtxWQ54yCbLNbJNLPPkgFqvqNhjGqHPhi0kcG3GJoUj8g3+IMIL/Dr/kpYJm1DsI/QZsoWEC4TbyzFC7pKP8AcRWg26gGzjJRV7eDdTU/GVijPIof8OyuyRO+QNOWtqFu7x5eSEORWnbJOjSVxm0E6ZQuixpnKr5L1a5xgmT9S6ikEP0Lx67aLeZLEfWsWgMpjmiewzuZQG8k9mVYP+OLmWHJKnRvm2HG81t6aUHbSOcH7dFrrFuxZN2UGPEc4P2kK3FA36jvb1Ior6F3JJPpC3iRyfq/orwutD6ncID8C42tMO/sd7RjjDcvyd2RGJRCK9xR92gnzHbXn6AwAAAABJRU5ErkJggg==>