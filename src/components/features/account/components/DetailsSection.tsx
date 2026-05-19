import type React from "react";

type BasicDetails = {
  email: string;
  contact: string;
  password: string;
};

type ProfessionalDetails = {
  role: string;
  facility: string;
  joiningDate: string;
};

type DetailsSectionProps = {
  basicDetails: BasicDetails;
  professionalDetails: ProfessionalDetails;
};

export default function DetailsSection({ basicDetails, professionalDetails }: DetailsSectionProps): React.ReactElement {
  return (
    <div className="flex flex-col gap-6 pt-6 w-full">
      {/* Basic Details Section */}
      <div className="flex flex-col gap-6">
        <p className="text-base font-normal text-[var(--color-neutral-secondary)] w-full">
          Basic details
        </p>
        <div className="flex flex-col gap-6">
          <DetailItem
            icon={<img src="/Settings/mail.svg" alt="email" className="w-6 h-6" />}
            label="Email"
            value={basicDetails.email}
          />
          <DetailItem
            icon={<img src="/Settings/phone.svg" alt="contact" className="w-6 h-6" />}
            label="Contact"
            value={basicDetails.contact}
          />
          <DetailItem
            icon={<img src="/Settings/key.svg" alt="password" className="w-6 h-6" />}
            label="Password"
            value={basicDetails.password}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[var(--gp-color-border-neutral)] w-full" />

      {/* Professional Details Section */}
      <div className="flex flex-col gap-6 flex-1">
        <p className="text-base font-normal text-[var(--color-neutral-secondary)] w-full">
          Professional details
        </p>
        <div className="flex flex-col gap-6">
          <DetailItem
            icon={<img src="/Settings/user.svg" alt="role" className="w-6 h-6" />}
            label="Role"
            value={professionalDetails.role}
          />
          <DetailItem
            icon={<img src="/Settings/location-pin.svg" alt="organisation" className="w-6 h-6" />}
            label="Organisation"
            value={professionalDetails.facility.length > 30 ? `${professionalDetails.facility.substring(0, 30)}...` : professionalDetails.facility}
          />
        </div>
      </div>
    </div>
  );
}

type DetailItemProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  className?: string;
};

function DetailItem({ icon, label, value, className }: DetailItemProps): React.ReactElement {
  return (
    <div className={`flex gap-2 items-start w-full ${className || ""}`}>
      <div className="shrink-0 w-6 h-6">
        {icon}
      </div>
      <p className="flex-1 text-base font-normal leading-6 text-[#6b7971] min-h-6">
        {label} :
      </p>
      <p className="flex-1 text-base font-normal leading-6 text-[#37493f] min-h-6">
        {value}
      </p>
    </div>
  );
}
