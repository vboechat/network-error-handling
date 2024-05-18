import { describe, it, expect, vi } from "vitest";
import { AxiosError } from "axios";
import { networkErrorHandling, ToastFunction } from "./network-error-handling";
import { StatusCode } from "./status-codes";

describe("networkErrorHandling", () => {
  it("should add an error and handle it without toast", () => {
    const axiosError = {
      response: { status: 404 },
    } as AxiosError;

    const handler = networkErrorHandling(axiosError).addError(
      StatusCode.NOT_FOUND,
      "Not Found",
      "The requested resource was not found"
    );

    const callback = vi.fn();
    handler.addError(
      StatusCode.INTERNAL_SERVER_ERROR,
      "Server Error",
      "Internal server error",
      callback
    );

    handler.handle();

    expect(callback).not.toHaveBeenCalled();
  });

  it("should add an error and handle it with toast", () => {
    const axiosError = {
      response: { status: 404 },
    } as AxiosError;

    const toast: ToastFunction = vi.fn();

    const handler = networkErrorHandling(axiosError)
      .addError(
        StatusCode.NOT_FOUND,
        "Not Found",
        "The requested resource was not found"
      )
      .withToast(toast);

    handler.handle();

    expect(toast).toHaveBeenCalledWith(
      "Not Found",
      "The requested resource was not found"
    );
  });

  it("should add multiple errors and handle them correctly", () => {
    const axiosError = {
      response: { status: 500 },
    } as AxiosError;

    const toast: ToastFunction = vi.fn();
    const callback = vi.fn();

    const handler = networkErrorHandling(axiosError)
      .addError(
        StatusCode.NOT_FOUND,
        "Not Found",
        "The requested resource was not found"
      )
      .addError(
        StatusCode.INTERNAL_SERVER_ERROR,
        "Server Error",
        "Internal server error",
        callback
      )
      .withToast(toast);

    handler.handle();

    expect(toast).toHaveBeenCalledWith("Server Error", "Internal server error");
    expect(callback).toHaveBeenCalled();
  });

  it("should not handle error if status is not in the map", () => {
    const axiosError = {
      response: { status: 403 },
    } as AxiosError;

    const toast: ToastFunction = vi.fn();
    const callback = vi.fn();

    const handler = networkErrorHandling(axiosError)
      .addError(
        StatusCode.NOT_FOUND,
        "Not Found",
        "The requested resource was not found"
      )
      .addError(
        StatusCode.INTERNAL_SERVER_ERROR,
        "Server Error",
        "Internal server error",
        callback
      )
      .withToast(toast);

    handler.handle();

    expect(toast).not.toHaveBeenCalled();
    expect(callback).not.toHaveBeenCalled();
  });

  it("should handle error without status", () => {
    const axiosError = {
      response: {},
    } as AxiosError;

    const handler = networkErrorHandling(axiosError).addError(
      StatusCode.NOT_FOUND,
      "Not Found",
      "The requested resource was not found"
    );

    handler.handle();

    expect(true).toBe(true);
  });
});
