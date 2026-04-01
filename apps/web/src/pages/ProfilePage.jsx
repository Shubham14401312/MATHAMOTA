import { Camera, Palette, Save, SmilePlus, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { useChatStore } from "../store/chatStore.js";

export default function ProfilePage() {
  const currentUser = useChatStore((state) => state.currentUser);
  const updateCurrentUser = useChatStore((state) => state.updateCurrentUser);
  const [name, setName] = useState(currentUser.name);
  const [status, setStatus] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(currentUser.avatar);
  const emojiChoices = useMemo(
    () => ["\u2764\ufe0f", "\ud83c\udf38", "\u2728", "\ud83e\ude77", "\ud83e\udd8b", "\ud83c\udf80"],
    []
  );

  function handleAvatarUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const avatar = String(reader.result || "");
      setAvatarPreview(avatar);
      updateCurrentUser({ avatar });
      setStatus("Profile photo saved on this device.");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function handleSave() {
    updateCurrentUser({ name: name.trim() || currentUser.name, avatar: avatarPreview });
    setStatus("Profile changes saved.");
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-panel">
      <header className="border-b border-border-soft px-6 py-4">
        <h2 className="text-lg font-semibold">Profile</h2>
        <p className="text-sm text-text-muted">Personal details and quick appearance settings.</p>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto grid max-w-3xl gap-6">
          <div className="glass-surface rounded-3xl border border-border-soft p-6 shadow-sm">
            <div className="flex flex-col gap-5 md:flex-row md:items-center">
              <div className="relative w-fit">
                <img
                  src={avatarPreview}
                  alt={currentUser.name}
                  className="h-24 w-24 rounded-full border border-white/70 object-cover shadow-lg"
                />
                <label className="absolute -bottom-1 -right-1 inline-flex cursor-pointer items-center justify-center rounded-full bg-accent p-2 text-white shadow-lg">
                  <Camera className="h-4 w-4" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                </label>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium uppercase tracking-[0.22em] text-text-muted">Display profile</p>
                <label className="mt-3 block">
                  <span className="mb-2 block text-sm text-text-muted">Display name</span>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="glass-strong w-full rounded-2xl px-4 py-3 outline-none"
                  />
                </label>
                <div className="mt-4 flex flex-wrap gap-2">
                  {emojiChoices.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className="emoji-font glass-strong rounded-2xl px-3 py-2 text-xl"
                      onClick={() => setName((prev) => `${prev} ${emoji}`.trim())}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white"
                  >
                    <Save className="h-4 w-4" />
                    Save profile
                  </button>
                  {status ? <p className="text-sm text-text-muted">{status}</p> : null}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="glass-surface rounded-3xl border border-border-soft p-5 shadow-sm">
              <UserRound className="mb-3 h-6 w-6 text-accent" />
              <p className="font-semibold">Identity</p>
              <p className="mt-2 text-sm text-text-muted">
                Avatar and name stay synced across your chat list and conversation header.
              </p>
            </div>
            <div className="glass-surface rounded-3xl border border-border-soft p-5 shadow-sm">
              <Palette className="mb-3 h-6 w-6 text-accent" />
              <p className="font-semibold">Theme tone</p>
              <p className="mt-2 text-sm text-text-muted">
                The interface now uses a maroon-red glass finish with softer highlights and rounded surfaces.
              </p>
            </div>
            <div className="glass-surface rounded-3xl border border-border-soft p-5 shadow-sm">
              <SmilePlus className="mb-3 h-6 w-6 text-accent" />
              <p className="font-semibold">Emoji-ready</p>
              <p className="mt-2 text-sm text-text-muted">
                Apple emoji rendering is prioritized when supported by the device.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
