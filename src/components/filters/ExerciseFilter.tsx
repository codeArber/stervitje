import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dumbbell, HeartPulse, StretchHorizontal, BarChart3, ShieldCheck, Globe } from "lucide-react";
import React from "react";

export interface ExerciseFilterValues {
  category?: string;
  difficulty?: number;
  visibility?: string;
}

interface ExerciseFilterProps {
  values: ExerciseFilterValues;
  onChange: (values: ExerciseFilterValues) => void;
}

export function ExerciseFilter({ values, onChange }: ExerciseFilterProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      {/* Category Select */}
      <Select
        value={values.category}
        onValueChange={(v) => onChange({ ...values, category: v })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="strength">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4" /> Strength
            </div>
          </SelectItem>
          <SelectItem value="cardio">
            <div className="flex items-center gap-2">
              <HeartPulse className="h-4 w-4" /> Cardio
            </div>
          </SelectItem>
          <SelectItem value="flexibility">
            <div className="flex items-center gap-2">
              <StretchHorizontal className="h-4 w-4" /> Flexibility
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Difficulty Select */}
      <Select
        value={values.difficulty ? String(values.difficulty) : undefined}
        onValueChange={(v) => onChange({ ...values, difficulty: Number(v) })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Difficulty" />
        </SelectTrigger>
        <SelectContent>
          {[1,2,3,4,5].map(level => (
            <SelectItem key={level} value={String(level)}>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" /> Level {level}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Visibility Select */}
      <Select
        value={values.visibility}
        onValueChange={(v) => onChange({ ...values, visibility: v })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Visibility" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="public">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" /> Public
            </div>
          </SelectItem>
          <SelectItem value="private">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Private
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
