import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Chip,
  Divider,
  CircularProgress,
  useTheme,
  Popper,
  ClickAwayListener
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  TrendingUp as TrendingIcon,
  History as HistoryIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import { debounce } from 'lodash';
import { productService } from '../../services/productService';

interface SearchResult {
  id: string;
  name: string;
  category: string;
  price: number;
  salePrice?: number;
  imageUrl: string;
  type: 'product' | 'category' | 'suggestion';
}

interface SearchBarProps {
  placeholder?: string;
  variant?: 'outlined' | 'filled' | 'standard';
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  showSuggestions?: boolean;
  showHistory?: boolean;
  showTrending?: boolean;
  onSearch?: (query: string) => void;
  onResultSelect?: (result: SearchResult) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search for products...',
  variant = 'outlined',
  size = 'medium',
  fullWidth = false,
  showSuggestions = true,
  showHistory = true,
  showTrending = true,
  onSearch,
  onResultSelect
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Load search history and trending searches on mount
  useEffect(() => {
    loadSearchHistory();
    loadTrendingSearches();
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Search for products
        const searchResults = await productService.searchProducts(searchQuery, {
          limit: 8,
          includeCategories: true,
          includeSuggestions: true
        });

        const formattedResults: SearchResult[] = [
          // Products
          ...searchResults.products.map(product => ({
            id: product.id,
            name: product.name,
            category: product.category,
            price: product.price,
            salePrice: product.salePrice,
            imageUrl: product.imageUrl,
            type: 'product' as const
          })),
          
          // Categories (if any match)
          ...searchResults.categories?.map(category => ({
            id: category.id,
            name: category.name,
            category: 'Category',
            price: 0,
            imageUrl: category.imageUrl || '/category-placeholder.png',
            type: 'category' as const
          })) || [],

          // Search suggestions
          ...searchResults.suggestions?.map((suggestion, index) => ({
            id: `suggestion-${index}`,
            name: suggestion,
            category: 'Suggestion',
            price: 0,
            imageUrl: '',
            type: 'suggestion' as const
          })) || []
        ];

        setResults(formattedResults);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  // Handle input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = event.target.value;
    setQuery(newQuery);
    setSelectedIndex(-1);

    if (newQuery.trim()) {
      setShowDropdown(true);
      debouncedSearch(newQuery);
    } else {
      setResults([]);
      setShowDropdown(newQuery.length === 0); // Show suggestions when empty
    }
  };

  // Handle form submission
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    performSearch();
  };

  // Perform search
  const performSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (finalQuery.trim()) {
      // Add to search history
      addToSearchHistory(finalQuery.trim());
      
      // Navigate to search results
      navigate(`/search?q=${encodeURIComponent(finalQuery.trim())}`);
      
      // Close dropdown
      setShowDropdown(false);
      
      // Call callback
      onSearch?.(finalQuery.trim());
      
      // Clear selection
      setSelectedIndex(-1);
    }
  };

  // Handle result selection
  const handleResultSelect = (result: SearchResult) => {
    if (result.type === 'product') {
      navigate(`/product/${result.id}`);
    } else if (result.type === 'category') {
      navigate(`/category/${result.id}`);
    } else if (result.type === 'suggestion') {
      setQuery(result.name);
      performSearch(result.name);
    }
    
    setShowDropdown(false);
    onResultSelect?.(result);
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!showDropdown) return;

    const totalItems = getDropdownItems().length;
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : prev));
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
        
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0) {
          const items = getDropdownItems();
          const selectedItem = items[selectedIndex];
          if (selectedItem) {
            handleResultSelect(selectedItem);
          }
        } else {
          performSearch();
        }
        break;
        
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Get all dropdown items in order
  const getDropdownItems = (): SearchResult[] => {
    const items: SearchResult[] = [];
    
    if (query.length === 0) {
      // Show history and trending when no query
      if (showHistory && searchHistory.length > 0) {
        items.push(...searchHistory.slice(0, 5).map((term, index) => ({
          id: `history-${index}`,
          name: term,
          category: 'Recent Search',
          price: 0,
          imageUrl: '',
          type: 'suggestion' as const
        })));
      }
      
      if (showTrending && trendingSearches.length > 0) {
        items.push(...trendingSearches.slice(0, 5).map((term, index) => ({
          id: `trending-${index}`,
          name: term,
          category: 'Trending',
          price: 0,
          imageUrl: '',
          type: 'suggestion' as const
        })));
      }
    } else {
      items.push(...results);
    }
    
    return items;
  };

  // Load search history from localStorage
  const loadSearchHistory = () => {
    try {
      const history = localStorage.getItem('searchHistory');
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  };

  // Add to search history
  const addToSearchHistory = (term: string) => {
    try {
      const currentHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      const updatedHistory = [term, ...currentHistory.filter((h: string) => h !== term)].slice(0, 10);
      localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
      setSearchHistory(updatedHistory);
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  };

  // Load trending searches (mock data)
  const loadTrendingSearches = () => {
    // In a real app, this would come from an API
    const trending = ['iPhone', 'MacBook', 'Gaming Laptop', 'Headphones', 'Smart Watch'];
    setTrendingSearches(trending);
  };

  // Clear search
  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowDropdown(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Handle input focus
  const handleInputFocus = () => {
    if (query.length === 0 && (searchHistory.length > 0 || trendingSearches.length > 0)) {
      setShowDropdown(true);
    } else if (query.length >= 2) {
      setShowDropdown(true);
    }
  };

  // Handle click away
  const handleClickAway = () => {
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  const dropdownItems = getDropdownItems();

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box ref={searchRef} sx={{ position: 'relative', width: fullWidth ? '100%' : 'auto' }}>
        <form onSubmit={handleSubmit}>
          <TextField
            ref={inputRef}
            fullWidth={fullWidth}
            variant={variant}
            size={size}
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {loading && <CircularProgress size={20} />}
                  {query && !loading && (
                    <IconButton
                      size="small"
                      onClick={handleClear}
                      edge="end"
                    >
                      <ClearIcon />
                    </IconButton>
                  )}
                </InputAdornment>
              )
            }}
          />
        </form>

        {/* Search Results Dropdown */}
        {showDropdown && (
          <Paper
            elevation={8}
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 1300,
              maxHeight: 400,
              overflow: 'auto',
              mt: 1
            }}
          >
            {dropdownItems.length > 0 ? (
              <List sx={{ py: 0 }}>
                {query.length === 0 && searchHistory.length > 0 && showHistory && (
                  <>
                    <Box sx={{ px: 2, py: 1, backgroundColor: theme.palette.grey[50] }}>
                      <Typography variant="body2" fontWeight="bold" color="text.secondary">
                        Recent Searches
                      </Typography>
                    </Box>
                    {searchHistory.slice(0, 5).map((term, index) => (
                      <ListItem
                        key={`history-${index}`}
                        button
                        selected={selectedIndex === index}
                        onClick={() => handleResultSelect({
                          id: `history-${index}`,
                          name: term,
                          category: 'Recent Search',
                          price: 0,
                          imageUrl: '',
                          type: 'suggestion'
                        })}
                        sx={{ py: 1 }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ backgroundColor: theme.palette.grey[200] }}>
                            <HistoryIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={term} />
                      </ListItem>
                    ))}
                    {trendingSearches.length > 0 && <Divider />}
                  </>
                )}

                {query.length === 0 && trendingSearches.length > 0 && showTrending && (
                  <>
                    <Box sx={{ px: 2, py: 1, backgroundColor: theme.palette.grey[50] }}>
                      <Typography variant="body2" fontWeight="bold" color="text.secondary">
                        Trending Searches
                      </Typography>
                    </Box>
                    {trendingSearches.slice(0, 5).map((term, index) => {
                      const itemIndex = searchHistory.length + index;
                      return (
                        <ListItem
                          key={`trending-${index}`}
                          button
                          selected={selectedIndex === itemIndex}
                          onClick={() => handleResultSelect({
                            id: `trending-${index}`,
                            name: term,
                            category: 'Trending',
                            price: 0,
                            imageUrl: '',
                            type: 'suggestion'
                          })}
                          sx={{ py: 1 }}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ backgroundColor: theme.palette.primary.light }}>
                              <TrendingIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText primary={term} />
                          <Chip label="Trending" size="small" color="primary" />
                        </ListItem>
                      );
                    })}
                  </>
                )}

                {query.length >= 2 && results.map((result, index) => (
                  <ListItem
                    key={result.id}
                    button
                    selected={selectedIndex === index}
                    onClick={() => handleResultSelect(result)}
                    sx={{ py: 1 }}
                  >
                    <ListItemAvatar>
                      {result.type === 'product' ? (
                        <Avatar
                          src={result.imageUrl}
                          alt={result.name}
                          sx={{ width: 40, height: 40 }}
                        />
                      ) : result.type === 'category' ? (
                        <Avatar sx={{ backgroundColor: theme.palette.secondary.light }}>
                          <CategoryIcon />
                        </Avatar>
                      ) : (
                        <Avatar sx={{ backgroundColor: theme.palette.grey[200] }}>
                          <SearchIcon />
                        </Avatar>
                      )}
                    </ListItemAvatar>
                    <ListItemText
                      primary={result.name}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {result.category}
                          </Typography>
                          {result.type === 'product' && (
                            <Typography variant="body2" fontWeight="bold" color="primary">
                              ${result.salePrice || result.price}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    {result.type === 'category' && (
                      <Chip label="Category" size="small" color="secondary" />
                    )}
                  </ListItem>
                ))}
              </List>
            ) : query.length >= 2 && !loading ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No results found for "{query}"
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Try different keywords or check your spelling
                </Typography>
              </Box>
            ) : null}
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );
};

export default SearchBar;