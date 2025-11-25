import { PostResponse } from "@/model/PostResponse"
import { PostResponsePage } from "@/model/PostResponsePage"


export interface AnalyticsData {
  totalPosts: number
  publishedPosts: number
  scheduledPosts: number
  failedPosts: number
  averageMediaPerPost: number
  postsPerProvider: Record<string, number>
  postStatusDistribution: Record<string, number>
  postsOverTime: Array<{ date: string; count: number }>
  mediaTypeDistribution: Record<string, number>
}

export async function fetchAnalyticsData(getToken: () => Promise<string | null>, limit = 100): Promise<AnalyticsData> {
  try {
    const token = await getToken()
    if (!token) throw new Error("Authentication token not available")

         const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        const url = new URL(`${backendUrl}/posts/all`);
 
    const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });


    if (!response.ok) throw new Error(`Failed to fetch analytics: ${response.statusText}`)

    const data: PostResponsePage = await response.json()

    return processAnalytics(data.content)
  } catch (error) {
    console.error("Error in fetchAnalyticsData:", error)
    throw error
  }
}

function processAnalytics(posts: PostResponse[]): AnalyticsData {
  const analytics: AnalyticsData = {
    totalPosts: posts.length,
    publishedPosts: posts.filter((p) => p.postStatus === "PUBLISHED").length,
    scheduledPosts: posts.filter((p) => p.postStatus === "SCHEDULED").length,
    failedPosts: posts.filter((p) => p.postStatus === "FAILED").length,
    averageMediaPerPost: posts.reduce((sum, p) => sum + p.media.length, 0) / posts.length || 0,
    postsPerProvider: {},
    postStatusDistribution: {
      published: posts.filter((p) => p.postStatus === "PUBLISHED").length,
      scheduled: posts.filter((p) => p.postStatus === "SCHEDULED").length,
     
      failed: posts.filter((p) => p.postStatus === "FAILED").length,
    },
    postsOverTime: generateTimeSeriesData(posts),
    mediaTypeDistribution: generateMediaDistribution(posts),
  }

  // Group posts by provider
  posts.forEach((post) => {
    analytics.postsPerProvider[post.provider] = (analytics.postsPerProvider[post.provider] || 0) + 1
  })

  return analytics
}

function generateTimeSeriesData(posts: PostResponse[]): Array<{ date: string; count: number }> {
  const dateMap: Record<string, number> = {}

  posts.forEach((post) => {
    const date = new Date(post.scheduledTime).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
    dateMap[date] = (dateMap[date] || 0) + 1
  })

  return Object.entries(dateMap)
    .map(([date, count]) => ({ date, count }))
    .slice(-14) // Last 14 days
}

function generateMediaDistribution(posts: PostResponse[]): Record<string, number> {
  const mediaTypes: Record<string, number> = {}

  posts.forEach((post) => {
    post.media.forEach((media) => {
      const type = media.mimeType.split("/")[0] // image, video, audio, application
      mediaTypes[type] = (mediaTypes[type] || 0) + 1
    })
  })

  return mediaTypes
}
