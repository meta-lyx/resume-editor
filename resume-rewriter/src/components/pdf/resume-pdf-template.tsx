import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Link,
} from '@react-pdf/renderer';

// Register fonts - using web-safe fonts that work well
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2', fontWeight: 500 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff2', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2', fontWeight: 700 },
  ],
});

// Color palette
const colors = {
  primary: '#10B981', // Emerald green (Pixel Pear brand)
  dark: '#0F172A',
  text: '#1E293B',
  textLight: '#64748B',
  border: '#E2E8F0',
  background: '#FFFFFF',
  accent: '#059669',
};

// Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: colors.background,
    padding: 40,
    fontFamily: 'Inter',
  },
  // Header section
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingBottom: 15,
  },
  name: {
    fontSize: 28,
    fontWeight: 700,
    color: colors.dark,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: 600,
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  contactItem: {
    fontSize: 9,
    color: colors.textLight,
  },
  contactLink: {
    fontSize: 9,
    color: colors.primary,
    textDecoration: 'none',
  },
  // Sections
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: colors.dark,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionAccent: {
    width: 4,
    height: 12,
    backgroundColor: colors.primary,
    marginRight: 8,
    borderRadius: 2,
  },
  // Experience entries
  entry: {
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 3,
  },
  entryTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: colors.dark,
  },
  entryCompany: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: 500,
  },
  entryDate: {
    fontSize: 9,
    color: colors.textLight,
    textAlign: 'right',
  },
  entryLocation: {
    fontSize: 9,
    color: colors.textLight,
    textAlign: 'right',
  },
  // Bullet points
  bulletList: {
    marginTop: 4,
    paddingLeft: 0,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  bulletPoint: {
    width: 12,
    fontSize: 9,
    color: colors.primary,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    color: colors.text,
    lineHeight: 1.4,
  },
  // Skills
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillCategory: {
    marginBottom: 8,
  },
  skillCategoryTitle: {
    fontSize: 10,
    fontWeight: 600,
    color: colors.dark,
    marginBottom: 4,
  },
  skillTag: {
    fontSize: 9,
    color: colors.text,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  skillTagHighlight: {
    fontSize: 9,
    color: colors.background,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  // Summary
  summary: {
    fontSize: 10,
    color: colors.text,
    lineHeight: 1.5,
  },
  // Education
  educationEntry: {
    marginBottom: 8,
  },
  degree: {
    fontSize: 11,
    fontWeight: 600,
    color: colors.dark,
  },
  school: {
    fontSize: 10,
    color: colors.textLight,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: colors.textLight,
  },
  footerBrand: {
    fontSize: 7,
    color: colors.primary,
  },
});

// Types
export interface ResumeContact {
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  website?: string;
  github?: string;
}

export interface ResumeExperience {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface ResumeEducation {
  degree: string;
  school: string;
  location?: string;
  graduationDate: string;
  gpa?: string;
  highlights?: string[];
}

export interface ResumeProject {
  name: string;
  description: string;
  technologies?: string[];
  bullets?: string[];
}

export interface ResumeData {
  name: string;
  title?: string;
  contact: ResumeContact;
  summary?: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: {
    category?: string;
    items: string[];
    highlighted?: string[];
  }[];
  projects?: ResumeProject[];
  certifications?: string[];
}

interface ResumePDFProps {
  data: ResumeData;
  showBranding?: boolean;
}

// Main PDF Component
export function ResumePDF({ data, showBranding = true }: ResumePDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{data.name}</Text>
          {data.title && <Text style={styles.title}>{data.title}</Text>}
          <View style={styles.contactRow}>
            {data.contact.email && (
              <Link src={`mailto:${data.contact.email}`} style={styles.contactLink}>
                {data.contact.email}
              </Link>
            )}
            {data.contact.phone && (
              <Text style={styles.contactItem}>{data.contact.phone}</Text>
            )}
            {data.contact.location && (
              <Text style={styles.contactItem}>{data.contact.location}</Text>
            )}
            {data.contact.linkedin && (
              <Link src={data.contact.linkedin} style={styles.contactLink}>
                LinkedIn
              </Link>
            )}
            {data.contact.github && (
              <Link src={data.contact.github} style={styles.contactLink}>
                GitHub
              </Link>
            )}
            {data.contact.website && (
              <Link src={data.contact.website} style={styles.contactLink}>
                Portfolio
              </Link>
            )}
          </View>
        </View>

        {/* Summary */}
        {data.summary && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>Professional Summary</Text>
            </View>
            <Text style={styles.summary}>{data.summary}</Text>
          </View>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>Experience</Text>
            </View>
            {data.experience.map((exp, idx) => (
              <View key={idx} style={styles.entry}>
                <View style={styles.entryHeader}>
                  <View>
                    <Text style={styles.entryTitle}>{exp.title}</Text>
                    <Text style={styles.entryCompany}>{exp.company}</Text>
                  </View>
                  <View>
                    <Text style={styles.entryDate}>
                      {exp.startDate} – {exp.endDate}
                    </Text>
                    {exp.location && (
                      <Text style={styles.entryLocation}>{exp.location}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.bulletList}>
                  {exp.bullets.map((bullet, bulletIdx) => (
                    <View key={bulletIdx} style={styles.bulletItem}>
                      <Text style={styles.bulletPoint}>•</Text>
                      <Text style={styles.bulletText}>{bullet}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>Education</Text>
            </View>
            {data.education.map((edu, idx) => (
              <View key={idx} style={styles.educationEntry}>
                <View style={styles.entryHeader}>
                  <View>
                    <Text style={styles.degree}>{edu.degree}</Text>
                    <Text style={styles.school}>
                      {edu.school}
                      {edu.gpa ? ` • GPA: ${edu.gpa}` : ''}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.entryDate}>{edu.graduationDate}</Text>
                    {edu.location && (
                      <Text style={styles.entryLocation}>{edu.location}</Text>
                    )}
                  </View>
                </View>
                {edu.highlights && edu.highlights.length > 0 && (
                  <View style={styles.bulletList}>
                    {edu.highlights.map((h, hIdx) => (
                      <View key={hIdx} style={styles.bulletItem}>
                        <Text style={styles.bulletPoint}>•</Text>
                        <Text style={styles.bulletText}>{h}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>Skills</Text>
            </View>
            {data.skills.map((skillGroup, idx) => (
              <View key={idx} style={styles.skillCategory}>
                {skillGroup.category && (
                  <Text style={styles.skillCategoryTitle}>{skillGroup.category}:</Text>
                )}
                <View style={styles.skillsContainer}>
                  {skillGroup.items.map((skill, skillIdx) => (
                    <Text
                      key={skillIdx}
                      style={
                        skillGroup.highlighted?.includes(skill)
                          ? styles.skillTagHighlight
                          : styles.skillTag
                      }
                    >
                      {skill}
                    </Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>Projects</Text>
            </View>
            {data.projects.map((project, idx) => (
              <View key={idx} style={styles.entry}>
                <Text style={styles.entryTitle}>{project.name}</Text>
                <Text style={styles.bulletText}>{project.description}</Text>
                {project.bullets && project.bullets.length > 0 && (
                  <View style={styles.bulletList}>
                    {project.bullets.map((bullet, bulletIdx) => (
                      <View key={bulletIdx} style={styles.bulletItem}>
                        <Text style={styles.bulletPoint}>•</Text>
                        <Text style={styles.bulletText}>{bullet}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Certifications */}
        {data.certifications && data.certifications.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>Certifications</Text>
            </View>
            <View style={styles.bulletList}>
              {data.certifications.map((cert, idx) => (
                <View key={idx} style={styles.bulletItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.bulletText}>{cert}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Footer */}
        {showBranding && (
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Generated on {new Date().toLocaleDateString()}
            </Text>
            <Text style={styles.footerBrand}>
              Optimized by PixelPear AI
            </Text>
          </View>
        )}
      </Page>
    </Document>
  );
}

export default ResumePDF;


