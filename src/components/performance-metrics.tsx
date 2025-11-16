import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function PerformanceMetrics() {
  // Replace this with actual data from your analytics
  const metrics = [
    { name: "Total Reach", value: "1.2M" },
    { name: "Engagement Rate", value: "3.8%" },
    { name: "Click-through Rate", value: "2.1%" },
    { name: "Conversion Rate", value: "0.5%" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric) => (
            <div key={metric.name} className="bg-muted p-3 rounded-lg">
              <p className="text-sm font-medium">{metric.name}</p>
              <p className="text-2xl font-bold">{metric.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

