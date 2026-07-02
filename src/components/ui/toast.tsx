"use client"
import toast from "react-hot-toast";
import React from "react";
import Icon from "@/components/ui/Icon";
import Link from "next/link";
import { FaRegCircleCheck } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export function showSuccess(
  title: string,
  message: string,
  hideDetails = false,
  href = "",
  buttonText = "VIEW DETAILS"
) {
  toast.custom(
    (t) => (
      <div className="w-[98vw] flex justify-center">
        <Alert
          variant="success"
          appearance="solid"
          autoDismiss
          onDismiss={() => toast.remove(t.id)}
          dismissTime={3000}
          className="rounded shadow-md !w-[98vw] cursor-pointer"
          onClick={() => toast.remove(t.id)}
        >
          <div className="flex-1 flex items-center justify-between gap-4">
            <div className="flex items-center gap-[var(--gp-space-regular)]">
              <AlertTitle className="text-[18px] font-semibold m-0 inline-block">{title}</AlertTitle>
              {message && (
                <AlertDescription className="text-[16px] font-normal m-0 pl-2 inline-block">
                  {message}
                </AlertDescription>
              )}
            </div>
            {href && !hideDetails && (
              <Link
                href={href}
                onClick={() => toast.remove(t.id)}
                className="shrink-0 px-4 py-2 bg-white text-green-700 rounded-md text-sm font-semibold hover:bg-green-50 transition-colors border border-green-700"
              >
                {buttonText}
              </Link>
            )}
          </div>
        </Alert>
      </div>
    ),
    { position: "top-center", duration: 2500 }
  );
}


export function showError(message: string) {
  toast.custom(
    (t) => (
      <div className="w-[100vw] flex justify-center">
        <Alert
          variant="error"
          appearance="solid"
          autoDismiss
          onDismiss={() => toast.remove(t.id)}
          dismissTime={3000}
          className="rounded !w-[98vw] cursor-pointer"
          onClick={() => toast.remove(t.id)}
        >
          <AlertTitle className="text-[18px]">Error</AlertTitle>
          <AlertDescription className="text-[16px]">{message}</AlertDescription>
        </Alert>
      </div>
    ),
    { position: "top-center", duration: 2500 }
  );
}

export function showWarning(
  title: string,
  message: string,
  hideDetails = false,
  href = "",
  buttonText = "VIEW DETAILS"
) {
  toast.custom(
    (t) => (
      <div className="w-[98vw] flex justify-center">
        <Alert
          variant="warning"
          appearance="solid"
          autoDismiss
          onDismiss={() => toast.remove(t.id)}
          dismissTime={4000}
          className="rounded shadow-md !w-[98vw] cursor-pointer"
          showClose={false}
          onClick={() => toast.remove(t.id)}
        >
          <div className="flex-1 flex items-center justify-between gap-4">
            <div className="flex items-center gap-[var(--gp-space-regular)]">
              <AlertTitle className="text-[18px] font-semibold m-0 inline-block">{title}</AlertTitle>
              {message && (
                <AlertDescription className="text-[16px] font-normal m-0 pl-2 inline-block">
                  {message}
                </AlertDescription>
              )}
            </div>
            {href && !hideDetails && (
              <Link
                href={href}
                onClick={() => toast.remove(t.id)}
                className="shrink-0 text-[#BB812C] font-[var(--gp-font-heading)] text-[16px] font-medium tracking-wider hover:opacity-80 transition-opacity uppercase"
              >
                {buttonText}
              </Link>
            )}
          </div>
        </Alert>
      </div>
    ),
    { position: "top-center", duration: 3000 }
  );
}
