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

const CROP_PRESETS = [
  { label: "Original", ratio: null  as number | null },
  { label: "1:1",      ratio: 1     as number | null },
  { label: "4:5",      ratio: 4 / 5 as number | null },
  { label: "16:9",     ratio: 16/ 9 as number | null },
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
  facebook:  { bg: "bg-[#1877F2]/8",  text: "text-[#1877F2]", border: "border-[#1877F2]/25", dot: "bg-[#1877F2]" },
  instagram: { bg: "bg-pink-50",       text: "text-pink-600",   border: "border-pink-200",      dot: "bg-pink-500" },
  x:         { bg: "bg-foreground/5",  text: "text-foreground", border: "border-border",         dot: "bg-foreground" },
  linkedin:  { bg: "bg-[#0A66C2]/8",  text: "text-[#0A66C2]", border: "border-[#0A66C2]/25",  dot: "bg-[#0A66C2]" },
  youtube:   { bg: "bg-red-50",        text: "text-red-600",    border: "border-red-200",        dot: "bg-red-500" },
  threads:   { bg: "bg-foreground/5",  text: "text-foreground", border: "border-border",         dot: "bg-foreground" },
  tiktok:    { bg: "bg-foreground/5",  text: "text-foreground", border: "border-border",         dot: "bg-foreground" },
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
        "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        checked ? "bg-primary" : "bg-muted"
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
    <div className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
      <div className="flex-1 min-w-0 pr-4">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
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
            "px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150",
            value === opt.value
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
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
      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</Label>
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
  const [selectedRatio, setSelectedRatio] = useState<number | null>(null);
  const [cropTarget, setCropTarget]       = useState<File | null>(null);
  const [applying, setApplying]           = useState(false);

  const imageFiles = (files ?? []).filter((f) => f.type.startsWith("image/"));

  async function applyToAll() {
    if (!imageFiles.length || selectedRatio === null || applying) return;
    setApplying(true);
    try {
      const cropped = await Promise.all(
        (files ?? []).map((f) =>
          f.type.startsWith("image/") ? cropFileToRatio(f, selectedRatio) : Promise.resolve(f),
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
            {CROP_PRESETS.map(({ label, ratio }) => (
              <button
                key={label}
                type="button"
                onClick={() => setSelectedRatio(ratio)}
                className={cn(
                  "flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors",
                  selectedRatio === ratio
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {selectedRatio !== null && (
            <button
              type="button"
              onClick={applyToAll}
              disabled={applying}
              className="w-full mt-2 py-1.5 text-xs font-semibold rounded-lg border border-primary/40 text-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
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
                  className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-colors group"
                  title={`Crop ${file.name} individually`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
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
          className={cn("text-sm", titleError ? "border-red-400 focus-visible:ring-red-400/30" : "")}
        />
        {titleError && (
          <p className="flex items-center gap-1.5 text-xs text-red-500">
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
            className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg flex-shrink-0 hover:bg-primary/90 transition-colors"
          >
            Add
          </button>
        </div>
        {(config.tags ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {(config.tags ?? []).map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-muted rounded-full text-xs font-medium">
                {tag}
                <button
                  type="button"
                  onClick={() => onChange({ ...config, tags: (config.tags ?? []).filter((t) => t !== tag) })}
                  className="text-muted-foreground hover:text-foreground ml-0.5 leading-none"
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
    <div className={cn("rounded-xl border overflow-hidden transition-shadow", styles.border, open ? "shadow-sm" : "")}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 transition-colors hover:brightness-95",
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
            <span className="flex items-center gap-1 text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 rounded-full px-2 py-px">
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
        <div className="px-4 py-4 bg-card border-t border-border/40">
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
        <Settings2 className="w-4 h-4 text-muted-foreground" />
        <div>
          <h3 className="text-sm font-semibold text-foreground">Platform Settings</h3>
          <p className="text-xs text-muted-foreground">Customize how your post appears on each platform</p>
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
