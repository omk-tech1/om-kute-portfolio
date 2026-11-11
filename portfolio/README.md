# Om Kute: Personal Portfolio Website

Personal portfolio of **Om Kute**, Computer Engineering student at Government Polytechnic Khamgaon, full stack web developer and AI/ML enthusiast.

Built with plain HTML, CSS and JavaScript. No frameworks, no build step, no dependencies. The responsive layout adapts across phones, tablets and desktop screens.

**Design:** switchable near-black dark mode and a bright, blue-accented theme using the supplied responsive hero artwork. Playfair Display for the name and headings, Inter for content, JetBrains Mono for small labels.

---

## What is on the page

| Section | Contents |
| --- | --- |
| Hero | Portrait, letter-by-letter name reveal, role line, Explore My Projects, Download Resume, Preview Resume and Contact Me buttons |
| Skills ticker | Continuous scrolling strip of core technologies |
| Highlights | Count-up numbers: 1 hackathon win, Top 75 at RACKATHON 2026, 50+ media mentions, 7 projects, 90% SSC |
| About | Short story, currently-learning list, quick facts |
| Technical Skills | Programming, Frontend, Backend, Database, AI/ML, Tools, CS fundamentals. Dashed chips mean learning or basic level |
| Featured Projects | ShramikConnect, SkillVista · Aptivon, HydroMind-AI, Wari Twin, plus WeatherVS India, MSPME and Lesson Plan Builder |
| Education | Diploma in Computer Engineering and SSC with an animated 90% ring |
| Journey | Scroll-driven timeline including the Cosmolix internship |
| Certifications | CDAC C course, Generative AI, Agentic AI workshop, Google AI Agents Intensive, Azure AI Labs |
| Achievements | Hackathon recognition and events attended |
| Leadership | CURIOUSPARC and Amravati AI Summit volunteering, team strengths |
| How I Work | Four-step process |
| Contact | Direct email and social channels, a validated name/email/subject/message form, and a resume link |

## Animations and interactions

- Intro curtain wipe and letter-by-letter name reveal
- Glowing neural-network particle background that reacts to the mouse
- Parallax portrait (mouse and scroll)
- Scroll-triggered section reveals and a scroll progress bar
- Skills ticker, count-up statistics, animated timeline and progress ring
- Project and achievement cards with glow and 3D tilt on hover
- Smooth scrolling, responsive mobile menu, resume preview dialog
- Compact `D` / `B` header button toggles dark and bright themes; the preference is saved when browser storage is available and the toggle still works without it
- Bright mode uses the supplied portrait-oriented mobile hero artwork and wide desktop artwork; dark mode retains its original animated portrait hero
- Responsive skill cards, two-column contact panel on larger screens, and stacked mobile layout
- Animations switch off automatically for visitors who enable "reduce motion" in their device settings
- No cookies or session storage are used; the theme preference is stored in local storage when available, and the page remains usable if browser privacy settings block storage, the decorative canvas, or optional remote fonts

---

## Project structure

```text
portfolio/
├── index.html                           # Main HTML document
├── resume.pdf                           # Resume PDF for direct linking
├── vercel.json                          # Vercel caching and PDF headers
├── .gitignore
├── README.md
├── css/
│   └── style.css                        # All styles and animations
├── js/
│   └── script.js                        # Neural canvas, reveals, counters, menu, resume preview
└── assets/
    ├── docs/
    │   └── Om_Kute_Resume.pdf           # Downloadable resume
    └── images/
        ├── om-kute-portrait.jpg         # Dark-mode hero portrait
        ├── om-kute-bright-mobile.jpeg   # Supplied bright-theme mobile artwork
        ├── om-kute-bright-desktop.jpeg  # Supplied bright-theme desktop artwork
        ├── om-kute-poster.jpg           # Original visual identity poster
        └── om-kute-resume.jpg           # Resume image used by the preview dialog
```

---

## Run in VS Code

1. Open the `portfolio` folder in VS Code (**File > Open Folder**).
2. Install the **Live Server** extension.
3. Right-click `index.html` and choose **Open with Live Server**.

You can also double-click `index.html` to open it in any browser. An internet connection loads the optional Google Fonts; without them the page falls back to system fonts and still works.

## Deploy

### Vercel (recommended)
1. Push this folder to a GitHub repository.
2. Open [vercel.com](https://vercel.com), choose **Add New > Project** and import the repository.
3. Click **Deploy**. No build settings are needed.

### GitHub Pages
1. Push this folder to a repository.
2. Go to **Settings > Pages**, choose the `main` branch and the `/ (root)` folder, then save.

---

## Update your content

- **Text, projects, links:** edit `index.html`. Each section is marked with a comment.
- **Resume:** replace `assets/docs/Om_Kute_Resume.pdf` and `resume.pdf`, and replace `assets/images/om-kute-resume.jpg` with a picture of the new first page (used by the Preview button).
- **Portrait:** replace `assets/images/om-kute-portrait.jpg` with a photo of the same 2:3 shape (for example 460 x 690 px).
- **Accent colour:** change `--blue` at the top of `css/style.css`.
- **Project links:** each project card can hold a `Live demo` link. Remove or add the `<a class="live">` line as needed.

## Pre-launch checklist

- [ ] Open the deployed site in a private window
- [ ] Check the Download Resume and Preview Resume buttons
- [ ] Check LinkedIn, GitHub, HydroMind-AI and ShramikConnect links
- [ ] Check the menu and layout on a phone

---

**Om Kute** · Akola, Maharashtra · [LinkedIn](https://www.linkedin.com/in/om-kute-9b3914381/) · [GitHub](https://github.com/omk-tech1)
