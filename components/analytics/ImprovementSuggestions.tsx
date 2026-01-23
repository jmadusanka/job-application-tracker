'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Lightbulb, AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react'
import { Suggestion, SuggestionCategory } from '@/lib/types'

interface ImprovementSuggestionsProps {
  suggestions: Suggestion[]
}

export function ImprovementSuggestions({ suggestions }: ImprovementSuggestionsProps) {
  // ── Helpers ────────────────────────────────────────────────────────────────
  const getCategoryIcon = (category: SuggestionCategory) => {
    switch (category) {
      case 'Summary':    return '📝'
      case 'Experience': return '💼'
      case 'Skills':     return '🎯'
      case 'Format':     return '📄'
      default:           return '💡'
    }
  }

  const getCategoryColor = (category: SuggestionCategory) => {
    switch (category) {
      case 'Summary':    return 'bg-blue-50 border-blue-200 hover:bg-blue-100'
      case 'Experience': return 'bg-purple-50 border-purple-200 hover:bg-purple-100'
      case 'Skills':     return 'bg-green-50 border-green-200 hover:bg-green-100'
      case 'Format':     return 'bg-amber-50 border-amber-200 hover:bg-amber-100'
      default:           return 'bg-slate-50 border-slate-200 hover:bg-slate-100'
    }
  }

  const getPriorityConfig = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return {
          variant: 'danger' as const,
          icon: <AlertTriangle className="w-3.5 h-3.5 text-red-600" />,
          label: 'HIGH PRIORITY'
        }
      case 'medium':
        return {
          variant: 'warning' as const,
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />,
          label: 'MEDIUM'
        }
      case 'low':
        return {
          variant: 'secondary' as const,   // ← safe & neutral fallback
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />,
          label: 'LOW'
        }
      default:
        return {
          variant: 'secondary' as const,   // ← fixed: use 'secondary' instead of 'outline'
          icon: null,
          label: priority.toUpperCase() || 'INFO'
        }
    }
  }

  // ── Group suggestions by category ──────────────────────────────────────────
  const grouped = suggestions.reduce((acc, s) => {
    const cat = s.category as SuggestionCategory
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(s)
    return acc
  }, {} as Record<SuggestionCategory, Suggestion[]>)

  const hasSuggestions = suggestions.length > 0

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-amber-600" />
          <CardTitle className="text-lg font-semibold">
            Resume Improvement Suggestions
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        {!hasSuggestions ? (
          <div className="py-10 text-center text-slate-500">
            <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className="text-base font-medium mb-1">No suggestions yet</p>
            <p className="text-sm">
              Add a job application with a description to get personalized AI tips.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category} className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl font-medium">{getCategoryIcon(category as SuggestionCategory)}</span>
                  <h4 className="font-semibold text-slate-800 text-base">
                    {category}
                  </h4>
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {items.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {items.map((suggestion, i) => {
                    const { variant, icon, label } = getPriorityConfig(suggestion.priority)
                    return (
                      <div
                        key={i}
                        className={`p-4 rounded-lg border transition-all duration-150 hover:shadow-sm ${getCategoryColor(category as SuggestionCategory)}`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            {icon}
                            <Badge 
                              variant={variant} 
                              className="text-xs font-medium px-2.5 py-0.5"
                            >
                              {label}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {suggestion.text}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {hasSuggestions && (
          <p className="text-xs text-slate-500 text-center mt-6 italic">
            Generated with AI • Review and personalize before using
          </p>
        )}
      </CardContent>
    </Card>
  )
}