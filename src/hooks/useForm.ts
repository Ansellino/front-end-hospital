import { useState } from "react";
import { useFormik, FormikConfig, FormikHelpers, FormikValues } from "formik";

interface UseFormOptions<Values> extends FormikConfig<Values> {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

/**
 * Custom hook that wraps Formik's useFormik with additional functionality
 * - Manages loading state automatically during form submission
 * - Standardized error handling
 * - Success callback handling
 *
 * @param options Form configuration including validation schema and callbacks
 * @returns Extended formik instance with additional utilities
 */
export function useForm<Values extends FormikValues = FormikValues>({
  onSubmit,
  onSuccess,
  onError,
  ...formikConfig
}: UseFormOptions<Values>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (
    values: Values,
    formikHelpers: FormikHelpers<Values>
  ) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await onSubmit(values, formikHelpers);

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (err) {
      let errorMessage = "An unexpected error occurred";

      if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);

      if (onError) {
        onError(err);
      }

      return Promise.reject(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formik = useFormik({
    ...formikConfig,
    onSubmit: handleSubmit,
  });

  return {
    formik,
    isSubmitting,
    error,
    setError,
    clearError: () => setError(null),
  };
}
