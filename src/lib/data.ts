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