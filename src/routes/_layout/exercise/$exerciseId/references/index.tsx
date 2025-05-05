import { useFetchExerciseById } from '@/api/exercises';
import TikTokPreview from '@/components/ReferencePreview';
import { TikTokEmbed } from '@/components/TikTokEmbed';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_layout/exercise/$exerciseId/references/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { exerciseId } = Route.useParams();
  const { data: exercise } = useFetchExerciseById(exerciseId);
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
          <Input placeholder='Search reference'/>
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
       
</div>
      </div>
      <div className='flex flex-row flex-wrap w-full p-4'>
        {exercise?.exercise_reference_global?.map((reference, index) => (
          <div key={index} className='rounded w-64 overflow-hidden shadow p-4'>
            <p>{reference.title}</p>
            <TikTokPreview reference={reference.url} />
          </div>
        ))}
      </div>
    </div>
  )
}
