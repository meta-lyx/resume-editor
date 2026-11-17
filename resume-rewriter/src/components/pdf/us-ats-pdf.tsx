// US ATS Standard: the plain, single-column format US recruiters and applicant
// tracking systems read most reliably. US Letter size, black text, standard
// section headings, US dates, no graphics and no branding footer.
import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer';
import { PDF_FONT_FAMILY } from './pdf-fonts';
import type { ResumeData } from './resume-pdf-template';
import { normalizeForUS, usDateRange } from '@/lib/us-resume-format';

const s = StyleSheet.create({
  page: { paddingVertical: 40, paddingHorizontal: 46, fontFamily: PDF_FONT_FAMILY, fontSize: 10, color: '#111111', lineHeight: 1.35 },
  name: { fontSize: 18, fontWeight: 700, textAlign: 'center', lineHeight: 1.2, marginBottom: 4 },
  contact: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', fontSize: 9 },
  contactItem: { color: '#111111', textDecoration: 'none' },
  sep: { marginHorizontal: 5, color: '#555555' },
  section: { marginTop: 10 },
  heading: { fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', borderBottomWidth: 0.75, borderBottomColor: '#111111', paddingBottom: 2, marginBottom: 5 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  strong: { fontWeight: 700 },
  sub: { fontSize: 9.5, color: '#333333' },
  entry: { marginBottom: 6 },
  bullet: { flexDirection: 'row', marginTop: 1.5, paddingLeft: 8 },
  bulletDot: { width: 9 },
  bulletText: { flex: 1 },
});

function Bullets({ items }: { items?: string[] }) {
  if (!items?.length) return null;
  return (
    <>
      {items.map((b, i) => (
        <View key={i} style={s.bullet} wrap={false}>
          <Text style={s.bulletDot}>•</Text>
          <Text style={s.bulletText}>{b}</Text>
        </View>
      ))}
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.section}>
      <Text style={s.heading}>{title}</Text>
      {children}
    </View>
  );
}

export function USAtsPDF({ data: raw }: { data: ResumeData; showBranding?: boolean }) {
  const data = normalizeForUS(raw);
  const c = data.contact || {};
  const contactParts: { text: string; href?: string }[] = [
    c.location ? { text: c.location } : null,
    c.phone ? { text: c.phone } : null,
    c.email ? { text: c.email, href: `mailto:${c.email}` } : null,
    c.linkedin ? { text: c.linkedin.replace(/^https?:\/\/(www\.)?/, ''), href: c.linkedin.startsWith('http') ? c.linkedin : `https://${c.linkedin}` } : null,
    c.github ? { text: c.github.replace(/^https?:\/\/(www\.)?/, ''), href: c.github.startsWith('http') ? c.github : `https://${c.github}` } : null,
    c.website ? { text: c.website.replace(/^https?:\/\/(www\.)?/, ''), href: c.website.startsWith('http') ? c.website : `https://${c.website}` } : null,
  ].filter(Boolean) as { text: string; href?: string }[];

  return (
    <Document title={`${data.name} Resume`} author={data.name}>
      <Page size="LETTER" style={s.page}>
        <Text style={s.name}>{data.name}</Text>
        {contactParts.length > 0 && (
          <View style={s.contact}>
            {contactParts.map((p, i) => (
              <View key={i} style={{ flexDirection: 'row' }}>
                {i > 0 && <Text style={s.sep}>|</Text>}
                {p.href ? <Link src={p.href} style={s.contactItem}>{p.text}</Link> : <Text>{p.text}</Text>}
              </View>
            ))}
          </View>
        )}

        {data.summary && (
          <Section title="Summary">
            <Text>{data.summary}</Text>
          </Section>
        )}

        {data.experience.length > 0 && (
          <Section title="Experience">
            {data.experience.map((e, i) => (
              <View key={i} style={s.entry}>
                <View style={s.row} wrap={false}>
                  <Text style={s.strong}>{e.title}</Text>
                  <Text>{usDateRange(e.startDate, e.endDate)}</Text>
                </View>
                <Text style={s.sub}>{[e.company, e.location].filter(Boolean).join(' · ')}</Text>
                <Bullets items={e.bullets} />
              </View>
            ))}
          </Section>
        )}

        {data.projects && data.projects.length > 0 && (
          <Section title="Projects">
            {data.projects.map((p, i) => (
              <View key={i} style={s.entry}>
                <Text>
                  <Text style={s.strong}>{p.name}</Text>
                  {p.technologies?.length ? <Text style={s.sub}>{`  |  ${p.technologies.join(', ')}`}</Text> : null}
                </Text>
                {p.description && <Text>{p.description}</Text>}
                <Bullets items={p.bullets} />
              </View>
            ))}
          </Section>
        )}

        {data.education.length > 0 && (
          <Section title="Education">
            {data.education.map((e, i) => (
              <View key={i} style={s.entry} wrap={false}>
                <View style={s.row}>
                  <Text style={s.strong}>{e.school}</Text>
                  <Text>{e.graduationDate}</Text>
                </View>
                <Text style={s.sub}>{[e.degree, e.location, e.gpa ? `GPA: ${e.gpa}` : ''].filter(Boolean).join(' · ')}</Text>
                <Bullets items={e.highlights} />
              </View>
            ))}
          </Section>
        )}

        {data.skills?.length > 0 && (
          <Section title="Skills">
            {data.skills.map((g, i) => (
              <Text key={i} style={{ marginBottom: 1.5 }}>
                {g.category ? <Text style={s.strong}>{`${g.category}: `}</Text> : null}
                {g.items.join(', ')}
              </Text>
            ))}
          </Section>
        )}

        {data.certifications && data.certifications.length > 0 && (
          <Section title="Certifications">
            <Bullets items={data.certifications} />
          </Section>
        )}
      </Page>
    </Document>
  );
}
