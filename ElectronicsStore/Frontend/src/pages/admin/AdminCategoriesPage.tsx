import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  IconButton,
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Alert,
  LinearProgress,
  Stack,
  Chip,
  Avatar,
  Tooltip,
  CardActions 
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  Refresh,
  Download,
  CloudUpload,
  ExpandMore,
  ChevronRight,
  Category as CategoryIcon,
  Folder,
  FolderOpen,
} from '@mui/icons-material';
import categoryService, { CategoryFilters, CategoryCreateRequest, CategoryUpdateRequest } from '../../services/categoryService';
import { Category } from '../../types';
import { format } from 'date-fns';

const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [hierarchyCategories, setHierarchyCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CategoryFilters>({
    pageNumber: 1,
    pageSize: 10,
    searchTerm: '',
    sortBy: 'name',
    sortDescending: false,
    isActive: undefined,
    parentCategoryId: undefined,
  });
  const [stats, setStats] = useState({
    totalCategories: 0,
    activeCategories: 0,
    mainCategories: 0,
    subCategories: 0,
    categoriesWithProducts: 0,
  });

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState<CategoryCreateRequest>({
    name: '',
    description: '',
    imageUrl: '',
    isActive: true,
    parentCategoryId: null,
  });
  const [editingCategory, setEditingCategory] = useState<CategoryUpdateRequest>({
    name: '',
    description: '',
    imageUrl: '',
    isActive: true,
    parentCategoryId: null,
  });

  const [viewMode, setViewMode] = useState<'table' | 'hierarchy'>('table');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [imageUploadOpen, setImageUploadOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
  const [editCategoryOpen, setEditCategoryOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoryResponse, hierarchyResponse, statsResponse] = await Promise.all([
          categoryService.getAllCategories(filters),
          categoryService.getCategoryHierarchy(),
          categoryService.getCategoryStats(),
        ]);
        setCategories(categoryResponse.items);
        setHierarchyCategories(hierarchyResponse);
        setStats(statsResponse);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  const handleCreateCategory = async () => {
    try {
      await categoryService.createCategory(newCategory);
      setCreateCategoryOpen(false);
      setNewCategory({ name: '', description: '', imageUrl: '', isActive: true, parentCategoryId: null });
      setFilters({ ...filters, pageNumber: 1 });
    } catch (err: any) {
      setError(err.message || 'Failed to create category');
    }
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory) return;

    try {
      await categoryService.updateCategory(selectedCategory.id, editingCategory);
      setEditCategoryOpen(false);
      setSelectedCategory(null);
      setFilters({ ...filters, pageNumber: 1 });
    } catch (err: any) {
      setError(err.message || 'Failed to update category');
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;

    try {
      await categoryService.deleteCategory(selectedCategory.id);
      setDeleteConfirmOpen(false);
      setSelectedCategory(null);
      setFilters({ ...filters, pageNumber: 1 });
    } catch (err: any) {
      setError(err.message || 'Failed to delete category');
    }
  };

  const handleImageUpload = async () => {
    if (!selectedCategory || !selectedImage) return;

    try {
      await categoryService.uploadCategoryImage(selectedCategory.id, selectedImage);
      setImageUploadOpen(false);
      setSelectedImage(null);
      setSelectedCategory(null);
      setFilters({ ...filters, pageNumber: 1 });
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    }
  };

  const handleFilterChange = (field: keyof CategoryFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const getStatusChip = (isActive: boolean) => (
    <Chip label={isActive ? 'Active' : 'Inactive'} color={isActive ? 'success' : 'error'} size="small" />
  );

  // const renderTreeItem = (category: Category): React.ReactNode => (
  //   <TreeItem
  //     key={category.id}
  //     id={category.id.toString()}
  //     label={<Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
  //       <Avatar src={category.imageUrl} sx={{ width: 24, height: 24, mr: 1 }}>
  //         <CategoryIcon fontSize="small" />
  //       </Avatar>
  //       <Typography variant="body2" sx={{ mr: 2 }}>
  //         {category.name}
  //       </Typography>
  //       {getStatusChip(category.isActive)}
  //       <Box sx={{ ml: 'auto' }}>
  //         <IconButton
  //           size="small"
  //           onClick={(e) => {
  //             e.stopPropagation();
  //             setSelectedCategory(category);
  //             setEditingCategory({
  //               name: category.name,
  //               description: category.description || '',
  //               imageUrl: category.imageUrl || '',
  //               isActive: category.isActive,
  //               parentCategoryId: category.parentCategoryId || null,
  //             });
  //             setEditCategoryOpen(true);
  //           } }
  //         >
  //           <Edit fontSize="small" />
  //         </IconButton>
  //       </Box>
  //     </Box>} itemId={''}    >
  //     {category.subCategories && category.subCategories.map(renderTreeItem)}
  //   </TreeItem>
  // );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Category Management
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {Object.entries(stats).map(([key, value]) => (
          <Grid item xs={12} sm={6} md={2.4} key={key}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>{key.replace(/([A-Z])/g, ' $1')}</Typography>
                <Typography variant="h4">{value.toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filter Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Stack direction="row" spacing={2}>
            <Button variant={viewMode === 'table' ? 'contained' : 'outlined'} onClick={() => setViewMode('table')}>
              Table View
            </Button>
            <Button variant={viewMode === 'hierarchy' ? 'contained' : 'outlined'} onClick={() => setViewMode('hierarchy')}>
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

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Search Categories"
              value={filters.searchTerm || ''}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ color: 'gray', mr: 1 }} />,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControlLabel
              control={<Switch checked={filters.isActive !== undefined ? filters.isActive : true} />}
              label="Show Active"
              onChange={() => handleFilterChange('isActive', filters.isActive === true ? false : true)}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Parent Category"
              select
              value={filters.parentCategoryId || ''}
              onChange={(e) => handleFilterChange('parentCategoryId', e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {loading && <LinearProgress />}

      {/* Category Display */}
      {/* <Grid container spacing={2}>
        {viewMode === 'table' ? (
          categories.map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{category.name}</Typography>
                  <Typography variant="body2">{category.description}</Typography>
                  {getStatusChip(category.isActive)}
                </CardContent>
                <CardActions>
                  <IconButton onClick={() => setSelectedCategory(category)}>
                    <Visibility />
                  </IconButton>
                  <IconButton onClick={() => setEditingCategory(category)}>
                    <Edit />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <TreeView defaultCollapseIcon={<ExpandMore />} defaultExpandIcon={<ChevronRight />}>
            {hierarchyCategories.map(renderTreeItem)}
          </TreeView>
        )}
      </Grid> */}

      {/* Modals */}
      <Dialog open={createCategoryOpen} onClose={() => setCreateCategoryOpen(false)}>
        <DialogTitle>Create New Category</DialogTitle>
        <DialogContent>
          {/* Category form fields */}
          <TextField
            label="Category Name"
            fullWidth
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Description"
            fullWidth
            value={newCategory.description}
            onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          {/* Image Upload */}
          <Button
            variant="outlined"
            fullWidth
            onClick={() => setImageUploadOpen(true)}
            startIcon={<CloudUpload />}
            sx={{ mb: 2 }}
          >
            Upload Image
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateCategoryOpen(false)} color="primary">Cancel</Button>
          <Button onClick={handleCreateCategory} color="primary" variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editCategoryOpen} onClose={() => setEditCategoryOpen(false)}>
        <DialogTitle>Edit Category</DialogTitle>
        <DialogContent>
          {/* Category form fields */}
          <TextField
            label="Category Name"
            fullWidth
            value={editingCategory.name}
            onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Description"
            fullWidth
            value={editingCategory.description}
            onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditCategoryOpen(false)} color="primary">Cancel</Button>
          <Button onClick={handleUpdateCategory} color="primary" variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Delete Category</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this category?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="primary">Cancel</Button>
          <Button onClick={handleDeleteCategory} color="secondary" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={imageUploadOpen} onClose={() => setImageUploadOpen(false)}>
        <DialogTitle>Upload Image</DialogTitle>
        <DialogContent>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedImage(e.target.files ? e.target.files[0] : null)}
            style={{ width: '100%' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageUploadOpen(false)} color="primary">Cancel</Button>
          <Button onClick={handleImageUpload} color="primary" variant="contained">Upload</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminCategoriesPage;
