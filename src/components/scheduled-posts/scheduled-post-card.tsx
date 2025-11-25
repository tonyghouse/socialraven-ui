
import { format } from "date-fns";
import { PLATFORM_ICONS } from "../platform-icons";

export function ScheduledPostCard({ post }: any) {
  const Icon = PLATFORM_ICONS[post.provider] || null;

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow p-4 flex flex-col gap-4">

      {/* Provider & Date */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-blue-500" />}
          <span className="font-medium">{post.provider}</span>
        </div>

        <span className="text-xs text-neutral-500">
          {format(new Date(post.scheduledTime), "dd MMM yyyy • HH:mm")}
        </span>
      </div>

      {/* Title */}
      <h2 className="font-bold text-lg">{post.title}</h2>

      {/* Description */}
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        {post.description}
      </p>

      {/* Usernames */}
      <div className="text-xs text-neutral-500">
        Posting as:{" "}
        <span className="font-medium">{post.userNames.join(", ")}</span>
      </div>

      {/* Media */}
      {post.media?.length > 0 && (
        <div className="flex overflow-x-auto gap-2 py-1">
          {post.media.map((m: any) => (
            <img
              key={m.id}
              src={m.url}
              alt={m.fileName}
              className="w-28 h-28 rounded-md object-cover border"
            />
          ))}
        </div>
      )}
    </div>
  );
}
