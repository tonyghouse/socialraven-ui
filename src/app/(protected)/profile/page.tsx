"use client";

import { UserProfile } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";

export default function ProfilePage() {
  const { user } = useUser();

  return (
    <div className="max-w-5xl mx-auto py-10 px-6 space-y-10">
      {/* SocialRaven Profile Section */}
      <div>
        <h1 className="text-2xl font-semibold mb-4">
          SocialRaven Profile
        </h1>

        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <p className="text-sm text-muted-foreground mb-2">
            Name
          </p>
          <p className="font-medium">
            {user?.firstName} {user?.lastName}
          </p>

          <p className="text-sm text-muted-foreground mt-4 mb-2">
            Email
          </p>
          <p className="font-medium">
            {user?.primaryEmailAddress?.emailAddress}
          </p>

          {/* Later you can add:
              - Plan (Free/Pro)
              - Usage stats
              - Connected accounts
          */}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-foreground/10 pt-10">
        <h2 className="text-xl font-semibold mb-6">
          Account Settings
        </h2>

        <div className="rounded-xl overflow-hidden border shadow-sm">
          <UserProfile />
        </div>
      </div>
    </div>
  );
}