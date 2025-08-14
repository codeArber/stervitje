import { createFileRoute } from '@tanstack/react-router'
import { queryClient } from '@/lib/query-client'
import { useFetchTeams } from '@/api/teams'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { TeamCard } from '@/components/teams/TeamCard'
import { CreateTeamForm } from '@/components/teams/CreateTeamForm'
import { useState } from 'react'

export const Route = createFileRoute('/_layout/teams/')({
  component: TeamsPage,
})

function TeamsPage() {
  const { data: teams, isLoading } = useFetchTeams()
  console.log(teams)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Teams</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
            </DialogHeader>
            <CreateTeamForm onClose={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="border rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams?.map(team => (
            <TeamCard 
              key={team.id} 
              team={team} 
            />
          ))}
        </div>
      )}
    </div>
  )
}
