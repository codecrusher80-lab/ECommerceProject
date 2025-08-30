import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Button,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Alert,
  LinearProgress,
  Divider,
  Stack,
  Avatar,
  FormControlLabel,
  Switch,
  TreeView,
  TreeItem,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  FilterList,
  Refresh,
  Download,
  Image as ImageIcon,
  CloudUpload,
  ExpandMore,
  ChevronRight,
  Category as CategoryIcon,
  Folder,
  FolderOpen
} from '@mui/icons-material';
import categoryService, { CategoryFilters, CategoryCreateRequest, CategoryUpdateRequest } from '../../services/categoryService';
import { Category } from '../../types';
import { format } from 'date-fns';

const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [hierarchyCategories, setHierarchyCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryDetailOpen, setCategoryDetailOpen] = useState(false);
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
  const [editCategoryOpen, setEditCategoryOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [imageUploadOpen, setImageUploadOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'hierarchy'>('table');
  const [filters, setFilters] = useState<CategoryFilters>({
    pageNumber: 1,
    pageSize: 10,
    searchTerm: '',
    sortBy: 'name',
    sortDescending: false,
    isActive: undefined,
    parentCategoryId: undefined
  });
  const [stats, setStats] = useState({
    totalCategories: 0,
    activeCategories: 0,
    mainCategories: 0,
    subCategories: 0,
    categoriesWithProducts: 0
  });
  const [newCategory, setNewCategory] = useState<CategoryCreateRequest>({
    name: '',
    description: '',
    imageUrl: '',
    isActive: true,
    parentCategoryId: null
  });
  const [editingCategory, setEditingCategory] = useState<CategoryUpdateRequest>({
    name: '',
    description: '',
    imageUrl: '',
    isActive: true,
    parentCategoryId: null
  });

  useEffect(() => {
    fetchCategories();
    fetchHierarchy();
    fetchStats();
  }, [page, rowsPerPage, filters]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getAllCategories({
        ...filters,
        pageNumber: page + 1,
        pageSize: rowsPerPage
      });
      setCategories(response.items);
      setTotalCount(response.totalCount);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchHierarchy = async () => {
    try {
      const hierarchy = await categoryService.getCategoryHierarchy();
      setHierarchyCategories(hierarchy);
    } catch (err: any) {
      console.error('Failed to fetch category hierarchy:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await categoryService.getCategoryStats();
      setStats(statsData);
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleCreateCategory = async () => {
    try {
      await categoryService.createCategory(newCategory);
      await fetchCategories();
      await fetchHierarchy();
      await fetchStats();
      setCreateCategoryOpen(false);
      setNewCategory({
        name: '',
        description: '',
        imageUrl: '',
        isActive: true,
        parentCategoryId: null
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create category');
    }
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory) return;
    
    try {
      await categoryService.updateCategory(selectedCategory.id, editingCategory);
      await fetchCategories();
      await fetchHierarchy();
      setEditCategoryOpen(false);
      setSelectedCategory(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update category');
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    
    try {
      await categoryService.deleteCategory(selectedCategory.id);
      await fetchCategories();
      await fetchHierarchy();
      await fetchStats();
      setDeleteConfirmOpen(false);
      setSelectedCategory(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete category');
    }
  };

  const handleToggleCategoryStatus = async (category: Category) => {
    try {
      await categoryService.toggleCategoryStatus(category.id, !category.isActive);
      await fetchCategories();
      await fetchHierarchy();
    } catch (err: any) {
      setError(err.message || 'Failed to toggle category status');
    }
  };

  const handleImageUpload = async () => {
    if (!selectedCategory || !selectedImage) return;

    try {
      const result = await categoryService.uploadCategoryImage(selectedCategory.id, selectedImage);
      await fetchCategories();
      await fetchHierarchy();
      setImageUploadOpen(false);
      setSelectedImage(null);
      setSelectedCategory(null);
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    }
  };

  const handleFilterChange = (field: keyof CategoryFilters, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const getStatusChip = (isActive: boolean) => {
    return (
      <Chip
        label={isActive ? 'Active' : 'Inactive'}
        color={isActive ? 'success' : 'error'}
        size="small"
      />
    );
  };

  const renderTreeItem = (category: Category): React.ReactNode => {
    return (
      <TreeItem
        key={category.id}
        nodeId={category.id.toString()}
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
            <Avatar src={category.imageUrl} sx={{ width: 24, height: 24, mr: 1 }}>
              <CategoryIcon fontSize="small" />
            </Avatar>
            <Typography variant="body2" sx={{ mr: 2 }}>
              {category.name}
            </Typography>
            {getStatusChip(category.isActive)}
            <Box sx={{ ml: 'auto' }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCategory(category);
                  setEditingCategory({
                    name: category.name,
                    description: category.description || '',
                    imageUrl: category.imageUrl || '',
                    isActive: category.isActive,
                    parentCategoryId: category.parentCategoryId || null
                  });
                  setEditCategoryOpen(true);
                }}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        }
      >
        {category.subCategories && category.subCategories.map(subCategory => 
          renderTreeItem(subCategory)
        )}
      </TreeItem>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Category Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Categories
              </Typography>
              <Typography variant="h4">
                {stats.totalCategories.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Categories
              </Typography>
              <Typography variant="h4">
                {stats.activeCategories.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Main Categories
              </Typography>
              <Typography variant="h4">
                {stats.mainCategories.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Sub Categories
              </Typography>
              <Typography variant="h4">
                {stats.subCategories.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                With Products
              </Typography>
              <Typography variant="h4">
                {stats.categoriesWithProducts.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* View Mode Tabs and Actions */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Stack direction="row" spacing={2}>
            <Button
              variant={viewMode === 'table' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('table')}
            >
              Table View
            </Button>
            <Button
              variant={viewMode === 'hierarchy' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('hierarchy')}
            >
              Hierarchy View
            </Button>
          </Stack>
          
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateCategoryOpen(true)}
            >
              Add Category
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={async () => {
                try {
                  const blob = await categoryService.exportCategories();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'categories.xlsx';
                  a.click();
                } catch (err: any) {
                  setError(err.message || 'Failed to export categories');
                }
              }}
            >
              Export
            </Button>
          </Stack>
        </Box>

        {viewMode === 'table' && (
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Search Categories"
                value={filters.searchTerm || ''}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1 }} />
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                select
                label="Status"
                value={filters.isActive === undefined ? '' : filters.isActive}
                onChange={(e) => handleFilterChange('isActive', e.target.value === '' ? undefined : e.target.value === 'true')}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                select
                label="Type"
                value={filters.parentCategoryId === undefined ? '' : (filters.parentCategoryId === null ? 'main' : 'sub')}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') handleFilterChange('parentCategoryId', undefined);
                  else if (value === 'main') handleFilterChange('parentCategoryId', null);
                  else handleFilterChange('parentCategoryId', -1); // Will be handled in backend
                }}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="main">Main Categories</MenuItem>
                <MenuItem value="sub">Sub Categories</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={fetchCategories}
                startIcon={<Refresh />}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        )}
      </Paper>

      {/* Content */}
      {viewMode === 'table' ? (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          {loading && <LinearProgress />}
          
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Category</TableCell>
                  <TableCell>Parent Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Products</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={category.imageUrl} sx={{ width: 40, height: 40 }}>
                          <CategoryIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {category.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {category.description}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {category.parentCategoryName || 'Main Category'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {getStatusChip(category.isActive)}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {category.subCategories?.length || 0} subcategories
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(), 'MMM dd, yyyy')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedCategory(category);
                              setCategoryDetailOpen(true);
                            }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Category">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedCategory(category);
                              setEditingCategory({
                                name: category.name,
                                description: category.description || '',
                                imageUrl: category.imageUrl || '',
                                isActive: category.isActive,
                                parentCategoryId: category.parentCategoryId || null
                              });
                              setEditCategoryOpen(true);
                            }}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Upload Image">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedCategory(category);
                              setImageUploadOpen(true);
                            }}
                          >
                            <ImageIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Category">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedCategory(category);
                              setDeleteConfirmOpen(true);
                            }}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Paper>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Category Hierarchy
          </Typography>
          <TreeView
            defaultCollapseIcon={<ExpandMore />}
            defaultExpandIcon={<ChevronRight />}
            sx={{ height: 500, flexGrow: 1, maxWidth: '100%', overflowY: 'auto' }}
          >
            {hierarchyCategories.map(category => renderTreeItem(category))}
          </TreeView>
        </Paper>
      )}

      {/* Create Category Dialog */}
      <Dialog
        open={createCategoryOpen}
        onClose={() => setCreateCategoryOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Category</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Category Name"
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={newCategory.description}
                onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Image URL"
                value={newCategory.imageUrl}
                onChange={(e) => setNewCategory(prev => ({ ...prev, imageUrl: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Parent Category"
                value={newCategory.parentCategoryId || ''}
                onChange={(e) => setNewCategory(prev => ({ ...prev, parentCategoryId: e.target.value ? Number(e.target.value) : null }))}
              >
                <MenuItem value="">Main Category (No Parent)</MenuItem>
                {categories.filter(cat => !cat.parentCategoryId).map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newCategory.isActive}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateCategoryOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateCategory} variant="contained">
            Create Category
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog
        open={editCategoryOpen}
        onClose={() => setEditCategoryOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Category</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Category Name"
                value={editingCategory.name}
                onChange={(e) => setEditingCategory(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={editingCategory.description}
                onChange={(e) => setEditingCategory(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Image URL"
                value={editingCategory.imageUrl}
                onChange={(e) => setEditingCategory(prev => ({ ...prev, imageUrl: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Parent Category"
                value={editingCategory.parentCategoryId || ''}
                onChange={(e) => setEditingCategory(prev => ({ ...prev, parentCategoryId: e.target.value ? Number(e.target.value) : null }))}
              >
                <MenuItem value="">Main Category (No Parent)</MenuItem>
                {categories.filter(cat => !cat.parentCategoryId && cat.id !== selectedCategory?.id).map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editingCategory.isActive}
                    onChange={(e) => setEditingCategory(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditCategoryOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateCategory} variant="contained">
            Update Category
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete category "{selectedCategory?.name}"? This action cannot be undone and will also delete all subcategories.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteCategory} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Upload Dialog */}
      <Dialog
        open={imageUploadOpen}
        onClose={() => setImageUploadOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload Category Image</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setSelectedImage(file);
              }}
              style={{ display: 'none' }}
              id="image-upload"
            />
            <label htmlFor="image-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUpload />}
                fullWidth
                sx={{ mb: 2 }}
              >
                Choose Image File
              </Button>
            </label>
            {selectedImage && (
              <Typography variant="body2">
                Selected: {selectedImage.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageUploadOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleImageUpload} 
            variant="contained"
            disabled={!selectedImage}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminCategoriesPage;
