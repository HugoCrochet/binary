import { BudgetClient } from "@/app/(app)/budget/budget-client";
import { requireAuth } from "@/lib/server/auth";
import { getBudgetViewModel } from "@/lib/server/budget";

export const dynamic = "force-dynamic";

export default async function BudgetPage() {
  const profile = await requireAuth();
  const budget = await getBudgetViewModel(profile.id);

  return <BudgetClient budget={budget} />;
}
