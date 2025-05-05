
interface ExerciseInstructionsProps {
  title: string;
  instructions: string;
}

export default function ExerciseInstructions({ title, instructions }: ExerciseInstructionsProps) {
  // Normalize instructions into an array of steps
  const steps: string[] = Array.isArray(instructions)
    ? instructions
    : instructions.split(/\r?\n|\d+\./).map(s => s.trim()).filter(Boolean);

  return (
    <div className="space-y-4">
      <ol className="relative border-s border-gray-200 dark:border-gray-700">
        {steps.map((step, idx) => {
          if(step.length === idx){
            return (

              <li className="mb-10 ms-4">
                <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                <p className="mb-4 text-base font-normal text-muted-foreground">{step}</p>
              </li>
  
            )
          }
          else{
            return(
              <li className="mb-10 ms-4">
                <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                <p className="mb-4 text-base font-normal text-muted-foreground">{step.slice(0, -2)}</p>
              </li>
            )
          }

          
        }
        )}
      </ol>
    </div>
  );
}

