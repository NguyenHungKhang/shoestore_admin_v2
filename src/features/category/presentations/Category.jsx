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
                    //remove any previous validation errors when category focuses on the input
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
                    //remove any previous validation errors when category focuses on the input
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            lastName: undefined,
                        }),
                },
            },
            {
                accessorKey: 'numOrder',
                header: 'Số thứ tự',
                muiEditTextFieldProps: {
                    required: true,
                    type: 'number',
                    inputProps: { min: 0 },
                },
            },
            {
                accessorKey: 'isDelete',
                header: 'Xóa mềm',
                editVariant: 'select',
                editSelectOptions: [
                    { label: "Xóa", value: true },
                    { label: "Không xóa", value: false }
                ],
                muiEditTextFieldProps: {
                    select: true,
                    defaultValue: true,
                    error: !!validationErrors?.state,
                    helperText: validationErrors?.state,
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
                Cell: ({renderedCellValue}) => {
                    return <span>{new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }).format(new Date(renderedCellValue))}</span>;
                },
            },
            {
                accessorKey: 'updatedAt',
                header: 'Ngày cập nhật',
                enableEditing: false,
                Cell: ({renderedCellValue}) => {
                    return <span>{new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }).format(new Date(renderedCellValue))}</span>;
                },
            },
        ],
        [validationErrors],
    );

    //call CREATE hook
    const { mutateAsync: createCategory, isPending: isCreatingCategory } =
        useCreateCategory();
    //call READ hook
    const {
        data: fetchedCategorys = [],
        isError: isLoadingCategorysError,
        isFetching: isFetchingCategorys,
        isLoading: isLoadingCategorys,
    } = useGetCategorys();

    //call UPDATE hook
    const { mutateAsync: updateCategory, isPending: isUpdatingCategory } =
        useUpdateCategory();
    //call DELETE hook
    const { mutateAsync: deleteCategory, isPending: isDeletingCategory } =
        useDeleteCategory();

    //CREATE action
    const handleCreateCategory = async ({ values, table }) => {
        const newValidationErrors = values;
        // if (Object.values(newValidationErrors).some((error) => error)) {
        //     setValidationErrors(newValidationErrors);
        //     return;
        // }
        setValidationErrors({});
        await createCategory(values);
        table.setCreatingRow(null); //exit creating mode
    };

    //UPDATE action
    const handleSaveCategory = async ({ values, table }) => {
        const newValidationErrors = values
        // if (Object.values(newValidationErrors).some((error) => error)) {
        //     setValidationErrors(newValidationErrors);
        //     return;
        // }
        setValidationErrors({});
        await updateCategory(values);
        table.setEditingRow(null); //exit editing mode
    };

    //DELETE action
    const openDeleteConfirmModal = (row) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            deleteCategory(row.original._id);
        }
    };

    const table = useMaterialReactTable({
        columns,
        data: fetchedCategorys,
        createDisplayMode: 'modal', //default ('row', and 'custom' are also available)
        editDisplayMode: 'modal', //default ('row', 'cell', 'table', and 'custom' are also available)
        enableEditing: true,
        getRowId: (row) => row.id,
        muiToolbarAlertBannerProps: isLoadingCategorysError
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
        onCreatingRowSave: handleCreateCategory,
        onEditingRowCancel: () => setValidationErrors({}),
        onEditingRowSave: handleSaveCategory,
        //optionally customize modal content
        renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
            <>
                <DialogTitle variant="h3">Tạo danh mục mới</DialogTitle>
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
                Tạo danh mục mới
            </Button>
        ),
        state: {
            isLoading: isLoadingCategorys,
            isSaving: isCreatingCategory || isUpdatingCategory || isDeletingCategory,
            showAlertBanner: isLoadingCategorysError,
            showProgressBars: isFetchingCategorys,
        },
    });

    return <MaterialReactTable table={table} />;
};

//CREATE hook (post new category to api)
function useCreateCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data) => {
            delete data._id;
            delete data.slug;
            delete data.createdAt
            delete data.updatedAt
            if(data.numOrder === null || data.numOrder.trim() === "")
                delete data.numOrder;
            const response = await axios.post(`http://localhost:3030/category/`, data)
            return (response.data);
        },
        //client side optimistic update
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']);
        },
        // onSettled: () => queryClient.invalidateQueries({ queryKey: ['categories'] }), //refetch categories after mutation, disabled for demo
    });
}

//READ hook (get categories from api)
function useGetCategorys() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await axios.get(`http://localhost:3030/category/by-admin`)
            return (response.data);
        },
        refetchOnWindowFocus: false,
    });
}

//UPDATE hook (put category in api)
function useUpdateCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data) => {
            const id = data._id;
            delete data._id;
            delete data.createdAt
            delete data.updatedAt
            const response = await axios.patch(`http://localhost:3030/category/${id}`, data)
        },
        //client side optimistic update
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']);
        },
        // onSettled: () => queryClient.invalidateQueries({ queryKey: ['categories'] }), //refetch categories after mutation, disabled for demo
    });
}

//DELETE hook (delete category in api)
function useDeleteCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (categoryId) => {
            const response = await axios.delete(`http://localhost:3030/category/${categoryId}`)
        },
        //client side optimistic update
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']);
        },
        // onSettled: () => queryClient.invalidateQueries({ queryKey: ['categories'] }), //refetch categories after mutation, disabled for demo
    });
}

const queryClient = new QueryClient();

const Category = () => (
    //Put this with your other react-query providers near root of your app
    <QueryClientProvider client={queryClient}>
        <Example />
    </QueryClientProvider>
);

export default Category;

const validateRequired = (value) => !!value.length;
const validateEmail = (email) =>
    !!email.length &&
    email
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        );

function validateCategory(category) {
    return {
        firstName: !validateRequired(category.firstName)
            ? 'First Name is Required'
            : '',
        lastName: !validateRequired(category.lastName) ? 'Last Name is Required' : '',
        email: !validateEmail(category.email) ? 'Incorrect Email Format' : '',
    };
}
