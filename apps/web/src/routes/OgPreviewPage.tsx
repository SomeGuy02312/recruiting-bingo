import { WinnerCertificate } from "../components/WinnerCertificate";
import { PageShell } from "../components/layout/PageShell";

// NOTE: This route is used to capture a static OG/social preview image of the winner certificate.
// 1. Run the app locally: npm run dev
// 2. Navigate to http://localhost:5173/og-preview
// 3. Adjust browser zoom so the certificate fits comfortably.
// 4. Take a 1200x630 screenshot of the certificate container only.
// 5. Save it to apps/web/public/og/recruiting-bingo-winner-social.png
// 6. Commit the PNG so it is served at https://bingo.hiregear.us/og/recruiting-bingo-winner-social.png

export function OgPreviewPage() {
  const summaryLine = "Claimed recruiting glory in a fast-paced hiring challenge with the entire team cheering.";

  return (
    <PageShell hideHeader mainClassName="w-full px-4 py-8">
      <div className="flex min-h-screen flex-col items-center gap-6 bg-slate-50 px-6 py-10">
        <div className="max-w-3xl text-center text-sm text-slate-600">
          <p>
            This dedicated preview page renders a generic Recruiting Bingo winner certificate for social media screenshots.
            Follow the instructions below to generate a fresh OG image whenever the design changes.
          </p>
        </div>
        <div className="w-full max-w-5xl rounded-[32px] border border-slate-200 bg-white/70 p-6 shadow-2xl" style={{ width: 1200, height: 630 }}>
          <div className="flex h-full w-full items-center justify-center">
            <div className="w-full max-w-xl">
              <WinnerCertificate winnerName="Recruiting Bingo Champion" summaryLine={summaryLine} />
            </div>
          </div>
        </div>
        <div className="max-w-3xl text-sm text-slate-500">
          <ol className="list-decimal space-y-1 pl-6">
            <li>Run the dev server with <code>npm run dev</code>.</li>
            <li>Open <code>http://localhost:5173/og-preview</code> in a desktop browser.</li>
            <li>Set zoom so the certificate fills the 1200×630 frame without cropping.</li>
            <li>Take a screenshot of only the bordered preview area.</li>
            <li>Save as <code>apps/web/public/og/recruiting-bingo-winner-social.png</code> and commit it.</li>
          </ol>
        </div>
      </div>
    </PageShell>
  );
}

export default OgPreviewPage;
