import { AxiosError } from "axios";
import { ToastFunction } from "./types/toast-function";

/**
 * Interface for error handling.
 */
interface ErrorHandler {
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
}

/**
 * Interface for error handling with both addError and handle methods.
 */
interface ErrorHandlerWithHandle {
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
}

/**
 * Interface for error handling with toast notifications and handle method.
 */
interface ErrorHandlingWithToastHandle {
  /**
   * Handles the error by executing the callback and/or displaying a toast.
   */
  handle: () => void;
}

/**
 * Type for error details.
 */
type ErrorDetails = {
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

  /**
   * Creates an error handler with the current errors and toast function.
   * @param {Map<number, ErrorDetails>} currentErrors - Map of current error details.
   * @param {ToastFunction | null} currentToast - Current toast function, if any.
   * @returns {ErrorHandler & ErrorHandlerWithHandle} - Returns the ErrorHandler instance.
   */
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
