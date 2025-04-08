import { createFileRoute, Link, useParams } from '@tanstack/react-router';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserRound, Trophy, Info, ListChecks } from 'lucide-react'; // Relevant icons
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useTeamPlans } from '@/api/plans/plan';
import Model from 'react-body-highlighter';
import { exercises } from '..';
import { useTeamMembers } from '@/api/teams';

// Placeholder Data - Replace with your actual team data
const teamDetails = {
  name: 'Vienna Vipers',
  logoUrl: '/images/team-logo.png', // Replace with your actual logo URL
  description: 'A passionate and competitive team based in Vienna.',
  established: '2020',
  city: 'Vienna',
  country: 'Austria',
  recordWins: 150,
  recordLosses: 50,
  achievements: ['2023 Regional Champions', '2022 National Runners-Up'],
};

const teamMembersData = [
  { id: 'coach-1', name: 'Helga Schmidt', role: 'Coach' },
  { id: 'student-1', name: 'Anton Meyer', role: 'Student' },
  { id: 'student-2', name: 'Lena Bauer', role: 'Student' },
  { id: 'coach-2', name: 'Franz Richter', role: 'Assistant Coach' },
  { id: 'student-3', name: 'Sophie Weber', role: 'Student' },
  // ... more members
];

const teamPlansData = [
  { id: 'plan-1', name: 'Summer Training Camp' },
  { id: 'plan-2', name: 'Pre-Season Conditioning' },
  { id: 'plan-3', name: 'Advanced Skill Development' },
  // ... more plans
];

export const Route = createFileRoute('/_layout/discover/team/$teamId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { teamId } = Route.useParams(); // The ID of the team being viewed
  const {data} = useTeamPlans(teamId as string) // Fetching team plans using the teamId
   const {data: teamMembers} = useTeamMembers(teamId as string) // Fetching team members using the teamId
  console.log('teamMembers', teamMembers)
  return (
    <div className="space-y-6">
      {/* First Div: Team Overview (Image, Info, Records/Achievements - in a row) */}
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
        {/* Team Image */}
        <Card className="w-full md:w-64">
          <CardContent className="p-4 flex justify-center items-center">
            <div className="relative w-48 h-48 rounded-full overflow-hidden bg-muted">
              {teamDetails.logoUrl ? (
                <img src={teamDetails.logoUrl} alt={`${teamDetails.name} Logo`} className="object-cover w-full h-full" />
              ) : (
                <div className="flex justify-center items-center w-full h-full text-lg font-semibold">{teamDetails.name.substring(0, 2).toUpperCase()}</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Team Info */}
        <Card className="flex-1">
          <CardHeader className="flex flex-row items-center space-x-2">
            <Info className="w-5 h-5 text-primary" />
            <CardTitle>Team Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><span className="font-semibold">Name:</span> {teamDetails.name}</p>
            <p><span className="font-semibold">Description:</span> {teamDetails.description}</p>
            <p><span className="font-semibold">Established:</span> {teamDetails.established}</p>
            <p><span className="font-semibold">Location:</span> {teamDetails.city}, {teamDetails.country}</p>
            {/* Add more team info here if needed */}
          </CardContent>
        </Card>

        {/* Team Records & Achievements */}
        <Card className="w-full md:w-96">
          <CardHeader className="flex flex-row items-center space-x-2">
            <Trophy className="w-5 h-5 text-secondary" />
            <CardTitle>Records & Achievements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><span className="font-semibold">Wins:</span> {teamDetails.recordWins}</p>
            <p><span className="font-semibold">Losses:</span> {teamDetails.recordLosses}</p>
            {teamDetails.achievements.length > 0 && (
              <div>
                <h4 className="font-semibold">Achievements:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {teamDetails.achievements.map((achievement) => (
                    <li key={achievement}>{achievement}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Second Div: Team Members (Table) */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
          <UserRound className="w-6 h-6 text-primary" />
          Team Members
        </h2>
        <Card>
          <CardContent>
            <Table>
              <TableCaption>Current members of the {teamDetails.name}.</TableCaption>
              <TableHead>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  {/* Add more table headers later */}
                </TableRow>
              </TableHead>
              <TableBody>
                {teamMembers?.map((member) => (
               <Link to='/discover/user/$userId' params={{ userId: member.user_id }} key={member.user_id}>
                  <TableRow key={member.user_id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{member.profile?.username}</span>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{member.role}</TableCell>
                    {/* Add more table cells later */}
                  </TableRow>
               </Link>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Third Div: Team Plans (List or Grid) */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
          <ListChecks className="w-6 h-6 text-primary" />
          Team Plans
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.map((plan) => (
              <Link key={plan.id} to='/plans/$planId' params={{ planId: plan.id }}>
                <Card >
                  <CardContent className="p-4">
                    <CardTitle className="text-xl font-semibold mb-1">
                      {plan.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground mb-2">
                      {plan.description || 'No description provided.'}
                    </CardDescription>

                    <div className="text-sm space-y-1 text-muted-foreground">
                      <p><strong>Created by:</strong> {plan.id}</p>
                      <p><strong>Created at:</strong> {new Date(plan?.created_at).toLocaleDateString()}</p>
                      {plan.duration_weeks && (
                        <p><strong>Duration:</strong> {plan.duration_weeks} week{plan.duration_weeks > 1 ? 's' : ''}</p>
                      )}
                      {plan.difficulty_level && (
                        <p><strong>Difficulty:</strong> {plan.difficulty_level}</p>
                      )}
                      {plan.sport && (
                        <p><strong>Sport:</strong> {plan.sport}</p>
                      )}
                      {plan.team_name && (
                        <p><strong>Team:</strong> {plan.team_name}</p>
                      )}
                      <p><strong>Visibility:</strong> {plan.visibility}</p>
                      <div className="flex gap-4 pt-2 text-xs text-gray-500">
                        <span>👁️ {plan.view_count}</span>
                        <span>❤️ {plan.like_count}</span>
                        <span>🔁 {plan.fork_count}</span>
                        <span>12 active users</span>
                      </div>
                    </div>
                    <div className='flex w-full flex-row justify-between'>
                      <Model
                        data={exercises}
                        style={{ width: '10rem', padding: '1rem' }}
                   
                        // onClick={handleClick}
                      />
                      <Model
                        data={exercises}

                        style={{ width: '10rem', padding: '1rem' }}
                        type="posterior"
                      // onClick={handleClick}
                      />

                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
{/* <TeamWorkspace teamName={''} publicPlans={[{id: '1', title: 'sad', description: 'ads' */}
  //       }]} users={[{
  //         id: '1',
  //         name: 'Arber Bajraktari',
  //         role: 'Coach'
  //       }, {
  //         id: '2',
  //         name: 'Anis Shkembi',
  //         role: 'Student'
  //       }]} />