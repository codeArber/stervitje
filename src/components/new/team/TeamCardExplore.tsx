import React from 'react';
import { Users, Crown, Clipboard, GraduationCap, FileText } from 'lucide-react';
import { RichTeamCardData } from '@/types/explore';
import { Label } from '@/components/ui/label';

// Using your existing types
interface User {
  name: string;
  email: string;
}


interface TeamCardProps {
  team: RichTeamCardData;
  // Optional props for handling user data when available
  admin?: User;
  coaches?: User[];
  students?: User[];
  onViewDetails?: (teamId: string) => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  admin,
  coaches = [],
  students = [],
  onViewDetails
}) => {
  const {
    id,
    name,
    description,
    sport,
    plans_count,
    members_count,
    created_at
  } = team;

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(id);
    }
  };

  return (
    <div className="border border-muted rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Label variant={'sectionTitle'}>{name}</Label>
            {sport && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {sport}
              </span>
            )}
          </div>
          {description && (
            <p className="text-gray-600 text-sm">{description}</p>
          )}
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Users className="w-4 h-4 mr-1" />
          {members_count}
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-4 mb-4 p-3 border-b rounded-lg">
        <div className="flex items-center">
          <FileText className="w-4 h-4 text-purple-500 mr-2" />
          <span className="text-sm text-gray-700">
            <span className="font-medium">{plans_count}</span> plans
          </span>
        </div>
        <div className="flex items-center">
          <Users className="w-4 h-4 text-gray-500 mr-2" />
          <span className="text-sm text-gray-700">
            <span className="font-medium">{members_count}</span> members
          </span>
        </div>
      </div>

      {/* Admin Section - Only show if admin data is provided */}
      {admin && (
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <Crown className="w-4 h-4 text-yellow-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">Admin</span>
          </div>
          <div className="ml-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-sm font-medium text-yellow-700">
                  {admin.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{admin.name}</p>
                <p className="text-xs text-gray-500">{admin.email}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Coaches Section - Only show if coaches data is provided */}
      {coaches.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <Clipboard className="w-4 h-4 text-blue-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">
              Coaches ({coaches.length})
            </span>
          </div>
          <div className="ml-6">
            <div className="space-y-2">
              {coaches.slice(0, 3).map((coach, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                    <span className="text-xs font-medium text-blue-700">
                      {coach.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">{coach.name}</p>
                  </div>
                </div>
              ))}
              {coaches.length > 3 && (
                <p className="text-xs text-gray-500 ml-8">
                  +{coaches.length - 3} more coaches
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Students Section - Only show if students data is provided */}
      {students.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <GraduationCap className="w-4 h-4 text-green-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">
              Students ({students.length})
            </span>
          </div>
          <div className="ml-6">
            <div className="flex flex-wrap gap-1">
              {students.slice(0, 6).map((student, index) => (
                <div
                  key={index}
                  className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center"
                  title={student.name}
                >
                  <span className="text-xs font-medium text-green-700">
                    {student.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              ))}
              {students.length > 6 && (
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    +{students.length - 6}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>
            Created {created_at ? formatDate(created_at) : 'Unknown date'}
          </span>
          <button
            onClick={handleViewDetails}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};