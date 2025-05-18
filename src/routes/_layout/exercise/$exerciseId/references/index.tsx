import { useCreateExerciseSavedReference, useFetchExerciseById, useRemoveExerciseSavedReference } from '@/api/exercises';
import Icons from '@/components/icons/Icons';
import TikTokPreview from '@/components/ReferencePreview';
import { TikTokEmbed } from '@/components/TikTokEmbed';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useExerciseReferenceLists } from '@/hooks/use-references';
import { cn } from '@/lib/utils';
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_layout/exercise/$exerciseId/references/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { exerciseId } = Route.useParams();
  const { globalRefs, savedRefs } = useExerciseReferenceLists(exerciseId)
  const { data: exercise } = useFetchExerciseById(exerciseId)
  const saveReference = useCreateExerciseSavedReference()
  const removeReference = useRemoveExerciseSavedReference()
  return (
    <div className="flex flex-col w-full ">
      {/* Back Button */}
      <div className='flex flex-row '>
        <div className=' bg-sidebar flex items-center shadow px-4 py-6 z-10 w-full justify-between h-18'>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink >
                  <Link to='/'>
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink >
                  <Link to='/exercise'>
                    Exercises
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink >
                  <Link to='/exercise/$exerciseId' params={{ exerciseId }}>
                    {exercise?.name}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>References</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div></div>
        </div>
      </div>
      {/* Header */}
      <div className='flex flex-col w-full p-4 py-8 gap-4'  >
        <h2 className="text-2xl font-semibold tracking-tight ">Exercise Global References</h2>
        <div className='flex flex-row gap-4'>

          <div className='flex items-center'>
            <Input placeholder='Search reference' />
          </div>
          <div className='flex items-center w-fit'>
            <Select defaultValue="all">
              <SelectTrigger className='w-32'>
                <SelectValue placeholder="Select a sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="youtube">Youtube</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='flex items-center w-fit'>
            <Select defaultValue="saved">
              <SelectTrigger className='w-32'>
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">Global</SelectItem>
                <SelectItem value="team">Team</SelectItem>
                <SelectItem value="saved">Saved</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </div>
      </div>
      <div className='flex flex-row flex-wrap w-full p-4'>
        {savedRefs?.map((reference, index) => {
          return (
            <div key={index} className='rounded w-64 overflow-hidden shadow p-4'>
              <div className="flex justify-between items-center p-2 ">
                <p>{reference?.globalReference?.title}</p>
                {reference?.globalReference?.source === 'tiktok' && <Icons.tiktok />}
                <Button
                  onClick={() => removeReference.mutate({
                    id: reference?.savedReferenceId || '',
                    exerciseId: reference?.globalReference?.exercise_id || '',
                  })}>
                  Remove
                </Button>
              </div>
              {reference?.globalReference?.source === "tiktok" && <TikTokPreview reference={reference?.globalReference?.url} />}
              {/* {reference.source === "youtube" && <TikTokPreview reference={reference.url} />} */}
            </div>
          )
        })}
        <div className='flex flex-row flex-wrap w-full p-4'>
          Global
        </div>
        {globalRefs?.map((reference, index) => (
          <div key={index} className='rounded w-64 overflow-hidden shadow p-4'>
            <div className="flex justify-between items-center p-2 ">
              <p>{reference.title}</p>
              {reference.source === 'tiktok' && <Icons.tiktok />}
              <Button
                variant={'outline'}
                onClick={() => saveReference.mutate({
                  reference: {
                    global_reference: reference.id,
                    exercise_id: reference.exercise_id,
                  }
                })}>
                Save
              </Button>
            </div>
            {reference.source === "tiktok" && <TikTokPreview reference={reference.url} />}
            {/* {reference.source === "youtube" && <TikTokPreview reference={reference.url} />} */}
          </div>
        ))}
      </div>
    </div>
  )
}
