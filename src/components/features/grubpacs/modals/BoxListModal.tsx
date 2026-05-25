import Badge from '@/components/ui/Badge';
import CheckBox from '@/components/ui/CheckBox';
import FilterButton from '@/components/ui/FilterButton';
import Icon from '@/components/ui/Icon';
import Modal from '@/components/ui/Modal'
import SearchInput from '@/components/ui/SearchInput';
import React, { useState } from 'react'
import { FiLock, FiSearch } from 'react-icons/fi';
import { IoWarning } from 'react-icons/io5';

const GrubpacsTransferList = ({open,onClose}: {open: boolean; onClose: () => void}) => {
     const [searchTerm, setSearchTerm] = useState("");
    const [showOfflineBoxes, setShowOfflineBoxes] = useState(true);
  const mockBoxes = [
    {
      id: 1,
      name: "BOX-2456",
      code: "#DL12345",
      department: "Blood bank",
      power: "ON",
      status: "warning",
      added: "Today"
    },
    {
      id: 2,
      name: "BOX-2457",
      code: "#DL12346",
      department: "Blood bank",
      power: "ON",
      status: "warning",
      added: "Today"
    },
    {
      id: 3,
      name: "BOX-2458",
      code: "#DL12347",
      department: "Blood bank",
      power: "ON",
      status: "warning",
      added: "Today"
    },
    {
      id: 4,
      name: "BOX-2459",
      code: "#DL12348",
      department: "Blood bank",
      power: "ON",
      status: "warning",
      added: "Today"
    },
    {
      id: 5,
      name: "BOX-2460",
      code: "#DL12349",
      department: "Blood bank",
      power: "ON",
      status: "warning",
      added: "Today"
    }
  ];
    const filteredBoxes = mockBoxes.filter(box => 
    box.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    box.code.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
      <Modal
        open={open}
        onClose={onClose}
        width='w-[800px]'
      >
        <div className="relative h-full flex flex-col bg-white mt-8">
          {/* Header */}
          <div className="flex justify-between items-start p-6 pb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-[var(--color-neutral-primary)]">
                GrubPacs selected for transfer
              </h2>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="px-6 pb-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1">
                <SearchInput
                  placeholder="Search box"
                  icon={<FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-[240px]"
                />
              </div>
              <span className="text-[var(--color-stroke-brand)] text-sm">
                Showing {filteredBoxes.length} of {mockBoxes.length}
              </span>
              <label className="flex items-center gap-2 cursor-pointer">
<CheckBox checked={showOfflineBoxes} onChange={(e)=>setShowOfflineBoxes(e.target.checked)}/>
                <span className="text-[var(--color-neutral-secondary)] text-lg">Show offline boxes</span>
              </label>
              <FilterButton open={false} handleFilterClick={() => {}} />
            </div>
          </div>

          {/* Boxes List */}
        <div className="flex-1 overflow-y-auto px-6">
          <table className="w-full text-left">
              <thead>
                <tr className="text-[var(--color-stroke-brand)] text-sm border-b border-[var(--color-stroke-neutral)]">
                  <th className="font-medium py-3 pl-4">Name</th>
                  <th className="font-medium py-3 text-right pr-4">Power</th>
                  <th className="font-medium py-3 text-right pr-4">Added</th>
                </tr>
              </thead>
              <tbody>
                {mockBoxes.map((box) => (
                  <tr
                    key={box.id}
                    className="border-b border-[var(--color-stroke-neutral)] hover:bg-[var(--color-neutral-secondary-bg)]"
                  >
                    <td className="py-4 pl-4">
                      <div>
                        <div className="flex gap-1">
                          <img src="/lock.svg" alt="Lock" className="w-4 h-4" />
                          <div className='flex flex-col gap-1'>
                          <span className="font-semibold text-[var(--color-neutral-secondary)]">
                            {box.name}
                          </span>
                        <div className="text-sm text-[var(--color-stroke-brand)]">{box.code} | {box.department}</div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-right pr-4">
                      <div className="flex items-center justify-end gap-8">
                        <Icon name="warning_yellow" className="w-5 h-5" />
                        <Badge color='green' className='text-center'>
                          {box.power}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-4 text-right pr-4 text-[var(--color-neutral-secondary)]">
                      {box.added}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
        </div>
      </Modal>
  )
}

export default GrubpacsTransferList
