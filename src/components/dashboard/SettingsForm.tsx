"use client";

import { useState, useRef, type FormEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Camera, FileCheck, Loader2, Check, X, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { COUNTRIES } from "@/lib/currency";
import Select from "@/components/ui/Select";

type Profile = {
  full_name: string;
  email: string;
  company_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  id_document_url: string | null;
  notifications_enabled: boolean;
  role: string;
  skills: string[] | null;
  country: string | null;
  city: string | null;
} | null;

export default function SettingsForm({
  userId,
  initialProfile,
}: {
  userId: string;
  initialProfile: Profile;
}) {
  const router = useRouter();
  const supabase = createClient();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const idInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(initialProfile?.full_name ?? "");
  const [companyName, setCompanyName] = useState(initialProfile?.company_name ?? "");
  const [bio, setBio] = useState(initialProfile?.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatar_url ?? "");
  const [idDocumentUrl, setIdDocumentUrl] = useState(initialProfile?.id_document_url ?? "");
  const [idFileName, setIdFileName] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(initialProfile?.notifications_enabled ?? true);
  const [skills, setSkills] = useState<string[]>(initialProfile?.skills ?? []);
const [skillInput, setSkillInput] = useState("");
const [country, setCountry] = useState(initialProfile?.country ?? "");
const [city, setCity] = useState(initialProfile?.city ?? "");

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [idUploading, setIdUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const initials = (initialProfile?.full_name ?? "U")
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setAvatarUploading(true);

    const ext = file.name.split(".").pop();
    const path = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setError(uploadError.message);
      setAvatarUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

    const { error: saveError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", userId);

    if (saveError) {
      setError(saveError.message);
      setAvatarUploading(false);
      return;
    }

    setAvatarUrl(publicUrl);
    setAvatarUploading(false);
    router.refresh();
  }

  async function handleIdDocumentChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setIdUploading(true);

    const ext = file.name.split(".").pop();
    const path = `${userId}/id-document.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("id-documents")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setError(uploadError.message);
      setIdUploading(false);
      return;
    }

    const { error: saveError } = await supabase
      .from("profiles")
      .update({ id_document_url: path })
      .eq("id", userId);

    if (saveError) {
      setError(saveError.message);
      setIdUploading(false);
      return;
    }

    setIdDocumentUrl(path);
    setIdFileName(file.name);
    setIdUploading(false);
    router.refresh();
  }

  function addSkill() {
    const value = skillInput.trim();
    if (value && !skills.includes(value)) {
      setSkills([...skills, value]);
    }
    setSkillInput("");
  }

  function removeSkill(skill: string) {
    setSkills(skills.filter((s) => s !== skill));
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);

    const { error: updateError } = await supabase
  .from("profiles")
  .update({
    full_name: fullName,
    company_name: companyName,
    bio,
    avatar_url: avatarUrl || null,
    id_document_url: idDocumentUrl || null,
    notifications_enabled: notificationsEnabled,
    skills,
    country: country || null,
    city: city || null,
  })
  .eq("id", userId);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleLogout() {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const inputStyle = {
    borderColor: "var(--line)",
    background: "var(--paper)",
    color: "var(--ink)",
  };

  return (
    <form
      onSubmit={handleSave}
      className="flex flex-col gap-6 rounded-2xl border p-5 sm:p-8"
      style={{ background: "var(--paper)", borderColor: "var(--line)" }}
    >
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center font-semibold text-xl overflow-hidden shrink-0"
          style={{ background: "var(--yellow)", color: "var(--ink)" }}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <div>
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            disabled={avatarUploading}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full border transition hover:bg-[var(--surface)] disabled:opacity-60"
            style={{ borderColor: "var(--line-strong)", color: "var(--ink)" }}
          >
            {avatarUploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
            {avatarUploading ? "Uploading..." : "Change photo"}
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
          <p className="text-xs mt-2" style={{ color: "var(--ink-faint)" }}>
            JPG or PNG, at least 200x200px.
          </p>
        </div>
      </div>

      {/* Full name */}
      <div>
        <label className="text-sm font-medium mb-1 block" style={{ color: "var(--ink)" }}>
          Full name
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border outline-none text-sm"
          style={inputStyle}
        />
      </div>

      {/* Company name */}
      <div>
        <label className="text-sm font-medium mb-1 block" style={{ color: "var(--ink)" }}>
          Company name
        </label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="e.g. Acme Inc."
          className="w-full px-4 py-2.5 rounded-lg border outline-none text-sm"
          style={inputStyle}
        />
      </div>

      {/* ID upload */}
      <div>
        <label className="text-sm font-medium mb-1 block" style={{ color: "var(--ink)" }}>
          ID verification document
        </label>
        <button
          type="button"
          onClick={() => idInputRef.current?.click()}
          disabled={idUploading}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-sm text-left transition hover:bg-[var(--surface)] disabled:opacity-60"
          style={inputStyle}
        >
          {idUploading ? (
            <Loader2 size={16} className="animate-spin shrink-0" style={{ color: "var(--ink-faint)" }} />
          ) : idDocumentUrl ? (
            <FileCheck size={16} className="shrink-0" style={{ color: "var(--good)" }} />
          ) : (
            <FileCheck size={16} className="shrink-0" style={{ color: "var(--ink-faint)" }} />
          )}
          <span style={{ color: idDocumentUrl ? "var(--ink)" : "var(--ink-faint)" }}>
            {idUploading
              ? "Uploading..."
              : idDocumentUrl
              ? idFileName || "Document uploaded"
              : "Upload a government ID (PDF or image)"}
          </span>
        </button>
        <input
          ref={idInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleIdDocumentChange}
          className="hidden"
        />
      </div>

      {/* Bio */}
      <div>
        <label className="text-sm font-medium mb-1 block" style={{ color: "var(--ink)" }}>
          Bio
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="A short introduction about you or your company."
          rows={4}
          className="w-full px-4 py-2.5 rounded-lg border outline-none text-sm resize-none"
          style={inputStyle}
        />
      </div>

      {/* Country / City */}
<div className="grid sm:grid-cols-2 gap-4">
  <div>
    <label className="text-sm font-medium mb-1 block" style={{ color: "var(--ink)" }}>
      Country
    </label>
    <Select
      value={country}
      onChange={setCountry}
      options={COUNTRIES.map((c) => ({ value: c.name, label: c.name }))}
      placeholder="Select country"
      searchable
    />
  </div>
  <div>
    <label className="text-sm font-medium mb-1 block" style={{ color: "var(--ink)" }}>
      City
    </label>
    <input
      type="text"
      value={city}
      onChange={(e) => setCity(e.target.value)}
      placeholder="e.g. Mumbai"
      className="w-full px-4 py-2.5 rounded-lg border outline-none text-sm"
      style={inputStyle}
    />
  </div>
</div>

      {/* Skills (freelancer only) */}
      {initialProfile?.role === "freelancer" && (
        <div>
          <label className="text-sm font-medium mb-1 block" style={{ color: "var(--ink)" }}>
            Skills
          </label>
          <div
            className="flex flex-wrap gap-2 px-3 py-2 rounded-lg border"
            style={inputStyle}
          >
            {skills.map((skill) => (
              <span
                key={skill}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                style={{ background: "var(--surface-yellow)", color: "var(--yellow-deep)" }}
              >
                {skill}
                <button type="button" onClick={() => removeSkill(skill)}>
                  <X size={12} />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addSkill();
                }
              }}
              onBlur={addSkill}
              placeholder={skills.length === 0 ? "Type a skill and press Enter" : "Add another"}
              className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
              style={{ color: "var(--ink)" }}
            />
          </div>
        </div>
      )}

      {/* Notifications toggle */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--ink)" }}>
            Notifications
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--ink-faint)" }}>
            Get notified about new proposals and messages.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setNotificationsEnabled(!notificationsEnabled)}
          className="w-12 h-7 rounded-full relative transition shrink-0"
          style={{ background: notificationsEnabled ? "var(--yellow)" : "var(--line-strong)" }}
        >
          <span
            className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition"
            style={{ transform: notificationsEnabled ? "translateX(20px)" : "translateX(0)" }}
          />
        </button>
      </div>

      {error && (
        <p className="text-sm px-3 py-2 rounded-lg" style={{ background: "var(--bad-soft)", color: "var(--bad)" }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full py-3 rounded-full font-semibold flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-60"
        style={{ background: "var(--yellow)", color: "var(--ink)" }}
      >
        {saving && <Loader2 size={16} className="animate-spin" />}
        {saved && <Check size={16} />}
        {saving ? "Saving..." : saved ? "Saved" : "Save changes"}
      </button>

      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="w-full py-3 rounded-full font-semibold flex items-center justify-center gap-2 border transition hover:bg-[var(--bad-soft)] disabled:opacity-60"
        style={{ borderColor: "var(--bad)", color: "var(--bad)" }}
      >
        {loggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
        {loggingOut ? "Logging out..." : "Log out"}
      </button>
    </form>
  );
}