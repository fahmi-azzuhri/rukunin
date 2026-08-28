import type { ReactNode } from "react";

type ModalProps = {
  titleId: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
};

export function Modal({
  titleId,
  onClose,
  children,
  className = "max-h-[calc(100vh_-_40px)] w-[min(560px,100%)] overflow-y-auto rounded-[14px] bg-white shadow-[0_24px_70px_#17382e30]",
}: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[#17382e66] p-5"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="presentation"
    >
      <section
        className={className}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        {children}
      </section>
    </div>
  );
}
