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
                    //remove any previous validation errors when cart focuses on the input
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
                    //remove any previous validation errors when cart focuses on the input
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
                    //remove any previous validation errors when cart focuses on the input
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            email: undefined,
                        }),
                },
                Cell: (cell) => <div style={{ overflow: "hiden", textOverflow: "ellipsis", whiteSpace: 'nowrap', width: "500px" }}>{cell.renderedCellValue}</div>,
            },
            // {
            //     accessorKey: 'isDeleted',
            //     header: 'Đã xóa mềm',
            //     enableEditing: false,
            //     // editSelectOptions: usStates,
            //     muiEditTextFieldProps: {
            //         select: true,
            //         error: !!validationErrors?.state,
            //         helperText: validationErrors?.state,
            //     },
            //     Cell: (cell) => {
            //         const value = cell.renderedCellValue;
            //         let displayValue = '';
            //         if (value === 'true') {
            //             displayValue = 'Đã xóa';
            //         } else if (value === 'false') {
            //             displayValue = 'Chưa xóa';
            //         } else {
            //             displayValue = 'Lỗi'
            //         }
            //         return <span>{displayValue}</span>;
            //     },
            // },
        ],
        [validationErrors],
    );

    //call CREATE hook
    const { mutateAsync: createCart, isPending: isCreatingCart } =
        useCreateCart();
    //call READ hook
    const {
        data: fetchedCarts = [],
        isError: isLoadingCartsError,
        isFetching: isFetchingCarts,
        isLoading: isLoadingCarts,
    } = useGetCarts();

    //call UPDATE hook
    const { mutateAsync: updateCart, isPending: isUpdatingCart } =
        useUpdateCart();
    //call DELETE hook
    const { mutateAsync: deleteCart, isPending: isDeletingCart } =
        useDeleteCart();

    //CREATE action
    const handleCreateCart = async ({ values, table }) => {
        const newValidationErrors = values;
        // if (Object.values(newValidationErrors).some((error) => error)) {
        //     setValidationErrors(newValidationErrors);
        //     return;
        // }
        setValidationErrors({});
        await createCart(values);
        table.setCreatingRow(null); //exit creating mode
    };

    //UPDATE action
    const handleSaveCart = async ({ values, table }) => {
        const newValidationErrors = values
        // if (Object.values(newValidationErrors).some((error) => error)) {
        //     setValidationErrors(newValidationErrors);
        //     return;
        // }
        setValidationErrors({});
        await updateCart(values);
        table.setEditingRow(null); //exit editing mode
    };

    //DELETE action
    const openDeleteConfirmModal = (row) => {
        if (window.confirm('Are you sure you want to delete this cart?')) {
            deleteCart(row.original._id);
        }
    };

    const table = useMaterialReactTable({
        columns,
        data: fetchedCarts,
        createDisplayMode: 'modal', //default ('row', and 'custom' are also available)
        editDisplayMode: 'modal', //default ('row', 'cell', 'table', and 'custom' are also available)
        enableEditing: true,
        getRowId: (row) => row.id,
        muiToolbarAlertBannerProps: isLoadingCartsError
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
        onCreatingRowSave: handleCreateCart,
        onEditingRowCancel: () => setValidationErrors({}),
        onEditingRowSave: handleSaveCart,
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
            isLoading: isLoadingCarts,
            isSaving: isCreatingCart || isUpdatingCart || isDeletingCart,
            showAlertBanner: isLoadingCartsError,
            showProgressBars: isFetchingCarts,
        },
    });

    return <MaterialReactTable table={table} />;
};

//CREATE hook (post new cart to api)
function useCreateCart() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data) => {
            delete data._id;
            delete data.slug;
            const response = await axios.post(`http://localhost:3030/cart/`, data)
            return (response.data);
        },
        //client side optimistic update
        onMutate: (newCartInfo) => {
            queryClient.setQueryData(['carts'], (prevCarts) => [
                ...prevCarts,
                {
                    ...newCartInfo,
                    id: (Math.random() + 1).toString(36).substring(7),
                },
            ]);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['carts']);
        },
        // onSettled: () => queryClient.invalidateQueries({ queryKey: ['carts'] }), //refetch carts after mutation, disabled for demo
    });
}

//READ hook (get carts from api)
function useGetCarts() {
    return useQuery({
        queryKey: ['carts'],
        queryFn: async () => {
            const response = await axios.get(`http://localhost:3030/cart/`)
            console.log(response)
            return (response.data?.data);
        },
        refetchOnWindowFocus: false,
    });
}

//UPDATE hook (put cart in api)
function useUpdateCart() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data) => {
            const response = await axios.patch(`http://localhost:3030/cart/`, data)
        },
        //client side optimistic update
        onMutate: (newCartInfo) => {
            queryClient.setQueryData(['carts'], (prevCarts) =>
                prevCarts?.map((prevCart) =>
                    prevCart.id === newCartInfo.id ? newCartInfo : prevCart,
                ),
            );
        },
        // onSettled: () => queryClient.invalidateQueries({ queryKey: ['carts'] }), //refetch carts after mutation, disabled for demo
    });
}

//DELETE hook (delete cart in api)
function useDeleteCart() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (cartId) => {
            const response = await axios.delete(`http://localhost:3030/cart/${cartId}`)
            console.log(response)
        },
        //client side optimistic update
        onMutate: (cartId) => {
            queryClient.setQueryData(['carts'], (prevCarts) =>
                prevCarts?.filter((cart) => cart.id !== cartId),
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['carts']);
        },
        // onSettled: () => queryClient.invalidateQueries({ queryKey: ['carts'] }), //refetch carts after mutation, disabled for demo
    });
}

const queryClient = new QueryClient();

const Cart = () => (
    //Put this with your other react-query providers near root of your app
    <Box
        component="main"
        sx={{ ml: { sm: "240px" }, flexGrow: 1, p: 3, width: { sm: `calc(100% - ${240}px)` } }}
    >
        <QueryClientProvider client={queryClient}>
            <Example />
        </QueryClientProvider>
    </Box>

);

export default Cart;

const validateRequired = (value) => !!value.length;
const validateEmail = (email) =>
    !!email.length &&
    email
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        );

function validateCart(cart) {
    return {
        firstName: !validateRequired(cart.firstName)
            ? 'First Name is Required'
            : '',
        lastName: !validateRequired(cart.lastName) ? 'Last Name is Required' : '',
        email: !validateEmail(cart.email) ? 'Incorrect Email Format' : '',
    };
}
