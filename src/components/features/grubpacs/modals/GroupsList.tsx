import Modal from '@/components/ui/Modal'
import SearchInput from '@/components/ui/SearchInput'
import React from 'react'
import { FiFilter, FiMoreVertical } from 'react-icons/fi'
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import { Tooltip } from '@radix-ui/react-tooltip';
import Icon from '@/components/ui/Icon';
import FilterButton from '@/components/ui/FilterButton';

const GroupsList = ({ open, onClose, data, getStatusColor }: { open: boolean; onClose: () => void; data: Array<{ id?: string | number; name?: string; code?: string; location?: string; floor?: string; addedDate?: string }>; getStatusColor?: (status: string) => string }) => {
  if (!open) return null
  return (
    <Modal open={open} onClose={onClose} width='w-[70%]'>
      <div className="flex flex-col">
        <h1 className="py-6 font-semibold text-2xl text-[var(--color-neutral-primary)]">
          First floor
        </h1>
        <div className="flex items-center justify-between">
          <div className="relative max-w-xs w-full">
            <SearchInput value="" onChange={() => {}} />
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-[var(--color-stroke-brand)] text-sm">
              Showing {data.length} of {data.length}
            </span>
            <FilterButton open={false} handleFilterClick={() => {}} />
          </div>
        </div>
      </div>

      <div className="bg-white">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell className="!text-[var(--color-stroke-brand)] text-base font-normal ">
                Name
              </TableCell>
              <TableCell className="!text-[var(--color-stroke-brand)] text-base font-normal ">
                {null}
              </TableCell>
              <TableCell className="!text-[var(--color-stroke-brand)] text-base font-normal ">
                Power
              </TableCell>
              <TableCell className="!text-[var(--color-stroke-brand)] text-base font-normal ">
                Added
              </TableCell>
              <TableCell className="w-12">{null}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item, index) => (
              index < 3 && <TableRow key={item.id || index}>
                <TableCell className="pl-4">
                  {null}
                </TableCell>
                <TableCell >
                  <div className="">
                    <div className="!text-base cursor-pointer font-semibold text-[var(--color-neutral-secondary)]">
                      {item.name || `BOX-${item.code || item.id}`}
                    </div>
                    <div className=" text-[var(--color-stroke-brand)]">
                      #{item.code || item.id} | {item.location || "Room 202"}
                      {item.floor && ` | ${item.floor}`}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="">
                  <div className="flex items-center gap-8 ">
                    <div>
                      <Icon name="power" className="w-4 h-4" />
                    </div>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full border bg-[var(--toast-success-bg)] border-[var(--color-success)] text-[var(--notif-success)] text-sm font-medium cursor-pointer">
                      ON
                    </span>
                  </div>
                </TableCell>
                <TableCell className="">
                  <span className=" text-[var(--color-neutral-secondary)]">
                    {item.addedDate || "Today"}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* {
      open && (
        <GroupsList open={openGroupModal} onClose={()=>setOpenGroupModal(false)} data={data}/>
      )
    } */}
      </div>
    </Modal>
  )
}

export default GroupsList
