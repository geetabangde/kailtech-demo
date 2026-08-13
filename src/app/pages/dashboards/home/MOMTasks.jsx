import { Card } from "components/ui";
import Marquee from "react-fast-marquee";

export function MOMTasks({ data }) {
  const tasks = data || [];

  if (tasks.length === 0) return null;

  return (
    <div className="col-span-12 w-full mb-4">
      <Card className="!p-3 flex items-center bg-indigo-50 border border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800">
        <span className="shrink-0 text-sm font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 mr-4 whitespace-nowrap">
          MOM Tasks
        </span>
        <div className="flex-1 overflow-hidden">
          <Marquee
            pauseOnHover={true}
            speed={40}
            className="text-sm font-medium text-indigo-900 dark:text-indigo-200 block"
          >
            <div className="flex space-x-12 pr-12">
              {tasks.map((task, idx) => (
                <div key={task.id || idx} className="inline-flex items-center whitespace-nowrap">
                  <span className="mr-2 text-indigo-500">•</span>
                  <span>{task.details}</span>
                  {task.timeline && (
                    <span className="ml-1 text-indigo-500/80">({task.timeline})</span>
                  )}
                </div>
              ))}
            </div>
          </Marquee>
        </div>
      </Card>
    </div>
  );
}
