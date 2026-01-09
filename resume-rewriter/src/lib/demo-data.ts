// Demo data for testing the template selector without backend
import type { ResumeData } from '@/components/pdf/resume-pdf-template';

export const demoResumeData: ResumeData = {
  name: 'Alex Johnson',
  title: 'Senior Software Engineer',
  contact: {
    email: 'alex.johnson@email.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    linkedin: 'https://linkedin.com/in/alexjohnson',
    github: 'https://github.com/alexjohnson',
    website: 'https://alexjohnson.dev',
  },
  summary: 'Results-driven Senior Software Engineer with 7+ years of experience building scalable web applications and leading cross-functional teams. Expertise in React, Node.js, and cloud architecture. Passionate about clean code, mentoring junior developers, and delivering exceptional user experiences.',
  experience: [
    {
      title: 'Senior Software Engineer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      startDate: 'Jan 2021',
      endDate: 'Present',
      bullets: [
        'Led development of microservices architecture serving 2M+ daily active users, reducing API response time by 40%',
        'Mentored team of 5 junior developers, implementing code review practices that decreased bug rate by 35%',
        'Architected real-time notification system using WebSockets, improving user engagement by 25%',
        'Collaborated with product team to define technical requirements, delivering features 20% ahead of schedule',
      ],
    },
    {
      title: 'Software Engineer',
      company: 'StartupXYZ',
      location: 'Remote',
      startDate: 'Mar 2018',
      endDate: 'Dec 2020',
      bullets: [
        'Built React-based dashboard that increased customer self-service adoption by 60%',
        'Implemented CI/CD pipeline reducing deployment time from 2 hours to 15 minutes',
        'Developed RESTful APIs handling 500K+ requests per day with 99.9% uptime',
        'Optimized PostgreSQL queries resulting in 50% improvement in database performance',
      ],
    },
    {
      title: 'Junior Developer',
      company: 'WebAgency Co.',
      location: 'New York, NY',
      startDate: 'Jun 2016',
      endDate: 'Feb 2018',
      bullets: [
        'Developed responsive web applications for 20+ clients using React and Vue.js',
        'Collaborated with designers to implement pixel-perfect UI components',
        'Participated in agile ceremonies and contributed to sprint planning',
      ],
    },
  ],
  education: [
    {
      degree: 'Bachelor of Science in Computer Science',
      school: 'University of California, Berkeley',
      location: 'Berkeley, CA',
      graduationDate: 'May 2016',
      gpa: '3.8',
      highlights: ['Dean\'s List', 'ACM Programming Competition Finalist'],
    },
  ],
  skills: [
    {
      category: 'Languages',
      items: ['JavaScript', 'TypeScript', 'Python', 'Go', 'SQL'],
    },
    {
      category: 'Frontend',
      items: ['React', 'Next.js', 'Vue.js', 'Tailwind CSS', 'Redux'],
    },
    {
      category: 'Backend',
      items: ['Node.js', 'Express', 'GraphQL', 'PostgreSQL', 'Redis'],
    },
    {
      category: 'Cloud & DevOps',
      items: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'],
    },
  ],
  certifications: [
    'AWS Certified Solutions Architect',
    'Google Cloud Professional Developer',
  ],
  projects: [
    {
      name: 'Open Source CLI Tool',
      description: 'Created a popular CLI tool for automating development workflows with 2K+ GitHub stars',
      bullets: ['Built with Go, supports multiple platforms', 'Featured in GitHub trending'],
    },
  ],
};

export const demoExtractedText = `Alex Johnson
Senior Software Engineer
alex.johnson@email.com | +1 (555) 123-4567 | San Francisco, CA
LinkedIn: linkedin.com/in/alexjohnson | GitHub: github.com/alexjohnson

PROFESSIONAL SUMMARY
Results-driven Senior Software Engineer with 7+ years of experience building scalable web applications and leading cross-functional teams.

EXPERIENCE

Senior Software Engineer | TechCorp Inc. | Jan 2021 - Present
• Led development of microservices architecture serving 2M+ daily active users
• Mentored team of 5 junior developers
• Architected real-time notification system using WebSockets

Software Engineer | StartupXYZ | Mar 2018 - Dec 2020
• Built React-based dashboard that increased customer self-service adoption by 60%
• Implemented CI/CD pipeline reducing deployment time from 2 hours to 15 minutes

EDUCATION
Bachelor of Science in Computer Science
University of California, Berkeley | May 2016

SKILLS
JavaScript, TypeScript, Python, React, Node.js, AWS, Docker, PostgreSQL`;

export const demoOptimizedText = `ALEX JOHNSON
Senior Software Engineer

PROFESSIONAL SUMMARY
Results-driven Senior Software Engineer with 7+ years of experience building scalable web applications and leading cross-functional teams. Expertise in React, Node.js, and cloud architecture with a proven track record of reducing API response times by 40% and improving team productivity by 35%.

PROFESSIONAL EXPERIENCE

Senior Software Engineer | TechCorp Inc. | San Francisco, CA | Jan 2021 - Present
• Spearheaded development of microservices architecture serving 2M+ daily active users, achieving 40% reduction in API response time
• Mentored and coached team of 5 junior developers, implementing rigorous code review practices that decreased production bug rate by 35%
• Architected and deployed real-time notification system using WebSockets and Redis, driving 25% improvement in user engagement metrics
• Partnered with product management to translate business requirements into technical specifications, consistently delivering features 20% ahead of schedule

Software Engineer | StartupXYZ | Remote | Mar 2018 - Dec 2020
• Engineered React-based analytics dashboard that increased customer self-service adoption by 60%, reducing support ticket volume
• Designed and implemented CI/CD pipeline using GitHub Actions and Docker, reducing deployment time from 2 hours to 15 minutes
• Developed and maintained RESTful APIs handling 500K+ daily requests with 99.9% uptime SLA
• Optimized PostgreSQL database queries and indexing strategies, resulting in 50% improvement in query performance

EDUCATION
Bachelor of Science in Computer Science | University of California, Berkeley | May 2016
• GPA: 3.8/4.0 | Dean's List | ACM Programming Competition Finalist

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, Python, Go, SQL
Frontend: React, Next.js, Vue.js, Tailwind CSS, Redux
Backend: Node.js, Express, GraphQL, PostgreSQL, Redis
Cloud & DevOps: AWS, Docker, Kubernetes, CI/CD, Terraform`;

// Function to load demo data into localStorage for testing
export function loadDemoData() {
  localStorage.setItem('resume_extracted_text', demoExtractedText);
  localStorage.setItem('resume_title', 'Alex Johnson Resume');
  localStorage.setItem('resume_job_description', 'We are looking for a Senior Software Engineer to join our team...');
  localStorage.setItem('resume_customized', demoOptimizedText);
  localStorage.setItem('resume_structured', JSON.stringify(demoResumeData));
  localStorage.setItem('resume_processed', 'true');
  localStorage.setItem('ai_ats_score', '92');
  localStorage.setItem('ai_processing_time', '3500');
  localStorage.setItem('ai_keywords_matched', JSON.stringify(['React', 'Node.js', 'AWS', 'TypeScript', 'microservices']));
  localStorage.setItem('ai_suggestions', JSON.stringify([
    'Added quantifiable metrics to all bullet points',
    'Highlighted leadership and mentoring experience',
    'Optimized keywords for ATS compatibility',
  ]));
  
  console.log('✅ Demo data loaded! Refresh the page to see the comparison view.');
  return true;
}

// Make it available globally for console access
if (typeof window !== 'undefined') {
  (window as any).loadDemoData = loadDemoData;
}

