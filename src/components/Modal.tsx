import React from "react";
import { useModal } from "../context/ModalContext";

export interface ModalProps {
  title: string;
  type?: ModalType;
  body?: React.ReactElement;
  footer?: React.ReactElement;
}

export type ModalType = "small";

export const Modal: React.FC<ModalProps> = ({
  footer,
  type = "small",
  title,
  body,
}) => {
  const { dismissModal } = useModal();
  const id = `modal-${type}`;
  const modalContents = {
    hasBody: "flex items-center justify-between p-3 border-b rounded-t",
    noBody: "flex items-center justify-between p-3 rounded-t",
  };
  const handleClose = () => dismissModal();
  return (
    <div
      id={id}
      tabIndex={-1}
      className="fixed top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 min-h-screen max-h-full flex items-center justify-center bg-black/40"
    >
      <div className="relative w-full max-w-md max-h-full">
        <div className="relative bg-white rounded-lg shadow">
          <div className={modalContents[!!body ? "hasBody" : "noBody"]}>
            <h3 className="text-xl font-medium text-gray-900">{title}</h3>
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
              data-modal-hide="small-modal"
              onClick={handleClose}
            >
              <CloseIcon />
              <span className="sr-only">Close modal</span>
            </button>
          </div>
          {body}
          {footer && (
            <div className="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;

const CloseIcon = () => (
  <svg
    aria-hidden="true"
    className="w-5 h-5"
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
      clipRule="evenodd"
    ></path>
  </svg>
);
