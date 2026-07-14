"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function NewPortfolioProjectPage() {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [techInput, setTechInput] = useState("");
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [projectUrl, setProjectUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function addTag(
    input: string,
    list: string[],
    setList: (v: string[]) => void,
    setInput: (v: string) => void
  ) {
    const value = input.trim();
    if (value && !list.includes(value)) {
      setList([...list, value]);
    }
    setInput("");
  }

  function tagKeyDown(
    e: KeyboardEvent<HTMLInputElement>,
    input: string,
    list: string[],
    setList: (v: string[]) => void,
    setInput: (v: string) => void
  ) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input, list, setList, setInput);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!title || !description) {
      setError("Please fill in the project name and description.");
      return;
    }
    if (technologies.length === 0) {
      setError("Please add at least one technology or software used.");
      return;
    }
    if (skills.length === 0) {
      setError("Please add at least one required skill.");
      return;
    }

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be logged in.");
      setLoading(false);
      return;
    }

    let fileUrl: string | null = null;
    let fileName: string | null = null;

    if (file) {
      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const path = `${user.id}/${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("portfolio-files")
        .upload(path, file);

      if (uploadError) {
        setError(uploadError.message);
        setLoading(false);
        return;
      }

      const { data } = supabase.storage.from("portfolio-files").getPublicUrl(path);
      fileUrl = data.publicUrl;
      fileName = file.name;
    }

    const { error: insertError } = await supabase.from("portfolio_projects").insert({
      freelancer_id: user.id,
      title,
      description,
      technologies,
      skills,
      project_url: projectUrl || null,
      file_url: fileUrl,
      file_name: fileName,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard/freelancer/portfolio");
  }

  const inputStyle = {
    borderColor: "var(--line)",
    background: "var(--paper)",
    color: "var(--ink)",
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <h1 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: "var(--ink)" }}>
        Add a portfolio project
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--ink-soft)" }}>
        Show clients real examples of your work.
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 rounded-2xl border p-5 sm:p-8"
        style={{ background: "var(--paper)", borderColor: "var(--line)" }}
      >
        <div>
          <label className="text-sm font-medium mb-1 block" style={{ color: "var(--ink)" }}>
            Project name
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. E-commerce Checkout Redesign"
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
            placeholder="What was the project, your role, and the outcome?"
            rows={4}
            className="w-full px-4 py-2.5 rounded-lg border outline-none text-sm resize-none"
            style={inputStyle}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block" style={{ color: "var(--ink)" }}>
            Technology / software used
          </label>
          <div className="flex flex-wrap gap-2 px-3 py-2 rounded-lg border" style={inputStyle}>
            {technologies.map((tech) => (
              <span
                key={tech}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                style={{ background: "var(--surface-yellow)", color: "var(--yellow-deep)" }}
              >
                {tech}
                <button type="button" onClick={() => setTechnologies(technologies.filter((t) => t !== tech))}>
                  <X size={12} />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => tagKeyDown(e, techInput, technologies, setTechnologies, setTechInput)}
              onBlur={() => addTag(techInput, technologies, setTechnologies, setTechInput)}
              placeholder={technologies.length === 0 ? "e.g. Figma, React (press Enter)" : "Add another"}
              className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
              style={{ color: "var(--ink)" }}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block" style={{ color: "var(--ink)" }}>
            Skills required
          </label>
          <div className="flex flex-wrap gap-2 px-3 py-2 rounded-lg border" style={inputStyle}>
            {skills.map((skill) => (
              <span
                key={skill}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                style={{ background: "var(--surface)", color: "var(--ink-soft)", border: "1px solid var(--line)" }}
              >
                {skill}
                <button type="button" onClick={() => setSkills(skills.filter((s) => s !== skill))}>
                  <X size={12} />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => tagKeyDown(e, skillInput, skills, setSkills, setSkillInput)}
              onBlur={() => addTag(skillInput, skills, setSkills, setSkillInput)}
              placeholder={skills.length === 0 ? "e.g. UI Design (press Enter)" : "Add another"}
              className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
              style={{ color: "var(--ink)" }}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block" style={{ color: "var(--ink)" }}>
            Project URL (optional)
          </label>
          <input
            type="url"
            value={projectUrl}
            onChange={(e) => setProjectUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-2.5 rounded-lg border outline-none text-sm"
            style={inputStyle}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block" style={{ color: "var(--ink)" }}>
            Upload file (PDF, Word doc, or image — optional)
          </label>
          <label
            className="flex items-center gap-3 px-4 py-3 rounded-lg border text-sm cursor-pointer transition hover:bg-[var(--surface)]"
            style={inputStyle}
          >
            <Upload size={16} style={{ color: "var(--ink-faint)" }} />
            <span style={{ color: file ? "var(--ink)" : "var(--ink-faint)" }}>
              {file ? file.name : "Choose a file"}
            </span>
            <input
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
          </label>
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
            {loading ? "Saving..." : "Save project"}
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