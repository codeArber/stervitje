import { Exercise } from "@/types/type";

// export const exercises: Exercise[] = [
//   {
//     id: "1",
//     name: "Barbell Bench Press",
//     description: "A compound exercise that targets the chest, shoulders, and triceps.",
//     category: "Strength",
//     equipment: "Barbell",
//     difficulty: "Intermediate",
//     duration: 10,
//     image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1740&auto=format&fit=crop",
//     instructions: [
//       "Lie on a flat bench with your feet flat on the floor.",
//       "Grip the barbell slightly wider than shoulder-width apart.",
//       "Lower the bar to your mid-chest.",
//       "Press the bar back up to the starting position."
//     ],
//     muscles: ["Chest", "Shoulders", "Triceps"]
//   },
//   {
//     id: "2",
//     name: "Squat",
//     description: "The king of leg exercises, targeting quadriceps, hamstrings, and glutes.",
//     category: "Strength",
//     equipment: "Barbell",
//     difficulty: "Intermediate",
//     duration: 15,
//     image: "https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?q=80&w=1469&auto=format&fit=crop",
//     instructions: [
//       "Stand with feet shoulder-width apart.",
//       "Place the barbell on your upper back.",
//       "Bend your knees and lower your hips until thighs are parallel to the floor.",
//       "Return to the starting position."
//     ],
//     muscles: ["Quadriceps", "Hamstrings", "Glutes", "Core"]
//   },
//   {
//     id: "3",
//     name: "Deadlift",
//     description: "A compound movement that builds overall strength and power.",
//     category: "Strength",
//     equipment: "Barbell",
//     difficulty: "Advanced",
//     duration: 15,
//     image: "https://images.unsplash.com/photo-1598575285627-d1f27d332d05?q=80&w=1740&auto=format&fit=crop",
//     instructions: [
//       "Stand with feet hip-width apart, barbell over mid-foot.",
//       "Bend at the hips and knees to grip the bar.",
//       "Lift the bar by extending hips and knees.",
//       "Return the weight to the floor with control."
//     ],
//     muscles: ["Lower Back", "Hamstrings", "Glutes", "Traps"]
//   },
//   {
//     id: "4",
//     name: "Pull-Up",
//     description: "An upper body exercise that builds back and arm strength.",
//     category: "Bodyweight",
//     equipment: "Pull-up Bar",
//     difficulty: "Intermediate",
//     duration: 10,
//     image: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=1588&auto=format&fit=crop",
//     instructions: [
//       "Hang from a pull-up bar with hands slightly wider than shoulder-width.",
//       "Pull your body up until your chin is over the bar.",
//       "Lower yourself with control back to the starting position."
//     ],
//     muscles: ["Back", "Biceps", "Shoulders"]
//   },
//   {
//     id: "5",
//     name: "Plank",
//     description: "A core exercise that improves stability and posture.",
//     category: "Core",
//     equipment: "None",
//     difficulty: "Beginner",
//     duration: 5,
//     image: "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?q=80&w=1470&auto=format&fit=crop",
//     instructions: [
//       "Start in a push-up position, then bend your elbows and rest your weight on your forearms.",
//       "Keep your body in a straight line from head to heels.",
//       "Engage your core and hold the position."
//     ],
//     muscles: ["Core", "Shoulders", "Back"]
//   },
//   {
//     id: "6",
//     name: "Dumbbell Shoulder Press",
//     description: "An upper body exercise targeting the shoulders and triceps.",
//     category: "Strength",
//     equipment: "Dumbbells",
//     difficulty: "Intermediate",
//     duration: 10,
//     image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1740&auto=format&fit=crop",
//     instructions: [
//       "Sit on a bench with back support.",
//       "Hold a dumbbell in each hand at shoulder height.",
//       "Press the weights upward until arms are extended.",
//       "Lower the weights back to shoulder level."
//     ],
//     muscles: ["Shoulders", "Triceps"]
//   },
//   {
//     id: "7",
//     name: "Burpee",
//     description: "A full-body exercise that builds strength and cardio endurance.",
//     category: "Cardio",
//     equipment: "None",
//     difficulty: "Advanced",
//     duration: 10,
//     image: "https://images.unsplash.com/photo-1593476087123-36d1de271f08?q=80&w=1588&auto=format&fit=crop",
//     instructions: [
//       "Start in a standing position.",
//       "Drop into a squat position and place hands on the ground.",
//       "Kick feet back into a plank position.",
//       "Perform a push-up.",
//       "Return feet to squat position.",
//       "Jump up from squat position."
//     ],
//     muscles: ["Full Body"]
//   },
//   {
//     id: "8",
//     name: "Bicycle Crunch",
//     description: "An effective core exercise targeting the abs and obliques.",
//     category: "Core",
//     equipment: "None",
//     difficulty: "Beginner",
//     duration: 5,
//     image: "https://images.unsplash.com/photo-1600881333168-2ef49b341f30?q=80&w=1587&auto=format&fit=crop",
//     instructions: [
//       "Lie on your back with hands behind your head.",
//       "Lift shoulders off the ground and bring knees to chest.",
//       "Extend one leg while rotating torso to bring elbow to opposite knee.",
//       "Alternate sides in a pedaling motion."
//     ],
//     muscles: ["Abs", "Obliques"]
//   },
//   {
//     id: "9",
//     name: "Kettlebell Swing",
//     description: "A dynamic exercise that builds power and cardiovascular fitness.",
//     category: "Power",
//     equipment: "Kettlebell",
//     difficulty: "Intermediate",
//     duration: 8,
//     image: "https://images.unsplash.com/photo-1604247584233-99c3f893ec2c?q=80&w=1588&auto=format&fit=crop",
//     instructions: [
//       "Stand with feet shoulder-width apart, kettlebell on the floor in front of you.",
//       "Hinge at the hips to grip the kettlebell with both hands.",
//       "Swing the kettlebell back between your legs, then thrust hips forward to swing it up to chest height.",
//       "Let the kettlebell fall back down and repeat."
//     ],
//     muscles: ["Glutes", "Hamstrings", "Core", "Shoulders"]
//   },
//   {
//     id: "10",
//     name: "Downward Dog",
//     description: "A yoga pose that stretches and strengthens the entire body.",
//     category: "Yoga",
//     equipment: "Yoga Mat",
//     difficulty: "Beginner",
//     duration: 3,
//     image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1520&auto=format&fit=crop",
//     instructions: [
//       "Start on hands and knees with wrists under shoulders and knees under hips.",
//       "Lift knees off the floor and push hips up and back.",
//       "Straighten legs as much as possible and press heels toward the floor.",
//       "Create an inverted V shape with your body."
//     ],
//     muscles: ["Shoulders", "Hamstrings", "Calves", "Core"]
//   },
//   {
//     id: "11",
//     name: "Jump Rope",
//     description: "A simple but effective cardio exercise for coordination and endurance.",
//     category: "Cardio",
//     equipment: "Jump Rope",
//     difficulty: "Beginner",
//     duration: 15,
//     image: "https://images.unsplash.com/photo-1434596922112-19c563067271?q=80&w=1470&auto=format&fit=crop",
//     instructions: [
//       "Hold the handles of the jump rope with hands at hip height.",
//       "Rotate wrists to swing the rope overhead and jump over it as it passes under your feet.",
//       "Land softly on the balls of your feet and repeat."
//     ],
//     muscles: ["Calves", "Shoulders", "Core"]
//   },
//   {
//     id: "12",
//     name: "Resistance Band Row",
//     description: "A back exercise that improves posture and upper body strength.",
//     category: "Strength",
//     equipment: "Resistance Band",
//     difficulty: "Beginner",
//     duration: 8,
//     image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1470&auto=format&fit=crop",
//     instructions: [
//       "Secure a resistance band at chest height.",
//       "Step back to create tension in the band.",
//       "Pull the band toward your chest, squeezing shoulder blades together.",
//       "Slowly return to the starting position."
//     ],
//     muscles: ["Back", "Biceps", "Shoulders"]
//   },
//   {
//     id: "13",
//     name: "Medicine Ball Slam",
//     description: "An explosive exercise that builds power and releases stress.",
//     category: "Power",
//     equipment: "Medicine Ball",
//     difficulty: "Intermediate",
//     duration: 5,
//     image: "https://images.unsplash.com/photo-1595078475328-1ab05d0a6a0e?q=80&w=1600&auto=format&fit=crop",
//     instructions: [
//       "Stand with feet shoulder-width apart, holding a medicine ball.",
//       "Raise the ball overhead, extending your body.",
//       "Forcefully throw the ball to the ground in front of you.",
//       "Catch the ball on the rebound and repeat."
//     ],
//     muscles: ["Shoulders", "Core", "Arms", "Back"]
//   },
//   {
//     id: "14",
//     name: "Pistol Squat",
//     description: "A challenging single-leg squat that builds strength and balance.",
//     category: "Bodyweight",
//     equipment: "None",
//     difficulty: "Advanced",
//     duration: 10,
//     image: "https://images.unsplash.com/photo-1567598508481-65a7a5ee979d?q=80&w=1587&auto=format&fit=crop",
//     instructions: [
//       "Stand on one leg with the other leg extended in front of you.",
//       "Lower your body by bending the supporting knee.",
//       "Keep your extended leg off the ground throughout the movement.",
//       "Return to standing position and repeat."
//     ],
//     muscles: ["Quadriceps", "Glutes", "Core"]
//   },
//   {
//     id: "15",
//     name: "Standing Forward Bend",
//     description: "A flexibility exercise that stretches the hamstrings and back.",
//     category: "Flexibility",
//     equipment: "None",
//     difficulty: "Beginner",
//     duration: 3,
//     image: "https://images.unsplash.com/photo-1566501206188-5dd0cf160a0e?q=80&w=1587&auto=format&fit=crop",
//     instructions: [
//       "Stand with feet hip-width apart.",
//       "Hinge at the hips and fold forward.",
//       "Let your hands hang toward the floor or rest on your legs.",
//       "Hold the position and breathe deeply."
//     ],
//     muscles: ["Hamstrings", "Lower Back"]
//   }
// ]
