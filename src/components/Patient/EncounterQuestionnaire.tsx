import { navigate } from "raviger";

import { Card, CardContent } from "@/components/ui/card";

import Page from "@/components/Common/Page";
import { QuestionnaireForm } from "@/components/Questionnaire/QuestionnaireForm";

interface Props {
  facilityId: string;
  patientId: string;
  encounterId?: string;
  questionnaireSlug?: string;
  subjectType?: string;
}

export default function EncounterQuestionnaire({
  facilityId,
  patientId,
  encounterId,
  questionnaireSlug,
  subjectType,
}: Props) {
  return (
    <Page
      title="Questionnaire"
      backUrl={`/facility/${facilityId}/patient/${patientId}/encounter/${encounterId}`}
    >
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="pt-6">
            <QuestionnaireForm
              facilityId={facilityId}
              patientId={patientId}
              subjectType={subjectType}
              encounterId={encounterId}
              questionnaireSlug={questionnaireSlug}
              onSubmit={() => {
                if (encounterId) {
                  navigate(
                    `/facility/${facilityId}/encounter/${encounterId}/updates`,
                  );
                } else {
                  navigate(`/patient/${patientId}/updates`);
                }
              }}
            />
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}