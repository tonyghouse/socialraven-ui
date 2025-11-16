import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"

export function CalendarView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar />
      </CardContent>
    </Card>
  )
}

