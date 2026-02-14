import { redirect } from "next/navigation";

type LegacyPlanDetailPageProps = {
  params: Promise<{ planId: string }>;
};

export default async function LegacyPlanDetailPage({
  params,
}: LegacyPlanDetailPageProps) {
  const { planId } = await params;
  redirect(`/dashboard/marketplace/${planId}`);
}
