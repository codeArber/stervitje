export enum ExerciseCategory {
  STRENGTH = 'strength',            // Building muscular force
  ENDURANCE = 'endurance',          // Muscular or aerobic endurance
  MOBILITY = 'mobility',            // Joint range of motion
  POWER = 'power',                  // Explosive force (e.g., jumps)
  SPEED = 'speed',                  // Sprinting, fast footwork
  AGILITY = 'agility',              // Quick directional changes
  BALANCE = 'balance',              // Stability and control
  COORDINATION = 'coordination',    // Complex motor skills, timing
  RECOVERY = 'recovery',            // Active rest, cooldowns
  CORE_STABILITY = 'core_stability' // Deep core and anti-rotation focus
}

  

  // libs/data.ts

export enum MuscleGroup {
  TRAPEZIUS      = "trapezius",
  UPPER_BACK     = "upper-back",
  LOWER_BACK     = "lower-back",
  CHEST          = "chest",
  BICEPS         = "biceps",
  TRICEPS        = "triceps",
  FOREARM        = "forearm",
  BACK_DELTOIDS  = "back-deltoids",
  FRONT_DELTOIDS = "front-deltoids",
  ABS            = "abs",
  OBLIQUES       = "obliques",
  ADDUCTOR       = "adductor",
  HAMSTRING      = "hamstring",
  QUADRICEPS     = "quadriceps",
  ABDUCTORS      = "abductors",
  CALVES         = "calves",
  GLUTEAL        = "gluteal",
  HEAD           = "head",
  NECK           = "neck",
}


// libs/data.ts

export enum ExerciseType {
  PULL        = "pull",
  PUSH        = "push",
  ISOMETRIC   = "isometric",
  PLYOMETRIC  = "plyometric",
  ROTATIONAL  = "rotational",
  DYNAMIC     = "dynamic"
}


// runtime array if you need to map/UI–over it:
export const exerciseTypes = Object.values(ExerciseType) as ExerciseType[]
export const muscleGroups = Object.values(MuscleGroup) as MuscleGroup[]
// User Measurements Display Labels and Types
export const MEASUREMENT_FIELDS = {
  // Body Composition & Metrics
  weight_kg: {
    label: 'Weight',
    type: 'number'
  },
  height_cm: {
    label: 'Height',
    type: 'number'
  },
  body_fat_percentage: {
    label: 'Body Fat Percentage',
    type: 'number'
  },
  resting_heart_rate: {
    label: 'Resting Heart Rate',
    type: 'number'
  },

  // Circumferences - Arms
  biceps_left_cm: {
    label: 'Left Biceps',
    type: 'number'
  },
  biceps_right_cm: {
    label: 'Right Biceps',
    type: 'number'
  },
  forearm_left_cm: {
    label: 'Left Forearm',
    type: 'number'
  },
  forearm_right_cm: {
    label: 'Right Forearm',
    type: 'number'
  },

  // Circumferences - Torso
  chest_cm: {
    label: 'Chest',
    type: 'number'
  },
  waist_cm: {
    label: 'Waist',
    type: 'number'
  },
  hips_cm: {
    label: 'Hips',
    type: 'number'
  },

  // Circumferences - Legs
  thigh_left_cm: {
    label: 'Left Thigh',
    type: 'number'
  },
  thigh_right_cm: {
    label: 'Right Thigh',
    type: 'number'
  },
  calf_left_cm: {
    label: 'Left Calf',
    type: 'number'
  },
  calf_right_cm: {
    label: 'Right Calf',
    type: 'number'
  },

  // Photo URLs
  body_fat_photo_url: {
    label: 'Body Fat Photo',
    type: 'photo'
  },
  biceps_left_photo_url: {
    label: 'Left Biceps Photo',
    type: 'photo'
  },
  biceps_right_photo_url: {
    label: 'Right Biceps Photo',
    type: 'photo'
  },
  waist_photo_url: {
    label: 'Waist Photo',
    type: 'photo'
  },
  chest_photo_url: {
    label: 'Chest Photo',
    type: 'photo'
  },
  thigh_left_photo_url: {
    label: 'Left Thigh Photo',
    type: 'photo'
  },
  thigh_right_photo_url: {
    label: 'Right Thigh Photo',
    type: 'photo'
  },
  calf_left_photo_url: {
    label: 'Left Calf Photo',
    type: 'photo'
  },
  calf_right_photo_url: {
    label: 'Right Calf Photo',
    type: 'photo'
  },
  hips_photo_url: {
    label: 'Hips Photo',
    type: 'photo'
  },
  forearm_left_photo_url: {
    label: 'Left Forearm Photo',
    type: 'photo'
  },
  forearm_right_photo_url: {
    label: 'Right Forearm Photo',
    type: 'photo'
  },

  // Meta fields
  overall_notes: {
    label: 'Notes',
    type: 'text'
  },
  measurement_date: {
    label: 'Measurement Date',
    type: 'date'
  },
  created_at: {
    label: 'Created At',
    type: 'datetime'
  }
};

// Utility function to get display label
export const getDisplayLabel = (fieldName: any) => {
  return MEASUREMENT_FIELDS[fieldName]?.label || fieldName;
};

// Utility function to get field type
export const getFieldType = (fieldName: any) => {
  return MEASUREMENT_FIELDS[fieldName]?.type || 'text';
};