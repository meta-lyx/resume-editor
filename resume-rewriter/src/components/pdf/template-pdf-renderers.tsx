import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Link,
} from '@react-pdf/renderer';
import type { ResumeData } from './resume-pdf-template';

// Disable hyphenation
Font.registerHyphenationCallback((word: string) => [word]);

// ============================================================
// TEMPLATE 1: CLASSIC EXECUTIVE
// Elegant serif design with gold accents, traditional corporate style
// ============================================================
const classicColors = {
  primary: '#1E3A5F',
  accent: '#C49A3D',
  text: '#1F2937',
  textLight: '#6B7280',
  border: '#D1D5DB',
  background: '#FFFFFF',
};

const classicStyles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: classicColors.background,
    padding: 50,
    fontFamily: 'Times-Roman',
  },
  header: {
    marginBottom: 25,
    borderBottomWidth: 3,
    borderBottomColor: classicColors.accent,
    paddingBottom: 20,
    alignItems: 'center',
  },
  name: {
    fontSize: 28,
    fontFamily: 'Times-Bold',
    color: classicColors.primary,
    marginBottom: 6,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 12,
    color: classicColors.textLight,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 15,
    marginTop: 12,
  },
  contactItem: {
    fontSize: 9,
    color: classicColors.text,
  },
  contactLink: {
    fontSize: 9,
    color: classicColors.primary,
    textDecoration: 'none',
  },
  section: {
    marginBottom: 18,
  },
  sectionHeader: {
    borderBottomWidth: 1,
    borderBottomColor: classicColors.border,
    marginBottom: 12,
    paddingBottom: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Times-Bold',
    color: classicColors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  entry: {
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  entryTitle: {
    fontSize: 11,
    fontFamily: 'Times-Bold',
    color: classicColors.text,
  },
  entryCompany: {
    fontSize: 10,
    fontFamily: 'Times-Italic',
    color: classicColors.accent,
  },
  entryDate: {
    fontSize: 9,
    color: classicColors.textLight,
    textAlign: 'right',
  },
  bulletList: {
    marginTop: 4,
    paddingLeft: 10,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  bulletPoint: {
    width: 12,
    fontSize: 9,
    color: classicColors.accent,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    color: classicColors.text,
    lineHeight: 1.5,
  },
  summary: {
    fontSize: 10,
    color: classicColors.text,
    lineHeight: 1.6,
    textAlign: 'justify',
    fontFamily: 'Times-Italic',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    fontSize: 9,
    color: classicColors.text,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: classicColors.border,
    borderRadius: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    borderTopWidth: 1,
    borderTopColor: classicColors.border,
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 7,
    color: classicColors.textLight,
  },
});

export function ClassicExecutivePDF({ data, showBranding = true }: { data: ResumeData; showBranding?: boolean }) {
  return (
    <Document>
      <Page size="A4" style={classicStyles.page}>
        <View style={classicStyles.header}>
          <Text style={classicStyles.name}>{data.name}</Text>
          {data.title && <Text style={classicStyles.title}>{data.title}</Text>}
          <View style={classicStyles.contactRow}>
            {data.contact.email && (
              <Link src={`mailto:${data.contact.email}`} style={classicStyles.contactLink}>
                {data.contact.email}
              </Link>
            )}
            {data.contact.phone && <Text style={classicStyles.contactItem}>• {data.contact.phone}</Text>}
            {data.contact.location && <Text style={classicStyles.contactItem}>• {data.contact.location}</Text>}
            {data.contact.linkedin && <Link src={data.contact.linkedin} style={classicStyles.contactLink}>• LinkedIn</Link>}
          </View>
        </View>

        {data.summary && (
          <View style={classicStyles.section}>
            <View style={classicStyles.sectionHeader}>
              <Text style={classicStyles.sectionTitle}>Professional Summary</Text>
            </View>
            <Text style={classicStyles.summary}>{data.summary}</Text>
          </View>
        )}

        {data.experience.length > 0 && (
          <View style={classicStyles.section}>
            <View style={classicStyles.sectionHeader}>
              <Text style={classicStyles.sectionTitle}>Professional Experience</Text>
            </View>
            {data.experience.map((exp, idx) => (
              <View key={idx} style={classicStyles.entry}>
                <View style={classicStyles.entryHeader}>
                  <View>
                    <Text style={classicStyles.entryTitle}>{exp.title}</Text>
                    <Text style={classicStyles.entryCompany}>{exp.company}</Text>
                  </View>
                  <Text style={classicStyles.entryDate}>{exp.startDate} – {exp.endDate}</Text>
                </View>
                <View style={classicStyles.bulletList}>
                  {exp.bullets.map((bullet, bulletIdx) => (
                    <View key={bulletIdx} style={classicStyles.bulletItem}>
                      <Text style={classicStyles.bulletPoint}>◆</Text>
                      <Text style={classicStyles.bulletText}>{bullet}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {data.education.length > 0 && (
          <View style={classicStyles.section}>
            <View style={classicStyles.sectionHeader}>
              <Text style={classicStyles.sectionTitle}>Education</Text>
            </View>
            {data.education.map((edu, idx) => (
              <View key={idx} style={classicStyles.entry}>
                <View style={classicStyles.entryHeader}>
                  <View>
                    <Text style={classicStyles.entryTitle}>{edu.degree}</Text>
                    <Text style={classicStyles.entryCompany}>{edu.school}</Text>
                  </View>
                  <Text style={classicStyles.entryDate}>{edu.graduationDate}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {data.skills.length > 0 && (
          <View style={classicStyles.section}>
            <View style={classicStyles.sectionHeader}>
              <Text style={classicStyles.sectionTitle}>Core Competencies</Text>
            </View>
            <View style={classicStyles.skillsContainer}>
              {data.skills.flatMap(group => group.items).map((skill, idx) => (
                <Text key={idx} style={classicStyles.skillTag}>{skill}</Text>
              ))}
            </View>
          </View>
        )}

        {showBranding && (
          <View style={classicStyles.footer}>
            <Text style={classicStyles.footerText}>Optimized by PixelPear AI</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}

// ============================================================
// TEMPLATE 2: MODERN MINIMAL
// Clean sans-serif design with emerald accents, contemporary feel
// ============================================================
const modernColors = {
  primary: '#0F172A',
  accent: '#10B981',
  text: '#334155',
  textLight: '#94A3B8',
  border: '#E2E8F0',
  background: '#FFFFFF',
  accentLight: '#ECFDF5',
};

const modernStyles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: modernColors.background,
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: modernColors.accent,
  },
  name: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    color: modernColors.primary,
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    color: modernColors.accent,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  contactItem: {
    fontSize: 9,
    color: modernColors.textLight,
  },
  contactLink: {
    fontSize: 9,
    color: modernColors.accent,
    textDecoration: 'none',
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionAccent: {
    width: 4,
    height: 16,
    backgroundColor: modernColors.accent,
    marginRight: 10,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: modernColors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  entry: {
    marginBottom: 14,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  entryTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: modernColors.primary,
  },
  entryCompany: {
    fontSize: 10,
    color: modernColors.accent,
    fontFamily: 'Helvetica-Bold',
  },
  entryDate: {
    fontSize: 9,
    color: modernColors.textLight,
  },
  bulletList: {
    marginTop: 6,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bulletPoint: {
    width: 14,
    fontSize: 9,
    color: modernColors.accent,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    color: modernColors.text,
    lineHeight: 1.5,
  },
  summary: {
    fontSize: 10,
    color: modernColors.text,
    lineHeight: 1.6,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillTag: {
    fontSize: 8,
    color: modernColors.accent,
    backgroundColor: modernColors.accentLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: modernColors.border,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: modernColors.textLight,
  },
  footerBrand: {
    fontSize: 7,
    color: modernColors.accent,
  },
});

export function ModernMinimalPDF({ data, showBranding = true }: { data: ResumeData; showBranding?: boolean }) {
  return (
    <Document>
      <Page size="A4" style={modernStyles.page}>
        <View style={modernStyles.header}>
          <Text style={modernStyles.name}>{data.name}</Text>
          {data.title && <Text style={modernStyles.title}>{data.title}</Text>}
          <View style={modernStyles.contactRow}>
            {data.contact.email && (
              <Link src={`mailto:${data.contact.email}`} style={modernStyles.contactLink}>
                {data.contact.email}
              </Link>
            )}
            {data.contact.phone && <Text style={modernStyles.contactItem}>{data.contact.phone}</Text>}
            {data.contact.location && <Text style={modernStyles.contactItem}>{data.contact.location}</Text>}
            {data.contact.linkedin && <Link src={data.contact.linkedin} style={modernStyles.contactLink}>LinkedIn</Link>}
            {data.contact.github && <Link src={data.contact.github} style={modernStyles.contactLink}>GitHub</Link>}
          </View>
        </View>

        {data.summary && (
          <View style={modernStyles.section}>
            <View style={modernStyles.sectionHeader}>
              <View style={modernStyles.sectionAccent} />
              <Text style={modernStyles.sectionTitle}>About</Text>
            </View>
            <Text style={modernStyles.summary}>{data.summary}</Text>
          </View>
        )}

        {data.experience.length > 0 && (
          <View style={modernStyles.section}>
            <View style={modernStyles.sectionHeader}>
              <View style={modernStyles.sectionAccent} />
              <Text style={modernStyles.sectionTitle}>Experience</Text>
            </View>
            {data.experience.map((exp, idx) => (
              <View key={idx} style={modernStyles.entry}>
                <View style={modernStyles.entryHeader}>
                  <View>
                    <Text style={modernStyles.entryTitle}>{exp.title}</Text>
                    <Text style={modernStyles.entryCompany}>{exp.company}</Text>
                  </View>
                  <Text style={modernStyles.entryDate}>{exp.startDate} – {exp.endDate}</Text>
                </View>
                <View style={modernStyles.bulletList}>
                  {exp.bullets.map((bullet, bulletIdx) => (
                    <View key={bulletIdx} style={modernStyles.bulletItem}>
                      <Text style={modernStyles.bulletPoint}>→</Text>
                      <Text style={modernStyles.bulletText}>{bullet}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {data.education.length > 0 && (
          <View style={modernStyles.section}>
            <View style={modernStyles.sectionHeader}>
              <View style={modernStyles.sectionAccent} />
              <Text style={modernStyles.sectionTitle}>Education</Text>
            </View>
            {data.education.map((edu, idx) => (
              <View key={idx} style={modernStyles.entry}>
                <View style={modernStyles.entryHeader}>
                  <View>
                    <Text style={modernStyles.entryTitle}>{edu.degree}</Text>
                    <Text style={modernStyles.entryCompany}>{edu.school}</Text>
                  </View>
                  <Text style={modernStyles.entryDate}>{edu.graduationDate}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {data.skills.length > 0 && (
          <View style={modernStyles.section}>
            <View style={modernStyles.sectionHeader}>
              <View style={modernStyles.sectionAccent} />
              <Text style={modernStyles.sectionTitle}>Skills</Text>
            </View>
            <View style={modernStyles.skillsGrid}>
              {data.skills.flatMap(group => group.items).map((skill, idx) => (
                <Text key={idx} style={modernStyles.skillTag}>{skill}</Text>
              ))}
            </View>
          </View>
        )}

        {showBranding && (
          <View style={modernStyles.footer}>
            <Text style={modernStyles.footerText}>Generated on {new Date().toLocaleDateString()}</Text>
            <Text style={modernStyles.footerBrand}>Optimized by PixelPear AI</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}

// ============================================================
// TEMPLATE 3: CREATIVE SIDEBAR
// Bold two-column design with striking sidebar
// ============================================================
const creativeColors = {
  primary: '#6D28D9',
  accent: '#F472B6',
  text: '#1F2937',
  textLight: '#6B7280',
  textOnDark: '#F3F4F6',
  border: '#E5E7EB',
  background: '#FFFFFF',
  sidebarBg: '#6D28D9',
};

const creativeStyles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: creativeColors.background,
    fontFamily: 'Helvetica',
  },
  sidebar: {
    width: '35%',
    backgroundColor: creativeColors.sidebarBg,
    padding: 30,
    color: creativeColors.textOnDark,
  },
  mainContent: {
    width: '65%',
    padding: 35,
  },
  sidebarName: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  sidebarTitle: {
    fontSize: 10,
    color: creativeColors.accent,
    marginBottom: 25,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sidebarSection: {
    marginBottom: 20,
  },
  sidebarSectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: creativeColors.accent,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contactItem: {
    fontSize: 8,
    color: creativeColors.textOnDark,
    marginBottom: 6,
    opacity: 0.9,
  },
  contactLink: {
    fontSize: 8,
    color: creativeColors.accent,
    textDecoration: 'none',
    marginBottom: 6,
  },
  skillItem: {
    fontSize: 9,
    color: creativeColors.textOnDark,
    marginBottom: 4,
    paddingLeft: 8,
    opacity: 0.9,
  },
  skillDot: {
    color: creativeColors.accent,
    marginRight: 6,
  },
  mainSection: {
    marginBottom: 18,
  },
  mainSectionTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: creativeColors.primary,
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: creativeColors.accent,
    paddingBottom: 4,
  },
  entry: {
    marginBottom: 14,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  entryTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: creativeColors.text,
  },
  entryCompany: {
    fontSize: 10,
    color: creativeColors.primary,
  },
  entryDate: {
    fontSize: 8,
    color: creativeColors.textLight,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  bulletList: {
    marginTop: 6,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  bulletPoint: {
    width: 10,
    fontSize: 9,
    color: creativeColors.accent,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    color: creativeColors.text,
    lineHeight: 1.4,
  },
  summary: {
    fontSize: 10,
    color: creativeColors.text,
    lineHeight: 1.5,
    marginBottom: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    right: 35,
    fontSize: 7,
    color: creativeColors.textLight,
  },
});

export function CreativeSidebarPDF({ data, showBranding = true }: { data: ResumeData; showBranding?: boolean }) {
  return (
    <Document>
      <Page size="A4" style={creativeStyles.page}>
        {/* Sidebar */}
        <View style={creativeStyles.sidebar}>
          <Text style={creativeStyles.sidebarName}>{data.name}</Text>
          {data.title && <Text style={creativeStyles.sidebarTitle}>{data.title}</Text>}

          <View style={creativeStyles.sidebarSection}>
            <Text style={creativeStyles.sidebarSectionTitle}>Contact</Text>
            {data.contact.email && (
              <Link src={`mailto:${data.contact.email}`} style={creativeStyles.contactLink}>
                ✉ {data.contact.email}
              </Link>
            )}
            {data.contact.phone && <Text style={creativeStyles.contactItem}>☎ {data.contact.phone}</Text>}
            {data.contact.location && <Text style={creativeStyles.contactItem}>◉ {data.contact.location}</Text>}
            {data.contact.linkedin && (
              <Link src={data.contact.linkedin} style={creativeStyles.contactLink}>⬡ LinkedIn</Link>
            )}
            {data.contact.github && (
              <Link src={data.contact.github} style={creativeStyles.contactLink}>⬡ GitHub</Link>
            )}
          </View>

          {data.skills.length > 0 && (
            <View style={creativeStyles.sidebarSection}>
              <Text style={creativeStyles.sidebarSectionTitle}>Skills</Text>
              {data.skills.flatMap(group => group.items).slice(0, 12).map((skill, idx) => (
                <Text key={idx} style={creativeStyles.skillItem}>
                  <Text style={creativeStyles.skillDot}>●</Text> {skill}
                </Text>
              ))}
            </View>
          )}

          {data.education.length > 0 && (
            <View style={creativeStyles.sidebarSection}>
              <Text style={creativeStyles.sidebarSectionTitle}>Education</Text>
              {data.education.map((edu, idx) => (
                <View key={idx} style={{ marginBottom: 8 }}>
                  <Text style={{ fontSize: 9, color: '#FFFFFF', fontFamily: 'Helvetica-Bold' }}>{edu.degree}</Text>
                  <Text style={{ fontSize: 8, color: creativeColors.accent }}>{edu.school}</Text>
                  <Text style={{ fontSize: 8, color: creativeColors.textOnDark, opacity: 0.8 }}>{edu.graduationDate}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Main Content */}
        <View style={creativeStyles.mainContent}>
          {data.summary && (
            <View style={creativeStyles.mainSection}>
              <Text style={creativeStyles.mainSectionTitle}>Profile</Text>
              <Text style={creativeStyles.summary}>{data.summary}</Text>
            </View>
          )}

          {data.experience.length > 0 && (
            <View style={creativeStyles.mainSection}>
              <Text style={creativeStyles.mainSectionTitle}>Experience</Text>
              {data.experience.map((exp, idx) => (
                <View key={idx} style={creativeStyles.entry}>
                  <View style={creativeStyles.entryHeader}>
                    <View>
                      <Text style={creativeStyles.entryTitle}>{exp.title}</Text>
                      <Text style={creativeStyles.entryCompany}>{exp.company}</Text>
                    </View>
                    <Text style={creativeStyles.entryDate}>{exp.startDate} - {exp.endDate}</Text>
                  </View>
                  <View style={creativeStyles.bulletList}>
                    {exp.bullets.map((bullet, bulletIdx) => (
                      <View key={bulletIdx} style={creativeStyles.bulletItem}>
                        <Text style={creativeStyles.bulletPoint}>▸</Text>
                        <Text style={creativeStyles.bulletText}>{bullet}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}

          {data.projects && data.projects.length > 0 && (
            <View style={creativeStyles.mainSection}>
              <Text style={creativeStyles.mainSectionTitle}>Projects</Text>
              {data.projects.map((project, idx) => (
                <View key={idx} style={creativeStyles.entry}>
                  <Text style={creativeStyles.entryTitle}>{project.name}</Text>
                  <Text style={creativeStyles.summary}>{project.description}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {showBranding && (
          <Text style={creativeStyles.footer}>Optimized by PixelPear AI</Text>
        )}
      </Page>
    </Document>
  );
}

// ============================================================
// TEMPLATE 4: TECH MODERN
// Developer-focused with clean lines and monospace elements
// ============================================================
const techColors = {
  primary: '#0D1117',
  accent: '#22D3EE',
  accentSecondary: '#3B82F6',
  text: '#24292F',
  textLight: '#57606A',
  border: '#D0D7DE',
  background: '#FFFFFF',
  codeBg: '#F6F8FA',
};

const techStyles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: techColors.background,
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: techColors.border,
  },
  topBar: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  terminalDots: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  name: {
    fontSize: 28,
    fontFamily: 'Courier-Bold',
    color: techColors.primary,
    marginBottom: 4,
  },
  title: {
    fontSize: 12,
    color: techColors.accent,
    fontFamily: 'Courier',
    marginBottom: 10,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  contactItem: {
    fontSize: 9,
    color: techColors.textLight,
    fontFamily: 'Courier',
  },
  contactLink: {
    fontSize: 9,
    color: techColors.accentSecondary,
    textDecoration: 'none',
    fontFamily: 'Courier',
  },
  section: {
    marginBottom: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionPrefix: {
    fontSize: 10,
    color: techColors.accent,
    fontFamily: 'Courier-Bold',
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: techColors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  entry: {
    marginBottom: 14,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: techColors.accent,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  entryTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: techColors.primary,
  },
  entryCompany: {
    fontSize: 10,
    color: techColors.accentSecondary,
  },
  entryDate: {
    fontSize: 8,
    color: techColors.textLight,
    fontFamily: 'Courier',
    backgroundColor: techColors.codeBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  bulletList: {
    marginTop: 6,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  bulletPoint: {
    width: 16,
    fontSize: 9,
    color: techColors.accent,
    fontFamily: 'Courier',
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    color: techColors.text,
    lineHeight: 1.5,
  },
  summary: {
    fontSize: 10,
    color: techColors.text,
    lineHeight: 1.6,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: techColors.accent,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillTag: {
    fontSize: 8,
    color: techColors.primary,
    backgroundColor: techColors.codeBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    fontFamily: 'Courier',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: techColors.border,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: techColors.textLight,
    fontFamily: 'Courier',
  },
});

export function TechModernPDF({ data, showBranding = true }: { data: ResumeData; showBranding?: boolean }) {
  return (
    <Document>
      <Page size="A4" style={techStyles.page}>
        <View style={techStyles.header}>
          <View style={techStyles.terminalDots}>
            <View style={[techStyles.dot, { backgroundColor: '#FF5F56' }]} />
            <View style={[techStyles.dot, { backgroundColor: '#FFBD2E' }]} />
            <View style={[techStyles.dot, { backgroundColor: '#27CA3F' }]} />
          </View>
          <Text style={techStyles.name}>{data.name}</Text>
          {data.title && <Text style={techStyles.title}>{'// '}{data.title}</Text>}
          <View style={techStyles.contactRow}>
            {data.contact.email && (
              <Link src={`mailto:${data.contact.email}`} style={techStyles.contactLink}>
                {data.contact.email}
              </Link>
            )}
            {data.contact.phone && <Text style={techStyles.contactItem}>| {data.contact.phone}</Text>}
            {data.contact.location && <Text style={techStyles.contactItem}>| {data.contact.location}</Text>}
            {data.contact.github && <Link src={data.contact.github} style={techStyles.contactLink}>| GitHub</Link>}
            {data.contact.linkedin && <Link src={data.contact.linkedin} style={techStyles.contactLink}>| LinkedIn</Link>}
          </View>
        </View>

        {data.summary && (
          <View style={techStyles.section}>
            <View style={techStyles.sectionHeader}>
              <Text style={techStyles.sectionPrefix}>##</Text>
              <Text style={techStyles.sectionTitle}>About</Text>
            </View>
            <Text style={techStyles.summary}>{data.summary}</Text>
          </View>
        )}

        {data.experience.length > 0 && (
          <View style={techStyles.section}>
            <View style={techStyles.sectionHeader}>
              <Text style={techStyles.sectionPrefix}>##</Text>
              <Text style={techStyles.sectionTitle}>Experience</Text>
            </View>
            {data.experience.map((exp, idx) => (
              <View key={idx} style={techStyles.entry}>
                <View style={techStyles.entryHeader}>
                  <View>
                    <Text style={techStyles.entryTitle}>{exp.title}</Text>
                    <Text style={techStyles.entryCompany}>@ {exp.company}</Text>
                  </View>
                  <Text style={techStyles.entryDate}>{exp.startDate} → {exp.endDate}</Text>
                </View>
                <View style={techStyles.bulletList}>
                  {exp.bullets.map((bullet, bulletIdx) => (
                    <View key={bulletIdx} style={techStyles.bulletItem}>
                      <Text style={techStyles.bulletPoint}>{'> '}</Text>
                      <Text style={techStyles.bulletText}>{bullet}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {data.education.length > 0 && (
          <View style={techStyles.section}>
            <View style={techStyles.sectionHeader}>
              <Text style={techStyles.sectionPrefix}>##</Text>
              <Text style={techStyles.sectionTitle}>Education</Text>
            </View>
            {data.education.map((edu, idx) => (
              <View key={idx} style={techStyles.entry}>
                <View style={techStyles.entryHeader}>
                  <View>
                    <Text style={techStyles.entryTitle}>{edu.degree}</Text>
                    <Text style={techStyles.entryCompany}>@ {edu.school}</Text>
                  </View>
                  <Text style={techStyles.entryDate}>{edu.graduationDate}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {data.skills.length > 0 && (
          <View style={techStyles.section}>
            <View style={techStyles.sectionHeader}>
              <Text style={techStyles.sectionPrefix}>##</Text>
              <Text style={techStyles.sectionTitle}>Tech Stack</Text>
            </View>
            <View style={techStyles.skillsContainer}>
              {data.skills.flatMap(group => group.items).map((skill, idx) => (
                <Text key={idx} style={techStyles.skillTag}>{skill}</Text>
              ))}
            </View>
          </View>
        )}

        {showBranding && (
          <View style={techStyles.footer}>
            <Text style={techStyles.footerText}>$ generated --by pixelpear-ai</Text>
            <Text style={techStyles.footerText}>{new Date().toISOString().split('T')[0]}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}

// Export type for external use
export type { ResumeData };

