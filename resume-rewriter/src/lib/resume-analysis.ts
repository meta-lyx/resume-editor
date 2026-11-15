// Rule-based resume analysis for the free tools. Runs in the browser, no AI calls, no cost per use.
//
//   extractJobKeywords(jd)            -> the skills, tools and terms a job description asks for
//   matchKeywords(resume, keywords)   -> which of them the resume contains
//   checkResume(resume, fileInfo)     -> ATS formatting and content checks, with a 0-100 score

// ---------------------------------------------------------------------------
// Known skills and tools. First entry is the display name; the rest are aliases.
// Matching is case-insensitive and on word boundaries.
// ---------------------------------------------------------------------------
const SKILLS: string[][] = [
  // Programming languages
  ['Python'], ['Java'], ['JavaScript', 'JS', 'ecmascript'], ['TypeScript', 'TS'], ['C++', 'cpp'], ['C#', 'c sharp'],
  ['Go', 'golang'], ['Rust'], ['Ruby'], ['PHP'], ['Swift'], ['Kotlin'], ['Scala'], ['MATLAB'], ['SAS'], ['Stata'],
  ['SQL'], ['NoSQL'], ['Bash', 'shell scripting'], ['VBA'], ['HTML', 'html5'], ['CSS', 'css3'], ['Perl'], ['Julia'],
  ['R programming', 'rstudio', 'r studio'],
  // Web, mobile, backend
  ['React', 'react.js', 'reactjs'], ['Angular', 'angularjs'], ['Vue', 'vue.js', 'vuejs'], ['Next.js', 'nextjs'],
  ['Node.js', 'nodejs'], ['Express.js', 'expressjs'], ['Django'], ['Flask'], ['FastAPI'], ['Spring Boot', 'spring framework', 'spring mvc'],
  ['.NET', 'dotnet', 'asp.net'], ['Ruby on Rails', 'rails'], ['GraphQL'], ['REST APIs', 'rest api', 'restful', 'restful apis', 'REST'],
  ['Microservices', 'microservice'], ['iOS'], ['Android'], ['React Native'], ['Flutter'], ['Tailwind', 'tailwind css'],
  // Data and ML
  ['Machine Learning', 'ML'], ['Deep Learning'], ['Natural Language Processing', 'NLP'], ['Computer Vision'],
  ['Large Language Models', 'LLM', 'LLMs'], ['Generative AI', 'genai', 'gen ai'], ['Artificial Intelligence', 'AI'],
  ['PyTorch'], ['TensorFlow'], ['Keras'], ['scikit-learn', 'sklearn', 'scikit learn'], ['Pandas'], ['NumPy'],
  ['Spark', 'apache spark', 'pyspark'], ['Hadoop'], ['Kafka', 'apache kafka'], ['Airflow', 'apache airflow'], ['dbt'],
  ['Snowflake'], ['Databricks'], ['BigQuery'], ['Redshift'], ['ETL', 'ELT'], ['Data Pipelines', 'data pipeline'],
  ['Data Modeling', 'data modelling'], ['Data Visualization', 'data viz', 'data visualisation'], ['Data Analysis', 'data analytics'],
  ['Statistics', 'statistical analysis', 'statistical modeling'], ['A/B Testing', 'ab testing', 'a/b tests', 'split testing', 'experimentation'],
  ['Regression', 'regression analysis'], ['Forecasting'], ['Tableau'], ['Power BI', 'powerbi'], ['Looker'], ['Excel', 'microsoft excel', 'ms excel'],
  ['Google Analytics', 'ga4'], ['Jupyter'], ['PostgreSQL', 'postgres'], ['MySQL'], ['MongoDB'], ['Redis'], ['Elasticsearch'],
  ['DynamoDB'], ['Oracle'], ['SQL Server', 'mssql'],
  // Cloud and DevOps
  ['AWS', 'amazon web services'], ['Azure', 'microsoft azure'], ['GCP', 'google cloud', 'google cloud platform'],
  ['Docker'], ['Kubernetes', 'k8s'], ['Terraform'], ['CI/CD', 'ci cd', 'continuous integration'], ['Jenkins'],
  ['GitHub Actions'], ['Git'], ['Linux', 'unix'], ['Serverless'], ['Lambda', 'aws lambda'],
  ['Distributed Systems'], ['System Design'], ['Cybersecurity', 'information security'],
  // Software practice
  ['Agile'], ['Scrum'], ['Jira'], ['Confluence'], ['Unit Testing', 'test automation', 'automated testing'],
  ['Object-Oriented Programming', 'OOP', 'object oriented'], ['Data Structures'], ['Algorithms'],
  // Product, design, research
  ['Product Management'], ['Product Roadmap', 'roadmap'], ['User Research', 'ux research'],
  ['Usability Testing'], ['Figma'], ['Sketch'], ['Adobe Photoshop', 'photoshop'], ['Adobe Illustrator', 'illustrator'],
  ['Adobe Creative Suite', 'adobe creative cloud'], ['UX Design', 'UX', 'user experience'], ['UI Design', 'UI'],
  ['Wireframing', 'wireframes'], ['Prototyping'], ['Design Systems', 'design system'],
  // Business, finance, accounting
  ['Financial Modeling', 'financial modelling'], ['Valuation', 'DCF'], ['Financial Analysis'], ['FP&A'],
  ['Budgeting'], ['Accounting'], ['GAAP', 'us gaap'], ['IFRS'], ['Auditing', 'audit'], ['Tax'], ['Bloomberg'],
  ['Capital IQ'], ['Investment Banking'], ['Private Equity'], ['Equity Research'], ['Risk Management'],
  ['Due Diligence'], ['M&A', 'mergers and acquisitions'], ['QuickBooks'], ['SAP'], ['NetSuite'],
  ['Business Analysis'], ['Business Intelligence', 'BI'], ['KPIs', 'KPI'], ['Stakeholder Management', 'stakeholder management'],
  ['Project Management'], ['Process Improvement'], ['Supply Chain'], ['Operations'], ['Consulting'],
  ['Market Research'], ['Competitive Analysis'], ['Strategy', 'business strategy'],
  // Marketing and sales
  ['SEO', 'search engine optimization'], ['SEM', 'search engine marketing'], ['Content Marketing'],
  ['Social Media Marketing', 'social media'], ['Email Marketing'], ['Digital Marketing'], ['Brand Management', 'branding'],
  ['Copywriting'], ['Marketing Analytics'], ['HubSpot'], ['Salesforce', 'sfdc'], ['CRM'], ['Google Ads', 'adwords'],
  ['Meta Ads', 'facebook ads'], ['Lead Generation'], ['B2B'], ['B2C'], ['SaaS'], ['E-commerce', 'ecommerce'],
  ['Customer Success'], ['Account Management'], ['Public Relations', 'PR'],
  // Regulated and specialist
  ['HIPAA'], ['SOX'], ['Clinical Research'], ['CAD', 'autocad'], ['SolidWorks'], ['Six Sigma', 'lean six sigma'],
  ['PMP'], ['CPA'], ['CFA'],
  // Languages (common asks for international candidates)
  ['Mandarin', 'mandarin chinese', 'chinese'], ['Cantonese'], ['Spanish'], ['Japanese'], ['Korean'], ['French'], ['German'],
  ['Bilingual'],
];

// Names that are also ordinary English words ("react to", "excel at", "Go above and beyond").
// These match only in this exact case; "Go" also needs to sit in a list ("Python, Go").
const EXACT_CASE = new Set(['React', 'Go', 'Swift', 'Rust', 'Spark', 'Sketch', 'Ruby', 'Oracle', 'Excel', 'Tax', 'Operations', 'Strategy']);

const STOPWORDS = new Set(
  `a about above after again against all also am an and any are as at be because been before being below between both but by
  can could did do does doing down during each few for from further had has have having he her here hers him his how i if in
  into is it its itself just me more most my no nor not now of off on once only or other our ours out over own same she should
  so some such than that the their them then there these they this those through to too under until up very was we were what
  when where which while who whom why will with would you your yours etc e.g i.e via per within across including include
  includes like well new using use used may must able one two three four five years year plus least strong excellent good great
  high highly preferred required requirements qualifications responsibilities role job position candidate candidates ideal
  team teams work working works experience experienced experiences ability abilities skills skill knowledge understanding
  proficiency proficient familiarity familiar demonstrated proven track record looking join company opportunity opportunities
  we're you'll you're us our help helping ensure support supporting provide providing make making take get related relevant
  equivalent degree bachelor's bachelors master's masters field fields similar minimum preferred nice bonus apply applicants
  benefits salary pay range location remote hybrid office onsite full-time part-time full time employer equal opportunity
  status regard without race color religion sex sexual orientation gender identity national origin disability veteran
  protected applicable law day days week weeks month months time based every other others want need needs across various
  multiple different strong solid deep broad hands-on hands self-starter detail-oriented fast-paced environment dynamic
  passionate passion love excited exciting impact impactful mission world-class best cross-functional collaborate
  collaboration collaborative communicate communication communicating written verbal interpersonal problem-solving solving
  problem problems think thinking learn learning grow growth closely partner partners lead leading drive driving own owning
  build building develop developing responsible duties key core primary daily level senior junior mid intern internship
  data business product products customer customers tools tool systems system solutions services process processes quality
  results insights decisions questions information projects project people users company's organization industry`
    .split(/\s+/)
    .filter(Boolean),
);

// Acronyms that show up in job ads but are never the skill being asked for.
const IGNORED_ACRONYMS = new Set(['EEO', 'USA', 'US', 'LLC', 'INC', 'CEO', 'CTO', 'CFO', 'HR', 'PTO', 'FAQ', 'NYC', 'SF', 'EOE', 'DEI', 'OK', 'AM', 'PM', 'ET', 'PT', 'PST', 'EST', 'ADA', 'II', 'III', 'IV', 'OR', 'AND', 'THE', 'TBD', 'N/A', 'OPT', 'CPT', 'H1B', 'GPA', 'BS', 'BA', 'MS', 'MA', 'MBA', 'PHD', 'WFH']);

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
}

function termPattern(term: string, flags: string): RegExp {
  const escaped = escapeRegex(term).replace(/\s+/g, '[\\s-]+');
  // Allow a plural "s" on terms that end in a letter.
  const plural = /[a-z]$/i.test(term) ? '(?:e?s)?' : '';
  return new RegExp(`(?<![A-Za-z0-9+#])${escaped}${plural}(?![A-Za-z0-9+#])`, flags);
}

// Matcher for one dictionary name. Short all-caps acronyms and EXACT_CASE words are case-sensitive.
function aliasPattern(name: string, flags: string): RegExp {
  const sensitive = EXACT_CASE.has(name) || (name.length <= 3 && name === name.toUpperCase() && /[A-Z]/.test(name)) || /^[A-Z]{2,4}s$/.test(name);
  const f = sensitive ? flags.replace('i', '') : flags.includes('i') ? flags : flags + 'i';
  if (name === 'Go') return new RegExp('(?:(?<=[,/(]\\s?)|(?<=\\b(?:and|or|in|with|using|like)\\s))Go(?![A-Za-z0-9+#])', f);
  return termPattern(name, f);
}

export type Keyword = {
  term: string; // display form
  patterns: RegExp[]; // case-insensitive matchers used against the resume
  importance: 'required' | 'preferred' | 'mentioned';
  count: number; // times it appears in the job description
};

type Section = 'required' | 'preferred' | 'other';

// Split a job description into lines tagged with the kind of section they sit in.
function tagSections(jd: string): { line: string; section: Section }[] {
  let section: Section = 'other';
  return jd.split(/\n/).map((raw) => {
    const line = raw.trim();
    const lower = line.toLowerCase();
    const isHeading = line.length < 70 && !/[.!?]$/.test(line);
    if (isHeading && /(preferred|nice[- ]to[- ]have|bonus|plus|desired|ideally)/.test(lower)) section = 'preferred';
    else if (isHeading && /(requirement|qualification|must[- ]have|what you('|’)ll need|what we('|’)re looking for|you have|about you|who you are|basic|minimum)/.test(lower)) section = 'required';
    else if (isHeading && /(responsibilit|what you('|’)ll do|the role|about the job|day to day|benefits|about us|perks|compensation)/.test(lower)) section = 'other';
    // Inline cues on a single bullet override the section.
    let lineSection = section;
    if (/\b(preferred|a plus|is a plus|nice to have|bonus)\b/i.test(line)) lineSection = 'preferred';
    else if (/\b(required|must have|must be|minimum of)\b/i.test(line)) lineSection = 'required';
    return { line, section: lineSection };
  });
}

function rankImportance(sections: Set<Section>): Keyword['importance'] {
  if (sections.has('required')) return 'required';
  if (sections.has('preferred')) return 'preferred';
  return 'mentioned';
}

const MAX_KEYWORDS = 30;

/** Pull the skills, tools and repeated terms out of a job description. */
export function extractJobKeywords(jobDescription: string): Keyword[] {
  const jd = jobDescription.replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
  const lines = tagSections(jd);
  const found = new Map<string, { kw: Keyword; sections: Set<Section> }>();

  const record = (term: string, patterns: RegExp[], section: Section, hits: number) => {
    const key = term.toLowerCase();
    const entry = found.get(key) ?? { kw: { term, patterns, importance: 'mentioned', count: 0 }, sections: new Set<Section>() };
    entry.kw.count += hits;
    entry.sections.add(section);
    found.set(key, entry);
  };

  // 1. Known skills.
  for (const [display, ...aliases] of SKILLS) {
    const names = [display, ...aliases];
    const jdPatterns = names.map((n) => aliasPattern(n, 'g'));
    const resumePatterns = names.map((n) => aliasPattern(n, 'i'));
    for (const { line, section } of lines) {
      const hits = jdPatterns.reduce((n, re) => n + (line.match(re)?.length ?? 0), 0);
      if (hits) record(display, resumePatterns, section, hits);
    }
  }

  // 2. Acronyms and tool-like tokens the dictionary doesn't know (e.g. "CMMS", "Looker Studio", "C++").
  const known = new Set([...found.keys()]);
  const allAliases = new Set(SKILLS.flat().map((s) => s.toLowerCase()));
  for (const { line, section } of lines) {
    // Character ranges of this line already claimed by a known skill ("A/B" inside "A/B testing").
    const claimed: [number, number][] = [];
    for (const { kw } of found.values()) {
      for (const p of kw.patterns) {
        for (const hit of line.matchAll(new RegExp(p.source, p.flags + 'g'))) claimed.push([hit.index!, hit.index! + hit[0].length]);
      }
    }
    for (const m of line.matchAll(/(?<![A-Za-z0-9])([A-Z][A-Z0-9&/+.-]{1,9})(?![A-Za-z0-9])/g)) {
      const token = m[1].replace(/[.-]+$/, '');
      if (claimed.some(([start, end]) => m.index! >= start && m.index! < end)) continue;
      if (token.length < 2 || IGNORED_ACRONYMS.has(token) || /^\d/.test(token)) continue;
      if (allAliases.has(token.toLowerCase()) || known.has(token.toLowerCase())) continue;
      // Skip shouted headings ("REQUIREMENTS").
      if (/^[A-Z]{5,}$/.test(token) && STOPWORDS.has(token.toLowerCase())) continue;
      if (line === line.toUpperCase() && line.length > 12) continue;
      record(token, [termPattern(token, '')], section, 1);
    }
  }

  // 3. Repeated phrases: two-word terms that appear at least twice, single words at least three times.
  const sentences = jd
    .toLowerCase()
    .split(/[\n.;:!?()•·|]+/)
    .map((s) => s.match(/[a-z][a-z0-9+#'/-]*/g) ?? []);
  const isContent = (w: string) => w.length > 2 && !STOPWORDS.has(w) && !/^\d/.test(w);
  const bigrams = new Map<string, number>();
  const unigrams = new Map<string, number>();
  for (const words of sentences) {
    for (let i = 0; i < words.length; i++) {
      const w = words[i].replace(/'s$/, '');
      if (!isContent(w)) continue;
      unigrams.set(w, (unigrams.get(w) ?? 0) + 1);
      const next = words[i + 1]?.replace(/'s$/, '');
      if (next && isContent(next)) bigrams.set(`${w} ${next}`, (bigrams.get(`${w} ${next}`) ?? 0) + 1);
    }
  }
  const coveredByKnown = (phrase: string) =>
    [...found.values()].some(({ kw }) => kw.patterns.some((p) => p.test(phrase)));
  const extras: { term: string; count: number }[] = [];
  for (const [phrase, count] of bigrams) {
    if (count >= 2 && !coveredByKnown(phrase)) extras.push({ term: phrase, count });
  }
  const inBigram = (w: string) => extras.some((e) => e.term.split(' ').includes(w));
  for (const [word, count] of unigrams) {
    if (count >= 3 && word.length > 3 && !inBigram(word) && !coveredByKnown(word)) extras.push({ term: word, count });
  }
  for (const { term, count } of extras) {
    const pattern = termPattern(term, 'i');
    const sections = new Set<Section>(lines.filter(({ line }) => pattern.test(line)).map(({ section }) => section));
    found.set(term, {
      kw: { term, patterns: [pattern], importance: 'mentioned', count },
      sections: sections.size ? sections : new Set<Section>(['other']),
    });
  }

  const order = { required: 0, preferred: 1, mentioned: 2 };
  return [...found.values()]
    .map(({ kw, sections }) => ({ ...kw, importance: rankImportance(sections) }))
    .sort((a, b) => order[a.importance] - order[b.importance] || b.count - a.count || a.term.localeCompare(b.term))
    .slice(0, MAX_KEYWORDS);
}

export type KeywordMatch = {
  score: number; // 0-100, weighted: required counts double
  matched: Keyword[];
  missing: Keyword[];
};

export function matchKeywords(resumeText: string, keywords: Keyword[]): KeywordMatch {
  const text = resumeText.replace(/[‘’]/g, "'");
  const matched: Keyword[] = [];
  const missing: Keyword[] = [];
  let total = 0;
  let got = 0;
  for (const kw of keywords) {
    const weight = kw.importance === 'required' ? 2 : 1;
    total += weight;
    if (kw.patterns.some((p) => p.test(text))) {
      matched.push(kw);
      got += weight;
    } else {
      missing.push(kw);
    }
  }
  return { score: total ? Math.round((got / total) * 100) : 0, matched, missing };
}

// ---------------------------------------------------------------------------
// ATS checks
// ---------------------------------------------------------------------------

export type CheckStatus = 'pass' | 'warn' | 'fail' | 'info';

export type Check = {
  id: string;
  group: 'Parsing' | 'Contact' | 'Structure' | 'Content' | 'US conventions';
  title: string;
  status: CheckStatus;
  detail: string;
  weight: number; // points this check is worth; 0 for info-only
  learnMore?: { label: string; href: string };
};

export type FileInfo = { kind?: 'pdf' | 'docx' | 'txt' | 'paste'; pages?: number; hasTables?: boolean; hasImages?: boolean };

const SECTION_HEADINGS: Record<string, string[]> = {
  experience: ['experience', 'work experience', 'professional experience', 'employment', 'employment history', 'work history', 'internships', 'internship experience', 'relevant experience', 'career history'],
  education: ['education', 'academic background', 'education background', 'academics'],
  skills: ['skills', 'technical skills', 'core skills', 'key skills', 'skills & interests', 'skills and interests', 'core competencies', 'competencies', 'tools', 'technologies', 'skills & tools', 'additional information', 'additional skills'],
};

function hasSection(text: string, names: string[]): boolean {
  const lines = text.split('\n').map((l) => l.trim().toLowerCase().replace(/[:：]$/, '').replace(/\s+/g, ' '));
  if (lines.some((l) => names.includes(l))) return true;
  // PDF text sometimes runs headings into the next line; accept an upper-case heading anywhere.
  return names.some((n) => new RegExp(`(^|\\s)${escapeRegex(n.toUpperCase())}(\\s|:|$)`).test(text));
}

const WEAK_PHRASES = /\b(responsible for|duties included|helped (to )?|assisted (with|in)|worked on|participated in|involved in|tasked with)\b/gi;
const FIRST_PERSON = /(?<![A-Za-z])(I|I'm|I've|me|my|myself)(?![A-Za-z'])/g;

function bulletLines(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => /^[•●▪◦‣\-*–]\s*/.test(l) || l.split(/\s+/).length >= 8)
    .map((l) => l.replace(/^[•●▪◦‣\-*–]\s*/, ''));
}

/** Formatting and content checks. Score is out of 100. */
export function checkResume(resumeText: string, file: FileInfo = {}): { score: number; checks: Check[]; wordCount: number } {
  const text = resumeText.replace(/\r\n/g, '\n');
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const checks: Check[] = [];
  const add = (c: Check) => checks.push(c);

  // Parsing
  const readable = text.replace(/\s/g, '').length >= 200;
  add({
    id: 'readable', group: 'Parsing', title: 'Text can be read by an ATS', weight: 20,
    status: readable ? 'pass' : 'fail',
    detail: readable
      ? 'We could extract the text from your file, so an applicant tracking system can too.'
      : 'Almost no text could be extracted. This usually means a scanned or image-based PDF, or a resume exported from a design tool as pictures. An ATS will see a blank resume. Export a text-based PDF from Word or Google Docs.',
  });
  if (!readable) return { score: 0, checks, wordCount };

  if (file.kind === 'docx') {
    add({
      id: 'tables', group: 'Parsing', title: 'No tables or text boxes', weight: 6,
      status: file.hasTables ? 'warn' : 'pass',
      detail: file.hasTables
        ? 'Your document uses a table. Many ATS read tables out of order or skip cells. Use a single-column layout with plain text.'
        : 'No tables found. Single-column text is the safest layout.',
    });
  }

  // Contact
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
  add({
    id: 'email', group: 'Contact', title: 'Email address', weight: 8,
    status: email ? 'pass' : 'fail',
    detail: email ? `Found ${email}.` : 'No email address found. Put it in your header as plain text, not inside an image or icon.',
  });
  if (email && /@(qq|163|126|sina|sohu|yeah)\.(com|cn)$/i.test(email)) {
    add({
      id: 'email-domain', group: 'US conventions', title: 'Email domain US recruiters recognize', weight: 3, status: 'warn',
      detail: `${email} uses a domain some US company mail filters treat as unfamiliar. Use your university address or a Gmail/Outlook address built from your name.`,
    });
  }
  const usPhone = /(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/.test(text);
  const cnPhone = /(\+?86[\s-]?)?(?<!\d)1[3-9]\d[\s-]?\d{4}[\s-]?\d{4}(?!\d)/.test(text);
  const anyPhone = usPhone || cnPhone || /\+\d{1,3}[\s\d().-]{7,}/.test(text);
  add({
    id: 'phone', group: 'Contact', title: 'Phone number', weight: 6,
    status: usPhone ? 'pass' : anyPhone ? 'warn' : 'fail',
    detail: usPhone
      ? 'Found a US phone number.'
      : anyPhone
        ? 'Only a non-US phone number found. Recruiters in the US rarely call international numbers. Add a US number (Google Voice works) if you have one.'
        : 'No phone number found. Add one to your header.',
  });
  const linkedin = /linkedin\.com\/in\//i.test(text) || /\blinkedin\b/i.test(text);
  add({
    id: 'linkedin', group: 'Contact', title: 'LinkedIn profile', weight: 4,
    status: linkedin ? 'pass' : 'warn',
    detail: linkedin
      ? 'LinkedIn profile included.'
      : 'No LinkedIn URL. Most US recruiters check LinkedIn; add linkedin.com/in/your-name to your header.',
  });

  // Structure
  const exp = hasSection(text, SECTION_HEADINGS.experience);
  const edu = hasSection(text, SECTION_HEADINGS.education);
  const skills = hasSection(text, SECTION_HEADINGS.skills);
  add({
    id: 'sections', group: 'Structure', title: 'Standard section headings', weight: 12,
    status: exp && edu && skills ? 'pass' : exp && edu ? 'warn' : 'fail',
    detail:
      exp && edu && skills
        ? 'Found Experience, Education and Skills headings. An ATS uses these to sort your information.'
        : `Missing: ${[!exp && 'Experience', !edu && 'Education', !skills && 'Skills'].filter(Boolean).join(', ')}. Use plain, standard headings. Creative titles like "My Journey" confuse parsers.`,
    learnMore: { label: 'ATS-friendly resume format', href: '/blog/ats-friendly-resume-format' },
  });

  const pages = file.pages;
  const tooLong = (pages !== undefined && pages > 2) || wordCount > 1100;
  const tooShort = wordCount < 250;
  add({
    id: 'length', group: 'Structure', title: 'Resume length', weight: 6,
    status: tooLong || tooShort ? 'warn' : 'pass',
    detail: tooShort
      ? `About ${wordCount} words. That is thin. Add results to your bullets, plus projects or coursework if you are a student.`
      : tooLong
        ? `${pages ? `${pages} pages, ` : ''}about ${wordCount} words. Students and new grads should aim for one page; experienced candidates for two at most.`
        : `${pages ? `${pages} page${pages > 1 ? 's' : ''}, ` : ''}about ${wordCount} words. A good length.`,
  });

  // Content
  const bullets = bulletLines(text);
  const quantified = bullets.filter((b) => /\d|%|\$/.test(b)).length;
  const ratio = bullets.length ? quantified / bullets.length : 0;
  add({
    id: 'numbers', group: 'Content', title: 'Results with numbers', weight: 10,
    status: ratio >= 0.4 ? 'pass' : ratio >= 0.2 ? 'warn' : 'fail',
    detail: bullets.length
      ? `${quantified} of ${bullets.length} bullet points include a number. ${ratio >= 0.4 ? 'Good.' : 'Aim for at least half. Add scale (users, revenue, records), change (%, time saved) or rank (top 5%).'}`
      : 'We could not find bullet points. Describe each role with 3 to 5 bullets that start with a verb and end with a result.',
  });

  const weak = text.match(WEAK_PHRASES) ?? [];
  add({
    id: 'verbs', group: 'Content', title: 'Strong action verbs', weight: 6,
    status: weak.length === 0 ? 'pass' : weak.length <= 2 ? 'warn' : 'fail',
    detail:
      weak.length === 0
        ? 'No weak phrases like "responsible for" or "helped with".'
        : `Found ${weak.length} weak phrase${weak.length > 1 ? 's' : ''}: ${[...new Set(weak.map((w) => `"${w.toLowerCase()}"`))].slice(0, 4).join(', ')}. Start with what you did: built, led, analyzed, launched, reduced.`,
  });

  const firstPerson = (text.match(FIRST_PERSON) ?? []).length;
  add({
    id: 'pronouns', group: 'Content', title: 'No first-person pronouns', weight: 3,
    status: firstPerson === 0 ? 'pass' : 'warn',
    detail:
      firstPerson === 0
        ? 'No "I", "me" or "my". US resumes drop the subject.'
        : `Found "I", "me" or "my" ${firstPerson} time${firstPerson > 1 ? 's' : ''}. Write "Built a dashboard…", not "I built a dashboard…".`,
  });

  // US conventions (common issues on resumes written for other markets)
  const personal: string[] = [];
  const personalChecks: [RegExp, string][] = [
    [/\b(date of birth|d\.?o\.?b\.?|birth ?date|born (on|in))\b|出生/i, 'date of birth'],
    [/\bage\s*[:：]\s*\d{2}\b|年龄/i, 'age'],
    [/\b(gender|sex)\s*[:：]|性别/i, 'gender'],
    [/\bmarital status\b|\bmarried\b|婚/i, 'marital status'],
    [/\b(nationality|ethnicity)\s*[:：]|民族|国籍/i, 'nationality or ethnicity'],
    [/\b(political (status|affiliation)|party member|communist youth league)\b|政治面貌|党员/i, 'political affiliation'],
    [/\b(height|weight)\s*[:：]|身高|体重/i, 'height or weight'],
    [/\b(hometown|native place|place of origin|household registration|hukou)\b|籍贯|户口/i, 'hometown'],
    [/\b(religion)\s*[:：]/i, 'religion'],
    [/\b(id|passport) (number|no\.?)\b|身份证/i, 'ID or passport number'],
  ];
  for (const [re, label] of personalChecks) if (re.test(text)) personal.push(label);
  if (file.hasImages) personal.push('a photo or image');
  add({
    id: 'personal', group: 'US conventions', title: 'No personal details US resumes leave out', weight: 12,
    status: personal.length ? 'fail' : 'pass',
    detail: personal.length
      ? `Found ${personal.join(', ')}. US employers avoid this information because of anti-discrimination law, and some will set a resume aside rather than risk it. Remove it.`
      : 'No photo, age, birth date, gender or marital status. That matches US norms.',
    learnMore: { label: 'US resume format for international students', href: '/blog/us-resume-format-for-international-students' },
  });

  const cjk = (text.match(/[぀-ヿ㐀-䶿一-鿿가-힯]/g) ?? []).length;
  add({
    id: 'english', group: 'US conventions', title: 'Written fully in English', weight: 5,
    status: cjk === 0 ? 'pass' : 'warn',
    detail:
      cjk === 0
        ? 'No Chinese, Japanese or Korean characters.'
        : `Found ${cjk} Chinese, Japanese or Korean character${cjk > 1 ? 's' : ''}. Some ATS turn them into boxes or question marks. Translate school, company and award names into their official English forms.`,
    learnMore: { label: 'Translate a Chinese resume into English', href: '/blog/translate-chinese-resume-to-english' },
  });

  const dottedDates = text.match(/(?<!\d)(19|20)\d{2}\s*[./]\s*(0?[1-9]|1[0-2])(?!\d)/g) ?? [];
  add({
    id: 'dates', group: 'US conventions', title: 'US date format', weight: 3,
    status: dottedDates.length ? 'warn' : 'pass',
    detail: dottedDates.length
      ? `Dates like "${dottedDates[0].replace(/\s/g, '')}" are common in China and Europe but can confuse US parsers. Use "Jun 2023 – Aug 2023".`
      : 'Dates use a format US systems read reliably.',
  });

  const gpa = text.match(/\bGPA\b[^0-9\n]{0,15}(\d{2,3}(\.\d+)?)/i);
  if (gpa && Number(gpa[1]) > 5) {
    add({
      id: 'gpa', group: 'US conventions', title: 'GPA scale is clear', weight: 3, status: 'warn',
      detail: `Your GPA reads as ${gpa[1]}. US readers expect a 4.0 scale. Write it with its scale ("${gpa[1]}/100") or list a converted GPA from a credential evaluation such as WES.`,
    });
  }

  const authorization = /\b(OPT|CPT|F-?1|STEM OPT|work authori[sz]ation|authorized to work|H-?1B|sponsorship|green card|permanent resident|U\.?S\.? citizen)\b/i.test(text);
  add({
    id: 'authorization', group: 'US conventions', title: 'Work authorization', weight: 0, status: 'info',
    detail: authorization
      ? 'You mention your work authorization. That is optional but can help when it is a strength, for example a 3-year STEM OPT window.'
      : 'Your resume does not mention work authorization. That is fine; most applications ask separately. If you are on F-1 with STEM OPT eligibility, a short line can help.',
    learnMore: { label: 'Work authorization on a resume (F-1 / OPT)', href: '/blog/f1-opt-resume-work-authorization' },
  });

  const scored = checks.filter((c) => c.weight > 0);
  const total = scored.reduce((s, c) => s + c.weight, 0);
  const earned = scored.reduce((s, c) => s + (c.status === 'pass' ? c.weight : c.status === 'warn' ? c.weight / 2 : 0), 0);
  return { score: Math.round((earned / total) * 100), checks, wordCount };
}
