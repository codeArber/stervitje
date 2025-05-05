import * as React from "react"
import { cn } from "@/lib/utils"


import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ExerciseCategory, ExerciseType } from "@/lib/data"
import { useCreateExerciseReferenceGlobal, useUpdateExercise } from "@/api/exercises"
import { Label } from "./ui/label"
import Icons from "./icons/Icons"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogTitle, DialogTrigger } from "./ui/dialog"
import { AspectRatio } from "./ui/aspect-ratio"
import { MoreHorizontal, MoreVertical, Plus, X } from "lucide-react"
import { ExerciseReferenceGlobal } from "@/lib/supabase/types"
import TikTokPreview from "./ReferencePreview"
import { Checkbox } from "./ui/checkbox"
import { useForm } from "react-hook-form"
import { Input } from "./ui/input"
import { useExerciseImageUrl } from "@/api/exercises";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "./ui/button"
import { TikTokEmbed } from "./TikTokEmbed"
import { z } from "zod"
import { Card, CardHeader, CardTitle } from "./ui/card"
import { Link } from "@tanstack/react-router"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu"

type Props = {
  /** Unique ID of the exercise you’re editing */
  exerciseId: string | number
  /** Currently assigned category */
  category: ExerciseCategory
  /** Parent handler → (id, nextCategory) */
  /** Tailwind helper */
  className?: string
}


const ExerciseCategories = [
  { value: ExerciseCategory.STRENGTH, label: "Strength", icon: <Icons.strength /> },
  { value: ExerciseCategory.ENDURANCE, label: "Endurance", icon: <Icons.endurance /> },
  { value: ExerciseCategory.MOBILITY, label: "Mobility", icon: <Icons.mobility /> },
  { value: ExerciseCategory.POWER, label: "Power", icon: <Icons.power /> },
  { value: ExerciseCategory.SPEED, label: "Speed", icon: <Icons.speed /> },
  { value: ExerciseCategory.AGILITY, label: "Agility", icon: <Icons.agility /> },
  { value: ExerciseCategory.BALANCE, label: "Balance", icon: <Icons.balance /> },
  { value: ExerciseCategory.COORDINATION, label: "Coordination", icon: <Icons.coordination /> },
  { value: ExerciseCategory.RECOVERY, label: "Recovery", icon: <Icons.recovery /> },
  { value: ExerciseCategory.CORE_STABILITY, label: "Core Stability", icon: <Icons.core_stability /> },
]

const ExerciseTypes = [
  { label: "Pull", value: ExerciseType.PULL, icon: <Icons.pull /> },
  { label: "Push", value: ExerciseType.PUSH, icon: <Icons.push /> },
  { label: "Isometric", value: ExerciseType.ISOMETRIC, icon: <Icons.isometric /> },
  { label: "Plyometric", value: ExerciseType.PLYOMETRIC, icon: <Icons.plyometric /> },
  { label: "Rotational", value: ExerciseType.ROTATIONAL, icon: <Icons.rotational /> },
  { label: "Dynamic", value: ExerciseType.DYNAMIC, icon: <Icons.dynamic /> }
]



export function ExerciseCategoryDropdown({
  exerciseId,
  category,
  className,
}: Props) {
  const updateCategory = useUpdateExercise()
  return (
    <Select
      value={category}
      onValueChange={(next) =>
        updateCategory.mutate({
          exerciseId: exerciseId as string,
          payload: {
            category: next as ExerciseCategory,
          }
        })
        // onChange(exerciseId, next as ExerciseCategory)
      }
    >
      <SelectTrigger
        className={cn(
          "w-48",            // tweak width as needed
          className
        )}
      >
        <div className="flex flex-row items-center gap-2 text-white">
          <SelectValue placeholder="Choose category" className="group-data-[state=checked]:text-white" />
        </div>
      </SelectTrigger>

      <SelectContent>
        {ExerciseCategories.map((cat, index) => {
          return (
            <SelectItem
              key={cat.value}
              value={cat.value}
              className="group"
            >
              <div className="flex items-center gap-2">
                {cat.icon}
                <Label
                  variant="select"
                  className="group-data-[state=checked]:text-white capitalize"
                >
                  {cat.label}
                </Label>
              </div>
            </SelectItem>
          );
        })}

      </SelectContent>
    </Select>
  )
}



type Props2 = {
  /** Unique ID of the exercise you’re editing */
  exerciseId: string | number
  /** Currently assigned category */
  category: ExerciseCategory
  /** Parent handler → (id, nextCategory) */
  /** Tailwind helper */
  className?: string
  type: ExerciseCategory
}
export function ExerciseTypeDropdown({
  exerciseId,
  type,
  className,
}: Props2) {
  const updateCategory = useUpdateExercise()
  return (
    <Select
      value={type}
      onValueChange={(next) =>
        updateCategory.mutate({
          exerciseId: exerciseId as string,
          payload: {
            exercise_type: next as ExerciseCategory,
          }
        })
        // onChange(exerciseId, next as ExerciseCategory)
      }
    >
      <SelectTrigger
        className={cn(
          "w-48",            // tweak width as needed
          className
        )}
      >
        <div className="flex flex-row items-center gap-2 text-white">
          <SelectValue placeholder="Choose type" className="group-data-[state=checked]:text-white" />
        </div>
      </SelectTrigger>

      <SelectContent>

        {ExerciseTypes.map((type, index) => {
          return (
            <SelectItem
              key={type.value}
              value={type.value}
              className="group"
            >
              <div className="flex items-center gap-2">
                {type.icon}
                <Label
                  variant="select"
                  className="group-data-[state=checked]:text-white capitalize"
                >
                  {type.label}
                </Label>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  )
}

// Environment options
export enum ExerciseEnvironment {
  GYM = 'gym',
  HOME = 'home',
  OUTDOOR = 'outdoor',
  STUDIO = 'studio'
}

const environments = [
  { value: "gym", label: "Gym", icon: <Icons.gym /> },
  { value: "home", label: "Home", icon: <Icons.home /> },
  { value: "outdoor", label: "Outdoor", icon: <Icons.outdoor /> },
  { value: "studio", label: "Studio", icon: <Icons.studio /> },
];

const difficulties = [
  { value: "1", label: "Very Easy", icon: <Icons.diff1 /> },
  { value: "2", label: "Easy", icon: <Icons.diff2 /> },
  { value: "3", label: "Medium", icon: <Icons.diff3 /> },
  { value: "4", label: "Hard", icon: <Icons.diff4 /> },
  { value: "5", label: "Very Hard", icon: <Icons.diff5 /> },
];

type DifficultyProps = {
  /** Unique ID of the exercise you're editing */
  exerciseId: string | number
  /** Currently assigned difficulty level */
  difficultyLevel?: number | null
  /** Tailwind helper */
  className?: string
}

export function ExerciseDifficultyDropdown({
  exerciseId,
  difficultyLevel,
}: DifficultyProps) {
  const updateExercise = useUpdateExercise()

  // Handle difficulty change
  const handleDifficultyChange = (value: string) => {
    updateExercise.mutate({
      exerciseId: exerciseId as string,
      payload: {
        difficulty_level: parseInt(value)
      }
    });
  };

  return (
    <Select
      value={difficultyLevel?.toString() || ""}
      onValueChange={handleDifficultyChange}
    >
      <SelectTrigger className="w-48">
        <div className="flex flex-row items-center gap-2 text-white">
          <SelectValue placeholder="Select difficulty" className="group-data-[state=checked]:text-white" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {difficulties.map(({ value, label, icon }) => (
          <SelectItem
            key={value}
            value={value}
            className="group"                      // enable group-based variants
          >
            <div className="flex items-center gap-2">
              {icon}
              <Label
                variant="select"
                className="group-data-[state=checked]:text-white"  // white when selected
              >
                {label}
              </Label>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

type EnvironmentProps = {
  /** Unique ID of the exercise you're editing */
  exerciseId: string | number
  /** Currently assigned environment */
  environment?: string
  /** Tailwind helper */
  className?: string
}

export function ExerciseEnvironmentDropdown({
  exerciseId,
  environment,
  className,
}: EnvironmentProps) {
  const updateExercise = useUpdateExercise()

  // Handle environment change
  const handleEnvironmentChange = (value: string) => {
    updateExercise.mutate({
      exerciseId: exerciseId as string,
      payload: {
        // Using any to bypass type checking for environment property
        // This assumes the API actually accepts this property
        environment: value as any
      }
    });
  };

  return (
    <Select
      value={environment || ""}
      onValueChange={handleEnvironmentChange}
    >
      <SelectTrigger className={cn("w-48", className)}>
        <div className="flex flex-row items-center gap-2 text-white">
          <SelectValue placeholder="Select environment" className="group-data-[state=checked]:text-white" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {environments.map((env, index) => (
          <SelectItem
            key={env.value}
            value={env.value}
            className="group"
          >
            <div className="flex items-center gap-2">
              {env.icon}
              <Label
                variant="select"
                className="group-data-[state=checked]:text-white capitalize"
              >
                {env.label}
              </Label>
            </div>
          </SelectItem>
        ))}

      </SelectContent>
    </Select>
  )
}
interface ExerciseImageProps {
  url: string;
  alt?: string;
}
export function ExerciseImage({ url, alt }: ExerciseImageProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="w-full cursor-pointer">
          <h3 className="text-lg font-semibold mb-7">Image</h3>
          <AspectRatio ratio={12 / 8} className="bg-muted overflow-hidden flex ">
            <img
              src={url}
              alt={alt ?? "Exercise image"}
              className="object-scale-down w-full h-full"
              width={480}
              height={320}
              onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
            />
          </AspectRatio>
        </div>
      </DialogTrigger>
      <DialogOverlay className="fixed w-full bg-black/50" />
      <DialogContent className="fixed p-0 max-w-full w-2/3 p-8 pt-16">
        <DialogClose className="absolute top-4 right-4 z-10">
          {/* <X size={24} /> */}
        </DialogClose>
        <div className="w-full h-full flex items-center justify-center bg-black rounded-lg overflow-hidden shadow-xl">
          <img
            src={url}
            alt={alt ?? "Exercise image"}
            className="max-w-full max-h-full"
            onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

const addReferenceSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  url: z.string().url({ message: "Please enter a valid URL" }),
  source: z.string().min(1, { message: "Source is required" }),
  isGlobal: z.boolean().default(false),
});

type AddReferenceFormValues = z.infer<typeof addReferenceSchema>;

export function ExerciseReferences({ exercise, exerciseId }: { exercise: ExerciseReferenceGlobal[], exerciseId: string }) {
  const [selectedReference, setSelectedReference] = React.useState<string | null>(null);
  const addReference = useCreateExerciseReferenceGlobal();
  const [openDialog, setOpenDialog] = React.useState(false);
  const [openAddReferenceDialog, setOpenAddReferenceDialog] = React.useState(false);

  const form = useForm<AddReferenceFormValues>({
    resolver: zodResolver(addReferenceSchema),
    defaultValues: { title: "", url: "", source: "", isGlobal: false },
  });

  // Handle form submission
  const onSubmit = async (data: AddReferenceFormValues) => {
    try {
      // Here you would add the API call to save the reference
      // Example API call based on whether it's global or private:
      if (data.isGlobal) {
        // Add to global references
        addReference.mutate({
          exerciseId: exerciseId,
          reference: {
            exercise_id: exerciseId,
            source: data.source as "tiktok" | "youtube" | "instagram",
            title: data.title,
            url: data.url
          }
        });
      }
      //  else {
      //   // Add to user's private references
      //   await addPrivateExerciseReference({
      //     exercise_id: exercise.id,
      //     user_id: userId() || '',
      //     title: data.title,
      //     url: data.url,
      //     source: data.source,
      //   });
      // }

      console.log("Submitting reference:", data);

      // toast({
      //   title: "Reference added",
      //   description: "The reference has been added successfully.",
      // });

      // Close the dialog and reset the form
      setOpenAddReferenceDialog(false);
      form.reset();
    } catch (error) {
      console.error("Error adding reference:", error);
      // toast({
      //   title: "Error",
      //   description: "There was an error adding the reference. Please try again.",
      //   variant: "destructive",
      // });
    }
  };

  return (
    <div className="flex flex-col w-full px-6">
      <div className="w-full flex flex-row justify-between">
        <h3 className="text-lg font-semibold mb-2">References</h3>
        <div className="flex flex-row gap-2 items-center">
          <Button
            variant="outline"
            onClick={() => setOpenAddReferenceDialog(true)}
          >
            <Plus />
          </Button>
          <Button
            variant="outline" asChild>
            <Link to='/exercise/$exerciseId/references' params={{ exerciseId: exerciseId }} className="text-sm text-muted-foreground hover:underline">
              More References
            </Link></Button>
        </div>
      </div>
      {exercise.length === 0 && (
        <div className="flex flex-col flex-1 pt-32 text-muted-foreground items-center justify-center w-full h-full">
          <p>No references found</p>
        </div>
      )}
      <div className="grid h-full grid-flow-col gap-4 auto-cols-max overflow-x-auto mt-4 p-2">
        {exercise.slice(0, 8).map((reference) => (
          <Card
            key={reference.id}
            className="flex flex-col gap-2 p-2 border relative rounded w-fit h-fit"
            onClick={() => {
              setSelectedReference(reference.url);
              setOpenDialog(true);
            }}
          >  <div className="absolute bottom-4 left-4">
              <Icons.tiktok />

            </div>
            <CardHeader className="px-2 flex flex-row">
              <CardTitle className="flex flex-row items-center justify-start gap-2 overflow-hidden h-8 w-32 relative">

                {reference.title}
              </CardTitle>
              <div className="px-2 gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='secondary' size={'icon'}>
                      <MoreVertical />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Reference</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Remove</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <div className="h-48">

              <TikTokPreview reference={reference.url} />
            </div>
          </Card>
        ))}

      </div>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reference Video</DialogTitle>
          </DialogHeader>
          {selectedReference && <TikTokEmbed url={selectedReference} />}
        </DialogContent>
      </Dialog>

      {/* Add Reference Dialog */}
      <Dialog open={openAddReferenceDialog} onOpenChange={setOpenAddReferenceDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Reference</DialogTitle>
            <DialogDescription>
              Add a reference link for this exercise. This could be a video tutorial, article, or any helpful resource.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Reference title" {...field} />
                    </FormControl>
                    <FormDescription>
                      A descriptive title for the reference
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormDescription>
                      The link to the reference (video, article, etc.)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source</FormLabel>
                    <FormControl>
                      <Input placeholder="YouTube, TikTok, etc." {...field} />
                    </FormControl>
                    <FormDescription>
                      Where this reference is from
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isGlobal"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Add as global reference
                      </FormLabel>
                      <FormDescription>
                        If checked, this reference will be visible to all users.
                        Otherwise, it will be private to you.
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Add Reference</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}