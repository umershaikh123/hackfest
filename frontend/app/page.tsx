"use client"

import { useState } from "react"
import { ChatInterface } from "@/components/chat-interface"
import { ResultsDashboard } from "@/components/results-dashboard"
import { ThemeSwitcher } from "@/components/theme-switcher"

export default function Home() {
  const [showResults, setShowResults] = useState(false)

  const handleFirstInteraction = () => {
    setShowResults(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold gradient-text">🚀 Product Maestro</h1>
              <h2 className="text-xl text-muted-foreground">AI-Powered No-Code IDE for Product Managers</h2>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Transform your raw ideas into structured development plans with intelligent AI agents
              </p>
            </div>
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className={`grid gap-8 ${showResults ? "lg:grid-cols-2" : "lg:grid-cols-1"} transition-all duration-500`}>
          {/* Chat Interface */}
          <div className="space-y-6">
            <div className="glassmorphism rounded-xl border border-border/50 h-[600px] flex flex-col">
              <ChatInterface onFirstInteraction={handleFirstInteraction} />
            </div>
          </div>

          {/* Results Dashboard */}
          {showResults && (
            <div className="space-y-6 animate-in slide-in-from-right duration-500">
              <div className="glassmorphism rounded-xl border border-border/50">
                <ResultsDashboard />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
