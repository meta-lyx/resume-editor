import { Link } from 'react-router-dom';
import { LegalLayout } from './legal-layout';

export function TermsPage() {
  return (
    <LegalLayout title="Terms of Use" updated="October 25, 2026">
      <p>
        These terms apply when you use PixelPear at pixelpear.io. By creating an account or using the
        service, you agree to them. Questions go to <a href="mailto:hello@pixelpear.io">hello@pixelpear.io</a>.
      </p>

      <h2>The service</h2>
      <p>
        PixelPear uses AI to rewrite your resume for a specific job description and exports it as a formatted
        document. AI output can contain mistakes. Review every resume before you send it, and make sure it
        describes only experience, skills and credentials you actually have.
      </p>

      <h2>Your account</h2>
      <ul>
        <li>Keep your sign-in details private. You are responsible for activity on your account.</li>
        <li>Give accurate information when you register.</li>
        <li>You must be at least 16 to use PixelPear.</li>
      </ul>

      <h2>Your content</h2>
      <p>
        You keep ownership of the resumes and job descriptions you upload and of the resumes we generate for
        you. You give us permission to store and process that content only to provide the service, as
        described in the <Link to="/privacy">Privacy Policy</Link>.
      </p>
      <p>Only upload content you have the right to use.</p>

      <h2>Payments</h2>
      <ul>
        <li>Plans are sold as one-time purchases at the prices shown on the Pricing page.</li>
        <li>Payments are processed by Stripe.</li>
        <li>
          If something went wrong with a purchase, email us and we will work it out with you.
        </li>
      </ul>

      <h2>Acceptable use</h2>
      <p>Do not use PixelPear to:</p>
      <ul>
        <li>create false or misleading credentials or impersonate someone else;</li>
        <li>upload malware or content that is unlawful;</li>
        <li>overload, probe or interfere with the service, or scrape it with automated tools;</li>
        <li>resell access without our written permission.</li>
      </ul>
      <p>We may suspend accounts that break these rules.</p>

      <h2>No guarantee of results</h2>
      <p>
        PixelPear helps you present your experience. We cannot guarantee interviews, job offers or how any
        applicant tracking system will score your resume. The service is provided "as is", and to the extent
        the law allows, our liability is limited to the amount you paid us in the 12 months before a claim.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms. The date at the top shows the latest version. Continuing to use PixelPear
        after a change means you accept the updated terms.
      </p>
    </LegalLayout>
  );
}
