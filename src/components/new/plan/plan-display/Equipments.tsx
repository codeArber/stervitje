import { Ban, Cable, Circle, Dumbbell, Grip, Minus, RectangleHorizontal, Settings } from "lucide-react";
import { LucideIcon } from "lucide-react";

// Types
export interface Equipment {
  idx: number;
  id: number;
  name: string;
  tag_type: "equipment";
  icon: LucideIcon;
}

export type EquipmentSize = "sm" | "default" | "lg";

export interface EquipmentBadgeProps {
  equipmentId?: number;
  equipmentName?: string;
  size?: EquipmentSize;
}

// Equipment data with proper typing
const EQUIPMENT_DATA: Equipment[] = [
  { idx: 0, id: 1, name: "None", tag_type: "equipment", icon: Ban },
  { idx: 1, id: 2, name: "Barbell", tag_type: "equipment", icon: Minus },
  { idx: 2, id: 3, name: "Dumbbell", tag_type: "equipment", icon: Dumbbell },
  { idx: 3, id: 4, name: "Kettlebell", tag_type: "equipment", icon: Circle },
  { idx: 4, id: 5, name: "Bench", tag_type: "equipment", icon: RectangleHorizontal },
  { idx: 5, id: 6, name: "Pull-up Bar", tag_type: "equipment", icon: Grip },
  { idx: 6, id: 7, name: "Resistance Band", tag_type: "equipment", icon: Cable },
  { idx: 7, id: 8, name: "Cable Machine", tag_type: "equipment", icon: Settings }
];

// Equipment Badge Component
export const EquipmentBadge: React.FC<EquipmentBadgeProps> = ({ 
  equipmentId, 
  equipmentName, 
  size = "default" 
}) => {
  // Find equipment by ID or name
  const equipment = EQUIPMENT_DATA.find(eq => 
    eq.id === equipmentId || eq.name === equipmentName
  );
  
  if (!equipment) {
    return null;
  }
  
  const Icon = equipment.icon;
  
  const sizeClasses: Record<EquipmentSize, string> = {
    sm: "px-2 py-1 text-xs",
    default: "px-2 py-1 text-sm",
    lg: "px-4 py-2 text-base"
  };
  
  const iconSizes: Record<EquipmentSize, string> = {
    sm: "w-3 h-3",
    default: "w-3 h-3", 
    lg: "w-5 h-5"
  };
  
  return (
    <div className={`inline-flex items-center gap-2 bg-blue-500/40 border border-blue-500 rounded-md ${sizeClasses[size]} text-xs no-whitespace text-foreground`}>
      <Icon className={`${iconSizes[size]} text-blue-600 dark:text-blue-400`} />
      <span className="inline-flex no-whitespace">{equipment.name}</span>
    </div>
  );
};

// Utility functions with proper return types
export const getEquipmentById = (id: number): Equipment | undefined => {
  return EQUIPMENT_DATA.find(eq => eq.id === id);
};

export const getEquipmentByName = (name: string): Equipment | undefined => {
  return EQUIPMENT_DATA.find(eq => eq.name === name);
};

export const getAllEquipment = (): Equipment[] => {
  return EQUIPMENT_DATA;
};

// Export the equipment data if needed elsewhere
export { EQUIPMENT_DATA };