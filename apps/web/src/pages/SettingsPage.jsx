import { Bell, Download, MapPin, Mic, ShieldCheck, Wifi } from "lucide-react";
import { useState } from "react";
import { useChatStore } from "../store/chatStore.js";

export default function SettingsPage() {
  const socketState = useChatStore((state) => state.socketState);
  const [permissionState, setPermissionState] = useState({
    notifications: "idle",
    microphone: "idle",
    location: "idle"
  });

  async function requestNotifications() {
    if (!("Notification" in window)) {
      setPermissionState((prev) => ({ ...prev, notifications: "unsupported" }));
      return;
    }
    const value = await Notification.requestPermission();
    setPermissionState((prev) => ({ ...prev, notifications: value }));
  }

  async function requestMicrophone() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setPermissionState((prev) => ({ ...prev, microphone: "granted" }));
    } catch {
      setPermissionState((prev) => ({ ...prev, microphone: "blocked" }));
    }
  }

  function requestLocation() {
    if (!navigator.geolocation) {
      setPermissionState((prev) => ({ ...prev, location: "unsupported" }));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => setPermissionState((prev) => ({ ...prev, location: "granted" })),
      () => setPermissionState((prev) => ({ ...prev, location: "blocked" })),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-panel">
      <header className="border-b border-border-soft px-6 py-4">
        <h2 className="text-lg font-semibold">Settings</h2>
        <p className="text-sm text-text-muted">Connection, permissions, downloads, and privacy preferences.</p>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto grid max-w-3xl gap-4">
          <div className="glass-surface rounded-3xl border border-border-soft p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <Wifi className="mt-1 h-5 w-5 text-accent" />
              <div>
                <p className="font-semibold">WebSocket connection</p>
                <p className="mt-1 text-sm text-text-muted">
                  Current real-time state: <span className="font-medium text-text-main">{socketState}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="glass-surface rounded-3xl border border-border-soft p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <Bell className="mt-1 h-5 w-5 text-accent" />
              <div>
                <p className="font-semibold">Notifications</p>
                <p className="mt-1 text-sm text-text-muted">
                  Permission state: <span className="font-medium text-text-main">{permissionState.notifications}</span>
                </p>
                <button
                  type="button"
                  onClick={requestNotifications}
                  className="mt-3 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white"
                >
                  Enable notifications
                </button>
              </div>
            </div>
          </div>

          <div className="glass-surface rounded-3xl border border-border-soft p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <Mic className="mt-1 h-5 w-5 text-accent" />
              <div>
                <p className="font-semibold">Microphone</p>
                <p className="mt-1 text-sm text-text-muted">
                  Permission state: <span className="font-medium text-text-main">{permissionState.microphone}</span>
                </p>
                <button
                  type="button"
                  onClick={requestMicrophone}
                  className="mt-3 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white"
                >
                  Allow microphone
                </button>
              </div>
            </div>
          </div>

          <div className="glass-surface rounded-3xl border border-border-soft p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 h-5 w-5 text-accent" />
              <div>
                <p className="font-semibold">Location sharing</p>
                <p className="mt-1 text-sm text-text-muted">
                  Permission state: <span className="font-medium text-text-main">{permissionState.location}</span>
                </p>
                <button
                  type="button"
                  onClick={requestLocation}
                  className="mt-3 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white"
                >
                  Allow location
                </button>
              </div>
            </div>
          </div>

          <div className="glass-surface rounded-3xl border border-border-soft p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <Download className="mt-1 h-5 w-5 text-accent" />
              <div>
                <p className="font-semibold">Install and APK</p>
                <p className="mt-1 text-sm text-text-muted">
                  The footer install button supports PWA install. The APK button becomes active once a real APK URL is attached.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-surface rounded-3xl border border-border-soft p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-1 h-5 w-5 text-accent" />
              <div>
                <p className="font-semibold">Client-side resilience</p>
                <p className="mt-1 text-sm text-text-muted">
                  Chats are cached locally for faster startup and better offline fallback behavior.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
