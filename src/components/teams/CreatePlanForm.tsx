import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCreatePlan } from '@/api/plan/index'

type CreatePlanFormProps = {
  teamId: string
  onClose: () => void
}

export function CreatePlanForm({ teamId, onClose }: CreatePlanFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    team_id: teamId,
    private: false,
  })
  
  const createPlanMutation = useCreatePlan()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    
    // Special handling for checkbox
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Call the mutation to create the plan
      // We'll pass only the fields we know are needed, letting the API handle defaults
      await createPlanMutation.mutateAsync({
        title: formData.title,
        description: formData.description,
        team_id: teamId,
        private: formData.private,
      } as any)
      
      // Reset form and close dialog
      setFormData({ 
        title: '', 
        description: '', 
        team_id: teamId,
        private: false,
      })
      onClose()
    } catch (error) {
      console.error('Error creating plan:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({ 
      title: '', 
      description: '', 
      team_id: teamId,
      private: false,
    })
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Plan Title *
        </label>
        <Input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2 pt-2">
        <input
          type="checkbox"
          id="private"
          name="private"
          checked={formData.private}
          onChange={handleChange}
          className="rounded"
        />
        <label htmlFor="private" className="block text-sm font-medium text-gray-700">
          Private Plan
        </label>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2 pt-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleClose}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || createPlanMutation.isPending}
          className="flex-1"
        >
          {isSubmitting || createPlanMutation.isPending ? 'Creating...' : 'Create Plan'}
        </Button>
      </div>
    </form>
  )
}
