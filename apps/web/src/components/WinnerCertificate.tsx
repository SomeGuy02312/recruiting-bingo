import type { RefObject } from "react";

export interface WinnerCertificateProps {
  winnerName: string;
  subtitle?: string;
  summaryLine?: string;
  cardImageUrl?: string | null;
  footerLinkUrl?: string;
  footerLinkLabel?: string;
  certificateRef?: RefObject<HTMLDivElement | null> | null;
  highlightEmoji?: string;
}

const DEFAULT_SUBTITLE = "Awarded for surviving another recruiting cycle.";
const DEFAULT_FOOTER_LINK_URL = "https://bingo.hiregear.us";
const DEFAULT_FOOTER_LINK_LABEL = "bingo.hiregear.us";

export function WinnerCertificate({
  winnerName,
  subtitle = DEFAULT_SUBTITLE,
  summaryLine,
  cardImageUrl,
  footerLinkUrl = DEFAULT_FOOTER_LINK_URL,
  footerLinkLabel = DEFAULT_FOOTER_LINK_LABEL,
  certificateRef,
  highlightEmoji = "🏆",
}: WinnerCertificateProps) {
  return (
    <div
      ref={certificateRef}
      className="bg-[#fdf4e4] rounded-3xl border border-[#f1e1c5] shadow-[0_18px_40px_rgba(15,23,42,0.18)] px-6 py-4 flex flex-col items-center text-center"
    >
      <header className="flex flex-col items-center text-center">
        <div className="mb-0.5 flex justify-center text-3xl" aria-hidden="true">
          {highlightEmoji}
        </div>
        <p className="mb-0.5 text-[11px] uppercase tracking-[0.22em] text-slate-500">RECRUITING BINGO CHAMPION</p>
        <h1 className="mb-0.5 text-3xl font-semibold text-slate-900">{winnerName} is the winner!</h1>
        {subtitle ? <p className="mb-2 text-base text-slate-600">{subtitle}</p> : null}
      </header>

      <div className="mt-4 flex w-full flex-col items-center gap-4">
        {cardImageUrl ? <CapturedCardImage cardImageUrl={cardImageUrl} /> : <CardPlaceholder />}

        {summaryLine ? (
          <p className="mt-3 max-w-xl text-center text-base text-slate-700 mx-auto">{summaryLine}</p>
        ) : null}
        <div className="mt-3 w-full border-t border-[#f0ddbf] pt-2">
          <p className="text-center text-sm text-slate-500">
            Play free at{" "}
            {footerLinkUrl ? (
              <a
                href={footerLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-slate-700 underline-offset-2 hover:underline"
              >
                {footerLinkLabel}
              </a>
            ) : (
              <span className="font-medium text-slate-700">{footerLinkLabel}</span>
            )}
            .
          </p>
        </div>
      </div>
    </div>
  );
}

function CapturedCardImage({ cardImageUrl }: { cardImageUrl: string }) {
  return (
    <div className="flex justify-center">
      <div
        className="inline-flex rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-[0_16px_35px_rgba(15,23,42,0.22)]"
        style={{
          transform: "perspective(900px) rotateX(18deg) rotateZ(8deg) translateY(-4px)",
          transformOrigin: "center",
        }}
      >
        <img src={cardImageUrl} alt="Winning Recruiting Bingo card" className="block h-auto w-[260px] max-w-full rounded-xl" />
      </div>
    </div>
  );
}

function CardPlaceholder() {
  return (
    <div className="flex justify-center">
      <div className="inline-flex rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-[0_16px_35px_rgba(15,23,42,0.22)]">
        <div className="grid grid-cols-5 gap-1 rounded-xl bg-slate-50 p-3">
          {Array.from({ length: 25 }).map((_, index) => (
            <span
              key={index}
              className={
                index === 12
                  ? "h-6 w-6 rounded-full bg-amber-300"
                  : "h-6 w-6 rounded-md border border-slate-200 bg-white"
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
