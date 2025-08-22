import React from 'react';
import { cn } from '@/lib/utils';

interface DayLevelWeekIndicatorProps {
  currentDay: number; // 1-7 (Monday = 1, Sunday = 7) - the day user is currently viewing/on
  weekDays: Array<{
    day_number: number;
    is_rest_day: boolean;
    has_sessions: boolean;
  }>;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  className?: string;
  weekNumber?: number;
}

const DayLevelWeekIndicator: React.FC<DayLevelWeekIndicatorProps> = ({
  currentDay,
  weekDays,
  size = 'md',
  showLabels = false,
  className,
  weekNumber
}) => {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']; // Mon-Sun labels
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-5 w-5 text-xs';
      case 'lg':
        return 'h-12 w-12 text-base';
      default:
        return 'h-8 w-8 text-sm';
    }
  };

  const getDayInfo = (dayIndex: number) => {
    const dayNumber = dayIndex + 1;
    return weekDays.find(day => day.day_number === dayNumber) || {
      day_number: dayNumber,
      is_rest_day: true,
      has_sessions: false
    };
  };

  const getDayClasses = (dayIndex: number) => {
    const dayNumber = dayIndex + 1;
    const dayInfo = getDayInfo(dayIndex);
    const isCurrentDay = dayNumber === currentDay;
    
    const baseClasses = cn(
      'flex items-center justify-center rounded-full font-medium transition-all duration-200 border-2',
      getSizeClasses()
    );

    if (isCurrentDay && dayInfo.is_rest_day) {
      // Current day - rest (active rest)
      return cn(
        baseClasses,
        'text-white',
        // Using custom hex colors for active rest
        'border-[#ceffcc]',
        'bg-[#212121]'
      );
    } else if (isCurrentDay && (dayInfo.has_sessions || !dayInfo.is_rest_day)) {
      // Current day - workout (active workout)
      return cn(
        baseClasses,
        'text-white',
        // Using custom hex colors for active workout
        'border-[#66ff61]',
        'bg-[#474ec8]'
      );
    } else if (dayInfo.is_rest_day) {
      // Rest day - not active
      return cn(
        baseClasses,
        'text-white',
        // Using custom hex colors for rest
        'border-[#383838]',
        'bg-[#212121]'
      );
    } else if (dayInfo.has_sessions) {
      // Workout day - not active
      return cn(
        baseClasses,
        'text-white',
        // Using custom hex colors for workout
        'border-[#5c5e80]',
        'bg-[#242764]'
      );
    } else {
      // No data - muted
      return cn(
        baseClasses,
        'text-gray-400 border-gray-600 bg-gray-800'
      );
    }
  };

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      {/* Day indicators */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: 7 }, (_, index) => {
          const dayInfo = getDayInfo(index);
          const tooltip = `${dayNames[index]}${dayInfo.is_rest_day ? ' (Rest Day)' : dayInfo.has_sessions ? ' (Workout)' : ' (No Data)'}`;
          
          return (
            <div
              key={index}
              className={getDayClasses(index)}
              title={tooltip}
            >
              {showLabels ? days[index] : ''}
            </div>
          );
        })}
      </div>
      
      {/* Legend
      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-[#474ec8] border border-[#66ff61]"></div>
          <span>Today</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-[#242764] border border-[#5c5e80]"></div>
          <span>Workout</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-[#212121] border border-[#383838]"></div>
          <span>Rest</span>
        </div>
      </div> */}
    </div>
  );
};

export default DayLevelWeekIndicator;