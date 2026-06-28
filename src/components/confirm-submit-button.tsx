"use client";

import type { ReactNode } from "react";

interface ConfirmSubmitButtonProps {
  children?: ReactNode;
  confirmText?: string;
  className?: string;
}

export function ConfirmSubmitButton({
  children = "Hapus",
  confirmText = "Yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.",
  className = "text-sm font-medium text-red-600 hover:text-red-700",
}: ConfirmSubmitButtonProps) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(event) => {
        if (!window.confirm(confirmText)) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}
