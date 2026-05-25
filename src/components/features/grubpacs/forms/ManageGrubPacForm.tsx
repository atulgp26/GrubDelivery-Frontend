import React, { useState } from "react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { mockFormRestaurants as restaurants } from "../data/mockFormData";

export default function ManageGrubPacForm({ initial, onSave, onBack }: {
  initial?: { code?: string; name?: string; restaurant?: string; vehicle?: string };
  onSave?: (data: { code: string; name: string; restaurant: string; vehicle: string }) => void;
  onBack?: () => void;
}) {
  const [form, setForm] = useState({
    code: initial?.code || "",
    name: initial?.name || "",
    restaurant: initial?.restaurant || "",
    vehicle: initial?.vehicle || "",
  });
  const [focusedField, setFocusedField] = useState("");

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="relative flex flex-col md:flex-row gap-8 items-stretch min-w-[640px] max-w-[60rem]">
      <button
        className="absolute left-0 top-0 -mt-2 ml-4 px-4 py-1 border border-[var(--color-stroke-brand)] rounded text-[var(--color-stroke-brand)] bg-white hover:bg-gray-100 text-sm flex items-center gap-2"
        onClick={() => {
          if (onBack) onBack();
          else if (onSave) onSave(form);
        }}
        type="button"
      >
        <span>&larr;</span> GO BACK
      </button>
      <div className="flex-1 flex flex-col justify-between pl-0 md:pl-8">
        <div>
          <h2 className="text-xl font-semibold text-[var(--color-neutral-primary)] mb-1 mt-8">
            Manage Your Grubpacs
          </h2>
          <p className="text-[var(--color-neutral-secondary)] text-lg mb-8">
            Stay organized by keeping a record of your delivery boxes.
          </p>
          <div className="space-y-6 w-full max-w-[60rem]">
            <div>
              <div className="text-[var(--color-neutral-secondary)] mb-2 text-sm">Basic details</div>
              <Input
                value={form.code}
                disabled
                className="mb-3 text-[var(--fog-gray)] border-[var(--mist-gray)] bg-[var(--very-light-gray)] w-full"
                placeholder="#GB12E3r4d"
              />
              <Input
                value={form.name}
                onChange={(e) => e?.target && handleChange("name", e.target.value)}
                className="mb-3 border-[var(--mist-gray)] text-[var(--color-neutral-secondary)] w-full"
                placeholder="BOX-2456"
                isFocused={focusedField === "name"}
                onFocus={() => setFocusedField("name")}
                onBlur={() => setFocusedField("")}
              />
            </div>
            <div>
              <div className="text-[var(--color-neutral-secondary)] mb-2 text-sm">Assigned restaurant</div>
              <Select
                value={form.restaurant}
                onChange={(value) => handleChange("restaurant", String(value))}
                options={restaurants}
                placeholder="Select restaurant"
                className="text-[var(--color-neutral-secondary)] text-sm border-[var(--mist-gray)] w-full"
              />
            </div>
            <div>
              <div className="text-[var(--color-neutral-secondary)] mb-2 text-sm">Assigned vehicle</div>
              <Input
                value={form.vehicle}
                onChange={(e) => e?.target && handleChange("vehicle", e.target.value)}
                placeholder="Add vehicle number"
                className="border-[var(--mist-gray)]  text-[var(--icon-color)] w-full"
                isFocused={focusedField === "vehicle"}
                onFocus={() => setFocusedField("vehicle")}
                onBlur={() => setFocusedField("")}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex justify-center items-center">
        <Image
          src="/box.png"
          alt="GrubPac Box"
          className="w-96 h-96 object-contain"
          width={384}
          height={384}
        />
      </div>

      <div className="absolute bottom-2 right-6">
        <Button className="bg-[var(--accent-orange)] hover:bg-[var(--primary-hover)] text-white px-6 py-3 rounded-lg font-medium">
          SAVE CHANGES
        </Button>
      </div>
    </div>
  );
}
