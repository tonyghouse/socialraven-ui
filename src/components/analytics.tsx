import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

export function Analytics() {
  // This is mock data. Replace it with your actual analytics data.
  const data = [
    { name: "Mon", total: 60 },
    { name: "Tue", total: 160 },
    { name: "Wed", total: 120 },
    { name: "Thu", total: 20 },
    { name: "Fri", total: 180 },
    { name: "Sat", total: 100 },
    { name: "Sun", total: 140 },
  ]

  return (
    <Card>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Bar dataKey="total" fill="#F97316" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

