"use client";
import { ScheduledPosts } from "@/components/scheduled-posts";
import { Analytics } from "@/components/analytics";
import { CalendarView } from "@/components/calendar-view";
import { PerformanceMetrics } from "@/components/performance-metrics";
import { AccountManagement } from "@/components/account-management";
import { ContentLibrary } from "@/components/content-library";
import PostScheduler from "@/components/post-scheduler";

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6 space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="col-span-3">
          <PostScheduler />
        </div>
        <div className="col-span-2">
          <ScheduledPosts />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AccountManagement />
        <ContentLibrary />
        {/* <CalendarView /> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Analytics />
        <PerformanceMetrics />
      </div>


    </div>
  );
}
