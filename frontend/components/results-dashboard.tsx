"use client"

import type React from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Lightbulb,
  FileText,
  Users,
  Calendar,
  Palette,
  CheckCircle,
  Clock,
  AlertTriangle,
  ExternalLink,
  Download,
  Eye,
} from "lucide-react"

interface ResultsDashboardProps {
  artifacts: {
    idea?: any
    userStories?: any
    prd?: any
    sprints?: any
    visual?: any
  }
  conversation?: {
    messages: any[]
    getConversationStats: () => any
    exportConversation: () => void
  }
}

export function ResultsDashboard({
  artifacts,
  conversation,
}: ResultsDashboardProps) {
  const getArtifactStatus = (artifactData: any) => {
    return artifactData ? "completed" : "pending"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "pending":
        return <Clock className="w-4 h-4 text-muted-foreground" />
      default:
        return <AlertTriangle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge
            variant="default"
            className="bg-green-500/20 text-green-400 border-green-500/30 loading-pulse smooth-transition  "
          >
            ✅ Completed
          </Badge>
        )
      case "pending":
        return <Badge variant="secondary">⏳ Pending</Badge>
      default:
        return <Badge variant="destructive">⚠️ Error</Badge>
    }
  }

  const openExternalLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const renderArtifactDetail = (type: string, data: any) => {
    if (!data) return null

    switch (type) {
      case "idea":
        return (
          <div className="space-y-2">
            <h4 className="font-medium">{data.refinedIdea}</h4>
            <p className="text-sm text-muted-foreground">
              {data.problemStatement}
            </p>
            <div className="flex flex-wrap gap-1">
              {data.features
                ?.slice(0, 3)
                .map((feature: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
            </div>
          </div>
        )

      case "userStories":
        return (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {data.userStories?.length || 0} stories generated
            </p>
            {data.userStories?.slice(0, 2).map((story: any, idx: number) => (
              <div key={idx} className="text-xs space-y-1">
                <p className="font-medium">{story.title}</p>
                <p className="text-muted-foreground">
                  {story.description.slice(0, 100)}...
                </p>
              </div>
            ))}
          </div>
        )

      case "prd":
        return (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {data.wordCount || 0} words, {data.sections?.length || 0} sections
            </p>
            {data.notionUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openExternalLink(data.notionUrl)}
                className="w-full"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                View in Notion
              </Button>
            )}
          </div>
        )

      case "sprints":
        return (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {data.sprints?.length || 0} sprints planned
            </p>
            {data.linearUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openExternalLink(data.linearUrl)}
                className="w-full"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                View in Linear
              </Button>
            )}
          </div>
        )

      case "visual":
        return (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {data.artifacts?.length || 0} design artifacts
            </p>
            {data.boardUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openExternalLink(data.boardUrl)}
                className="w-full"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                View Miro Board
              </Button>
            )}
          </div>
        )

      default:
        return null
    }
  }

  const artifactItems = [
    {
      key: "idea",
      title: "Product Idea",
      description: "Refined and structured concept",
      icon: <Lightbulb className="w-5 h-5" />,
      data: artifacts.idea,
    },
    {
      key: "userStories",
      title: "User Stories",
      description: "Comprehensive stories with acceptance criteria",
      icon: <Users className="w-5 h-5" />,
      data: artifacts.userStories,
    },
    {
      key: "prd",
      title: "PRD",
      description: "Product Requirements Document",
      icon: <FileText className="w-5 h-5" />,
      data: artifacts.prd,
    },
    {
      key: "sprints",
      title: "Sprint Plans",
      description: "Development timeline and task breakdown",
      icon: <Calendar className="w-5 h-5" />,
      data: artifacts.sprints,
    },
    {
      key: "visual",
      title: "Visual Design",
      description: "User journey maps and workflow diagrams",
      icon: <Palette className="w-5 h-5" />,
      data: artifacts.visual,
    },
  ]

  const stats = conversation?.getConversationStats?.() || {
    totalMessages: 0,
    userMessages: 0,
    agentMessages: 0,
    agentUsage: {},
    averageProcessingTime: 0,
    artifactCount: 0,
    sessionDuration: 0,
  }

  return (
    <div className="space-y-6 max-h-[100vh] overflow-auto">
      {/* Artifacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {artifactItems.map((artifact, index) => {
          const status = getArtifactStatus(artifact.data)
          return (
            <Card
              key={artifact.key}
              className={` glassmorphism smooth-transition message-enter ${
                status === "completed"
                  ? "border-green-500/50 shadow-green-500/20"
                  : status === "pending"
                    ? "border-yellow-500/50"
                    : "border-border/50"
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-primary">
                    {artifact.icon}
                    <CardTitle className="text-base">
                      {artifact.title}
                    </CardTitle>
                  </div>
                  {getStatusIcon(status)}
                </div>
                <CardDescription className="text-sm">
                  {artifact.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {getStatusBadge(status)}
                {renderArtifactDetail(artifact.key, artifact.data)}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Conversation Stats */}
      {stats && (
        <>
          <Separator />
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Session Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">
                    {stats.totalMessages}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total Messages
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {stats.artifactCount}
                  </div>
                  <div className="text-xs text-muted-foreground">Artifacts</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {Math.round(stats.averageProcessingTime / 1000)}s
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Avg Response
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {Math.round((stats.sessionDuration || 0) / 60000)}m
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Session Time
                  </div>
                </div>
              </div>
              {conversation?.exportConversation && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={conversation.exportConversation}
                    className="w-full"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Export Conversation
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
