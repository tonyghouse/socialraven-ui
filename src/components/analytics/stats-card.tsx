import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  className?: string
}

export function StatsCard({ title, value, subtitle, icon: Icon, className = "" }: StatsCardProps) {
  return (
    <Card className={`bg-card border border-border ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
            <h3 className="text-4xl font-bold text-foreground mt-2">{value}</h3>
            {subtitle && <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>}
          </div>
          <div className="p-3 rounded-lg bg-primary/10 ml-4">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
