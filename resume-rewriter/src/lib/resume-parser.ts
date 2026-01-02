// Resume content parser - converts AI-optimized text to structured data
import type { ResumeData, ResumeExperience, ResumeEducation, ResumeContact } from '@/components/pdf/resume-pdf-template';

// Debug mode - set to true to see parsing logs
const DEBUG = true;

function log(...args: unknown[]) {
  if (DEBUG) console.log('[ResumeParser]', ...args);
}

// Clean up text - remove markdown formatting and extra whitespace
function cleanText(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')  // Remove bold markdown
    .replace(/__([^_]+)__/g, '$1')       // Remove underscore bold
    .replace(/\*([^*]+)\*/g, '$1')       // Remove italic
    .replace(/_([^_]+)_/g, '$1')         // Remove underscore italic
    .replace(/`([^`]+)`/g, '$1')         // Remove code formatting
    .replace(/#{1,6}\s*/g, '')           // Remove markdown headers
    .trim();
}

// Check if a line is a section header
function isSectionHeader(line: string): string | null {
  const cleanLine = cleanText(line).toUpperCase();
  
  // Ignore these - they're not real section headers
  const ignorePatterns = [
    /^(AI[-\s]?)?(OPTIMIZED\s+)?RESUME$/i,
    /^RESUME$/i,
    /^CURRICULUM VITAE$/i,
    /^CV$/i,
  ];
  
  for (const pattern of ignorePatterns) {
    if (pattern.test(cleanLine)) {
      log('Ignoring fake header:', cleanLine);
      return null;
    }
  }
  
  // Common section headers
  const sectionMap: Record<string, string> = {
    'PROFESSIONAL SUMMARY': 'SUMMARY',
    'SUMMARY': 'SUMMARY',
    'OBJECTIVE': 'SUMMARY',
    'PROFILE': 'SUMMARY',
    'ABOUT': 'SUMMARY',
    'WORK EXPERIENCE': 'EXPERIENCE',
    'EXPERIENCE': 'EXPERIENCE',
    'PROFESSIONAL EXPERIENCE': 'EXPERIENCE',
    'EMPLOYMENT': 'EXPERIENCE',
    'EMPLOYMENT HISTORY': 'EXPERIENCE',
    'CAREER HISTORY': 'EXPERIENCE',
    'EDUCATION': 'EDUCATION',
    'ACADEMIC BACKGROUND': 'EDUCATION',
    'QUALIFICATIONS': 'EDUCATION',
    'SKILLS': 'SKILLS',
    'TECHNICAL SKILLS': 'SKILLS',
    'CORE COMPETENCIES': 'SKILLS',
    'EXPERTISE': 'SKILLS',
    'CORE SKILLS': 'SKILLS',
    'KEY SKILLS': 'SKILLS',
    'PROJECTS': 'PROJECTS',
    'KEY PROJECTS': 'PROJECTS',
    'CERTIFICATIONS': 'CERTIFICATIONS',
    'CERTIFICATES': 'CERTIFICATIONS',
    'LICENSES': 'CERTIFICATIONS',
    'AWARDS': 'AWARDS',
    'ACHIEVEMENTS': 'AWARDS',
    'HONORS': 'AWARDS',
  };
  
  for (const [pattern, section] of Object.entries(sectionMap)) {
    if (cleanLine === pattern || cleanLine.startsWith(pattern + ':')) {
      return section;
    }
  }
  
  return null;
}

// Check if line is a bullet point
function isBullet(line: string): boolean {
  return /^[\s]*[•\-\*\→\►\◆\○\●]\s+/.test(line) || /^[\s]*\d+[\.\)]\s+/.test(line);
}

// Extract bullet text
function extractBulletText(line: string): string {
  return line.replace(/^[\s]*[•\-\*\→\►\◆\○\●\d.)\s]+/, '').trim();
}

// Parse date range from a line
function parseDateRange(line: string): { startDate: string; endDate: string } | null {
  // Patterns for date ranges
  const patterns = [
    // "Jan 2020 - Present", "January 2020 – Dec 2023"
    /((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[.\s]*\d{4})\s*[-–—to]+\s*((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[.\s]*\d{4}|Present|Current|Now)/i,
    // "2020 - 2023", "2020 – Present"
    /\b((?:19|20)\d{2})\s*[-–—to]+\s*((?:19|20)\d{2}|Present|Current|Now)\b/i,
    // "(2020 - 2023)" with parentheses
    /\(((?:19|20)\d{2})\s*[-–—to]+\s*((?:19|20)\d{2}|Present|Current|Now)\)/i,
  ];
  
  for (const pattern of patterns) {
    const match = line.match(pattern);
    if (match) {
      return { startDate: match[1], endDate: match[2] };
    }
  }
  return null;
}

// Parse experience section content
function parseExperienceSection(lines: string[]): ResumeExperience[] {
  const experiences: ResumeExperience[] = [];
  let currentExp: Partial<ResumeExperience> | null = null;
  
  log('Parsing experience from', lines.length, 'lines');
  log('Lines:', lines.slice(0, 20)); // Log first 20 lines
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cleanLine = cleanText(line);
    
    if (!cleanLine) continue;
    
    log('Processing line:', cleanLine.substring(0, 80));
    
    // Check if this is a bullet point FIRST (priority over other checks)
    if (isBullet(line) || isBullet(cleanLine)) {
      const bulletText = extractBulletText(cleanLine);
      log('  -> Is bullet:', bulletText.substring(0, 50));
      if (bulletText && currentExp) {
        if (!currentExp.bullets) currentExp.bullets = [];
        currentExp.bullets.push(bulletText);
      } else if (bulletText && !currentExp) {
        // First bullet before any entry - create a default entry
        currentExp = { title: 'Experience', company: '', bullets: [bulletText] };
      }
      continue;
    }
    
    // Check for date range - strong indicator of new entry
    const dateRange = parseDateRange(cleanLine);
    
    // Check if this looks like a job title line
    // Must have: job title keywords OR company indicators OR date range
    const jobTitleKeywords = /\b(engineer|developer|manager|designer|analyst|consultant|specialist|director|lead|senior|junior|architect|coordinator|intern|associate|executive|administrator|officer|president|vp|ceo|cto|cfo)\b/i;
    const companyIndicators = /\b(at|@|inc\.|corp\.|llc|ltd|company|co\.|corporation)\b/i;
    const hasJobIndicators = jobTitleKeywords.test(cleanLine) || companyIndicators.test(cleanLine);
    
    // Only treat as new entry if:
    // 1. Has a date range, OR
    // 2. Has job title/company keywords AND is reasonably short (not a bullet point description)
    const isNewEntry = dateRange || (hasJobIndicators && cleanLine.length < 100);
    
    if (isNewEntry) {
      log('  -> New entry detected');
      
      // Save previous experience if exists
      if (currentExp && (currentExp.title || currentExp.company)) {
        log('  Saving experience:', currentExp.title, 'at', currentExp.company, 'with', currentExp.bullets?.length, 'bullets');
        experiences.push({
          title: currentExp.title || 'Position',
          company: currentExp.company || '',
          location: currentExp.location,
          startDate: currentExp.startDate || '',
          endDate: currentExp.endDate || '',
          bullets: currentExp.bullets || [],
        });
      }
      
      // Start new experience
      currentExp = { bullets: [] };
      
      if (dateRange) {
        currentExp.startDate = dateRange.startDate;
        currentExp.endDate = dateRange.endDate;
      }
      
      // Remove dates from line to parse title/company
      let titleLine = cleanLine;
      if (dateRange) {
        // Remove the date portion
        titleLine = titleLine.replace(/((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[.\s]*\d{4}\s*[-–—to]+\s*(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[.\s]*\d{4}|Present|Current|Now))/gi, '');
        titleLine = titleLine.replace(/\(?((?:19|20)\d{2})\s*[-–—to]+\s*((?:19|20)\d{2}|Present|Current|Now)\)?/gi, '');
        titleLine = titleLine.trim().replace(/^[,|\-–—]\s*/, '').replace(/[,|\-–—]\s*$/, '');
      }
      
      // Parse title and company
      // Common formats: "Title at Company", "Title, Company", "Title | Company", "Title - Company"
      const atMatch = titleLine.match(/^(.+?)\s+at\s+(.+?)(?:\s*[,|]\s*(.+))?$/i);
      const separatorMatch = titleLine.match(/^(.+?)\s*[,|–—]\s+(.+?)(?:\s*[,|]\s*(.+))?$/);
      
      if (atMatch) {
        currentExp.title = atMatch[1].trim();
        currentExp.company = atMatch[2].trim();
        if (atMatch[3]) currentExp.location = atMatch[3].trim();
      } else if (separatorMatch && separatorMatch[1].length > 2 && separatorMatch[2].length > 2) {
        currentExp.title = separatorMatch[1].trim();
        currentExp.company = separatorMatch[2].trim();
        if (separatorMatch[3]) currentExp.location = separatorMatch[3].trim();
      } else if (titleLine) {
        // Single line - could be just title, check next line for company
        currentExp.title = titleLine;
        
        // Look ahead for company on next line
        if (i + 1 < lines.length) {
          const nextLine = cleanText(lines[i + 1]);
          if (nextLine && !isBullet(lines[i + 1]) && !parseDateRange(nextLine)) {
            // Check if next line looks like a company name (not too long, doesn't start with action verb)
            const actionVerbs = /^(Led|Managed|Developed|Created|Designed|Built|Implemented|Achieved|Increased|Reduced|Delivered|Spearheaded|Drove|Improved|Collaborated|Coordinated|Analyzed|Optimized|Streamlined)/i;
            if (nextLine.length < 80 && !actionVerbs.test(nextLine) && !isBullet(nextLine)) {
              currentExp.company = nextLine;
              i++; // Skip the company line
            }
          }
        }
      }
      
      log('  Entry details:', currentExp.title, 'at', currentExp.company);
    } else {
      // This line is neither a bullet nor a new entry header
      // It might be additional context for current entry (e.g., company name on separate line)
      log('  -> Skipping line (not bullet or entry header)');
    }
  }
  
  // Don't forget the last experience
  if (currentExp && (currentExp.title || currentExp.company || (currentExp.bullets && currentExp.bullets.length > 0))) {
    log('  Saving final experience:', currentExp.title, 'with', currentExp.bullets?.length, 'bullets');
    experiences.push({
      title: currentExp.title || 'Position',
      company: currentExp.company || '',
      location: currentExp.location,
      startDate: currentExp.startDate || '',
      endDate: currentExp.endDate || '',
      bullets: currentExp.bullets || [],
    });
  }
  
  log('Parsed', experiences.length, 'experiences total');
  experiences.forEach((exp, i) => {
    log(`  Experience ${i + 1}: ${exp.title} at ${exp.company} - ${exp.bullets.length} bullets`);
  });
  
  return experiences;
}

// Parse education section
function parseEducationSection(lines: string[]): ResumeEducation[] {
  const education: ResumeEducation[] = [];
  let currentEdu: Partial<ResumeEducation> | null = null;
  
  for (const line of lines) {
    const cleanLine = cleanText(line);
    if (!cleanLine) continue;
    
    // Check for bullet points
    if (isBullet(line)) {
      if (currentEdu) {
        if (!currentEdu.highlights) currentEdu.highlights = [];
        currentEdu.highlights.push(extractBulletText(cleanLine));
      }
      continue;
    }
    
    // Check for degree patterns
    const degreePattern = /\b(Bachelor|Master|PhD|Ph\.?D|Doctorate|Associate|B\.?S\.?|B\.?A\.?|M\.?S\.?|M\.?A\.?|M\.?B\.?A\.?|B\.?Sc|M\.?Sc|B\.?E\.?|M\.?E\.?|B\.?Tech|M\.?Tech)\b/i;
    const hasYear = /((?:19|20)\d{2})/.test(cleanLine);
    
    if (degreePattern.test(cleanLine) || hasYear) {
      // Save previous education
      if (currentEdu && (currentEdu.degree || currentEdu.school)) {
        education.push({
          degree: currentEdu.degree || 'Degree',
          school: currentEdu.school || 'Institution',
          location: currentEdu.location,
          graduationDate: currentEdu.graduationDate || '',
          gpa: currentEdu.gpa,
          highlights: currentEdu.highlights,
        });
      }
      
      currentEdu = {};
      
      // Extract year
      const yearMatch = cleanLine.match(/((?:19|20)\d{2})/);
      if (yearMatch) {
        currentEdu.graduationDate = yearMatch[1];
      }
      
      // Extract GPA
      const gpaMatch = cleanLine.match(/GPA[:\s]*(\d+\.?\d*)/i);
      if (gpaMatch) {
        currentEdu.gpa = gpaMatch[1];
      }
      
      // Try to extract degree and school
      // Common format: "Degree in Field, University" or "Degree | University"
      const parts = cleanLine.split(/[,|–—]/);
      if (parts.length >= 2) {
        currentEdu.degree = parts[0].replace(/((?:19|20)\d{2})/g, '').trim();
        currentEdu.school = parts[1].replace(/((?:19|20)\d{2})/g, '').replace(/GPA[:\s]*\d+\.?\d*/i, '').trim();
      } else {
        currentEdu.degree = cleanLine.replace(/((?:19|20)\d{2})/g, '').replace(/GPA[:\s]*\d+\.?\d*/i, '').trim();
      }
    } else if (currentEdu && !currentEdu.school) {
      // This line might be the school name
      currentEdu.school = cleanLine;
    }
  }
  
  // Don't forget last education entry
  if (currentEdu && (currentEdu.degree || currentEdu.school)) {
    education.push({
      degree: currentEdu.degree || 'Degree',
      school: currentEdu.school || 'Institution',
      location: currentEdu.location,
      graduationDate: currentEdu.graduationDate || '',
      gpa: currentEdu.gpa,
      highlights: currentEdu.highlights,
    });
  }
  
  return education;
}

// Parse skills section
function parseSkillsSection(lines: string[], highlightedKeywords: string[] = []): { category?: string; items: string[]; highlighted?: string[] }[] {
  const skillGroups: { category?: string; items: string[]; highlighted?: string[] }[] = [];
  
  for (const line of lines) {
    const cleanLine = cleanText(line);
    if (!cleanLine) continue;
    
    // Check for category pattern: "Category: skill1, skill2, skill3"
    const categoryMatch = cleanLine.match(/^([^:]+):\s*(.+)/);
    
    let category: string | undefined;
    let skillsText: string;
    
    if (categoryMatch) {
      category = categoryMatch[1].trim();
      skillsText = categoryMatch[2];
    } else {
      skillsText = cleanLine;
    }
    
    // Split by common separators
    const skills = skillsText
      .split(/[,;|•]/)
      .map(s => s.trim())
      .filter(s => s.length > 1);
    
    if (skills.length > 0) {
      const highlighted = skills.filter(s => 
        highlightedKeywords.some(k => s.toLowerCase().includes(k.toLowerCase()))
      );
      skillGroups.push({ category, items: skills, highlighted });
    }
  }
  
  return skillGroups;
}

// Parse contact info from header lines
function parseContactInfo(lines: string[]): { name: string; title?: string; contact: ResumeContact } {
  let name = '';
  let title = '';
  const contact: ResumeContact = {};
  
  log('Parsing contact from header lines:', lines.slice(0, 10));
  
  for (const line of lines) {
    const cleanLine = cleanText(line);
    if (!cleanLine) continue;
    
    // Skip lines that are clearly NOT names (headers, labels, etc.)
    const skipPatterns = [
      /^(ai[-\s]?)?(optimized\s+)?resume$/i,
      /^resume$/i,
      /^curriculum vitae$/i,
      /^cv$/i,
      /^contact(\s+info(rmation)?)?$/i,
      /^personal(\s+info(rmation)?)?$/i,
      /^#/,  // Markdown headers
    ];
    
    let shouldSkip = false;
    for (const pattern of skipPatterns) {
      if (pattern.test(cleanLine)) {
        log('Skipping header line:', cleanLine);
        shouldSkip = true;
        break;
      }
    }
    if (shouldSkip) continue;
    
    // Email
    const emailMatch = cleanLine.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) {
      contact.email = emailMatch[0];
      continue;
    }
    
    // Phone - more specific pattern
    const phoneMatch = cleanLine.match(/(\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);
    if (phoneMatch) {
      contact.phone = phoneMatch[1].trim();
      continue;
    }
    
    // LinkedIn
    if (/linkedin/i.test(cleanLine)) {
      const urlMatch = cleanLine.match(/https?:\/\/[^\s]+/) || cleanLine.match(/linkedin\.com\/in\/[\w-]+/i);
      if (urlMatch) {
        contact.linkedin = urlMatch[0].startsWith('http') ? urlMatch[0] : `https://${urlMatch[0]}`;
      }
      continue;
    }
    
    // GitHub
    if (/github/i.test(cleanLine)) {
      const urlMatch = cleanLine.match(/https?:\/\/[^\s]+/) || cleanLine.match(/github\.com\/[\w-]+/i);
      if (urlMatch) {
        contact.github = urlMatch[0].startsWith('http') ? urlMatch[0] : `https://${urlMatch[0]}`;
      }
      continue;
    }
    
    // Location (city, state)
    const locationMatch = cleanLine.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),?\s*([A-Z]{2})\b/);
    if (locationMatch && !contact.location && !emailMatch) {
      contact.location = `${locationMatch[1]}, ${locationMatch[2]}`;
      continue;
    }
    
    // Name - first non-contact, non-header line
    if (!name && cleanLine.length > 2 && cleanLine.length < 50) {
      // Make sure it's not just a separator or contact info
      if (!cleanLine.includes('|') && !cleanLine.includes('@') && !/^\d/.test(cleanLine)) {
        name = cleanLine;
        continue;
      }
    }
    
    // Title - check for job title keywords
    if (name && !title && cleanLine !== name && cleanLine.length > 3 && cleanLine.length < 80) {
      const titlePattern = /\b(engineer|developer|manager|designer|analyst|consultant|specialist|director|lead|senior|junior|architect|coordinator|executive|administrator|associate|officer|scientist|researcher)\b/i;
      if (titlePattern.test(cleanLine)) {
        title = cleanLine;
      }
    }
  }
  
  return { 
    name: name || 'Your Name', 
    title: title || undefined, 
    contact 
  };
}

// Main parser function
export function parseResumeContent(
  text: string, 
  highlightedKeywords: string[] = []
): ResumeData {
  log('Starting to parse resume, text length:', text.length);
  
  // Split into lines and clean
  const allLines = text.split('\n');
  
  // Find sections
  const sections: { type: string; lines: string[] }[] = [];
  let currentSection: { type: string; lines: string[] } = { type: 'HEADER', lines: [] };
  
  for (const line of allLines) {
    const sectionType = isSectionHeader(line);
    
    if (sectionType) {
      // Save current section if it has content
      if (currentSection.lines.length > 0) {
        sections.push(currentSection);
      }
      // Start new section
      currentSection = { type: sectionType, lines: [] };
      log('Found section:', sectionType);
    } else {
      // Add line to current section
      currentSection.lines.push(line);
    }
  }
  
  // Don't forget last section
  if (currentSection.lines.length > 0) {
    sections.push(currentSection);
  }
  
  log('Found', sections.length, 'sections:', sections.map(s => s.type).join(', '));
  
  // Parse each section
  let name = 'Your Name';
  let title: string | undefined;
  let contact: ResumeContact = {};
  let summary = '';
  let experience: ResumeExperience[] = [];
  let education: ResumeEducation[] = [];
  let skills: { category?: string; items: string[]; highlighted?: string[] }[] = [];
  let certifications: string[] = [];
  
  for (const section of sections) {
    switch (section.type) {
      case 'HEADER':
        const headerInfo = parseContactInfo(section.lines);
        name = headerInfo.name;
        title = headerInfo.title;
        contact = headerInfo.contact;
        break;
        
      case 'SUMMARY':
        summary = section.lines
          .map(l => cleanText(l))
          .filter(l => l)
          .join(' ');
        break;
        
      case 'EXPERIENCE':
        experience = parseExperienceSection(section.lines);
        break;
        
      case 'EDUCATION':
        education = parseEducationSection(section.lines);
        break;
        
      case 'SKILLS':
        skills = parseSkillsSection(section.lines, highlightedKeywords);
        break;
        
      case 'CERTIFICATIONS':
        certifications = section.lines
          .map(l => cleanText(l))
          .filter(l => l && !isBullet(l))
          .concat(
            section.lines
              .filter(l => isBullet(l))
              .map(l => extractBulletText(cleanText(l)))
          );
        break;
    }
  }
  
  // Fallback: if no experience was parsed, try to extract from all lines
  if (experience.length === 0) {
    log('No experience found, trying fallback extraction');
    const bullets = allLines
      .filter(l => isBullet(l))
      .map(l => extractBulletText(cleanText(l)))
      .filter(b => b.length > 10);
    
    if (bullets.length > 0) {
      experience = [{
        title: title || 'Professional Experience',
        company: '',
        startDate: '',
        endDate: '',
        bullets,
      }];
      log('Created fallback experience with', bullets.length, 'bullets');
    }
  }
  
  // Log final results
  log('Parse complete:', {
    name,
    title,
    summary: summary.substring(0, 50) + '...',
    experienceCount: experience.length,
    totalBullets: experience.reduce((acc, e) => acc + (e.bullets?.length || 0), 0),
    educationCount: education.length,
    skillsGroupCount: skills.length,
  });
  
  return {
    name,
    title,
    contact,
    summary,
    experience,
    education,
    skills,
    certifications: certifications.length > 0 ? certifications : undefined,
  };
}

export default parseResumeContent;
