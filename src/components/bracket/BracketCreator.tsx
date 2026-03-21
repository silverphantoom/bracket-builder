"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OptionList } from "./OptionList";
import { useToast } from "@/components/ui/toast";
import { computeBracketSize, generateSeededOptions, buildRound1Pairs } from "@/lib/bracket-logic";
import { ChevronLeft, ChevronRight, Rocket, Loader2 } from "lucide-react";

export function BracketCreator() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1 fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [voteThreshold, setVoteThreshold] = useState(10);

  // Step 2 fields
  const [entries, setEntries] = useState<string[]>(
    Array(8).fill("")
  );

  const filledEntries = entries.filter((e) => e.trim());
  const bracketSize = computeBracketSize(Math.max(filledEntries.length, 3));

  const canProceedStep1 = title.trim().length > 0 && title.length <= 80;
  const canProceedStep2 = filledEntries.length >= 3;

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/brackets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          entries: filledEntries,
          vote_threshold: voteThreshold,
          bracket_size: bracketSize,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast(data.error || "Failed to create bracket", "error");
        return;
      }

      const { slug } = await res.json();
      toast("Bracket created! Share this link to start voting.", "success");

      // Copy URL to clipboard
      const url = `${window.location.origin}/${slug}`;
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        // Clipboard may not be available
      }

      router.push(`/${slug}`);
    } catch {
      toast("Something went wrong. Try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  // Preview data for Step 3
  const previewOptions = generateSeededOptions(filledEntries, bracketSize);
  const previewPairs = filledEntries.length >= 3 ? buildRound1Pairs(previewOptions) : [];

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Step indicators */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                s === step
                  ? "bg-accent-primary text-white"
                  : s < step
                    ? "bg-accent-primary/20 text-accent-primary"
                    : "bg-bg-raised text-text-muted"
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div
                className={`h-0.5 w-8 ${
                  s < step ? "bg-accent-primary" : "bg-bg-raised"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Basics */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-bold mb-1">Name your bracket</h2>
            <p className="text-sm text-text-secondary">
              What are people voting on?
            </p>
          </div>

          <Input
            id="title"
            label="Title"
            placeholder="Best pizza toppings of all time"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
            charCount={{ current: title.length, max: 80 }}
          />

          <Input
            id="description"
            label="Description (optional)"
            placeholder="A definitive ranking of pizza toppings"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={200}
            charCount={{ current: description.length, max: 200 }}
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              Votes to close each matchup: {voteThreshold}
            </label>
            <input
              type="range"
              min={5}
              max={50}
              value={voteThreshold}
              onChange={(e) => setVoteThreshold(Number(e.target.value))}
              className="w-full accent-accent-primary"
            />
            <div className="flex justify-between text-xs text-text-muted">
              <span>5</span>
              <span>50</span>
            </div>
          </div>

          <Button
            onClick={() => setStep(2)}
            disabled={!canProceedStep1}
            className="w-full"
          >
            Next <ChevronRight size={16} />
          </Button>
        </div>
      )}

      {/* Step 2: Add Entries */}
      {step === 2 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-bold mb-1">Add your entries</h2>
            <p className="text-sm text-text-secondary">
              {filledEntries.length} of {bracketSize} slots filled. Drag to
              reorder seeding.
            </p>
          </div>

          <OptionList entries={entries} onChange={setEntries} />

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">
              <ChevronLeft size={16} /> Back
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={!canProceedStep2}
              className="flex-1"
            >
              Next <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Launch */}
      {step === 3 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-bold mb-1">Review & launch</h2>
            <p className="text-sm text-text-secondary">
              Your bracket is ready to go.
            </p>
          </div>

          <div className="rounded-xl border border-border-default bg-bg-surface p-4 space-y-3">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider">
                Title
              </p>
              <p className="text-lg font-bold">{title}</p>
            </div>
            {description && (
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider">
                  Description
                </p>
                <p className="text-sm text-text-secondary">{description}</p>
              </div>
            )}
            <div className="flex gap-6">
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider">
                  Entries
                </p>
                <p className="font-mono font-semibold">
                  {filledEntries.length} / {bracketSize}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider">
                  Vote threshold
                </p>
                <p className="font-mono font-semibold">{voteThreshold}</p>
              </div>
            </div>
          </div>

          {/* Round 1 preview */}
          <div className="space-y-2">
            <p className="text-xs text-text-muted uppercase tracking-wider">
              Round 1 Matchups
            </p>
            {previewPairs.map(([a, b], i) => (
              <div
                key={i}
                className="flex items-center rounded-lg border border-border-default bg-bg-surface px-3 py-2 text-sm"
              >
                <span
                  className={`flex-1 font-mono text-xs text-text-muted mr-2`}
                >
                  #{a.seed}
                </span>
                <span className={`flex-1 ${a.is_bye ? "text-text-muted italic" : "text-text-primary"}`}>
                  {a.name}
                </span>
                <span className="mx-3 text-xs font-bold text-vs">VS</span>
                <span className={`flex-1 text-right ${b.is_bye ? "text-text-muted italic" : "text-text-primary"}`}>
                  {b.name}
                </span>
                <span className="flex-1 text-right font-mono text-xs text-text-muted ml-2">
                  #{b.seed}
                </span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep(2)} className="flex-1">
              <ChevronLeft size={16} /> Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Creating...
                </>
              ) : (
                <>
                  Launch Bracket <Rocket size={16} />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
