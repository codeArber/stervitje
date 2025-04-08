import { createFileRoute, Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  UserRound,
  Users,
  Dumbbell,
  Clock,
  TrendingUp,
  ListChecks,
  Calendar,
} from 'lucide-react'; // Ensure lucide-react is installed
import Timeline, {
  TimelineMarkers, // Import the wrapper for markers
  TodayMarker      // Import the specific marker for today's date/time
  // Import other markers like CustomMarker or CursorMarker if needed later
} from 'react-calendar-timeline';
import moment from 'moment' // Ensure moment is installed (npm install moment)
import 'react-calendar-timeline/style.css'; // Import timeline styles
import { useMemo } from 'react'; // Import useMemo for potentially calculating ranges
import { useUserPlans, useUserPublicWorkouts, useUserTeams } from '@/api/user';
import { Badge } from '@/components/ui/badge';

// Define types for better clarity (optional but recommended)
interface TimelineGroup {
  id: number;
  title: string;
}

interface TimelineItem {
  id: number;
  group: number;
  title: string;
  start_time: moment.Moment;
  end_time: moment.Moment;
  // You can add other properties like itemProps for styling
  itemProps?: React.HTMLAttributes<HTMLDivElement>;
}


export const Route = createFileRoute('/_layout/discover/user/$userId/')({
  component: RouteComponent,
});

function RouteComponent() {

  const { userId } = Route.useParams()
  const { data: teams } = useUserTeams(userId)
  const {data} = useUserPlans(userId as string) // Fetching user plans using the userId
  const {data: workouts} = useUserPublicWorkouts(userId as string) // Fetching user workouts using the userId
  // --- Groups remain the same or adjust as needed ---
  const groups: TimelineGroup[] = [
    { id: 1, title: 'Phase A' },
    { id: 2, title: 'Phase B' }
  ];

  // --- Items spanning longer durations (Weeks/Months) ---
  const items: TimelineItem[] = useMemo(() => [ // Using useMemo isn't strictly necessary for static data, but good practice if data could change
    {
      id: 1,
      group: 1, // Belongs to Phase A
      title: 'Foundation Building',
      start_time: moment("2025-04-01"), // Example: Start April 1st
      end_time: moment("2025-04-21"),   // Example: End April 21st (3 weeks)
      itemProps: {
        style: { background: 'lightblue', border: '1px solid blue' }
      }
    },
    {
      id: 2,
      group: 2, // Belongs to Phase B
      title: 'Strength Development',
      start_time: moment("2025-04-15"), // Example: Start April 15th
      end_time: moment("2025-06-15"),   // Example: End June 15th (2 months)
      itemProps: {
        style: { background: 'lightgreen', border: '1px solid green' }
      }
    },
    {
      id: 3,
      group: 1, // Belongs to Phase A
      title: 'Skill Refinement',
      start_time: moment("2025-05-01"), // Example: Start May 1st
      end_time: moment("2025-05-22"),   // Example: End May 22nd (3 weeks)
      itemProps: {
        style: { background: 'lightcoral', border: '1px solid red' }
      }
    },
    {
      id: 4,
      group: 2, // Belongs to Phase B
      title: 'Peak Performance Prep',
      start_time: moment("2025-06-20"), // Example: Start June 20th
      end_time: moment("2025-07-10"),   // Example: End July 10th (~3 weeks)
      itemProps: {
        style: { background: 'lightgoldenrodyellow', border: '1px solid orange' }
      }
    }
  ], []); // Empty dependency array because this static data doesn't change

  // --- Calculate default view range based on item data ---
  const defaultTimeStart = useMemo(() => {
    if (items.length === 0) return moment().add(-1, 'month').valueOf();
    // Find the earliest start time
    const minStart = items.reduce((min, item) => (item.start_time.isBefore(min) ? item.start_time : min), items[0].start_time);
    return minStart.clone().subtract(1, 'month').valueOf(); // Start view 1 month before the first item
  }, [items]);

  const defaultTimeEnd = useMemo(() => {
    if (items.length === 0) return moment().add(1, 'month').valueOf();
    // Find the latest end time
    const maxEnd = items.reduce((max, item) => (item.end_time.isAfter(max) ? item.end_time : max), items[0].end_time);
    return maxEnd.clone().add(1, 'month').valueOf(); // End view 1 month after the last item
  }, [items]);

  return (
    <div className="flex flex-col">
      {/* --- User Info Row (Top Section) --- */}
      <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 mb-4">
        {/* Placeholder for User Profile Picture */}
        <div className="flex-shrink-0 rounded-full bg-gray-300 h-24 w-24 flex items-center justify-center">
          <UserRound className="h-12 w-12 text-gray-500" />
        </div>

        {/* User Statistics and Teams Row */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
          {/* User Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-sm font-medium">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>User Statistics</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {/* Using text-xs for smaller cards */}
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>Total Sessions (Last 30 Days):</span>
                <span className="font-bold text-indigo-600">12</span>
              </div>
              <div className="flex items-center space-x-2">
                <Dumbbell className="h-4 w-4 text-gray-500" />
                <span>Training Hours:</span>
                <span className="font-bold text-indigo-600">15h</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>Sessions/Week:</span>
                <span className="font-bold text-indigo-600">3</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-gray-500" />
                <span>Improvements:</span>
                <span className="font-bold text-green-600">+10%</span>
              </div>
            </CardContent>
          </Card>

          {/* Teams */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-sm font-medium">
                <Users className="h-4 w-4 text-blue-500" />
                <span>Teams</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs">
              {/* Using text-xs */}
              <ul className="space-y-2">

                {teams?.map((team) => {
                  if (team.team.is_private) {
                    return (
                      <li key={team.id} className="flex items-center justify-between space-x-2">
                        <div className="flex flex-row gap-2 items-center">
                          <div className="rounded-full bg-blue-200 h-2 w-2"></div>
                          <span>{team.team?.name}</span>
                        </div>
                        <Badge variant={'outline'}>Private</Badge>
                      </li>
                    )
                  }
                  return (
                    (


                      <Link to='/discover/team/$teamId' params={{ teamId: team.team_id }} key={team.id}>
                        <li className="flex items-center space-x-2">
                          <div className="flex flex-row gap-2 items-center">

                            <div className="rounded-full bg-blue-200 h-2 w-2"></div>
                            <span>{team.team?.name}</span>
                          </div>
                        </li>
                      </Link>
                    )
                  )
                })}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* --- Plans Section (Timeline) --- */}
      <div className="w-full">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ListChecks className="h-4 w-4 text-orange-500" />
              <span>Plans Timeline</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Container div might be needed for specific styling or overflow control */}
            <div>
              <Timeline
                groups={groups}
                items={items.map(item => ({ ...item, start_time: item.start_time.valueOf(), end_time: item.end_time.valueOf() }))}
                defaultTimeStart={defaultTimeStart}
                defaultTimeEnd={defaultTimeEnd}
                canMove={false}
                canResize={false}
                sidebarWidth={100}
                lineHeight={40}
                itemHeightRatio={0.75}
              // Remove the 'markers' prop if you were using the manual method
              >
                {/* --- Use the built-in markers --- */}
                <TimelineMarkers>
                  <TodayMarker>
                    {/* Optional: Custom renderer for TodayMarker */}
                    {({ styles, date }) => <div style={{ ...styles, backgroundColor: 'red', width: '2px', zIndex: 10 }} />}
                  </TodayMarker>

                  {/* You could add other markers here too */}
                  {/* <CursorMarker /> */}
                  {/* <CustomMarker date={someSpecificTimestamp} /> */}
                </TimelineMarkers>
                {/* --- End of markers --- */}
              </Timeline>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* --- Session Details Section (Table) --- */}
      <div className="w-full">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-700" />
              <span>Session Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-auto"> {/* Added table-auto */}
                <thead>
                  <tr className="border-b bg-gray-50"> {/* Added bg color */}
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Date</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Description</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Duration</th> {/* Example extra column */}
                  </tr>
                </thead>
                <tbody>
                  {workouts?.map((workout) => (
                    <tr key={workout.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{new Date(workout.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-2">{workout.title}</td>
                      <td className="px-4 py-2">{workout.duration_minutes}</td> {/* Example extra column */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}