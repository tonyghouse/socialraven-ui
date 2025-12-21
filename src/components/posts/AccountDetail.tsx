"use client";

import { ConnectedAccount } from "@/model/ConnectedAccount";
import { PLATFORM_ICONS } from "@/components/generic/platform-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { getImageUrl } from "@/service/getImageUrl";
import { getInitials } from "@/service/getInitials";

interface Props {
  acc: ConnectedAccount;
}

export default function AccountDetail({ acc }: Props) {
  const Icon = PLATFORM_ICONS[acc.platform];
  const [imageError, setImageError] = useState(false);
  const imageUrl = getImageUrl(acc.profilePicLink);
  const initials = getInitials(acc.username);

  return ( 
          <div
            className={cn(
              "flex items-center gap-3",
              "min-w-[220px] rounded-xl border border-border",
              "bg-card px-4 py-3",
              "transition-all",
              "hover:bg-muted/40 hover:border-primary/20",
              "cursor-default"
            )}
          >
            {/* Avatar */}
            <Avatar className="h-10 w-10 flex-shrink-0">
              {imageUrl && !imageError && (
                <AvatarImage
                  src={imageUrl}
                  alt={acc.username}
                  onError={() => setImageError(true)}
                />
              )}
              <AvatarFallback className="bg-muted text-xs font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Account Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {acc.username}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground capitalize">
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {acc.platform}
              </div>
            </div>
          </div>
  );
}
