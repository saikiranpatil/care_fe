import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { t } from "i18next";
import { navigate } from "raviger";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import Loading from "@/components/Common/Loading";
import Page from "@/components/Common/Page";

import { PLUGIN_Component } from "@/PluginEngine";
import * as Notification from "@/Utils/Notifications";
import routes from "@/Utils/request/api";
import query from "@/Utils/request/query";
import request from "@/Utils/request/request";

import { Submit } from "../Common/ButtonV2";

interface IProps {
  facilityId: string;
}

const formSchema = z.object({
  middleware_address: z
    .string()
    .nonempty({ message: "Middleware Address is required" })
    .regex(/^(?!https?:\/\/)[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)*\.[a-zA-Z]{2,}$/, {
      message: "Invalid Middleware Address",
    }),
});

export const FacilityConfigure = (props: IProps) => {
  const { facilityId } = props;
  const [isLoading, setIsLoading] = useState(false);

  const { isPending: loading, data } = useQuery({
    queryKey: [routes.getPermittedFacility.path, facilityId],
    queryFn: query(routes.getPermittedFacility, {
      pathParams: { id: facilityId },
    }),
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!data) return;

    const formData = {
      name: data.name,
      state: data.state,
      district: data.district,
      local_body: data.local_body,
      ward: data.ward,
      middleware_address: values.middleware_address,
    };

    setIsLoading(true);

    const { res, error } = await request(routes.partialUpdateFacility, {
      pathParams: { id: facilityId },
      body: formData,
    });

    setIsLoading(false);
    if (res?.ok) {
      Notification.Success({
        msg: t("update_facility_middleware_success"),
      });
      navigate(`/facility/${facilityId}`);
    } else {
      Notification.Error({
        msg: error?.detail ?? "Something went wrong",
      });
    }
    setIsLoading(false);
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { middleware_address: "" },
  });

  useEffect(() => {
    if (data && data.middleware_address) {
      form.setValue("middleware_address", data.middleware_address);
    }
  }, [form, data]);

  if (isLoading || !data || loading) {
    return <Loading />;
  }

  return (
    <Page
      title="Configure Facility"
      crumbsReplacements={{
        [facilityId]: { name: data.name },
      }}
      className="w-full overflow-x-hidden"
    >
      <div className="mx-auto max-w-3xl">
        <div className="cui-card mt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="middleware_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-base font-normal text-secondary-900">
                      Facility Middleware Address
                      <span className="text-danger-500"> *</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter Middleware Address"
                      />
                    </FormControl>
                    <FormDescription>
                      This address will be applied to all assets when asset and
                      location middleware are Unspecified.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Submit label="Update" />
              </div>
            </form>
          </Form>
        </div>

        <PLUGIN_Component
          __name="ExtendFacilityConfigure"
          facilityId={facilityId}
        />
      </div>
    </Page>
  );
};
