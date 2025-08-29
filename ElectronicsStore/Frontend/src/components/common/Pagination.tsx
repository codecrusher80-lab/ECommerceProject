import React from 'react';
import {
  Pagination as MuiPagination,
  PaginationItem,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  useMediaQuery,
  IconButton
} from '@mui/material';
import {
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon
} from '@mui/icons-material';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  showItemsPerPage?: boolean;
  showTotalCount?: boolean;
  showFirstLast?: boolean;
  itemsPerPageOptions?: number[];
  variant?: 'default' | 'compact' | 'simple';
  color?: 'primary' | 'secondary' | 'standard';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true,
  showTotalCount = true,
  showFirstLast = false,
  itemsPerPageOptions = [5, 10, 20, 50, 100],
  variant = 'default',
  color = 'primary',
  size = 'medium',
  disabled = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    if (!disabled) {
      onPageChange(page);
    }
  };

  const handleItemsPerPageChange = (event: any) => {
    const newItemsPerPage = event.target.value;
    onItemsPerPageChange?.(newItemsPerPage);
    // Reset to page 1 when changing items per page
    onPageChange(1);
  };

  const calculateItemRange = () => {
    if (!totalItems) return null;
    
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);
    
    return { start, end };
  };

  const itemRange = calculateItemRange();

  // Simple variant for mobile or minimal UI
  if (variant === 'simple' || (isMobile && variant !== 'compact')) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          py: 2
        }}
      >
        {/* Page info */}
        {showTotalCount && totalItems && (
          <Typography variant="body2" color="text.secondary">
            Page {currentPage} of {totalPages}
            {itemRange && ` (${itemRange.start}-${itemRange.end} of ${totalItems} items)`}
          </Typography>
        )}

        {/* Navigation buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1 || disabled}
            size={size}
          >
            <PrevIcon />
          </IconButton>
          
          <Typography variant="body2" sx={{ mx: 2 }}>
            {currentPage} / {totalPages}
          </Typography>
          
          <IconButton
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || disabled}
            size={size}
          >
            <NextIcon />
          </IconButton>
        </Box>
      </Box>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 2
        }}
      >
        <MuiPagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          color={color}
          size={size}
          disabled={disabled}
          showFirstButton={showFirstLast}
          showLastButton={showFirstLast}
          siblingCount={isMobile ? 0 : 1}
          boundaryCount={1}
        />
      </Box>
    );
  }

  // Default variant with full features
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'stretch', md: 'center' },
        justifyContent: 'space-between',
        gap: 2,
        py: 2
      }}
    >
      {/* Left section: Items info and per-page selector */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2
        }}
      >
        {/* Total count */}
        {showTotalCount && totalItems !== undefined && (
          <Typography variant="body2" color="text.secondary">
            {itemRange ? (
              <>
                Showing {itemRange.start}-{itemRange.end} of {totalItems} items
              </>
            ) : (
              `${totalItems} items total`
            )}
          </Typography>
        )}

        {/* Items per page selector */}
        {showItemsPerPage && onItemsPerPageChange && (
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Items per page</InputLabel>
            <Select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              label="Items per page"
              disabled={disabled}
            >
              {itemsPerPageOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      {/* Right section: Pagination */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: { xs: 'center', md: 'flex-end' },
          alignItems: 'center'
        }}
      >
        {showFirstLast && (
          <IconButton
            onClick={() => onPageChange(1)}
            disabled={currentPage <= 1 || disabled}
            size={size}
            sx={{ mr: 1 }}
          >
            <FirstPageIcon />
          </IconButton>
        )}

        <MuiPagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          color={color}
          size={size}
          disabled={disabled}
          showFirstButton={false}
          showLastButton={false}
          siblingCount={isMobile ? 0 : 1}
          boundaryCount={1}
          renderItem={(item) => (
            <PaginationItem
              {...item}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: theme.palette[color].main,
                  color: theme.palette[color].contrastText,
                  '&:hover': {
                    backgroundColor: theme.palette[color].dark,
                  }
                }
              }}
            />
          )}
        />

        {showFirstLast && (
          <IconButton
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages || disabled}
            size={size}
            sx={{ ml: 1 }}
          >
            <LastPageIcon />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

// Hook for pagination logic
export const usePagination = (
  totalItems: number,
  initialItemsPerPage: number = 10,
  initialPage: number = 1
) => {
  const [currentPage, setCurrentPage] = React.useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = React.useState(initialItemsPerPage);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  const getSliceParams = () => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return { start, end };
  };

  const paginateArray = <T,>(array: T[]): T[] => {
    const { start, end } = getSliceParams();
    return array.slice(start, end);
  };

  // Reset page when total items change
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalItems, itemsPerPage, totalPages, currentPage]);

  return {
    currentPage,
    itemsPerPage,
    totalPages,
    handlePageChange,
    handleItemsPerPageChange,
    getSliceParams,
    paginateArray,
    // Convenience getters
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages
  };
};

export default Pagination;