import { useMemo, useState } from 'react';
import {
    MRT_EditActionButtons,
    MaterialReactTable,
    // createRow,
    useMaterialReactTable,
} from 'material-react-table';
import {
    Box,
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Toolbar,
    Tooltip,
} from '@mui/material';
import {
    QueryClient,
    QueryClientProvider,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios'

const Example = () => {
    const [validationErrors, setValidationErrors] = useState({});

    const columns = useMemo(
        () => [
            {
                accessorKey: '_id',
                header: 'Id',
                enableEditing: false,
                size: 80,
            },
            {
                accessorKey: 'name',
                header: 'Tên',
                muiEditTextFieldProps: {
                    required: true,
                    error: !!validationErrors?.firstName,
                    helperText: validationErrors?.firstName,
                    //remove any previous validation errors when brand focuses on the input
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            firstName: undefined,
                        }),
                    //optionally add validation checking for onBlur or onChange
                },
            },
            {
                accessorKey: 'slug',
                header: 'Slug',
                enableEditing: false,
                muiEditTextFieldProps: {
                    required: true,
                    error: !!validationErrors?.lastName,
                    helperText: validationErrors?.lastName,
                    //remove any previous validation errors when brand focuses on the input
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            lastName: undefined,
                        }),
                },
            },
            {
                accessorKey: 'desc',
                header: 'Mô tả',
                muiEditTextFieldProps: {
                    required: true,
                    error: !!validationErrors?.email,
                    helperText: validationErrors?.email,
                    //remove any previous validation errors when brand focuses on the input
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            email: undefined,
                        }),
                },
                Cell: (cell) => <div style={{ overflow: "hiden", textOverflow: "ellipsis", whiteSpace: 'nowrap', width: "500px" }}>{cell.renderedCellValue}</div>,
            },
            {
                accessorKey: 'isDelete',
                header: 'Xóa mềm',
                editSelectOptions: [
                    { label: "Xóa", value: true },
                    { label: "Không xóa", value: false }
                ],
                muiEditTextFieldProps: {
                    select: true,
                },
                Cell: (cell) => {
                    const value = cell.renderedCellValue;
                    let displayValue = '';
                    if (value === true) {
                        displayValue = 'Đã xóa';
                    } else if (value === false) {
                        displayValue = 'Chưa xóa';
                    } else {
                        displayValue = 'Lỗi'
                    }
                    return <span>{displayValue}</span>;
                },
            },
            {
                accessorKey: 'createdAt',
                header: 'Ngày tạo',
                enableEditing: false,
                Cell: ({ renderedCellValue }) => {
                    return <span>{new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }).format(new Date(renderedCellValue))}</span>;
                },
            },
            {
                accessorKey: 'updatedAt',
                header: 'Ngày cập nhật',
                enableEditing: false,
                Cell: ({ renderedCellValue }) => {
                    return <span>{new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }).format(new Date(renderedCellValue))}</span>;
                },
            },
        ],
        [validationErrors],
    );

    //call CREATE hook
    const { mutateAsync: createBrand, isPending: isCreatingBrand } =
        useCreateBrand();
    //call READ hook
    const {
        data: fetchedBrands = [],
        isError: isLoadingBrandsError,
        isFetching: isFetchingBrands,
        isLoading: isLoadingBrands,
    } = useGetBrands();

    //call UPDATE hook
    const { mutateAsync: updateBrand, isPending: isUpdatingBrand } =
        useUpdateBrand();
    //call DELETE hook
    const { mutateAsync: deleteBrand, isPending: isDeletingBrand } =
        useDeleteBrand();

    //CREATE action
    const handleCreateBrand = async ({ values, table }) => {
        const newValidationErrors = values;
        // if (Object.values(newValidationErrors).some((error) => error)) {
        //     setValidationErrors(newValidationErrors);
        //     return;
        // }
        setValidationErrors({});
        await createBrand(values);
        table.setCreatingRow(null); //exit creating mode
    };

    //UPDATE action
    const handleSaveBrand = async ({ values, table }) => {
        const newValidationErrors = values
        // if (Object.values(newValidationErrors).some((error) => error)) {
        //     setValidationErrors(newValidationErrors);
        //     return;
        // }
        setValidationErrors({});
        await updateBrand(values);
        table.setEditingRow(null); //exit editing mode
    };

    //DELETE action
    const openDeleteConfirmModal = (row) => {
        if (window.confirm('Are you sure you want to delete this brand?')) {
            deleteBrand(row.original._id);
        }
    };

    const table = useMaterialReactTable({
        columns,
        data: fetchedBrands,
        createDisplayMode: 'modal', //default ('row', and 'custom' are also available)
        editDisplayMode: 'modal', //default ('row', 'cell', 'table', and 'custom' are also available)
        enableEditing: true,
        getRowId: (row) => row.id,
        muiToolbarAlertBannerProps: isLoadingBrandsError
            ? {
                color: 'error',
                children: 'Error loading data',
            }
            : undefined,
        muiTableContainerProps: {
            sx: {
                minHeight: '500px',
            },
        },
        onCreatingRowCancel: () => setValidationErrors({}),
        onCreatingRowSave: handleCreateBrand,
        onEditingRowCancel: () => setValidationErrors({}),
        onEditingRowSave: handleSaveBrand,
        //optionally customize modal content
        renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
            <>
                <DialogTitle variant="h3">Tạo thương hiệu mới</DialogTitle>
                <DialogContent
                    sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                >
                    {internalEditComponents} {/* or render custom edit components here */}
                </DialogContent>
                <DialogActions>
                    <MRT_EditActionButtons variant="text" table={table} row={row} />
                </DialogActions>
            </>
        ),
        //optionally customize modal content
        renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
            <>
                <DialogTitle variant="h6">Sửa</DialogTitle>
                <DialogContent
                    sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                >
                    {internalEditComponents} {/* or render custom edit components here */}
                </DialogContent>
                <DialogActions>
                    <MRT_EditActionButtons variant="text" table={table} row={row} />
                </DialogActions>
            </>
        ),
        renderRowActions: ({ row, table }) => (
            <Box sx={{ display: 'flex', gap: '1rem' }}>
                <Tooltip title="Edit">
                    <IconButton onClick={() => table.setEditingRow(row)}>
                        <EditIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                    <IconButton color="error" onClick={() => openDeleteConfirmModal(row)}>
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
            </Box>
        ),
        renderTopToolbarCustomActions: ({ table }) => (
            <Button
                variant="contained"
                onClick={() => {
                    table.setCreatingRow(true); //simplest way to open the create row modal with no default values
                    //or you can pass in a row object to set default values with the `createRow` helper function
                    // table.setCreatingRow(
                    //   createRow(table, {
                    //     //optionally pass in default values for the new row, useful for nested data or other complex scenarios
                    //   }),
                    // );
                }}
            >
                Tạo thương hiệu mới
            </Button>
        ),
        state: {
            isLoading: isLoadingBrands,
            isSaving: isCreatingBrand || isUpdatingBrand || isDeletingBrand,
            showAlertBanner: isLoadingBrandsError,
            showProgressBars: isFetchingBrands,
        },
    });

    return <MaterialReactTable table={table} />;
};

//CREATE hook (post new brand to api)
function useCreateBrand() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data) => {
            delete data._id;
            delete data.slug;
            delete data.createdAt
            delete data.updatedAt
            const response = await axios.post(`http://localhost:3030/brand/`, data)
            return (response.data);
        },

        onSuccess: () => {
            queryClient.invalidateQueries(['brands']);
        },
        // onSettled: () => queryClient.invalidateQueries({ queryKey: ['brands'] }), //refetch brands after mutation, disabled for demo
    });
}

//READ hook (get brands from api)
function useGetBrands() {
    return useQuery({
        queryKey: ['brands'],
        queryFn: async () => {
            const response = await axios.get(`http://localhost:3030/brand/by-admin`)
            return (response.data);
        },
        refetchOnWindowFocus: false,
    });
}

//UPDATE hook (put brand in api)
function useUpdateBrand() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data) => {
            delete data.createdAt
            delete data.updatedAt
            const response = await axios.patch(`http://localhost:3030/brand/`, data)
        },

        onSuccess: () => {
            queryClient.invalidateQueries(['brands']);
        },
        // onSettled: () => queryClient.invalidateQueries({ queryKey: ['brands'] }), //refetch brands after mutation, disabled for demo
    });
}

//DELETE hook (delete brand in api)
function useDeleteBrand() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (brandId) => {
            const response = await axios.delete(`http://localhost:3030/brand/${brandId}`)
            console.log(response)
        },

        onSuccess: () => {
            queryClient.invalidateQueries(['brands']);
        },
        // onSettled: () => queryClient.invalidateQueries({ queryKey: ['brands'] }), //refetch brands after mutation, disabled for demo
    });
}

const queryClient = new QueryClient();

const Brand = () => (
    //Put this with your other react-query providers near root of your app
    <QueryClientProvider client={queryClient}>
        <Example />
    </QueryClientProvider>
);

export default Brand;

const validateRequired = (value) => !!value.length;
const validateEmail = (email) =>
    !!email.length &&
    email
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        );

function validateBrand(brand) {
    return {
        firstName: !validateRequired(brand.firstName)
            ? 'First Name is Required'
            : '',
        lastName: !validateRequired(brand.lastName) ? 'Last Name is Required' : '',
        email: !validateEmail(brand.email) ? 'Incorrect Email Format' : '',
    };
}
