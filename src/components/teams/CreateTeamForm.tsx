import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCreateTeam } from '@/api/teams/index'
import { useNavigate } from '@tanstack/react-router'

type CreateTeamFormProps = {
  onClose: () => void
}

export function CreateTeamForm({ onClose }: CreateTeamFormProps) {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sport: '',
    is_private: false,
    logo_url: null,
    updated_at: new Date().toISOString(),
  })
  
  const createTeamMutation = useCreateTeam()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Call the mutation to create the team
      await createTeamMutation.mutateAsync({
        name: formData.name,
        description: formData.description,
        sport: formData.sport,
        is_private: formData.is_private,
        logo_url: formData.logo_url,
        updated_at: formData.updated_at,
      })
      
      // Reset form and close dialog
      setFormData({ 
        name: '', 
        description: '', 
        sport: '',
        is_private: false,
        logo_url: null,
        updated_at: new Date().toISOString(),
      })
      onClose()
      
      // Navigate back to teams page
      navigate({ to: '/teams' })
    } catch (error) {
      console.error('Error creating team:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({ 
      name: '', 
      description: '', 
      sport: '',
      is_private: false,
      logo_url: null,
      updated_at: new Date().toISOString(),
    })
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Team Name *
        </label>
        <Input
          type="text"
          id="name"
          name="name"
          value={formData.name}
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
      
      <div>
        <label htmlFor="sport" className="block text-sm font-medium text-gray-700 mb-1">
          Sport
        </label>
        <Input
          type="text"
          id="sport"
          name="sport"
          value={formData.sport}
          onChange={handleChange}
        />
      </div>

      <div className="flex items-center space-x-2 pt-2">
        <input
          type="checkbox"
          id="is_private"
          name="is_private"
          checked={formData.is_private}
          onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.checked }))}
          className="rounded"
        />
        <label htmlFor="is_private" className="block text-sm font-medium text-gray-700">
          Private Team
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
          disabled={isSubmitting || createTeamMutation.isPending}
          className="flex-1"
        >
          {isSubmitting || createTeamMutation.isPending ? 'Creating...' : 'Create Team'}
        </Button>
      </div>
    </form>
  )
}
