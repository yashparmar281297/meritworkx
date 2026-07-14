"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { DURATION_OPTIONS, COMMITMENT_OPTIONS, RATE_TYPE_OPTIONS } from "@/lib/projectOptions";
import Select from "@/components/ui/Select";

export default function NewProjectPage() {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [rateType, setRateType] = useState<"fixed" | "range">("fixed");
  const [rateMin, setRateMin] = useState("");
  const [rateMax, setRateMax] = useState("");
  const [commitment, setCommitment] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function addSkill() {
    const value = skillInput.trim();
    if (value && !skills.includes(value)) {
      setSkills([...skills, value]);
    }
    setSkillInput("");
  }

  function handleSkillKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    }
  }

  function removeSkill(skill: string) {
    setSkills(skills.filter((s) => s !== skill));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!title || !description || !duration || !rateMin || !commitment) {
      setError("Please fill in all fields.");
      return;
    }
    if (rateType === "range" && !rateMax) {
      setError("Please enter both a minimum and maximum rate.");
      return;
    }
    if (rateType === "range" && Number(rateMax) <= Number(rateMin)) {
      setError("Maximum rate must be greater than minimum rate.");
      return;
    }
    if (skills.length === 0) {
      setError("Please add at least one skill.");
      return;
    }

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be logged in.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("projects").insert({
      client_id: user.id,
      title,
      description,
      rate_type: rateType,
      budget_min: Number(rateMin),
      budget_max: rateType === "range" ? Number(rateMax) : Number(rateMin),
      duration,
      weekly_commitment: commitment,
      skills,
      status: "open",
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard/client/projects");
  }

  const inputStyle = {
    borderColor: "var(--line)",
    background: "var(--paper)",
    color: "var(--ink)",
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <h1 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: "var(--ink)" }}>
        Post a new project
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--ink-soft)" }}>
        Fill in the details below to open this project to freelancers.
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 rounded-2xl border p-5 sm:p-8"
        style={{ background: "var(--paper)", borderColor: "var(--line)" }}
      >
        <div>
          <label className="text-sm font-medium mb-1 block" style={{ color: "var(--ink)" }}>
            Project heading
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Landing Page Redesign"
            className="w-full px-4 py-2.5 rounded-lg border outline-none text-sm"
            style={inputStyle}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block" style={{ color: "var(--ink)" }}>
            Project description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the work, goals, and any specifics."
            rows={4}
            className="w-full px-4 py-2.5 rounded-lg border outline-none text-sm resize-none"
            style={inputStyle}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: "var(--ink)" }}>
              Project duration
            </label>
            <Select
              value={duration}
              onChange={setDuration}
              options={DURATION_OPTIONS}
              placeholder="Select duration"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: "var(--ink)" }}>
              Weekly commitment
            </label>
            <Select
              value={commitment}
              onChange={setCommitment}
              options={COMMITMENT_OPTIONS}
              placeholder="Select time commitment"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block" style={{ color: "var(--ink)" }}>
            Project rate
          </label>

          <div className="flex gap-2 mb-3">
            {RATE_TYPE_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setRateType(o.value)}
                className="flex-1 py-2 rounded-lg text-sm font-medium border transition"
                style={
                  rateType === o.value
                    ? { background: "var(--surface-yellow)", borderColor: "var(--yellow)", color: "var(--yellow-deep)" }
                    : { background: "var(--paper)", borderColor: "var(--line)", color: "var(--ink-soft)" }
                }
              >
                {o.label}
              </button>
            ))}
          </div>

          {rateType === "fixed" ? (
            <div className="relative">
              <span
                className="absolute left-4 top-1/2 -translate-y-1/2 text-sm"
                style={{ color: "var(--ink-faint)" }}
              >
                $
              </span>
              <input
                type="number"
                min="0"
                value={rateMin}
                onChange={(e) => setRateMin(e.target.value)}
                placeholder="e.g. 1200"
                className="w-full pl-8 pr-4 py-2.5 rounded-lg border outline-none text-sm"
                style={inputStyle}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <span
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-sm"
                  style={{ color: "var(--ink-faint)" }}
                >
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  value={rateMin}
                  onChange={(e) => setRateMin(e.target.value)}
                  placeholder="Min, e.g. 3000"
                  className="w-full pl-8 pr-4 py-2.5 rounded-lg border outline-none text-sm"
                  style={inputStyle}
                />
              </div>
              <div className="relative">
                <span
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-sm"
                  style={{ color: "var(--ink-faint)" }}
                >
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  value={rateMax}
                  onChange={(e) => setRateMax(e.target.value)}
                  placeholder="Max, e.g. 5000"
                  className="w-full pl-8 pr-4 py-2.5 rounded-lg border outline-none text-sm"
                  style={inputStyle}
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block" style={{ color: "var(--ink)" }}>
            Skills and expertise
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
              onKeyDown={handleSkillKeyDown}
              onBlur={addSkill}
              placeholder={skills.length === 0 ? "Type a skill and press Enter" : "Add another"}
              className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
              style={{ color: "var(--ink)" }}
            />
          </div>
        </div>

        {error && (
          <p className="text-sm px-3 py-2 rounded-lg" style={{ background: "var(--bad-soft)", color: "var(--bad)" }}>
            {error}
          </p>
        )}

        <div className="flex gap-3 mt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 rounded-full font-semibold flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-60"
            style={{ background: "var(--yellow)", color: "var(--ink)" }}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Posting..." : "Post project"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 rounded-full font-medium border transition hover:bg-[var(--surface)]"
            style={{ borderColor: "var(--line-strong)", color: "var(--ink)" }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}