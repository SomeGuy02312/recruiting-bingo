import { useParams } from "react-router-dom";
import { PageShell } from "../components/layout/PageShell";

export function WinnerPage() {
  const { roomId, playerId } = useParams<{ roomId: string; playerId: string }>();

  return (
    <PageShell>
      <div className="flex flex-col gap-4">
        <h2 className="text-3xl font-semibold text-slate-900">Winner spotlight</h2>
        <p className="text-slate-600">
          Winner view for <span className="font-medium text-slate-900">{playerId}</span> in room
          <span className="font-medium text-slate-900"> {roomId}</span> – coming soon.
        </p>
      </div>
    </PageShell>
  );
}

export default WinnerPage;
