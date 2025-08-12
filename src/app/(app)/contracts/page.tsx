import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth";
import ContractsClient from "./pageClient";

export default async function ContractsPage() {
  const uid = await getCurrentUserId();
  if (!uid) {
    redirect("/login");
  }
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Contracts</h1>
      </div>
      <ContractsClient />
    </div>
  );
}