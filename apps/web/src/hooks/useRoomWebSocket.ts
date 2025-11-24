import { useEffect, useRef, useState } from "react";
import type { ClientMessage, ServerMessage } from "@recruiting-bingo/shared";

type Status = "connecting" | "open" | "closed" | "error";

export function useRoomWebSocket(
  roomId: string,
  playerId: string,
  onMessage: (message: ServerMessage) => void
): { status: Status; sendMessage: (message: ClientMessage) => void } {
  const [status, setStatus] = useState<Status>("connecting");
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!roomId || !playerId) {
      return;
    }

    setStatus("connecting");
    const origin = window.location.origin.replace(/^http/, (match) => (match === "https" ? "wss" : "ws"));
    const url = `${origin.replace(/\/$/, "")}/ws/rooms/${roomId}`;
    console.log("Opening room WebSocket", url);

    const socket = new WebSocket(url);
    socketRef.current = socket;

    const handleOpen = () => {
      console.log("WebSocket open");
      setStatus("open");
    };

    const handleMessage = (event: MessageEvent) => {
      console.log("WebSocket message:", event.data);
      try {
        const data = JSON.parse(event.data as string) as ServerMessage;
        onMessage(data);
      } catch (error) {
        console.warn("Failed to parse server message", error);
      }
    };

    const handleClose = () => {
      console.log("WebSocket closed");
      setStatus("closed");
    };

    const handleError = () => {
      console.log("WebSocket error");
      setStatus("error");
    };

    socket.addEventListener("open", handleOpen);
    socket.addEventListener("message", handleMessage as EventListener);
    socket.addEventListener("close", handleClose);
    socket.addEventListener("error", handleError);

    return () => {
      socket.removeEventListener("open", handleOpen);
      socket.removeEventListener("message", handleMessage as EventListener);
      socket.removeEventListener("close", handleClose);
      socket.removeEventListener("error", handleError);
      socket.close(1000, "component unmounted");
      socketRef.current = null;
    };
  }, [roomId, playerId, onMessage]);

  const sendMessage = (message: ClientMessage) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket not open; ignoring message", message);
    }
  };

  return { status, sendMessage };
}
