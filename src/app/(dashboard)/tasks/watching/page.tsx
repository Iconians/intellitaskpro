import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getWatchingTasks } from "@/lib/data/watching";
import { WatchingTasksList } from "@/components/tasks/WatchingTasksList";

export default async function WatchingTasksPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const tasks = await getWatchingTasks(user.id);

  return <WatchingTasksList tasks={tasks} />;
}
