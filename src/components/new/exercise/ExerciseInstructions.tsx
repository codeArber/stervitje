import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface InstructionsFormatterProps {
  instructions: string;
  title?: string;
  className?: string;
}

export function InstructionsFormatter({ 
  instructions, 
  title = "Instructions",
  className = "" 
}: InstructionsFormatterProps) {
  // Split instructions by \n or /n and filter out empty lines
  const steps = instructions
    .split(/[\\\/]n/)  // Split on both \n and /n
    .map(step => step.trim())
    .filter(step => step.length > 0);

  if (!steps.length) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">No instructions available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="p-6">
        {/* Title */}
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <Badge variant="secondary" className="text-xs">
            {steps.length} step{steps.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-3 group">
              {/* Step Number */}
              <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </div>
              
              {/* Step Content */}
              <div className="flex-1 pt-0.5">
                <p className="text-foreground leading-relaxed group-hover:text-primary transition-colors">
                  {step}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Alternative compact version without card wrapper
export function InstructionsFormatterCompact({ 
  instructions, 
  title,
  className = "" 
}: InstructionsFormatterProps) {
  const steps = instructions
    .split(/[\\\/]n/)  // Split on both \n and /n
    .map(step => step.trim())
    .filter(step => step.length > 0);

  if (!steps.length) {
    return (
      <div className={className}>
        <p className="text-muted-foreground text-sm">No instructions available</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Title */}
      {title && (
        <div className="flex items-center gap-2">
          <h4 className="text-base font-medium text-foreground">{title}</h4>
          <Badge variant="outline" className="text-xs">
            {steps.length} step{steps.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      )}

      {/* Steps */}
      <div className="space-y-2">
        {steps.map((step, index) => (
          <div key={index} className="flex gap-3 group">
            {/* Step Number */}
            <div className="flex-shrink-0 w-5 h-5 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-xs font-medium">
              {index + 1}
            </div>
            
            {/* Step Content */}
            <div className="flex-1">
              <p className="text-sm text-foreground leading-relaxed">
                {step}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}