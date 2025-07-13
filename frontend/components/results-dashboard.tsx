"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, FileText, Users, Calendar, Palette, CheckCircle, Clock, AlertTriangle } from "lucide-react"

interface Artifact {
  id: string
  title: string
  description: string
  status: "completed" | "in-progress" | "optional"
  icon: React.ReactNode
  actionButton?: {
    label: string
    onClick: () => void
  }
}

const artifacts: Artifact[] = [
  {
    id: "1",
    title: "Product Idea",
    description: "Refined and structured concept",
    status: "completed",
    icon: <Lightbulb className="w-5 h-5" />,
  },
  {
    id: "2",
    title: "User Stories",
    description: "Comprehensive stories with acceptance criteria",
    status: "completed",
    icon: <Users className="w-5 h-5" />,
  },
  {
    id: "3",
    title: "PRD",
    description: "Product Requirements Document",
    status: "completed",
    icon: <FileText className="w-5 h-5" />,
  },
  {
    id: "4",
    title: "Sprint Plans",
    description: "Development timeline (optional)",
    status: "optional",
    icon: <Calendar className="w-5 h-5" />,
  },
  {
    id: "5",
    title: "Visual Design",
    description: "User journey maps (optional)",
    status: "optional",
    icon: <Palette className="w-5 h-5" />,
    actionButton: {
      label: "View Miro Board",
      onClick: () => console.log("Opening Miro board..."),
    },
  },
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="w-4 h-4 text-green-500" />
    case "in-progress":
      return <Clock className="w-4 h-4 text-yellow-500" />
    case "optional":
      return <Clock className="w-4 h-4 text-blue-500" />
    default:
      return <AlertTriangle className="w-4 h-4 text-red-500" />
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return (
        <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">
          ✅ Completed
        </Badge>
      )
    case "in-progress":
      return (
        <Badge variant="default" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
          🔄 In Progress
        </Badge>
      )
    case "optional":
      return (
        <Badge variant="default" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
          🔄 Optional
        </Badge>
      )
    default:
      return <Badge variant="destructive">⚠️ Error</Badge>
  }
}

export function ResultsDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Generated Artifacts</h2>
        <p className="text-muted-foreground">Your AI-generated product development assets</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {artifacts.map((artifact) => (
          <Card key={artifact.id} className="glassmorphism hover:bg-card/80 transition-all duration-200 group">
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-primary">
                  {artifact.icon}
                  <CardTitle className="text-lg">{artifact.title}</CardTitle>
                </div>
                {getStatusIcon(artifact.status)}
              </div>
              <CardDescription className="text-sm">{artifact.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {getStatusBadge(artifact.status)}

              {artifact.actionButton && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={artifact.actionButton.onClick}
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors bg-transparent"
                >
                  {artifact.actionButton.label}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
