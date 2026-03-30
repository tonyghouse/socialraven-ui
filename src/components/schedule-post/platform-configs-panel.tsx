"use client";

import { useMemo, useState } from "react";
import { ConnectedAccount } from "@/model/ConnectedAccount";
import {
  PlatformConfigs,
  FacebookConfig,
  InstagramConfig,
  XConfig,
  YouTubeConfig,
  ThreadsConfig,
  TikTokConfig,
  LinkedInConfig,
} from "@/model/PostCollection";
import { PostType } from "@/model/PostType";
import { cn } from "@/lib/utils";
import { AlertCircle, ChevronDown, ChevronUp, Settings2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PLATFORM_ICONS } from "@/components/generic/platform-icons";
import ImageCropDialog from "./image-crop-dialog";

// ── Crop helpers (Instagram only) ─────────────────────────────────────────────

const CROP_PRESETS: { label: string; ratio: number | null; pw: number; ph: number }[] = [
  { label: "Original", ratio: null,   pw: 18, ph: 13 },
  { label: "1:1",      ratio: 1,      pw: 14, ph: 14 },
  { label: "4:5",      ratio: 4 / 5,  pw: 11, ph: 14 },
  { label: "16:9",     ratio: 16 / 9, pw: 25, ph: 14 },
];

function centerCropRegion(w: number, h: number, ratio: number) {
  const natural = w / h;
  if (natural > ratio) {
    const cw = Math.round(h * ratio);
    return { x: Math.round((w - cw) / 2), y: 0, w: cw, h };
  }
  const ch = Math.round(w / ratio);
  return { x: 0, y: Math.round((h - ch) / 2), w, h: ch };
}

async function cropFileToRatio(file: File, ratio: number): Promise<File> {
  const url = URL.createObjectURL(file);
  const img  = new window.Image();
  await new Promise<void>((res) => { img.onload = () => res(); img.src = url; });
  const region = centerCropRegion(img.naturalWidth, img.naturalHeight, ratio);
  const canvas = document.createElement("canvas");
  canvas.width  = region.w;
  canvas.height = region.h;
  canvas.getContext("2d")!.drawImage(img, region.x, region.y, region.w, region.h, 0, 0, region.w, region.h);
  URL.revokeObjectURL(url);
  return new Promise<File>((res, rej) =>
    canvas.toBlob((blob) => {
      if (!blob) { rej(new Error("toBlob failed")); return; }
      res(new File([blob], file.name, { type: file.type }));
    }, file.type),
  );
}

// ── Platform brand styles ─────────────────────────────────────────────────────

const PLATFORM_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  facebook:  { bg: "bg-surface-raised", text: "text-[#1877F2]", border: "border-border-subtle", dot: "bg-[#1877F2]" },
  instagram: { bg: "bg-surface-raised", text: "text-[#C13584]", border: "border-border-subtle", dot: "bg-[#C13584]" },
  x:         { bg: "bg-surface-raised", text: "text-foreground", border: "border-border-subtle", dot: "bg-foreground" },
  linkedin:  { bg: "bg-surface-raised", text: "text-[#0A66C2]", border: "border-border-subtle", dot: "bg-[#0A66C2]" },
  youtube:   { bg: "bg-surface-raised", text: "text-[#FF0000]", border: "border-border-subtle", dot: "bg-[#FF0000]" },
  threads:   { bg: "bg-surface-raised", text: "text-foreground", border: "border-border-subtle", dot: "bg-foreground" },
  tiktok:    { bg: "bg-surface-raised", text: "text-foreground", border: "border-border-subtle", dot: "bg-foreground" },
};

const PLATFORM_NAMES: Record<string, string> = {
  facebook:  "Facebook",
  instagram: "Instagram",
  x:         "X (Twitter)",
  linkedin:  "LinkedIn",
  youtube:   "YouTube",
  threads:   "Threads",
  tiktok:    "TikTok",
};

// ── Reusable sub-components ───────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]/35",
        checked ? "bg-[hsl(var(--accent))]" : "bg-surface-raised"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
          checked ? "translate-x-4" : "translate-x-0"
        )}
      />
    </button>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border-subtle py-2.5 last:border-0">
      <div className="flex-1 min-w-0 pr-4">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="mt-0.5 text-xs text-foreground-muted">{description}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function RadioPills<T extends string>({
  value,
  options,
  onChange,
}: {
  value?: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors duration-150",
            value === opt.value
              ? "border-[hsl(var(--accent))]/20 bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]"
              : "border-border-subtle bg-surface text-foreground-muted hover:border-[hsl(var(--accent))]/20 hover:text-foreground"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function ConfigRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold uppercase tracking-[0.08em] text-foreground-muted">{label}</Label>
      {children}
    </div>
  );
}

// ── Per-platform config panels ────────────────────────────────────────────────

function FacebookPanel({ config, onChange }: { config: FacebookConfig; onChange: (c: FacebookConfig) => void }) {
  return (
    <div className="space-y-4">
      <ConfigRow label="Audience">
        <RadioPills
          value={config.audience}
          options={[
            { value: "PUBLIC",             label: "Public" },
            { value: "FRIENDS",            label: "Friends" },
            { value: "FRIENDS_OF_FRIENDS", label: "Friends of Friends" },
            { value: "SELF",               label: "Only Me" },
          ]}
          onChange={(v) => onChange({ ...config, audience: v })}
        />
      </ConfigRow>
      <ConfigRow label="First Comment">
        <Textarea
          placeholder="Add a first comment (great for hashtags or CTAs)..."
          value={config.firstComment ?? ""}
          onChange={(e) => onChange({ ...config, firstComment: e.target.value })}
          className="min-h-[72px] text-sm resize-none"
        />
      </ConfigRow>
    </div>
  );
}

function InstagramPanel({
  config,
  onChange,
  files,
  onReplaceFiles,
}: {
  config: InstagramConfig;
  onChange: (c: InstagramConfig) => void;
  files?: File[];
  onReplaceFiles?: (files: File[]) => void;
}) {
  // "Original" (null) is the default — no cropping applied
  const [selectedRatio, setSelectedRatio] = useState<number | null | "original">("original");
  const [cropTarget, setCropTarget]       = useState<File | null>(null);
  const [applying, setApplying]           = useState(false);

  const imageFiles = (files ?? []).filter((f) => f.type.startsWith("image/"));

  // Actual crop ratio: null when "Original" is selected
  const cropRatio = selectedRatio === "original" ? null : selectedRatio;

  async function applyToAll() {
    if (!imageFiles.length || cropRatio === null || applying) return;
    setApplying(true);
    try {
      const cropped = await Promise.all(
        (files ?? []).map((f) =>
          f.type.startsWith("image/") ? cropFileToRatio(f, cropRatio!) : Promise.resolve(f),
        ),
      );
      onReplaceFiles?.(cropped);
    } finally {
      setApplying(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Aspect ratio crop — only shown when images are attached */}
      {imageFiles.length > 0 && (
        <ConfigRow label="Aspect Ratio">
          <div className="flex gap-2">
            {CROP_PRESETS.map(({ label, ratio, pw, ph }) => {
              const isSelected = selectedRatio === (ratio === null ? "original" : ratio);
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setSelectedRatio(ratio === null ? "original" : ratio)}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-1.5 rounded-lg border px-1 py-2.5 transition-colors",
                    isSelected
                      ? "border-[hsl(var(--accent))]/20 bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]"
                      : "border-border-subtle text-foreground-muted hover:border-[hsl(var(--accent))]/20 hover:text-foreground",
                  )}
                >
                  {/* Visual ratio preview */}
                  <div
                    style={{ width: pw, height: ph }}
                    className={cn(
                      "rounded-sm border-2 flex-shrink-0",
                      isSelected ? "border-[hsl(var(--accent))]" : "border-current"
                    )}
                  />
                  <span className="text-[10px] font-semibold leading-none">{label}</span>
                </button>
              );
            })}
          </div>

          {cropRatio !== null && (
            <button
              type="button"
              onClick={applyToAll}
              disabled={applying}
              className="mt-2 w-full rounded-lg border border-[hsl(var(--accent))]/20 py-1.5 text-xs font-semibold text-[hsl(var(--accent))] transition-colors hover:bg-[hsl(var(--accent))]/8 disabled:opacity-50"
            >
              {applying
                ? "Cropping…"
                : `Apply ${imageFiles.length > 1 ? `to all ${imageFiles.length} images` : "crop"}`}
            </button>
          )}

          {/* Per-image crop — thumbnail strip */}
          {imageFiles.length > 1 && (
            <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
              {imageFiles.map((file) => (
                <button
                  key={file.name + file.size}
                  type="button"
                  onClick={() => setCropTarget(file)}
                  className="group relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-border-subtle transition-colors hover:border-[hsl(var(--accent))]/25"
                  title={`Crop ${file.name} individually`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-[hsl(var(--foreground)/0.38)] opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="text-[9px] font-bold text-white">Crop</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ConfigRow>
      )}

      <ConfigRow label="Alt Text (Accessibility)">
        <Input
          placeholder="Describe your image for screen readers..."
          value={config.altText ?? ""}
          onChange={(e) => onChange({ ...config, altText: e.target.value })}
          className="text-sm"
        />
      </ConfigRow>
      <ConfigRow label="First Comment">
        <Textarea
          placeholder="Add hashtags in the first comment to keep captions clean..."
          value={config.firstComment ?? ""}
          onChange={(e) => onChange({ ...config, firstComment: e.target.value })}
          className="min-h-[72px] text-sm resize-none"
        />
      </ConfigRow>
      <ToggleRow
        label="Disable Comments"
        description="Prevent others from commenting on this post"
        checked={config.disableComments ?? false}
        onChange={(v) => onChange({ ...config, disableComments: v })}
      />

      <ImageCropDialog
        file={cropTarget}
        open={cropTarget !== null}
        onClose={() => setCropTarget(null)}
        onCrop={(croppedFile) => {
          if (!files || !onReplaceFiles) return;
          onReplaceFiles(files.map((f) => (f === cropTarget ? croppedFile : f)));
          setCropTarget(null);
        }}
      />
    </div>
  );
}

function XPanel({ config, onChange }: { config: XConfig; onChange: (c: XConfig) => void }) {
  return (
    <div className="space-y-4">
      <ConfigRow label="Who Can Reply">
        <RadioPills
          value={config.replySettings}
          options={[
            { value: "EVERYONE",   label: "Everyone" },
            { value: "FOLLOWERS",  label: "Followers" },
            { value: "MENTIONED",  label: "Mentioned only" },
          ]}
          onChange={(v) => onChange({ ...config, replySettings: v })}
        />
      </ConfigRow>
    </div>
  );
}

function YouTubePanel({
  config,
  onChange,
  showErrors,
  postType,
}: {
  config: YouTubeConfig;
  onChange: (c: YouTubeConfig) => void;
  showErrors?: boolean;
  postType?: PostType;
}) {
  const [tagInput, setTagInput] = useState("");
  const titleError = showErrors && postType === "VIDEO" && !config.videoTitle?.trim();

  function addTag() {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    const existing = config.tags ?? [];
    if (!existing.includes(trimmed)) {
      onChange({ ...config, tags: [...existing, trimmed] });
    }
    setTagInput("");
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Video Title
          {postType === "VIDEO" && (
            <span className="ml-1.5 text-red-500 font-bold">*</span>
          )}
        </Label>
        <Input
          placeholder="Enter a compelling video title..."
          value={config.videoTitle ?? ""}
          onChange={(e) => onChange({ ...config, videoTitle: e.target.value })}
          className={cn(
            "text-sm",
            titleError
              ? "border-destructive/60 focus-visible:ring-destructive/20"
              : "border-border-subtle"
          )}
        />
        {titleError && (
          <p className="flex items-center gap-1.5 text-xs text-destructive">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            Video title is required for YouTube
          </p>
        )}
      </div>
      <ConfigRow label="Privacy">
        <RadioPills
          value={config.privacy}
          options={[
            { value: "PUBLIC",   label: "Public" },
            { value: "UNLISTED", label: "Unlisted" },
            { value: "PRIVATE",  label: "Private" },
          ]}
          onChange={(v) => onChange({ ...config, privacy: v })}
        />
      </ConfigRow>
      <ConfigRow label="Tags">
        <div className="flex gap-2">
          <Input
            placeholder="Type a tag and press Enter..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
            className="text-sm flex-1"
          />
          <button
            type="button"
            onClick={addTag}
            className="flex-shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-[hsl(var(--accent-hover))]"
          >
            Add
          </button>
        </div>
        {(config.tags ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {(config.tags ?? []).map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 rounded-md border border-border-subtle bg-surface-raised px-2.5 py-1 text-xs font-medium">
                {tag}
                <button
                  type="button"
                  onClick={() => onChange({ ...config, tags: (config.tags ?? []).filter((t) => t !== tag) })}
                  className="ml-0.5 leading-none text-foreground-muted hover:text-foreground"
                  aria-label={`Remove tag ${tag}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </ConfigRow>
      <div className="pt-1 space-y-0">
        <ToggleRow
          label="Made for Kids"
          description="This video is directed at children (required by COPPA)"
          checked={config.madeForKids ?? false}
          onChange={(v) => onChange({ ...config, madeForKids: v })}
        />
        <ToggleRow
          label="Notify Subscribers"
          description="Send a notification to your subscribers when published"
          checked={config.notifySubscribers ?? true}
          onChange={(v) => onChange({ ...config, notifySubscribers: v })}
        />
      </div>
    </div>
  );
}

function ThreadsPanel({ config, onChange }: { config: ThreadsConfig; onChange: (c: ThreadsConfig) => void }) {
  return (
    <div className="space-y-4">
      <ConfigRow label="Who Can Reply">
        <RadioPills
          value={config.replyControl}
          options={[
            { value: "EVERYONE",             label: "Everyone" },
            { value: "PROFILES_YOU_FOLLOW",  label: "Profiles you follow" },
            { value: "MENTIONED_ONLY",       label: "Mentioned only" },
          ]}
          onChange={(v) => onChange({ ...config, replyControl: v })}
        />
      </ConfigRow>
    </div>
  );
}

function TikTokPanel({ config, onChange }: { config: TikTokConfig; onChange: (c: TikTokConfig) => void }) {
  return (
    <div className="space-y-4">
      <ConfigRow label="Visibility">
        <RadioPills
          value={config.privacyLevel}
          options={[
            { value: "PUBLIC_TO_EVERYONE",   label: "Everyone" },
            { value: "MUTUAL_FOLLOW_FRIENDS", label: "Friends" },
            { value: "FOLLOWER_OF_CREATOR",  label: "Followers" },
            { value: "SELF_ONLY",            label: "Only Me" },
          ]}
          onChange={(v) => onChange({ ...config, privacyLevel: v })}
        />
      </ConfigRow>
      <div className="pt-1 space-y-0">
        <ToggleRow
          label="Allow Comments"
          description="Let viewers comment on this video"
          checked={config.allowComment ?? true}
          onChange={(v) => onChange({ ...config, allowComment: v })}
        />
        <ToggleRow
          label="Allow Duet"
          description="Allow others to create side-by-side videos"
          checked={config.allowDuet ?? true}
          onChange={(v) => onChange({ ...config, allowDuet: v })}
        />
        <ToggleRow
          label="Allow Stitch"
          description="Allow others to clip and use this video"
          checked={config.allowStitch ?? true}
          onChange={(v) => onChange({ ...config, allowStitch: v })}
        />
        <ToggleRow
          label="Branded Content"
          description="Disclose paid partnerships or promotions"
          checked={config.brandContentToggle ?? false}
          onChange={(v) => onChange({ ...config, brandContentToggle: v })}
        />
      </div>
    </div>
  );
}

function LinkedInPanel({ config, onChange }: { config: LinkedInConfig; onChange: (c: LinkedInConfig) => void }) {
  return (
    <div className="space-y-4">
      <ConfigRow label="Visibility">
        <RadioPills
          value={config.visibility}
          options={[
            { value: "PUBLIC",      label: "Public" },
            { value: "CONNECTIONS", label: "Connections only" },
          ]}
          onChange={(v) => onChange({ ...config, visibility: v })}
        />
      </ConfigRow>
    </div>
  );
}

// ── Accordion card per platform ───────────────────────────────────────────────

function PlatformAccordionCard({
  platform,
  config,
  onChange,
  showErrors,
  postType,
  files,
  onReplaceFiles,
}: {
  platform: string;
  config: any;
  onChange: (c: any) => void;
  showErrors?: boolean;
  postType?: PostType;
  files?: File[];
  onReplaceFiles?: (files: File[]) => void;
}) {
  const [open, setOpen] = useState(true);
  const styles = PLATFORM_STYLES[platform] ?? PLATFORM_STYLES["x"];
  const Icon   = PLATFORM_ICONS[platform];
  const name   = PLATFORM_NAMES[platform] ?? platform;

  // Detect if this platform has a validation error to show a badge on the header
  const hasError =
    showErrors &&
    platform === "youtube" &&
    postType === "VIDEO" &&
    !config?.videoTitle?.trim();

  function renderPanel() {
    switch (platform) {
      case "facebook":  return <FacebookPanel  config={config ?? {}} onChange={onChange} />;
      case "instagram": return <InstagramPanel config={config ?? {}} onChange={onChange} files={files} onReplaceFiles={onReplaceFiles} />;
      case "x":         return <XPanel         config={config ?? {}} onChange={onChange} />;
      case "youtube":   return <YouTubePanel   config={config ?? {}} onChange={onChange} showErrors={showErrors} postType={postType} />;
      case "threads":   return <ThreadsPanel   config={config ?? {}} onChange={onChange} />;
      case "tiktok":    return <TikTokPanel    config={config ?? {}} onChange={onChange} />;
      case "linkedin":  return <LinkedInPanel  config={config ?? {}} onChange={onChange} />;
      default: return null;
    }
  }

  return (
    <div className={cn("overflow-hidden rounded-xl border transition-shadow", styles.border, open ? "shadow-sm" : "")}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center justify-between px-4 py-3 transition-colors hover:bg-[hsl(var(--background))]",
          styles.bg
        )}
      >
        <div className="flex items-center gap-3">
          {platform === "instagram" ? (
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)" }} />
          ) : (
            <div className={cn("w-2 h-2 rounded-full flex-shrink-0", styles.dot)} />
          )}
          {Icon && <Icon className={cn("w-4 h-4 flex-shrink-0", styles.text)} />}
          <span className={cn("text-sm font-semibold", styles.text)}>{name}</span>
          {hasError && (
            <span className="flex items-center gap-1 rounded-md border border-destructive/20 bg-destructive/10 px-2 py-px text-[10px] font-semibold text-destructive">
              <AlertCircle className="w-2.5 h-2.5" />
              Required field missing
            </span>
          )}
        </div>
        {open
          ? <ChevronUp   className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        }
      </button>

      {open && (
        <div className="border-t border-border-subtle bg-surface px-4 py-4">
          {renderPanel()}
        </div>
      )}
    </div>
  );
}

// ── Public component ──────────────────────────────────────────────────────────

interface Props {
  selectedAccounts: ConnectedAccount[];
  configs: PlatformConfigs;
  onChange: (configs: PlatformConfigs) => void;
  showErrors?: boolean;
  postType?: PostType;
  files?: File[];
  onReplaceFiles?: (files: File[]) => void;
}

export default function PlatformConfigsPanel({ selectedAccounts, configs, onChange, showErrors, postType, files, onReplaceFiles }: Props) {
  const platforms = useMemo(() => {
    const seen = new Set<string>();
    return selectedAccounts
      .map((a) => a.platform.toLowerCase())
      .filter((p) => { if (seen.has(p)) return false; seen.add(p); return true; });
  }, [selectedAccounts]);

  if (platforms.length === 0) return null;

  function update(platform: string, cfg: any) {
    onChange({ ...configs, [platform]: cfg });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle bg-surface-raised text-[hsl(var(--accent))]">
          <Settings2 className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Platform Settings</h3>
          <p className="text-xs text-foreground-muted">Customize how your post appears on each platform</p>
        </div>
      </div>
      <div className="space-y-2">
        {platforms.map((platform) => (
          <PlatformAccordionCard
            key={platform}
            platform={platform}
            config={(configs as any)[platform]}
            onChange={(c) => update(platform, c)}
            showErrors={showErrors}
            postType={postType}
            files={platform === "instagram" ? files : undefined}
            onReplaceFiles={platform === "instagram" ? onReplaceFiles : undefined}
          />
        ))}
      </div>
    </div>
  );
}
