import type { Metadata } from "next";

import { ExperimentPage } from "@/components/lab";
import { getExperiment } from "@/content/lab";
import { ResultSheet } from "@/lab/result-sheet";
import { pageMetadata } from "@/lib/metadata";

const experiment = getExperiment("result-sheet")!;

export const metadata: Metadata = pageMetadata({
  path: experiment.href,
  title: `${experiment.title} · Lab`,
  description: experiment.summary,
});

export default function Page() {
  return (
    <ExperimentPage experiment={experiment}>
      <ResultSheet />
    </ExperimentPage>
  );
}
