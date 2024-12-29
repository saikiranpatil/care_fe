import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertCircle, CalendarIcon } from "lucide-react";
import { Link, useQueryParams } from "raviger";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import CareIcon from "@/CAREUI/icons/CareIcon";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Avatar } from "@/components/Common/Avatar";
import CreateEncounterForm from "@/components/Encounter/CreateEncounterForm";

import routes from "@/Utils/request/api";
import mutate from "@/Utils/request/mutate";
import query from "@/Utils/request/query";
import { PaginatedResponse } from "@/Utils/request/types";
import { formatPatientAge } from "@/Utils/utils";
import { Encounter } from "@/types/emr/encounter";

const getStatusColor = (status: string) => {
  switch (status) {
    case "planned":
      return "bg-blue-100 text-blue-800";
    case "in_progress":
      return "bg-yellow-100 text-yellow-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function VerifyPatient(props: { facilityId: string }) {
  const [qParams] = useQueryParams();
  const { phone_number, year_of_birth, partial_id } = qParams;
  const { t } = useTranslation();

  const { mutate: verifyPatient, data: patientData } = useMutation({
    mutationFn: mutate(routes.patient.search_retrieve),
    onError: (error) => {
      const errorData = error.cause as { errors: { msg: string[] } };
      errorData.errors.msg.forEach((er) => {
        toast.error(er);
      });
    },
  });

  const { data: encounters } = useQuery<PaginatedResponse<Encounter>>({
    queryKey: ["encounters", patientData?.id],
    queryFn: query(routes.encounter.list, {
      queryParams: {
        patient: patientData?.id,
        live: false,
      },
    }),
    enabled: !!patientData?.id,
  });

  useEffect(() => {
    if (phone_number && year_of_birth && partial_id) {
      verifyPatient({
        phone_number,
        year_of_birth,
        partial_id,
      });
    }
  }, [phone_number, year_of_birth, partial_id, verifyPatient]);

  return (
    <div>
      {!phone_number || !year_of_birth || !partial_id ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Missing required parameters for patient verification
          </AlertDescription>
        </Alert>
      ) : patientData ? (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col justify-between gap-4 gap-y-2 md:flex-row">
                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="flex flex-row gap-x-4">
                    <div className="h-10 w-10 flex-shrink-0 md:h-14 md:w-14">
                      <Avatar
                        className="size-10 font-semibold text-secondary-800 md:size-auto"
                        name={patientData.name || "-"}
                      />
                    </div>
                    <div>
                      <h1
                        id="patient-name"
                        className="text-xl font-bold capitalize text-gray-950"
                      >
                        {patientData.name}
                      </h1>
                      <h3 className="text-sm font-medium text-gray-600">
                        {formatPatientAge(patientData, true)},{"  "}
                        <span className="capitalize">
                          {patientData.gender.replace("_", " ")},{"  "}
                        </span>
                        {patientData.blood_group &&
                          patientData.blood_group.replace("_", " ")}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Schedule an appointment or create a new encounter
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
              <Button
                asChild
                variant="outline"
                className="group relative h-[100px] md:h-[120px] overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-indigo-50 p-0 shadow-md hover:shadow-xl transition-all duration-300"
              >
                <Link
                  href={`/facility/${props.facilityId}/patient/${patientData.id}/book-appointment`}
                  className="p-4 md:p-6"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary opacity-0 transition-opacity duration-300 group-hover:opacity-10" />
                  <div className="relative flex w-full items-center gap-3 md:gap-4">
                    <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <CalendarIcon className="size-5 md:size-6 text-primary" />
                    </div>
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="text-base md:text-lg font-semibold text-gray-800 group-hover:text-primary transition-colors line-clamp-1">
                        Schedule Appointment
                      </span>
                      <span className="text-xs md:text-sm text-gray-500 line-clamp-1">
                        Book a new appointment
                      </span>
                    </div>
                    <CareIcon
                      icon="l-arrow-right"
                      className="ml-auto size-4 md:size-5 text-gray-400 transform translate-x-0 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                    />
                  </div>
                </Link>
              </Button>

              <CreateEncounterForm
                patientId={patientData.id}
                facilityId={props.facilityId}
                patientName={patientData.name}
                trigger={
                  <Button
                    variant="outline"
                    className="group relative h-[100px] md:h-[120px] overflow-hidden border-0 bg-gradient-to-br from-emerald-50 to-teal-50 p-0 shadow-md hover:shadow-xl transition-all duration-300 justify-start"
                  >
                    <div className="p-4 md:p-6">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary opacity-0 transition-opacity duration-300 group-hover:opacity-10" />
                      <div className="relative flex w-full items-center gap-3 md:gap-4">
                        <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <CareIcon
                            icon="l-stethoscope"
                            className="size-5 md:size-6 text-primary"
                          />
                        </div>
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="text-base md:text-lg font-semibold text-gray-800 group-hover:text-primary transition-colors line-clamp-1">
                            Create Encounter
                          </span>
                          <span className="text-xs md:text-sm text-gray-500 line-clamp-1">
                            Start a new clinical encounter
                          </span>
                        </div>
                        <CareIcon
                          icon="l-arrow-right"
                          className="ml-auto size-4 md:size-5 text-gray-400 transform translate-x-0 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                        />
                      </div>
                    </div>
                  </Button>
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Active Encounters</CardTitle>
              <CardDescription>
                View and manage patient encounters
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 pt-2">
              {encounters?.results && encounters.results.length > 0 ? (
                <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
                  {encounters.results.map((encounter: Encounter) => (
                    <Link
                      href={`/facility/${props.facilityId}/encounter/${encounter.id}/updates`}
                    >
                      <Card
                        key={encounter.id}
                        className="hover:shadow-lg transition-shadow group cursor-pointer"
                      >
                        <CardHeader className="p-3 md:p-4 pb-2 space-y-0">
                          <div className="flex items-center justify-between gap-2">
                            <CardTitle className="text-sm md:text-base">
                              {t(
                                `encounter_class__${encounter.encounter_class}`,
                              )}{" "}
                              {encounter.period.start && (
                                <span className="text-xs font-normal">
                                  -{" "}
                                  {new Date(
                                    encounter.period.start,
                                  ).toLocaleDateString()}
                                </span>
                              )}
                            </CardTitle>
                            <Badge className={getStatusColor(encounter.status)}>
                              {t(`encounter_status__${encounter.status}`)}
                            </Badge>
                          </div>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 md:p-8 text-center border rounded-lg border-dashed">
                  <div className="rounded-full bg-primary/10 p-2 md:p-3 mb-3 md:mb-4">
                    <CareIcon
                      icon="l-folder-open"
                      className="h-5 w-5 md:h-6 md:w-6 text-primary"
                    />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold mb-1">
                    No encounters found
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Create a new encounter to get started
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
