import { LegalLayout } from './legal-layout';

export function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="October 25, 2026">
      <p>
        This policy explains what PixelPear collects when you use pixelpear.io, why, who processes it on
        our behalf, and the choices you have. Questions go to{' '}
        <a href="mailto:hello@pixelpear.io">hello@pixelpear.io</a>.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Account details:</strong> your email address and name, and a sign-in session. If you sign
          in with Google, we receive your basic Google profile (name, email, profile image).
        </li>
        <li>
          <strong>Resume content:</strong> the files you upload, the text extracted from them, the job
          descriptions you paste, and the optimized resumes we generate.
        </li>
        <li>
          <strong>Payment records:</strong> which plan you bought and when. Card details are entered on
          Stripe's checkout page and never reach our servers.
        </li>
        <li>
          <strong>Usage data:</strong> pages visited and basic device and browser information, collected
          through Google Analytics with IP anonymization turned on.
        </li>
        <li>
          <strong>Data kept in your browser:</strong> your recent optimization history and sign-in token are
          stored in your browser's local storage. Clearing your browser data removes them.
        </li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To extract text from your resume and tailor it to the job description you provide.</li>
        <li>To run your account, process payments and track the credits you have used.</li>
        <li>To send account emails such as verification and password resets.</li>
        <li>To understand which pages are used so we can improve the product.</li>
      </ul>
      <p>We do not sell your personal information, and we do not use your resume to advertise to you.</p>

      <h2>Service providers</h2>
      <p>We share data only with providers that help run PixelPear, and only what each needs:</p>
      <ul>
        <li>
          <strong>Cloudflare</strong> hosts the site, the database and uploaded resume files.
        </li>
        <li>
          <strong>AI model providers</strong> (DeepSeek, OpenAI or Anthropic, depending on configuration)
          receive your resume text and the job description to generate the optimized version.
        </li>
        <li>
          <strong>Google Cloud Vision</strong> reads text from scanned or image-based PDFs.
        </li>
        <li>
          <strong>Stripe</strong> processes payments.
        </li>
        <li>
          <strong>Resend</strong> delivers account emails.
        </li>
        <li>
          <strong>Google Analytics</strong> measures site usage.
        </li>
      </ul>

      <h2>Your choices</h2>
      <ul>
        <li>
          You can ask us to delete your account, uploaded files and generated resumes by emailing{' '}
          <a href="mailto:hello@pixelpear.io">hello@pixelpear.io</a> from the address on your account.
        </li>
        <li>You can ask for a copy of the personal data we hold about you.</li>
        <li>You can block analytics with a browser extension or your browser's tracking settings.</li>
      </ul>

      <h2>Security</h2>
      <p>
        Data travels over HTTPS. Access to stored data is limited to what is needed to operate the service.
        No system is perfectly secure, so avoid uploading information you would not put on a resume.
      </p>

      <h2>Children</h2>
      <p>PixelPear is not intended for anyone under 16.</p>

      <h2>Changes</h2>
      <p>
        If this policy changes, we will update the date at the top of this page. Significant changes will be
        announced on the site or by email.
      </p>
    </LegalLayout>
  );
}
