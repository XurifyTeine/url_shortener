import React from "react";
import { useModal } from "../context/ModalContext";
import CloseIcon from "./Icons/CloseIcon";

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
