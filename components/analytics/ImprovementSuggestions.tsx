'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb } from 'lucide-react';
import { Suggestion, SuggestionCategory } from '@/lib/types';

interface ImprovementSuggestionsProps {
  suggestions: Suggestion[];
}

export function ImprovementSuggestions({ suggestions }: ImprovementSuggestionsProps) {
  const getCategoryIcon = (category: SuggestionCategory) => {
    switch (category) {
      case 'Summary':
        return '📝';
      case 'Experience':
        return '💼';
      case 'Skills':
        return '🎯';
      case 'Format':
        return '📄';
      default:
        return '💡';
    }
  };

  const getCategoryColor = (category: SuggestionCategory) => {
    switch (category) {
      case 'Summary':
        return 'bg-blue-50 border-blue-200';
      case 'Experience':
        return 'bg-purple-50 border-purple-200';
      case 'Skills':
        return 'bg-green-50 border-green-200';
      case 'Format':
        return 'bg-amber-50 border-amber-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const groupedSuggestions = suggestions.reduce((acc, suggestion) => {
    if (!acc[suggestion.category]) {
      acc[suggestion.category] = [];
    }
    acc[suggestion.category].push(suggestion);
    return acc;
  }, {} as Record<SuggestionCategory, Suggestion[]>);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-600" />
          <CardTitle className="text-base">Improvement Suggestions</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(groupedSuggestions).map(([category, items]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{getCategoryIcon(category as SuggestionCategory)}</span>
                <h4 className="font-semibold text-slate-900">{category}</h4>
                <span className="text-xs text-slate-500">({items.length})</span>
              </div>
              <div className="space-y-2">
                {items.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${getCategoryColor(category as SuggestionCategory)}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <Badge variant={getPriorityVariant(suggestion.priority)} className="text-xs">
                        {suggestion.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-700">{suggestion.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
