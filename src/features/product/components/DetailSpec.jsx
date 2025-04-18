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
    Typography,
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

    const columns = useMemo(
        () => [
            {
                accessorKey: 'groupKey',
                header: 'key',
                enableEditing: false,
            },
            {
                accessorKey: 'groupName',
                header: 'Tên thông số',
            },
            {
                accessorKey: 'groupItems',
                header: 'Thông số chi tiết',
                muiEditTextFieldProps: {
                    required: true,
                    multiline: true
                },
                Edit: ({ cell, column, row, table }) =>
                    <TextField
                        label="Thông số"
                        variant='standard'
                        multiline
                        defaultValue={row.original.groupItems && row.original.groupItems.map((item, index) => (
                            "* " + item.name + ": " + item.values.join("; ")
                        )).join("\n")}
                        onChange={(event) => { row._valuesCache[column.id] = event.target.value }}
                    />
                ,
                Cell: ({ renderedCellValue }) => {
                    if (Array.isArray(renderedCellValue)) {
                        return (
                            <Typography>
                                {renderedCellValue.map((item, index) => (
                                    <Box key={index}>
                                        {"* " + item.name + ": " + item.values.join("; ")}
                                    </Box>
                                ))}
                            </Typography>
                        );
                    }
                }
            },
            // {
            //     accessorKey: 'values',
            //     header: 'Thông số',
            //     Edit: ({ cell, column, row, table }) =>
            //         <TextField
            //             label="Thông số"
            //             variant='standard'
            //             defaultValue={row.original.values && row.original.values.join('; ')}
            //             onChange={(event) => { row._valuesCache[column.id] = event.target.value }}
            //         />
            //     ,
            //     Cell: ({ renderedCellValue }) => {
            //         if (Array.isArray(renderedCellValue)) {
            //             return (
            //                 <Typography>
            //                     {renderedCellValue.join('; ')}
            //                 </Typography>
            //             );
            //         } 
            //     }
            // }
            // {
            //     accessorKey: 'detailspecs',
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
    const { mutateAsync: createDetailSpec, isPending: isCreatingDetailSpec } =
        useCreateDetailSpec(productId);
    //call READ hook
    const {
        data: fetchedDetailSpecs = [],
        isError: isLoadingDetailSpecsError,
        isFetching: isFetchingDetailSpecs,
        isLoading: isLoadingDetailSpecs,
    } = useGetDetailSpecs({ productId });

    //call UPDATE hook
    const { mutateAsync: updateDetailSpec, isPending: isUpdatingDetailSpec } =
        useUpdateDetailSpec(productId);
    //call DELETE hook
    const { mutateAsync: deleteDetailSpec, isPending: isDeletingDetailSpec } =
        useDeleteDetailSpec(productId);

    //CREATE action
    const handleCreateDetailSpec = async ({ values, table }) => {
        const newValidationErrors = values;
        // if (Object.values(newValidationErrors).some((error) => error)) {
        //     setValidationErrors(newValidationErrors);
        //     return;
        // }
        setValidationErrors({});
        await createDetailSpec(values);
        table.setCreatingRow(null); //exit creating mode
    };

    //UPDATE action
    const handleSaveDetailSpec = async ({ values, table }) => {
        const newValidationErrors = values
        // if (Object.values(newValidationErrors).some((error) => error)) {
        //     setValidationErrors(newValidationErrors);
        //     return;
        // }
        setValidationErrors({});
        await updateDetailSpec(values);
        table.setEditingRow(null); //exit editing mode
    };

    //DELETE action
    const openDeleteConfirmModal = (row) => {
        if (window.confirm('Are you sure you want to delete this variant?')) {
            deleteDetailSpec(row.original);
        }
    };

    const table = useMaterialReactTable({
        columns,
        data: fetchedDetailSpecs,
        createDisplayMode: 'modal', //default ('row', and 'custom' are also available)
        editDisplayMode: 'modal', //default ('row', 'cell', 'table', and 'custom' are also available)
        enableEditing: true,
        getRowId: (row) => row.id,
        muiToolbarAlertBannerProps: isLoadingDetailSpecsError
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
        onCreatingRowSave: handleCreateDetailSpec,
        onEditingRowCancel: () => setValidationErrors({}),
        onEditingRowSave: handleSaveDetailSpec,
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
                Tạo thông số chi tiết mới
            </Button>
        ),
        state: {
            isLoading: isLoadingDetailSpecs,
            isSaving: isCreatingDetailSpec || isUpdatingDetailSpec || isDeletingDetailSpec,
            showAlertBanner: isLoadingDetailSpecsError,
            showProgressBars: isFetchingDetailSpecs,
        },
    });

    return <MaterialReactTable table={table} />;
};

//CREATE hook (post new variant to api)
function useCreateDetailSpec(productId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data) => {
            const pattern = /^(\*\s*.+?\s*:\s*.+?(\s*;\s*.+?)*)$/gm;
            const isValidFormat = pattern.test(data.groupItems);
            console.log(isValidFormat);
            if (isValidFormat) {
                data.groupItems = data.groupItems.split('\n').map((line) => {
                    line = line.trim();
                    if (line.startsWith('*')) {
                        line = line.substring(1).trim();
                    }
                    const [name, value] = line.split(':').map((part) => part.trim());
                    const values = value.split(';').map((item) => item.trim());
                    return {
                        name: name,
                        values: values,
                    };
                });
            }

            const sendData = {
                'detailSpecs': data,
                'action': 'create'
            }
            const response = await axios.patch(`http://localhost:3030/product/${productId}`, sendData)
            return (response.data);
        },
        //client side optimistic update
        onSuccess: () => {
            queryClient.invalidateQueries(['detailspecs']);
        },
        // onSettled: () => queryClient.invalidateQueries({ queryKey: ['detailspecs'] }), //refetch detailspecs after mutation, disabled for demo
    });
}

//READ hook (get detailspecs from api)
function useGetDetailSpecs({ productId }) {
    return useQuery({
        queryKey: ['detailspecs'],
        queryFn: async () => {
            const response = await axios.get(`http://localhost:3030/product/${productId}`)
            console.log(response);
            return (response.data?.detailSpecs);
        },
        refetchOnWindowFocus: false,
    });
}

//UPDATE hook (put variant in api)
function useUpdateDetailSpec(productId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data) => {
            const pattern = /^(\*\s*.+?\s*:\s*.+?(\s*;\s*.+?)*)$/gm;
            const isValidFormat = pattern.test(data.groupItems);
            console.log(isValidFormat);
            if (isValidFormat) {
                data.groupItems = data.groupItems.split('\n').map((line) => {
                    line = line.trim();
                    if (line.startsWith('*')) {
                        line = line.substring(1).trim();
                    }
                    const [name, value] = line.split(':').map((part) => part.trim());
                    const values = value.split(';').map((item) => item.trim());
                    return {
                        name: name,
                        values: values,
                    };
                });
            }

            const sendData = {
                'detailSpecs': data,
                'action': 'update'
            }
            const response = await axios.patch(`http://localhost:3030/product/${productId}`, sendData)
            console.log(response);
        },
        //client side optimistic update
        onSuccess: () => {
            queryClient.invalidateQueries(['detailspecs']);
        },
        // onSettled: () => queryClient.invalidateQueries({ queryKey: ['detailspecs'] }), //refetch detailspecs after mutation, disabled for demo
    });
}

//DELETE hook (delete variant in api)
function useDeleteDetailSpec(productId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data) => {
            const sendData = {
                'detailSpecs': data,
                'action': 'delete'
            }
            const response = await axios.patch(`http://localhost:3030/product/${productId}`, sendData)
            console.log(response);
        },
        //client side optimistic update
        onSuccess: () => {
            queryClient.invalidateQueries(['detailspecs']);
        },
        // onSettled: () => queryClient.invalidateQueries({ queryKey: ['detailspecs'] }), //refetch detailspecs after mutation, disabled for demo
    });
}

const queryClient = new QueryClient();

const DetailSpec = () => {
    const { productId } = useParams();
    return !productId ? (<>Loading</>) : (<QueryClientProvider client={queryClient}>
        <Example productId={productId} />
    </QueryClientProvider>);
};

export default DetailSpec;

const validateRequired = (value) => !!value.length;
const validateEmail = (email) =>
    !!email.length &&
    email
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        );

function validateDetailSpec(variant) {
    return {
        firstName: !validateRequired(variant.firstName)
            ? 'First Name is Required'
            : '',
        lastName: !validateRequired(variant.lastName) ? 'Last Name is Required' : '',
        email: !validateEmail(variant.email) ? 'Incorrect Email Format' : '',
    };
}
