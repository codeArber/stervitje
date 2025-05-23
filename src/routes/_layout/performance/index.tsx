import { useUserMeasurements } from '@/api/user'
import { useAuthStore } from '@/hooks/useAuthStore'
import { getDisplayLabel, getFieldType, MEASUREMENT_FIELDS } from '@/lib/data'
import { useUser } from '@supabase/auth-helpers-react'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/performance/')({
  component: RouteComponent,
})
function RouteComponent() {
  const { getId } = useAuthStore()
  const id = getId()
  const { data } = useUserMeasurements(id || '')
  
  if (!data) return null

  // Filter out non-measurement fields and photo URLs for cleaner display
  const getMeasurementFields = (measurement) => {
    return Object.entries(measurement)
      .filter(([key, value]) => {
        // Only show fields that exist in our constants and have values
        return MEASUREMENT_FIELDS[key] && 
               value !== null && 
               value !== undefined && 
               value !== '' &&
               getFieldType(key) === 'number' // Only show numeric measurements
      })
      .map(([key, value]) => ({
        key,
        label: getDisplayLabel(key),
        value,
        type: getFieldType(key)
      }))
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Performance</h1>
        <p className="text-sm text-gray-500">Track your performance over time</p>
        <Link to='/performance/measurement'>Add new</Link>
      </div>
      
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold">Measurements</h2>
        <p className="text-sm text-gray-500">Track your measurements over time</p>
        
        <div className="grid gap-6">
          {data.map((measurement) => {
            const measurementFields = getMeasurementFields(measurement)
            
            return (
              <div key={measurement.id} className="rounded-lg shadow-md p-6 border">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">
                    {formatDate(measurement.measurement_date)}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {measurementFields.length} measurements
                  </span>
                </div>
                
                {measurementFields.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {measurementFields.map(({ key, label, value }) => (
                      <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">{label}:</span>
                        <span className="text-gray-900">
                          {value} {getUnit(key)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No measurements recorded</p>
                )}
                
                {measurement.overall_notes && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-1">Notes</h4>
                    <p className="text-sm text-gray-700">{measurement.overall_notes}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        
        {data.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No measurements found</p>
            <p className="text-sm text-gray-400">Start tracking your progress by adding your first measurement</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function to get units for display
function getUnit(fieldName) {
  if (fieldName.includes('_kg')) return 'kg'
  if (fieldName.includes('_cm')) return 'cm'
  if (fieldName.includes('percentage')) return '%'
  if (fieldName.includes('heart_rate')) return 'bpm'
  return ''
}