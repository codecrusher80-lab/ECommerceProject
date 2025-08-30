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
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  ListItemText
} from '@mui/material';
import {
  PersonAdd,
  Edit,
  Delete,
  Block,
  CheckCircle,
  Cancel,
  Search,
  FilterList,
  Refresh,
  Download,
  Visibility,
  LockReset,
  Email,
  Phone,
  Group
} from '@mui/icons-material';
import userService, { UserFilters, UserCreateRequest, UserUpdateRequest } from '../../services/userService';
import { User } from '../../types';
import { format } from 'date-fns';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const availableRoles = ['Admin', 'Customer', 'Manager', 'Support'];

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [userDetailOpen, setUserDetailOpen] = useState(false);
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [filters, setFilters] = useState<UserFilters>({
    pageNumber: 1,
    pageSize: 10,
    searchTerm: '',
    sortBy: 'createdAt',
    sortDescending: true,
    isActive: undefined,
    roles: []
  });
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    newUsersThisMonth: 0,
    usersByRole: [] as { role: string; count: number }[]
  });
  const [newUser, setNewUser] = useState<UserCreateRequest>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    roles: ['Customer'],
    isActive: true
  });
  const [editingUser, setEditingUser] = useState<UserUpdateRequest>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    isActive: true,
    roles: []
  });

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [page, rowsPerPage, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers({
        ...filters,
        pageNumber: page + 1,
        pageSize: rowsPerPage
      });
      setUsers(response.items);
      setTotalCount(response.totalCount);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await userService.getUserStats();
      setStats(statsData);
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleCreateUser = async () => {
    try {
      await userService.createUser(newUser);
      await fetchUsers();
      await fetchStats();
      setCreateUserOpen(false);
      setNewUser({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        password: '',
        roles: ['Customer'],
        isActive: true
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    try {
      await userService.updateUser(selectedUser.userId, editingUser);
      await fetchUsers();
      setEditUserOpen(false);
      setSelectedUser(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      await userService.deleteUser(selectedUser.userId);
      await fetchUsers();
      await fetchStats();
      setDeleteConfirmOpen(false);
      setSelectedUser(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    try {
      await userService.toggleUserStatus(user.userId, !user.isActive);
      await fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to toggle user status');
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedUsers.length === 0) return;

    try {
      if (action === 'delete') {
        for (const userId of selectedUsers) {
          await userService.deleteUser(userId);
        }
      } else {
        await userService.bulkUpdateUsers(selectedUsers, {
          isActive: action === 'activate'
        });
      }
      await fetchUsers();
      await fetchStats();
      setSelectedUsers([]);
    } catch (err: any) {
      setError(err.message || `Failed to ${action} users`);
    }
  };

  const handleFilterChange = (field: keyof UserFilters, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const getStatusChip = (isActive: boolean) => {
    return (
      <Chip
        label={isActive ? 'Active' : 'Inactive'}
        color={isActive ? 'success' : 'error'}
        size="small"
        icon={isActive ? <CheckCircle /> : <Cancel />}
      />
    );
  };

  const getRolesChip = (roles: string[]) => {
    return roles.map(role => (
      <Chip
        key={role}
        label={role}
        size="small"
        variant="outlined"
        sx={{ mr: 0.5, mb: 0.5 }}
      />
    ));
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        User Management
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
                Total Users
              </Typography>
              <Typography variant="h4">
                {stats.totalUsers.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Users
              </Typography>
              <Typography variant="h4">
                {stats.activeUsers.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                New Today
              </Typography>
              <Typography variant="h4">
                {stats.newUsersToday.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                New This Month
              </Typography>
              <Typography variant="h4">
                {stats.newUsersThisMonth.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Actions */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          <FilterList sx={{ mr: 1, verticalAlign: 'middle' }} />
          Filters & Actions
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Search Users"
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
            <FormControl fullWidth>
              <InputLabel>Roles</InputLabel>
              <Select
                multiple
                value={filters.roles || []}
                onChange={(e) => handleFilterChange('roles', e.target.value as string[])}
                input={<OutlinedInput label="Roles" />}
                renderValue={(selected) => selected.join(', ')}
                MenuProps={MenuProps}
              >
                {availableRoles.map((role) => (
                  <MenuItem key={role} value={role}>
                    <Checkbox checked={(filters.roles || []).indexOf(role) > -1} />
                    <ListItemText primary={role} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={fetchUsers}
              startIcon={<Refresh />}
            >
              Refresh
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={1.5}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => setCreateUserOpen(true)}
              startIcon={<PersonAdd />}
            >
              Add User
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={1.5}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Download />}
              onClick={async () => {
                try {
                  const blob = await userService.exportUsers(filters);
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'users.xlsx';
                  a.click();
                } catch (err: any) {
                  setError(err.message || 'Failed to export users');
                }
              }}
            >
              Export
            </Button>
          </Grid>
        </Grid>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {selectedUsers.length} user(s) selected
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                color="success"
                onClick={() => handleBulkAction('activate')}
              >
                Activate Selected
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="warning"
                onClick={() => handleBulkAction('deactivate')}
              >
                Deactivate Selected
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={() => handleBulkAction('delete')}
              >
                Delete Selected
              </Button>
            </Stack>
          </Box>
        )}
      </Paper>

      {/* Users Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading && <LinearProgress />}
        
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={users.length > 0 && selectedUsers.length === users.length}
                    indeterminate={selectedUsers.length > 0 && selectedUsers.length < users.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(users.map(user => user.userId));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                  />
                </TableCell>
                <TableCell>User</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Roles</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.userId} hover>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedUsers.includes(user.userId)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(prev => [...prev, user.userId]);
                        } else {
                          setSelectedUsers(prev => prev.filter(id => id !== user.userId));
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        src={user.profileImage}
                        alt={`${user.firstName} ${user.lastName}`}
                        sx={{ width: 40, height: 40 }}
                      >
                        {user.firstName[0]}{user.lastName[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {user.firstName} {user.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Email sx={{ fontSize: 16 }} />
                        <Typography variant="caption">{user.email}</Typography>
                      </Box>
                      {user.phoneNumber && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Phone sx={{ fontSize: 16 }} />
                          <Typography variant="caption">{user.phoneNumber}</Typography>
                        </Box>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Box>{getRolesChip(user.roles)}</Box>
                  </TableCell>
                  <TableCell>
                    {getStatusChip(user.isActive)}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {user.lastLoginAt ? format(new Date(user.lastLoginAt), 'MMM dd, yyyy') : 'Never'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedUser(user);
                            setUserDetailOpen(true);
                          }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit User">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedUser(user);
                            setEditingUser({
                              firstName: user.firstName,
                              lastName: user.lastName,
                              phoneNumber: user.phoneNumber || '',
                              dateOfBirth: user.dateOfBirth || '',
                              gender: user.gender || '',
                              isActive: user.isActive,
                              roles: user.roles
                            });
                            setEditUserOpen(true);
                          }}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={user.isActive ? 'Deactivate' : 'Activate'}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleUserStatus(user)}
                          color={user.isActive ? 'error' : 'success'}
                        >
                          {user.isActive ? <Block /> : <CheckCircle />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete User">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedUser(user);
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

      {/* User Detail Dialog */}
      <Dialog
        open={userDetailOpen}
        onClose={() => setUserDetailOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          User Details - {selectedUser?.firstName} {selectedUser?.lastName}
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Personal Information</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Stack spacing={1}>
                      <Typography><strong>Name:</strong> {selectedUser.firstName} {selectedUser.lastName}</Typography>
                      <Typography><strong>Email:</strong> {selectedUser.email}</Typography>
                      <Typography><strong>Phone:</strong> {selectedUser.phoneNumber || 'Not provided'}</Typography>
                      <Typography><strong>Gender:</strong> {selectedUser.gender || 'Not specified'}</Typography>
                      <Typography><strong>Date of Birth:</strong> {selectedUser.dateOfBirth ? format(new Date(selectedUser.dateOfBirth), 'MMM dd, yyyy') : 'Not provided'}</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Account Information</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Stack spacing={1}>
                      <Typography><strong>User ID:</strong> {selectedUser.userId}</Typography>
                      <Typography><strong>Status:</strong> {getStatusChip(selectedUser.isActive)}</Typography>
                      <Typography><strong>Roles:</strong> {getRolesChip(selectedUser.roles)}</Typography>
                      <Typography><strong>Joined:</strong> {format(new Date(selectedUser.createdAt), 'PPP')}</Typography>
                      <Typography><strong>Last Login:</strong> {selectedUser.lastLoginAt ? format(new Date(selectedUser.lastLoginAt), 'PPP') : 'Never'}</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDetailOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog
        open={createUserOpen}
        onClose={() => setCreateUserOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="First Name"
                value={newUser.firstName}
                onChange={(e) => setNewUser(prev => ({ ...prev, firstName: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={newUser.lastName}
                onChange={(e) => setNewUser(prev => ({ ...prev, lastName: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                value={newUser.phoneNumber}
                onChange={(e) => setNewUser(prev => ({ ...prev, phoneNumber: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Roles</InputLabel>
                <Select
                  multiple
                  value={newUser.roles}
                  onChange={(e) => setNewUser(prev => ({ ...prev, roles: e.target.value as string[] }))}
                  input={<OutlinedInput label="Roles" />}
                  renderValue={(selected) => selected.join(', ')}
                >
                  {availableRoles.map((role) => (
                    <MenuItem key={role} value={role}>
                      <Checkbox checked={newUser.roles.indexOf(role) > -1} />
                      <ListItemText primary={role} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newUser.isActive}
                    onChange={(e) => setNewUser(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateUserOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateUser} variant="contained">
            Create User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        open={editUserOpen}
        onClose={() => setEditUserOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="First Name"
                value={editingUser.firstName}
                onChange={(e) => setEditingUser(prev => ({ ...prev, firstName: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={editingUser.lastName}
                onChange={(e) => setEditingUser(prev => ({ ...prev, lastName: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                value={editingUser.phoneNumber}
                onChange={(e) => setEditingUser(prev => ({ ...prev, phoneNumber: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={editingUser.dateOfBirth}
                onChange={(e) => setEditingUser(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                select
                label="Gender"
                value={editingUser.gender}
                onChange={(e) => setEditingUser(prev => ({ ...prev, gender: e.target.value }))}
              >
                <MenuItem value="">Not Specified</MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Roles</InputLabel>
                <Select
                  multiple
                  value={editingUser.roles}
                  onChange={(e) => setEditingUser(prev => ({ ...prev, roles: e.target.value as string[] }))}
                  input={<OutlinedInput label="Roles" />}
                  renderValue={(selected) => selected.join(', ')}
                >
                  {availableRoles.map((role) => (
                    <MenuItem key={role} value={role}>
                      <Checkbox checked={editingUser.roles.indexOf(role) > -1} />
                      <ListItemText primary={role} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editingUser.isActive}
                    onChange={(e) => setEditingUser(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUserOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateUser} variant="contained">
            Update User
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
            Are you sure you want to delete user {selectedUser?.firstName} {selectedUser?.lastName}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminUsersPage;
