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
  Stack,
  Avatar,
  FormControlLabel,
  Switch,
  Link as MuiLink
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  Refresh,
  Download,
  Image as ImageIcon,
  CloudUpload,
  Language,
  Business,
  TrendingUp
} from '@mui/icons-material';
import brandService, { BrandFilters, BrandCreateRequest, BrandUpdateRequest } from '../../services/brandService';
import { Brand } from '../../types';
import { format } from 'date-fns';

const AdminBrandsPage: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [brandDetailOpen, setBrandDetailOpen] = useState(false);
  const [createBrandOpen, setCreateBrandOpen] = useState(false);
  const [editBrandOpen, setEditBrandOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [logoUploadOpen, setLogoUploadOpen] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [filters, setFilters] = useState<BrandFilters>({
    pageNumber: 1,
    pageSize: 10,
    searchTerm: '',
    sortBy: 'name',
    sortDescending: false,
    isActive: undefined
  });
  const [stats, setStats] = useState({
    totalBrands: 0,
    activeBrands: 0,
    brandsWithProducts: 0,
    topSellingBrands: [] as { brand: Brand; totalSales: number }[]
  });
  const [newBrand, setNewBrand] = useState<BrandCreateRequest>({
    name: '',
    description: '',
    logoUrl: '',
    website: '',
    isActive: true
  });
  const [editingBrand, setEditingBrand] = useState<BrandUpdateRequest>({
    name: '',
    description: '',
    logoUrl: '',
    website: '',
    isActive: true
  });

  useEffect(() => {
    fetchBrands();
    fetchStats();
  }, [page, rowsPerPage, filters]);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await brandService.getAllBrands({
        ...filters,
        pageNumber: page + 1,
        pageSize: rowsPerPage
      });
      setBrands(response.items);
      setTotalCount(response.totalCount);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch brands');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await brandService.getBrandStats();
      setStats(statsData);
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleCreateBrand = async () => {
    try {
      await brandService.createBrand(newBrand);
      await fetchBrands();
      await fetchStats();
      setCreateBrandOpen(false);
      setNewBrand({
        name: '',
        description: '',
        logoUrl: '',
        website: '',
        isActive: true
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create brand');
    }
  };

  const handleUpdateBrand = async () => {
    if (!selectedBrand) return;
    
    try {
      await brandService.updateBrand(selectedBrand.id, editingBrand);
      await fetchBrands();
      setEditBrandOpen(false);
      setSelectedBrand(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update brand');
    }
  };

  const handleDeleteBrand = async () => {
    if (!selectedBrand) return;
    
    try {
      await brandService.deleteBrand(selectedBrand.id);
      await fetchBrands();
      await fetchStats();
      setDeleteConfirmOpen(false);
      setSelectedBrand(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete brand');
    }
  };

  const handleToggleBrandStatus = async (brand: Brand) => {
    try {
      await brandService.toggleBrandStatus(brand.id, !brand.isActive);
      await fetchBrands();
    } catch (err: any) {
      setError(err.message || 'Failed to toggle brand status');
    }
  };

  const handleLogoUpload = async () => {
    if (!selectedBrand || !selectedLogo) return;

    try {
      await brandService.uploadBrandLogo(selectedBrand.id, selectedLogo);
      await fetchBrands();
      setLogoUploadOpen(false);
      setSelectedLogo(null);
      setSelectedBrand(null);
    } catch (err: any) {
      setError(err.message || 'Failed to upload logo');
    }
  };

  const handleFilterChange = (field: keyof BrandFilters, value: any) => {
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

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Brand Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Brands
              </Typography>
              <Typography variant="h4">
                {stats.totalBrands.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Brands
              </Typography>
              <Typography variant="h4">
                {stats.activeBrands.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                With Products
              </Typography>
              <Typography variant="h4">
                {stats.brandsWithProducts.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Top Performers
              </Typography>
              <Typography variant="h4">
                {stats.topSellingBrands.length.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Actions */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filters & Actions
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Search Brands"
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
              SelectProps={{ native: true }}
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={fetchBrands}
              startIcon={<Refresh />}
            >
              Refresh
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => setCreateBrandOpen(true)}
              startIcon={<Add />}
            >
              Add Brand
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Download />}
              onClick={async () => {
                try {
                  const blob = await brandService.exportBrands();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'brands.xlsx';
                  a.click();
                } catch (err: any) {
                  setError(err.message || 'Failed to export brands');
                }
              }}
            >
              Export
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Brands Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading && <LinearProgress />}
        
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Brand</TableCell>
                <TableCell>Website</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Products</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {brands.map((brand) => (
                <TableRow key={brand.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar src={brand.logoUrl} sx={{ width: 40, height: 40 }}>
                        <Business />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {brand.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {brand.description}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {brand.website ? (
                      <MuiLink 
                        href={brand.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Language fontSize="small" />
                        Visit Website
                      </MuiLink>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No website
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {getStatusChip(brand.isActive)}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      View Products
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
                            setSelectedBrand(brand);
                            setBrandDetailOpen(true);
                          }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Brand">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedBrand(brand);
                            setEditingBrand({
                              name: brand.name,
                              description: brand.description || '',
                              logoUrl: brand.logoUrl || '',
                              website: brand.website || '',
                              isActive: brand.isActive
                            });
                            setEditBrandOpen(true);
                          }}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Upload Logo">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedBrand(brand);
                            setLogoUploadOpen(true);
                          }}
                        >
                          <ImageIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Brand">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedBrand(brand);
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

      {/* Brand Detail Dialog */}
      <Dialog
        open={brandDetailOpen}
        onClose={() => setBrandDetailOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Brand Details - {selectedBrand?.name}
        </DialogTitle>
        <DialogContent>
          {selectedBrand && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Avatar
                      src={selectedBrand.logoUrl}
                      sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}
                    >
                      <Business fontSize="large" />
                    </Avatar>
                    <Typography variant="h6" gutterBottom>
                      {selectedBrand.name}
                    </Typography>
                    {getStatusChip(selectedBrand.isActive)}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Brand Information</Typography>
                    <Stack spacing={2}>
                      <Typography><strong>Name:</strong> {selectedBrand.name}</Typography>
                      <Typography><strong>Description:</strong> {selectedBrand.description || 'No description'}</Typography>
                      {selectedBrand.website && (
                        <Typography>
                          <strong>Website:</strong>
                          <MuiLink href={selectedBrand.website} target="_blank" sx={{ ml: 1 }}>
                            {selectedBrand.website}
                          </MuiLink>
                        </Typography>
                      )}
                      <Typography><strong>Status:</strong> {selectedBrand.isActive ? 'Active' : 'Inactive'}</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBrandDetailOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Create Brand Dialog */}
      <Dialog
        open={createBrandOpen}
        onClose={() => setCreateBrandOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Brand</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Brand Name"
                value={newBrand.name}
                onChange={(e) => setNewBrand(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={newBrand.description}
                onChange={(e) => setNewBrand(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Logo URL"
                value={newBrand.logoUrl}
                onChange={(e) => setNewBrand(prev => ({ ...prev, logoUrl: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Website"
                value={newBrand.website}
                onChange={(e) => setNewBrand(prev => ({ ...prev, website: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newBrand.isActive}
                    onChange={(e) => setNewBrand(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateBrandOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateBrand} variant="contained">
            Create Brand
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Brand Dialog */}
      <Dialog
        open={editBrandOpen}
        onClose={() => setEditBrandOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Brand</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Brand Name"
                value={editingBrand.name}
                onChange={(e) => setEditingBrand(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={editingBrand.description}
                onChange={(e) => setEditingBrand(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Logo URL"
                value={editingBrand.logoUrl}
                onChange={(e) => setEditingBrand(prev => ({ ...prev, logoUrl: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Website"
                value={editingBrand.website}
                onChange={(e) => setEditingBrand(prev => ({ ...prev, website: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editingBrand.isActive}
                    onChange={(e) => setEditingBrand(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditBrandOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateBrand} variant="contained">
            Update Brand
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
            Are you sure you want to delete brand "{selectedBrand?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteBrand} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Logo Upload Dialog */}
      <Dialog
        open={logoUploadOpen}
        onClose={() => setLogoUploadOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload Brand Logo</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setSelectedLogo(file);
              }}
              style={{ display: 'none' }}
              id="logo-upload"
            />
            <label htmlFor="logo-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUpload />}
                fullWidth
                sx={{ mb: 2 }}
              >
                Choose Logo File
              </Button>
            </label>
            {selectedLogo && (
              <Typography variant="body2">
                Selected: {selectedLogo.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoUploadOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleLogoUpload} 
            variant="contained"
            disabled={!selectedLogo}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminBrandsPage;
