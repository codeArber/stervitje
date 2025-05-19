import { createFileRoute } from '@tanstack/react-router'
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { InputWithUnit } from "@/components/ui/input-with-unit"
import { Label } from "@/components/ui/label"
import useTheme from '@/hooks/use-theme';
import { useUpdateProfile, useUserQuery } from '@/api/user';
import { useAuthStore } from '@/hooks/useAuthStore';
import { set } from 'zod';
import { Metric } from '@/types';

export const Route = createFileRoute('/_layout/settings/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { theme, toggleTheme } = useTheme()
  // const user = useUserQuery()
  const { getPreferredUnit } = useAuthStore()
  const updateUser = useUpdateProfile()
  const unit = getPreferredUnit()
  return (
    <div className="flex flex-1 flex-col p-6 space-y-8 ">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* General Preferences */}
      <section className="space-y-4">
        <div className="space-y-2">
          <Label>Theme</Label>
          <Select value={theme} onValueChange={toggleTheme}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Metric Preferences */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Preferred Units</h2>

        <div className="space-y-2">
          <Label>Unit</Label>
          <Select value={getPreferredUnit()} onValueChange={(value) => updateUser.mutate({
            unit: value as Metric
          })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select weight unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="metric">Metric</SelectItem>
              <SelectItem value="imperial">Imperial</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Personal Info */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Your Metrics</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Height</Label>
            <InputWithUnit unit={unit === 'imperial' ? 'in' : 'cm'} type="number" placeholder="e.g. 175" />
          </div>

          <div className="space-y-2">
            <Label>Weight</Label>
            <InputWithUnit unit={unit === 'imperial' ? 'lb' : 'kg'} type="number" placeholder="e.g. 70" />
          </div>

          <div className="space-y-2">
            <Label>Age</Label>
            <Input type="number" placeholder="e.g. 25" />
          </div>

          <div className="space-y-2">
            <Label>Biceps Circ.</Label>
            <InputWithUnit unit={unit === 'imperial' ? 'in' : 'cm'} type="number" placeholder="e.g. 30" />
          </div>

          <div className="space-y-2">
            <Label>Leg Circ.</Label>
            <InputWithUnit unit={unit === 'imperial' ? 'in' : 'cm'} type="number" placeholder="e.g. 50" />
          </div>
        </div>
      </section>
    </div>
  )
}
