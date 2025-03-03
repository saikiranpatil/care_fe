import careConfig from "@careConfig";
import { useQuery } from "@tanstack/react-query";
import {
  compareAsc,
  eachDayOfInterval,
  format,
  max,
  startOfToday,
} from "date-fns";

import { ScheduleAPIs } from "@/components/Schedule/api";
import {
  Appointment,
  AvailabilityHeatmap,
  SlotAvailability,
} from "@/components/Schedule/types";

import query from "@/Utils/request/query";
import { dateQueryString, getMonthStartAndEnd } from "@/Utils/utils";

export const groupSlotsByAvailability = (slots: SlotAvailability[]) => {
  const result: {
    availability: SlotAvailability["availability"];
    slots: Omit<SlotAvailability, "availability">[];
  }[] = [];

  for (const slot of slots) {
    const availability = slot.availability;
    const existing = result.find(
      (r) => r.availability.name === availability.name,
    );
    if (existing) {
      existing.slots.push(slot);
    } else {
      result.push({ availability, slots: [slot] });
    }
  }

  // sort slots by start time
  result.forEach(({ slots }) =>
    slots.sort((a, b) => compareAsc(a.start_datetime, b.start_datetime)),
  );

  // sort availability by first slot start time
  result.sort((a, b) =>
    compareAsc(a.slots[0].start_datetime, b.slots[0].start_datetime),
  );

  return result;
};

/**
 * Get the availability heatmap for a user for a given month
 */
export const useAvailabilityHeatmap = ({
  facilityId,
  userId,
  month,
}: {
  facilityId: string;
  userId?: string;
  month: Date;
}) => {
  const { start, end } = getMonthStartAndEnd(month);

  // start from today if the month is current or past
  const fromDate = dateQueryString(max([start, startOfToday()]));
  const toDate = dateQueryString(end);

  let queryFn = query(ScheduleAPIs.slots.availabilityHeatmap, {
    pathParams: { facility_id: facilityId },
    body: {
      resource: userId,
      from_date: fromDate,
      to_date: toDate,
    },
  });

  if (careConfig.appointments.useAvailabilityStatsAPI === false) {
    queryFn = async () => getInfiniteAvailabilityHeatmap({ fromDate, toDate });
  }

  return useQuery({
    queryKey: ["availabilityHeatmap", userId, fromDate, toDate],
    queryFn,
    enabled: !!userId,
  });
};

const getInfiniteAvailabilityHeatmap = ({
  fromDate,
  toDate,
}: {
  fromDate: string;
  toDate: string;
}) => {
  const dates = eachDayOfInterval({ start: fromDate, end: toDate });

  const result: AvailabilityHeatmap = {};

  for (const date of dates) {
    result[dateQueryString(date)] = { total_slots: Infinity, booked_slots: 0 };
  }

  return result;
};

export const formatAppointmentSlotTime = (appointment: Appointment) => {
  if (!appointment.token_slot?.start_datetime) {
    return "";
  }
  return format(appointment.token_slot.start_datetime, "dd MMM, yyyy, hh:mm a");
};

export const formatSlotTimeRange = (slot: {
  start_datetime: string;
  end_datetime: string;
}) => {
  return `${format(slot.start_datetime, "h:mm a")} - ${format(
    slot.end_datetime,
    "h:mm a",
  )}`;
};
