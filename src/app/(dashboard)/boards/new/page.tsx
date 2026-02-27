import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NewBoardForm } from "./new-board-form";

export default async function NewBoardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const organizations = await prisma.organization.findMany({
    where: {
      members: {
        some: { userId: user.id },
      },
    },
    select: { id: true, name: true },
  });

  return <NewBoardForm organizations={organizations} />;
}
