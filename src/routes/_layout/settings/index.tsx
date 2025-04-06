import { createFileRoute } from '@tanstack/react-router'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const Route = createFileRoute('/_layout/settings/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="p-6 space-y-8 max-w-md">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* General Preferences */}
      <section className="space-y-4">
        <div className="space-y-2">
          <Label>Theme</Label>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Metric Preferences */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Preferred Units</h2>

        <div className="space-y-2">
          <Label>Weight Unit</Label>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select weight unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kg">Kilograms (kg)</SelectItem>
              <SelectItem value="lb">Pounds (lb)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Height Unit</Label>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select height unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cm">Centimeters (cm)</SelectItem>
              <SelectItem value="ftin">Feet & Inches</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Personal Info */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Your Metrics</h2>

        <div className="space-y-2">
          <Label>Height</Label>
          <Input type="number" placeholder="e.g. 175" />
        </div>

        <div className="space-y-2">
          <Label>Weight</Label>
          <Input type="number" placeholder="e.g. 70" />
        </div>

        <div className="space-y-2">
          <Label>Age</Label>
          <Input type="number" placeholder="e.g. 25" />
        </div>
      </section>
    </div>
  )
}
