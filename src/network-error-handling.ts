import { AxiosError } from "axios";

export type ToastFunction = (title: string, description: string) => void;

export type ErrorHandler = {
  /**
   * Adds an error with status, title, message, and optional callback.
   * @param {number} status - HTTP status code.
   * @param {string} title - Title of the error.
   * @param {string} message - Message describing the error.
   * @param {Function} [callback] - Optional callback to execute.
   * @returns {ErrorHandlerWithHandle} - Returns the ErrorHandlerWithHandle instance.
   */
  addError: (
    status: number,
    title: string,
    message: string,
    callback?: () => void
  ) => ErrorHandlerWithHandle;
};

export type ErrorHandlerWithHandle = {
  /**
   * Adds an error with status, title, message, and optional callback.
   * @param {number} status - HTTP status code.
   * @param {string} title - Title of the error.
   * @param {string} message - Message describing the error.
   * @param {Function} [callback] - Optional callback to execute.
   * @returns {ErrorHandlerWithHandle} - Returns the ErrorHandlerWithHandle instance.
   */
  addError: (
    status: number,
    title: string,
    message: string,
    callback?: () => void
  ) => ErrorHandlerWithHandle;

  /**
   * Adds a toast function for displaying errors.
   * @param {ToastFunction} toast - Function to display toast notifications.
   * @returns {ErrorHandlingWithToastHandle} - Returns an interface with the handle method.
   */
  withToast: (toast: ToastFunction) => ErrorHandlingWithToastHandle;

  /**
   * Handles the error by executing the callback.
   */
  handle: () => void;
};

export type ErrorHandlingWithToastHandle = {
  /**
   * Handles the error by executing the callback and/or displaying a toast.
   */
  handle: () => void;
};

export type ErrorDetails = {
  title: string;
  message: string;
  callback?: () => void;
};

/**
 * Function to create a network error handler.
 * @param {AxiosError} error - The Axios error object.
 * @returns {ErrorHandler} - Returns an error handler instance.
 */
export function networkErrorHandling(error: AxiosError): ErrorHandler {
  const errors = new Map<number, ErrorDetails>();

  const createHandler = (
    currentErrors: Map<number, ErrorDetails>,
    currentToast: ToastFunction | null
  ): ErrorHandler & ErrorHandlerWithHandle => ({
    addError: (
      status: number,
      title: string,
      message: string,
      callback?: () => void
    ): ErrorHandlerWithHandle => {
      const newErrors = new Map(currentErrors).set(status, {
        title,
        message,
        callback,
      });

      return createHandler(newErrors, currentToast);
    },

    withToast: (toast: ToastFunction): ErrorHandlingWithToastHandle => {
      const handler: ErrorHandlingWithToastHandle = {
        handle: (): void => {
          const status = error.response?.status;
          if (!status) return;

          const errorDetails = currentErrors.get(status);
          if (!errorDetails) return;

          if (errorDetails.callback) {
            errorDetails.callback();
          }

          toast(errorDetails.title, errorDetails.message);
        },
      };

      return handler;
    },

    handle: (): void => {
      const status = error.response?.status;
      if (!status) return;

      const errorDetails = currentErrors.get(status);
      if (!errorDetails) return;

      if (errorDetails.callback) {
        errorDetails.callback();
      }

      if (currentToast) {
        currentToast(errorDetails.title, errorDetails.message);
      }
    },
  });

  return createHandler(errors, null);
}
