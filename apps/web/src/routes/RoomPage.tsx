import { useParams } from "react-router-dom";
import { PageShell } from "../components/layout/PageShell";

export function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();

  return (
    <PageShell>
      <div className="flex flex-col gap-4">
        <h2 className="text-3xl font-semibold text-slate-900">Room {roomId}</h2>
        <p className="text-slate-600">Game UI coming soon. This page will handle joining and playing live.</p>
      </div>
    </PageShell>
  );
}
