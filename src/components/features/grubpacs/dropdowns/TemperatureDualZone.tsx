import React, { useState } from 'react';
import { MdDone } from 'react-icons/md';
import ActionConfirmModal from '../modals/ActionConfirmModal';
import TableCheckbox from '@/components/ui/TableCheckbox';
import Input from '@/components/ui/Input';

const TemperatureDualZone = ({ open, activeAction, onClose, selectedCount, isChecked, setIsChecked,
    zone1Temp,zone2Temp,setZone1Temp,setZone2Temp
}: {
  open?: boolean;
  activeAction?: string;
  onClose: () => void;
  selectedCount: number;
  isChecked: boolean;
  setIsChecked: (checked: boolean) => void;
  zone1Temp: string;
  zone2Temp: string;
  setZone1Temp: (temp: string) => void;
  setZone2Temp: (temp: string) => void;
}) => {
  const [openActionConfirm, setOpenActionConfirm] = useState(false);

  const bothZonesFilled = zone1Temp.trim() !== '' && zone2Temp.trim() !== '';
  const selectedAction = isChecked ? 'on' : 'off';

  return (
    <div className='absolute bottom-14 right-0 w-120 bg-white shadow-xl rounded-lg border border-[var(--color-stroke-neutral)] flex flex-col'>
      {/* Header */}
      <div className="text-[var(--color-neutral-secondary)]">
        <h2 className="text-sm py-2 px-3 border-b border-[var(--color-stroke-neutral)]">
          Take action on selected boxes :
        </h2>

        <div className="flex items-center gap-2 py-3 px-3 border-b border-[var(--color-stroke-neutral)]">
          <TableCheckbox 
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
          />
          <span className="text-lg">
            Dual zone on
            <span className="text-[var(--color-stroke-brand)] text-base">
              (Mixed settings)
            </span>
          </span>
        </div>

        {/* Temperature Zones */}
        <div className="grid grid-cols-2 gap-3 py-3 px-3 border-b border-[var(--color-stroke-neutral)]">
          <div>
            <label className="block mb-1">
              Zone 1 <span className="text-sm text-[var(--color-stroke-brand)]">(Primary)</span>
            </label>
            <Input
              type="number"
              value={zone1Temp}
              onChange={(e) => setZone1Temp(e.target.value)}
              placeholder="Set temperature (°C)"
              className="w-full px-4 py-2 !border !border-[var(--color-stroke-neutral)] !text-[var(--color-neutral-secondary)] rounded outline-none"
            />
          </div>
          <div>
            <label className="block mb-1">
              Zone 2 <span className="text-sm text-[var(--color-stroke-brand)]">(Secondary)</span>
            </label>
            <Input
              type="number"
              value={zone2Temp}
              onChange={(e) => setZone2Temp(e.target.value)}
              placeholder="Set temperature (°C)"
              className="w-full px-4 py-2 !border !border-[var(--color-stroke-neutral)] !text-[var(--color-neutral-secondary)] rounded outline-none"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between text-sm px-6 py-3 items-center">
        <button
          className="!text-[var(--color-stroke-brand)]"
          onClick={onClose}
        >
          CANCEL
        </button>
        <button
          className={`flex items-center text-sm gap-2 ${
            bothZonesFilled
              ? 'text-[var(--color-brand-default)]'
              : 'text-[var(--color-box-border)] disabled'
          }`}
          onClick={() => setOpenActionConfirm(true)}
        >
          <MdDone />
          CONFIRM
        </button>

        <ActionConfirmModal
          open={openActionConfirm}
          onClose={() => {
            setOpenActionConfirm(false);
            // Close parent dropdown after action is confirmed
            setTimeout(() => {
              onClose();
            }, 2000);
          }}
          selectedCount={selectedCount}
          activeAction={activeAction}
          selectedAction={selectedAction}
          zone1Temp={zone1Temp}
          zone2Temp={zone2Temp}
        />
      </div>
    </div>
  );
};

export default TemperatureDualZone;
