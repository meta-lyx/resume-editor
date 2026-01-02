// Resume content parser - converts AI-optimized text to structured data
import type { ResumeData, ResumeExperience, ResumeEducation, ResumeContact } from '@/components/pdf/resume-pdf-template';

interface ParsedSection {
  title: string;
  content: string[];
}

// Parse resume text into structured sections
function parseSections(text: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  
  // Common section headers
  const sectionPatterns = [
    /^(PROFESSIONAL\s+SUMMARY|SUMMARY|OBJECTIVE|PROFILE)/i,
    /^(WORK\s+EXPERIENCE|EXPERIENCE|EMPLOYMENT|PROFESSIONAL\s+EXPERIENCE)/i,
    /^(EDUCATION|ACADEMIC|QUALIFICATIONS)/i,
    /^(SKILLS|TECHNICAL\s+SKILLS|CORE\s+COMPETENCIES|EXPERTISE)/i,
    /^(PROJECTS|KEY\s+PROJECTS)/i,
    /^(CERTIFICATIONS?|LICENSES?|CREDENTIALS)/i,
    /^(AWARDS?|ACHIEVEMENTS?|HONORS?)/i,
    /^(PUBLICATIONS?)/i,
    /^(LANGUAGES?)/i,
    /^(INTERESTS?|HOBBIES)/i,
  ];
  
  let currentSection: ParsedSection | null = null;
  
  for (const line of lines) {
    // Check if this line is a section header
    let isHeader = false;
    for (const pattern of sectionPatterns) {
      if (pattern.test(line)) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = { title: line, content: [] };
        isHeader = true;
        break;
      }
    }
    
    if (!isHeader) {
      if (currentSection) {
        currentSection.content.push(line);
      } else {
        // Content before any section header - likely contact info or name
        if (!sections.find(s => s.title === '__HEADER__')) {
          sections.unshift({ title: '__HEADER__', content: [] });
        }
        sections[0].content.push(line);
      }
    }
  }
  
  if (currentSection) {
    sections.push(currentSection);
  }
  
  return sections;
}

// Parse contact info from header lines
function parseContact(lines: string[]): { name: string; title?: string; contact: ResumeContact } {
  let name = '';
  let title = '';
  const contact: ResumeContact = {};
  
  for (const line of lines) {
    // Email pattern
    const emailMatch = line.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) {
      contact.email = emailMatch[0];
    }
    
    // Phone pattern
    const phoneMatch = line.match(/[\d\s\-().+]{10,}/);
    if (phoneMatch) {
      contact.phone = phoneMatch[0].trim();
    }
    
    // LinkedIn
    if (line.toLowerCase().includes('linkedin')) {
      const urlMatch = line.match(/https?:\/\/[^\s]+/) || line.match(/linkedin\.com\/in\/[\w-]+/);
      if (urlMatch) {
        contact.linkedin = urlMatch[0].startsWith('http') ? urlMatch[0] : `https://${urlMatch[0]}`;
      }
    }
    
    // GitHub
    if (line.toLowerCase().includes('github')) {
      const urlMatch = line.match(/https?:\/\/[^\s]+/) || line.match(/github\.com\/[\w-]+/);
      if (urlMatch) {
        contact.github = urlMatch[0].startsWith('http') ? urlMatch[0] : `https://${urlMatch[0]}`;
      }
    }
    
    // Website/Portfolio
    if (line.toLowerCase().includes('portfolio') || line.toLowerCase().includes('website')) {
      const urlMatch = line.match(/https?:\/\/[^\s]+/);
      if (urlMatch) {
        contact.website = urlMatch[0];
      }
    }
    
    // Location (city, state pattern)
    const locationMatch = line.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),?\s+([A-Z]{2})\b/);
    if (locationMatch && !contact.location) {
      contact.location = `${locationMatch[1]}, ${locationMatch[2]}`;
    }
    
    // Name is usually the first line that's not contact info
    if (!name && !emailMatch && !phoneMatch && !line.includes('@') && !line.includes('linkedin') && !line.includes('github')) {
      if (line.length > 2 && line.length < 50 && !line.includes('|')) {
        name = line;
      }
    }
    
    // Title often comes after name
    if (name && !title && line !== name && !emailMatch && !phoneMatch) {
      if (line.length > 3 && line.length < 60) {
        // Check if it looks like a job title
        const titlePatterns = /engineer|developer|manager|designer|analyst|consultant|specialist|director|lead|senior|junior|architect|coordinator/i;
        if (titlePatterns.test(line)) {
          title = line;
        }
      }
    }
  }
  
  return { name: name || 'Your Name', title: title || undefined, contact };
}

// Parse experience entries
function parseExperience(content: string[]): ResumeExperience[] {
  const experiences: ResumeExperience[] = [];
  let currentExp: Partial<ResumeExperience> | null = null;
  
  for (let i = 0; i < content.length; i++) {
    const line = content[i];
    
    // Check for bullet points
    if (line.match(/^[•\-*]\s*/)) {
      if (currentExp) {
        if (!currentExp.bullets) currentExp.bullets = [];
        currentExp.bullets.push(line.replace(/^[•\-*]\s*/, ''));
      }
      continue;
    }
    
    // Check for date patterns (indicates new entry)
    const dateMatch = line.match(/((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}|(?:19|20)\d{2})\s*[-–—to]\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}|(?:19|20)\d{2}|Present|Current)/i);
    
    if (dateMatch || (line.match(/^[A-Z]/) && !line.startsWith('•') && line.length < 100)) {
      // Save previous experience
      if (currentExp && currentExp.title) {
        experiences.push({
          title: currentExp.title || 'Position',
          company: currentExp.company || 'Company',
          location: currentExp.location,
          startDate: currentExp.startDate || '',
          endDate: currentExp.endDate || 'Present',
          bullets: currentExp.bullets || [],
        });
      }
      
      // Start new experience
      currentExp = { bullets: [] };
      
      if (dateMatch) {
        currentExp.startDate = dateMatch[1];
        currentExp.endDate = dateMatch[2];
      }
      
      // Parse title and company from current or next line
      const titleCompanyLine = dateMatch ? line.replace(dateMatch[0], '').trim() : line;
      
      // Common patterns: "Title at Company" or "Title, Company" or "Title | Company"
      const atMatch = titleCompanyLine.match(/^(.+?)\s+at\s+(.+?)(?:\s*[,|]\s*(.+))?$/i);
      const separatorMatch = titleCompanyLine.match(/^(.+?)\s*[,|–—]\s*(.+?)(?:\s*[,|]\s*(.+))?$/);
      
      if (atMatch) {
        currentExp.title = atMatch[1].trim();
        currentExp.company = atMatch[2].trim();
        if (atMatch[3]) currentExp.location = atMatch[3].trim();
      } else if (separatorMatch) {
        currentExp.title = separatorMatch[1].trim();
        currentExp.company = separatorMatch[2].trim();
        if (separatorMatch[3]) currentExp.location = separatorMatch[3].trim();
      } else if (titleCompanyLine) {
        currentExp.title = titleCompanyLine;
        // Look at next line for company
        if (i + 1 < content.length && !content[i + 1].match(/^[•\-*]/)) {
          currentExp.company = content[i + 1];
          i++; // Skip next line
        }
      }
    }
  }
  
  // Don't forget the last experience
  if (currentExp && currentExp.title) {
    experiences.push({
      title: currentExp.title || 'Position',
      company: currentExp.company || 'Company',
      location: currentExp.location,
      startDate: currentExp.startDate || '',
      endDate: currentExp.endDate || 'Present',
      bullets: currentExp.bullets || [],
    });
  }
  
  return experiences;
}

// Parse education entries
function parseEducation(content: string[]): ResumeEducation[] {
  const education: ResumeEducation[] = [];
  let currentEdu: Partial<ResumeEducation> | null = null;
  
  for (const line of content) {
    // Check for degree patterns
    const degreePatterns = /\b(Bachelor|Master|PhD|Ph\.D|Doctor|Associate|B\.S\.|B\.A\.|M\.S\.|M\.A\.|MBA|B\.Sc|M\.Sc|B\.E\.|M\.E\.)\b/i;
    const yearMatch = line.match(/((?:19|20)\d{2})/);
    
    if (degreePatterns.test(line) || yearMatch) {
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
      
      if (yearMatch) {
        currentEdu.graduationDate = yearMatch[1];
      }
      
      // Try to extract degree and school
      const parts = line.split(/[,|–—]/);
      if (parts.length >= 2) {
        currentEdu.degree = parts[0].trim();
        currentEdu.school = parts[1].trim();
        if (parts[2]) {
          // Could be location or date
          if (parts[2].match(/\d{4}/)) {
            currentEdu.graduationDate = parts[2].trim();
          } else {
            currentEdu.location = parts[2].trim();
          }
        }
      } else {
        currentEdu.degree = line.replace(/\d{4}/, '').trim();
      }
      
      // GPA pattern
      const gpaMatch = line.match(/GPA[:\s]*(\d+\.?\d*)/i);
      if (gpaMatch) {
        currentEdu.gpa = gpaMatch[1];
      }
    } else if (currentEdu && line.match(/^[•\-*]/)) {
      // Bullet points for education
      if (!currentEdu.highlights) currentEdu.highlights = [];
      currentEdu.highlights.push(line.replace(/^[•\-*]\s*/, ''));
    } else if (currentEdu && !currentEdu.school) {
      currentEdu.school = line;
    }
  }
  
  // Don't forget the last education entry
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

// Parse skills
function parseSkills(content: string[], highlightedKeywords: string[] = []): { category?: string; items: string[]; highlighted?: string[] }[] {
  const skillGroups: { category?: string; items: string[]; highlighted?: string[] }[] = [];
  
  for (const line of content) {
    // Check for category pattern: "Category: skill1, skill2, skill3"
    const categoryMatch = line.match(/^([^:]+):\s*(.+)/);
    
    if (categoryMatch) {
      const category = categoryMatch[1].trim();
      const skills = categoryMatch[2].split(/[,;|]/).map(s => s.trim()).filter(s => s);
      const highlighted = skills.filter(s => 
        highlightedKeywords.some(k => s.toLowerCase().includes(k.toLowerCase()))
      );
      skillGroups.push({ category, items: skills, highlighted });
    } else {
      // Just a list of skills
      const skills = line.split(/[,;|]/).map(s => s.trim()).filter(s => s && s.length > 1);
      if (skills.length > 0) {
        const highlighted = skills.filter(s => 
          highlightedKeywords.some(k => s.toLowerCase().includes(k.toLowerCase()))
        );
        skillGroups.push({ items: skills, highlighted });
      }
    }
  }
  
  return skillGroups;
}

// Main parser function
export function parseResumeContent(
  text: string, 
  highlightedKeywords: string[] = []
): ResumeData {
  const sections = parseSections(text);
  
  // Find header section for contact info
  const headerSection = sections.find(s => s.title === '__HEADER__');
  const { name, title, contact } = headerSection 
    ? parseContact(headerSection.content) 
    : { name: 'Your Name', title: undefined, contact: {} };
  
  // Find and parse other sections
  let summary = '';
  let experience: ResumeExperience[] = [];
  let education: ResumeEducation[] = [];
  let skills: { category?: string; items: string[]; highlighted?: string[] }[] = [];
  let certifications: string[] = [];
  
  for (const section of sections) {
    const titleLower = section.title.toLowerCase();
    
    if (titleLower.includes('summary') || titleLower.includes('objective') || titleLower.includes('profile')) {
      summary = section.content.join(' ');
    } else if (titleLower.includes('experience') || titleLower.includes('employment')) {
      experience = parseExperience(section.content);
    } else if (titleLower.includes('education') || titleLower.includes('academic')) {
      education = parseEducation(section.content);
    } else if (titleLower.includes('skill') || titleLower.includes('competenc') || titleLower.includes('expertise')) {
      skills = parseSkills(section.content, highlightedKeywords);
    } else if (titleLower.includes('certification') || titleLower.includes('license')) {
      certifications = section.content
        .filter(l => !l.match(/^[•\-*]/))
        .concat(section.content.filter(l => l.match(/^[•\-*]/)).map(l => l.replace(/^[•\-*]\s*/, '')));
    }
  }
  
  // If no experience was parsed, try to create a basic structure from the full text
  if (experience.length === 0 && text.length > 100) {
    // Fallback: create a single experience entry with the main content
    const lines = text.split('\n').filter(l => l.match(/^[•\-*]/));
    if (lines.length > 0) {
      experience = [{
        title: 'Professional Experience',
        company: '',
        startDate: '',
        endDate: '',
        bullets: lines.map(l => l.replace(/^[•\-*]\s*/, '')),
      }];
    }
  }
  
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


