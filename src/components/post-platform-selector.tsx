import { Platform } from "@/model/Platform";

interface PostPlatformSelectorProps {
  platform: Platform;
  setPlatform: (p: Platform) => void;
}

export function PostPlatformSelector({
  platform,
  setPlatform,
}: PostPlatformSelectorProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2 text-foreground">
        Platform
      </label>
      <select
        className="w-full px-3 py-2 bg-input border border-border rounded-lg"
        value={platform ?? "instagram"}
        onChange={(e) =>
          setPlatform(e.target.value ? (e.target.value as Platform) : "instagram")
        }
      >
        <option value="instagram">Instagram</option>
        <option value="x">X (Twitter)</option>
        <option value="linkedin">LinkedIn</option>
        {/* <option value="facebook">Facebook</option> */}
        <option value="youtube">YouTube</option>
      </select>
    </div>
  );
}