import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface QuizOption {
  id: string;
  text: string;
}

interface QuizQuestionProps {
  questionText: string;
  options: QuizOption[];
  correctOptionId?: string; // Passed only after submission, or if known
  explanation?: string;
  isSubmitted?: boolean;
  onSelectOption: (id: string) => void;
  selectedOptionId?: string;
  className?: string;
}

export function QuizQuestion({
  questionText,
  options,
  correctOptionId,
  explanation,
  isSubmitted = false,
  onSelectOption,
  selectedOptionId,
  className,
}: QuizQuestionProps) {
  
  return (
    <Card className={cn("overflow-hidden border-0 shadow-none", className)}>
      <CardContent className="p-0 space-y-6">
        <h3 className="text-lg font-medium leading-relaxed">{questionText}</h3>
        
        <div className="space-y-3">
          {options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            const isCorrect = isSubmitted && correctOptionId === option.id;
            const isWrongSelected = isSubmitted && isSelected && correctOptionId !== option.id;
            
            return (
              <button
                key={option.id}
                disabled={isSubmitted}
                onClick={() => onSelectOption(option.id)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-200",
                  !isSubmitted && !isSelected && "hover:border-primary/50 hover:bg-muted/50",
                  !isSubmitted && isSelected && "border-primary bg-primary/5 ring-1 ring-primary",
                  isCorrect && "border-green-500 bg-green-500/10 ring-1 ring-green-500 text-green-900 dark:text-green-100",
                  isWrongSelected && "border-red-500 bg-red-500/10 ring-1 ring-red-500 text-red-900 dark:text-red-100",
                  isSubmitted && !isCorrect && !isWrongSelected && "opacity-50 border-muted bg-transparent"
                )}
              >
                <span className="flex-1">{option.text}</span>
                {isCorrect && <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 ml-3" />}
                {isWrongSelected && <XCircle className="h-5 w-5 text-red-500 shrink-0 ml-3" />}
              </button>
            );
          })}
        </div>

        {isSubmitted && explanation && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className={cn(
              "p-4 rounded-xl text-sm border",
              selectedOptionId === correctOptionId 
                ? "bg-green-500/10 border-green-500/20 text-green-800 dark:text-green-200"
                : "bg-blue-500/10 border-blue-500/20 text-blue-800 dark:text-blue-200"
            )}>
              <span className="font-semibold block mb-1">
                {selectedOptionId === correctOptionId ? "Correct!" : "Explanation:"}
              </span>
              {explanation}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
