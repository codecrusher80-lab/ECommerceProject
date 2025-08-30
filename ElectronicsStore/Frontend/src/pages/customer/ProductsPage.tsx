import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  Chip,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  Slider,
  Pagination,
  Skeleton,
} from "@mui/material";
import {
  ExpandMore,
  FilterList,
  Sort,
  ShoppingCart,
  FavoriteBorder,
} from "@mui/icons-material";
import { AppDispatch, RootState } from "../../store/store";
import {
  fetchProducts,
  fetchCategories,
  fetchBrands,
} from "../../store/thunks/productThunks";
import { addToCart } from "../../store/thunks/cartThunks";
import { updateFilters } from "../../store/slices/productSlice";

const ProductsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    products,
    categories,
    brands,
    filters,
    isLoading,
    isCategoriesLoading,
    isBrandsLoading,
    error,
  } = useSelector((state: RootState) => state.products);

  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200000]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchBrands());

    // Get category from URL params
    const params = new URLSearchParams(location.search);
    const categoryId = params.get("category");

    const initialFilters = {
      ...filters,
      ...(categoryId && { categoryId: parseInt(categoryId) }),
    };

    dispatch(updateFilters(initialFilters));
    loadProducts(initialFilters);
  }, [dispatch, location.search]);

  const loadProducts = (currentFilters = filters) => {
    dispatch(
      fetchProducts({
        filter: {
          ...currentFilters,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
        },
        pagination: {
          pageNumber: currentPage,
          pageSize: 12,
          sortBy,
          sortDescending: false,
        },
      })
    );
  };

  const handleCategoryFilter = (categoryId: number) => {
    const newFilters = {
      ...filters,
      categoryId: filters.categoryId === categoryId ? undefined : categoryId,
    };
    dispatch(updateFilters(newFilters));
    loadProducts(newFilters);
  };

  const handleBrandFilter = (brandId: number) => {
    const newFilters = {
      ...filters,
      brandId: filters.brandId === brandId ? undefined : brandId, // toggle or reset the brand filter
    };
    dispatch(updateFilters(newFilters));
    loadProducts(newFilters);
  };

  const handlePriceChange = (event: Event, newValue: number | number[]) => {
    setPriceRange(newValue as [number, number]);
  };

  const handlePriceCommit = () => {
    loadProducts();
  };

  const handleSortChange = (field: string, order: "asc" | "desc") => {
    setSortBy(field);
    setSortOrder(order);
    loadProducts();
  };

  const handleSearchSubmit = () => {
    setCurrentPage(1);
    loadProducts();
  };

  const handleProductClick = (productId: number) => {
    navigate(`/products/${productId}`);
  };

  const handleAddToCart = async (productId: number) => {
    try {
      await dispatch(addToCart({ productId, quantity: 1 })).unwrap();
      // Show success message
    } catch (error) {
      // Show error message
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  const calculateDiscount = (originalPrice: number, currentPrice: number) => {
    const discount = ((originalPrice - currentPrice) / originalPrice) * 100;
    return Math.round(discount);
  };

  if (error) {
    return (
      <Container>
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="error">
            Error: {error}
          </Typography>
          <Button
            variant="contained"
            onClick={() => loadProducts()}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Products
      </Typography>

      {/* Search and Sort */}
      <Box sx={{ mb: 4, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <TextField
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearchSubmit()}
          sx={{ flexGrow: 1, minWidth: 300 }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={`${sortBy}_${sortOrder}`}
            label="Sort By"
            onChange={(e) => {
              const [field, order] = e.target.value.split("_");
              handleSortChange(field, order as "asc" | "desc");
            }}
          >
            <MenuItem value="name_asc">Name A-Z</MenuItem>
            <MenuItem value="name_desc">Name Z-A</MenuItem>
            <MenuItem value="price_asc">Price Low-High</MenuItem>
            <MenuItem value="price_desc">Price High-Low</MenuItem>
            <MenuItem value="createdAt_desc">Newest First</MenuItem>
            <MenuItem value="averageRating_desc">Top Rated</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={4}>
        {/* Filters Sidebar */}
        <Grid item xs={12} md={3}>
          <Typography variant="h6" gutterBottom>
            <FilterList /> Filters
          </Typography>

          {/* Categories Filter */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography>Categories</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {isCategoriesLoading
                ? Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} height={40} />
                  ))
                : categories?.map((category) => (
                    <FormControlLabel
                      key={category.id}
                      control={
                        <Checkbox
                          checked={filters.categoryId === category.id}
                          onChange={() => handleCategoryFilter(category.id)}
                        />
                      }
                      label={category.name}
                    />
                  ))}
            </AccordionDetails>
          </Accordion>

          {/* Brands Filter */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography>Brands</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {isBrandsLoading
                ? Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} height={40} />
                  ))
                : brands?.slice(0, 10).map((brand) => (
                    <FormControlLabel
                      key={brand.id}
                      control={
                        <Checkbox
                          checked={filters.brandId === brand.id} // Check if brandId matches the selected filter
                          onChange={() => handleBrandFilter(brand.id)} // Handle brand filter change
                        />
                      }
                      label={brand.name}
                    />
                  ))}
            </AccordionDetails>
          </Accordion>

          {/* Price Range Filter */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography>Price Range</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={priceRange}
                  onChange={handlePriceChange}
                  onChangeCommitted={handlePriceCommit}
                  valueLabelDisplay="auto"
                  min={0}
                  max={200000}
                  step={1000}
                  valueLabelFormat={(value) => `₹${value.toLocaleString()}`}
                />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 1,
                  }}
                >
                  <Typography variant="body2">
                    ₹{priceRange[0].toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    ₹{priceRange[1].toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Products Grid */}
        <Grid item xs={12} md={9}>
          {/* Results Count */}
          <Box
            sx={{
              mb: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body1">
              {products?.totalCount || 0} products found
            </Typography>
          </Box>

          {/* Products Grid */}
          <Grid container spacing={3}>
            {isLoading ? (
              Array.from({ length: 12 }).map((_, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <Skeleton variant="rectangular" height={250} />
                    <CardContent>
                      <Skeleton variant="text" height={32} />
                      <Skeleton variant="text" height={24} width="40%" />
                      <Skeleton variant="text" height={20} width="60%" />
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : products?.items?.length ? (
              products.items.map((product) => {
                const discount =
                  product.discountPrice && product.discountPrice > product.price
                    ? calculateDiscount(product.discountPrice, product.price)
                    : 0;

                return (
                  <Grid item xs={12} sm={6} md={4} key={product.id}>
                    <Card
                      sx={{
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: 4,
                        },
                      }}
                    >
                      <Box sx={{ position: "relative" }}>
                        <CardMedia
                          component="img"
                          height="250"
                          image={
                            product.images?.[0]?.imageUrl ||
                            "/images/default-product.jpg"
                          }
                          alt={product.name}
                          onClick={() => handleProductClick(product.id)}
                        />
                        {discount > 0 && (
                          <Chip
                            label={`${discount}% OFF`}
                            color="secondary"
                            size="small"
                            sx={{
                              position: "absolute",
                              top: 8,
                              left: 8,
                            }}
                          />
                        )}
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            minWidth: "auto",
                            p: 1,
                          }}
                        >
                          <FavoriteBorder fontSize="small" />
                        </Button>
                      </Box>
                      <CardContent
                        onClick={() => handleProductClick(product.id)}
                      >
                        <Typography variant="h6" gutterBottom noWrap>
                          {product.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          {product.brand?.name}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <Typography variant="h6" color="primary.main">
                            {formatPrice(product.price)}
                          </Typography>
                          {product.discountPrice &&
                            product.discountPrice > product.price && (
                              <Typography
                                variant="body2"
                                sx={{
                                  textDecoration: "line-through",
                                  color: "text.secondary",
                                }}
                              >
                                {formatPrice(product.discountPrice)}
                              </Typography>
                            )}
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 2,
                          }}
                        >
                          <Rating
                            value={product.averageRating || 0}
                            precision={0.1}
                            size="small"
                            readOnly
                          />
                          <Typography variant="body2" color="text.secondary">
                            ({product.reviewCount || 0})
                          </Typography>
                        </Box>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<ShoppingCart />}
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product.id);
                          }}
                        >
                          Add to Cart
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })
            ) : (
              <Grid item xs={12}>
                <Box sx={{ textAlign: "center", py: 8 }}>
                  <Typography variant="h6" color="text.secondary">
                    No products found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try adjusting your filters or search criteria
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>

          {/* Pagination */}
          {products && products.totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={products.totalPages}
                page={currentPage}
                onChange={(event, page) => {
                  setCurrentPage(page);
                  loadProducts();
                }}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductsPage;
