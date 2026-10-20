import type { Metadata } from "next";

import { ExperimentPage } from "@/components/lab";
import { getExperiment } from "@/content/lab";
import { MatchClock } from "@/lab/match-clock";
import { pageMetadata } from "@/lib/metadata";

const experiment = getExperiment("match-clock")!;

export const metadata: Metadata = pageMetadata({
  path: experiment.href,
  title: `${experiment.title} · Lab`,
  description: experiment.summary,
});

export default function Page() {
  return (
    <ExperimentPage experiment={experiment}>
      <MatchClock />
    </ExperimentPage>
  );
}
