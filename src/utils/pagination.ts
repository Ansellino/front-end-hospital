import { useState, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Paginate an array of items
 */
export function paginateData<T>(
  data: T[],
  page: number,
  itemsPerPage: number
): T[] {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return data.slice(startIndex, endIndex);
}

/**
 * Calculate total number of pages
 */
export function calculateTotalPages(
  totalItems: number,
  itemsPerPage: number
): number {
  return Math.ceil(totalItems / itemsPerPage);
}

/**
 * Custom hook for pagination state management
 * @param initialItemsPerPage Default number of items per page
 * @param initialPage Initial page number (defaults to 1)
 * @param resetOnRouteChange Whether to reset pagination when route changes
 * @param dependencies Array of dependencies that will trigger pagination reset when changed
 * @returns Pagination state and handlers
 */
export function usePagination(
  initialItemsPerPage: number = 10,
  initialPage: number = 1,
  resetOnRouteChange: boolean = true,
  dependencies: any[] = []
) {
  const [page, setPage] = useState<number>(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState<number>(initialItemsPerPage);
  const location = useLocation();

  // Reset pagination when route changes
  useEffect(() => {
    if (resetOnRouteChange) {
      setPage(initialPage);
    }
  }, [location.pathname, resetOnRouteChange, initialPage]);

  // Reset pagination when dependencies change
  useEffect(() => {
    setPage(initialPage);
  }, [...dependencies]);

  /**
   * Handle page change event from MUI Pagination component
   */
  const handlePageChange = useCallback(
    (event: React.ChangeEvent<unknown>, value: number) => {
      setPage(value);
    },
    []
  );

  /**
   * Handle rows per page change event from MUI TablePagination
   */
  const handleChangeItemsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setItemsPerPage(parseInt(event.target.value, 10));
      setPage(1); // Reset to first page when changing items per page
    },
    []
  );

  /**
   * Get current page items from full data array
   */
  const getCurrentPageItems = useCallback(
    <T>(data: T[]): T[] => {
      return paginateData(data, page, itemsPerPage);
    },
    [page, itemsPerPage]
  );

  /**
   * Reset pagination to first page
   */
  const resetPagination = useCallback(() => {
    setPage(initialPage);
  }, [initialPage]);

  return {
    page,
    setPage,
    itemsPerPage,
    setItemsPerPage,
    handlePageChange,
    handleChangeItemsPerPage,
    getCurrentPageItems,
    calculateTotalPages: (totalItems: number) =>
      calculateTotalPages(totalItems, itemsPerPage),
    resetPagination,
  };
}
