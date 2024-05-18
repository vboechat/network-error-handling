# Network Error Handling

## Introduction

A powerful error handling to manage network axios response errors.

## Installation

```bash
npm install network-error-handling
```

```bash
yarn add network-error-handling
```

```bash
pnpm install network-error-handling
```

## Usage

### Network error handling

1. Import

```typescript
import { networkErrorHandling } from "network-error-handling";
```

2. Call the function, example:

**IMPORTANT**: The `error` parameter is the `AxiosError` object from the axios response.

```typescript
networkErrorHandling(error)
  .addError(
    409,
    "User already exists",
    "The user already exists, please try again with another email.",
    () => console.log("Error while creating user")
  )
  .handle();
```

#### Using toast

If you plan to display a toast of error, you will need to have a function to handle the toast, example using Shadcn
UI toast component

```typescript
import { toast } from "shadcn-components-folder-location/use-toast";

export const handleErrorToast = (title: string, description: string) =>
  toast({ title, description, variant: "error" });
```

After this, you can use the `withToast` method to handle the toast, example:

```typescript
networkErrorHandling(error)
  .addError(
    400,
    "Invalid form data",
    "The form data is invalid, please check the fields."
  )
  .addError(
    409,
    "User already exists",
    "The user already exists, please try again with another email."
  )
  .withToast(handleErrorToast)
  .handle();
```

Ooh, you can also use a callback function when using a toast!

```typescript
networkErrorHandling(error)
  .addError(
    409,
    "User already exists",
    "The user already exists, please try again with another email.",
    () => console.log("Error while creating user")
  )
  .withToast(handleErrorToast)
  .handle();
```

### Status Codes

This package provides a list of status codes that you can use to handle the errors, example:

```typescript
import { StatusCode } from "network-error-handling";

networkErrorHandling(error)
  .addError(
    StatusCode.CONFLICT,
    "User already exists",
    "The user already exists, please try again with another email."
  )
  .handle();
```

## Api References

### `networkErrorHandling(error: AxiosError)`

- `error`: The `AxiosError` object from the axios response.

### `addError(statusCode: number, title: string, description: string, callback?: () => void)`

- `statusCode`: The status code to handle the error.
- `title`: The title of the error.
- `description`: The description of the error.
- `callback`: Optional callback function to execute when the error is handled.

**CAUTION**: For now, the callback parameter is not async aware, so you can't use async functions inside the callback.

### `withToast(toastFunction: (title: string, description: string) => void)`

- `toastFunction`: The function to handle the toast.

**Observation**: You should handle the toast system by yourself in your project.

### `handle()`

- Handle the error.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
