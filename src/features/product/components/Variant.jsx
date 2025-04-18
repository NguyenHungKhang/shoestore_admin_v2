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
    TextField,
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
import { useParams } from 'react-router-dom';

const Example = ({ productId }) => {
    const [validationErrors, setValidationErrors] = useState({});
    const [image, setImage] = useState();

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        displayImage(file);
    };

    const displayImage = (file) => {
        const reader = new FileReader();
        reader.onload = () => {
            setImage(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const columns = useMemo(
        () => [
            {
                accessorKey: 'sku',
                header: 'Sku',
                enableEditing: false,
                size: 80,
            },
            {
                accessorKey: 'marketPrice',
                header: 'Giá thị trường',
                muiEditTextFieldProps: {
                    required: true,
                    type: 'number',
                    error: !!validationErrors?.lastName,
                    helperText: validationErrors?.lastName,
                    //remove any previous validation errors when variant focuses on the input
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            lastName: undefined,
                        }),
                },
            },
            {
                accessorKey: 'thumbnail',
                header: 'thumbnails',
                muiEditTextFieldProps: ({ cell }) => ({
                    required: true,
                }),
                Edit: ({ cell, column, row, table }) =>
                    <>
                        <TextField type='file' onChange={(event) => { handleFileChange(event); row._valuesCache[column.id] = event.target.files[0] }} inputProps={{ multiple: false, accept: "image/*", }} />
                        <img src={image ? image : row.original.thumbnail} height={50} />
                    </>
                ,
                Cell: ({ renderedCellValue }) => {
                    return <img src={renderedCellValue} height={50} />
                },
            },
            {
                accessorKey: 'price',
                header: 'Giá bán',
                muiEditTextFieldProps: {
                    required: true,
                    type: 'number',
                },
            },
            {
                accessorKey: 'slug',
                header: 'Slug',
                enableEditing: false,
            },
            {
                accessorKey: 'variantName',
                header: 'Tên kiểu',
                muiEditTextFieldProps: {
                    required: true,
                },
            },

            {
                accessorKey: 'sold',
                header: 'Đã bán',
                enableEditing: false,
            },
            {
                accessorKey: 'quantity',
                header: 'Số lượng tồn kho',
                muiEditTextFieldProps: {
                    required: true,
                    type: 'number',
                },
            },
            // {
            //     accessorKey: 'variants',
            //     header: 'Kiểu mẫu',
            //     muiEditTextFieldProps: {
            //         required: true,
            //         error: !!validationErrors?.firstName,
            //         helperText: validationErrors?.firstName,
            //         //remove any previous validation errors when variant focuses on the input
            //         onFocus: () =>
            //             setValidationErrors({
            //                 ...validationErrors,
            //                 firstName: undefined,
            //             }),
            //         //optionally add validation checking for onBlur or onChange
            //     },
            //     Cell: (cell) => {
            //         const value = cell.renderedCellValue;
            //         console.log(value)
            //         return <span>{value.map((item) => { return (item.variantName + ", "); })}</span>;
            //     },
            // },

            // {
            //     accessorKey: 'createdAt',
            //     header: 'Ngày tạo',
            //     muiEditTextFieldProps: {
            //         required: true,
            //         type: 'number',
            //         error: !!validationErrors?.lastName,
            //         helperText: validationErrors?.lastName,
            //         //remove any previous validation errors when variant focuses on the input
            //         onFocus: () =>
            //             setValidationErrors({
            //                 ...validationErrors,
            //                 lastName: undefined,
            //             }),
            //     },
            // },

            // {
            //     accessorKey: 'updatedAt',
            //     header: 'Ngày sửa',
            //     muiEditTextFieldProps: {
            //         required: true,
            //         type: 'number',
            //         error: !!validationErrors?.lastName,
            //         helperText: validationErrors?.lastName,
            //         //remove any previous validation errors when variant focuses on the input
            //         onFocus: () =>
            //             setValidationErrors({
            //                 ...validationErrors,
            //                 lastName: undefined,
            //             }),
            //     },
            // },
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
    const { mutateAsync: createVariant, isPending: isCreatingVariant } =
        useCreateVariant(productId);
    //call READ hook
    const {
        data: fetchedVariants = [],
        isError: isLoadingVariantsError,
        isFetching: isFetchingVariants,
        isLoading: isLoadingVariants,
    } = useGetVariants({ productId });

    //call UPDATE hook
    const { mutateAsync: updateVariant, isPending: isUpdatingVariant } =
        useUpdateVariant(productId);
    //call DELETE hook
    const { mutateAsync: deleteVariant, isPending: isDeletingVariant } =
        useDeleteVariant(productId);

    //CREATE action
    const handleCreateVariant = async ({ values, table }) => {
        const newValidationErrors = values;
        // if (Object.values(newValidationErrors).some((error) => error)) {
        //     setValidationErrors(newValidationErrors);
        //     return;
        // }
        setValidationErrors({});
        await createVariant(values);
        table.setCreatingRow(null); //exit creating mode
    };

    //UPDATE action
    const handleSaveVariant = async ({ values, table }) => {
        const newValidationErrors = values
        // if (Object.values(newValidationErrors).some((error) => error)) {
        //     setValidationErrors(newValidationErrors);
        //     return;
        // }
        setValidationErrors({});
        await updateVariant(values);
        table.setEditingRow(null); //exit editing mode
    };

    //DELETE action
    const openDeleteConfirmModal = (row) => {
        if (window.confirm('Are you sure you want to delete this variant?')) {
            deleteVariant(row.original);
        }
    };

    const table = useMaterialReactTable({
        columns,
        data: fetchedVariants,
        createDisplayMode: 'modal', //default ('row', and 'custom' are also available)
        editDisplayMode: 'modal', //default ('row', 'cell', 'table', and 'custom' are also available)
        enableEditing: true,
        getRowId: (row) => row.id,
        muiToolbarAlertBannerProps: isLoadingVariantsError
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
        onCreatingRowSave: handleCreateVariant,
        onEditingRowCancel: () => setValidationErrors({}),
        onEditingRowSave: handleSaveVariant,
        //optionally customize modal content
        renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
            <>
                <DialogTitle variant="h3">Tạo đánh giá mới</DialogTitle>
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
                Tạo kiểu mẫu mới
            </Button>
        ),
        state: {
            isLoading: isLoadingVariants,
            isSaving: isCreatingVariant || isUpdatingVariant || isDeletingVariant,
            showAlertBanner: isLoadingVariantsError,
            showProgressBars: isFetchingVariants,
        },
    });

    return <MaterialReactTable table={table} />;
};

//CREATE hook (post new variant to api)
function useCreateVariant(productId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data) => {
            delete data._id;
            delete data.slug;
            delete data.sku;
            delete data.sold;
            data.price = parseInt(data.price);
            data.marketPrice = parseInt(data.marketPrice);
            if (data.thumbnail instanceof File ? true : false) {
                const formData = new FormData();
                formData.append("image", data.thumbnail);
                const imageResponse = await axios.post(`http://localhost:3030/image/`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    }
                })
                data.thumbnail = imageResponse.data.data.url;
            }
            const sendData = {
                'variant': data,
                'action': 'create'
            }
            const response = await axios.patch(`http://localhost:3030/product/${productId}`, sendData)

            return (response.data);
        },
        //client side optimistic update
        onSuccess: () => {
            queryClient.invalidateQueries(['variants']);
        },
        // onSettled: () => queryClient.invalidateQueries({ queryKey: ['variants'] }), //refetch variants after mutation, disabled for demo
    });
}

//READ hook (get variants from api)
function useGetVariants({ productId }) {
    return useQuery({
        queryKey: ['variants'],
        queryFn: async () => {
            const response = await axios.get(`http://localhost:3030/product/${productId}`)
            console.log(response);
            return (response.data?.variants);
        },
        refetchOnWindowFocus: false,
    });
}

//UPDATE hook (put variant in api)
function useUpdateVariant(productId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data) => {
            data.price = parseInt(data.price);
            data.marketPrice = parseInt(data.marketPrice);
            if (data.thumbnail instanceof File ? true : false) {
                const responseProduct = await axios.get(`http://localhost:3030/product/${productId}`)
                const image_url = responseProduct.data.variants.find((p) => p.sku === data.sku).thumbnail;
                const parts = image_url.split("/");
                const id = parts[parts.length - 2];
                const formData = new FormData();
                formData.append("image", data.thumbnail);
                const imageResponse = await axios.patch(`http://localhost:3030/image/${id}`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    }
                })
                data.thumbnail = imageResponse.data.data.url;
            }
            const sendData = {
                'variant': data,
                'action': 'update'
            }
            const response = await axios.patch(`http://localhost:3030/product/${productId}`, sendData)
        },
        //client side optimistic update
        onSuccess: () => {
            queryClient.invalidateQueries(['variants']);
        },
        // onSettled: () => queryClient.invalidateQueries({ queryKey: ['variants'] }), //refetch variants after mutation, disabled for demo
    });
}

//DELETE hook (delete variant in api)
function useDeleteVariant(productId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data) => {
            data.price = parseInt(data.price);
            data.marketPrice = parseInt(data.marketPrice);
            const sendData = {
                'variant': data,
                'action': 'delete'
            }
          
            const image_url = data.thumbnail;
            const parts = image_url.split("/");
            const id = parts[parts.length - 2];
            const formData = new FormData();
            formData.append("image", data.thumbnail);
            await axios.delete(`http://localhost:3030/image/${id}`)
            
            const response = await axios.patch(`http://localhost:3030/product/${productId}`, sendData)
            console.log(response);
        },
        //client side optimistic update
        onSuccess: () => {
            queryClient.invalidateQueries(['variants']);
        },
        // onSettled: () => queryClient.invalidateQueries({ queryKey: ['variants'] }), //refetch variants after mutation, disabled for demo
    });
}

const queryClient = new QueryClient();

const Variant = () => {
    const { productId } = useParams();
    return !productId ? (<>Loading</>) : (<QueryClientProvider client={queryClient}>
        <Example productId={productId} />
    </QueryClientProvider>);
};

export default Variant;

const validateRequired = (value) => !!value.length;
const validateEmail = (email) =>
    !!email.length &&
    email
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        );

function validateVariant(variant) {
    return {
        firstName: !validateRequired(variant.firstName)
            ? 'First Name is Required'
            : '',
        lastName: !validateRequired(variant.lastName) ? 'Last Name is Required' : '',
        email: !validateEmail(variant.email) ? 'Incorrect Email Format' : '',
    };
}
