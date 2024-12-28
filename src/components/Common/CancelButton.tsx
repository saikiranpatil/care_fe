import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

import CareIcon from "@/CAREUI/icons/CareIcon";

import { Button, ButtonProps } from "@/components/ui/button";

export interface CancelButtonProps extends ButtonProps {
  label?: string;
}

const CancelButton = ({ label = "Cancel", ...props }: CancelButtonProps) => {
  const { t } = useTranslation();
  return (
    <Button
      id="cancel"
      type="button"
      variant="secondary"
      {...props}
      className={cn(
        "w-full md:w-auto button-secondary-border",
        props.className,
      )}
    >
      <CareIcon icon="l-times-circle" className="text-lg" />
      {label && <span className="whitespace-pre-wrap">{t(label)}</span>}
    </Button>
  );
};

export default CancelButton;
