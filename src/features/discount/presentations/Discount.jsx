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
import ImageEditor from '../components/ImageEditor.jsx';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs, { Dayjs } from 'dayjs';
import RichText from '../components/RichText.jsx';

const Example = () => {
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
                    //remove any previous validation errors when discount focuses on the input
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            firstName: undefined,
                        }),
                    //optionally add validation checking for onBlur or onChange
                },
            },

            {
                accessorKey: 'image',
                header: 'Hình ảnh',
                muiEditTextFieldProps: ({ cell }) => ({
                    required: true,
                }),
                Edit: ({ cell, column, row, table }) =>
                    <>
                        <TextField type='file' onChange={(event) => { handleFileChange(event); row._valuesCache[column.id] = event.target.files[0] }} inputProps={{ multiple: false, accept: "image/*", }} />
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                            <img src={image ? image : row.original.image} width={230} height={100} />
                        </Box>
                    </>
                ,
                Cell: ({ renderedCellValue }) => {
                    return <img src={renderedCellValue} width={230} height={100} />
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
                    //remove any previous validation errors when discount focuses on the input
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
                    //remove any previous validation errors when discount focuses on the input
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            email: undefined,
                        }),
                },
                Edit: ({ cell, column, row, table }) =>
                    <>
                        <RichText row={row} column={column} />
                    </>
                ,
                Cell: (cell) => <div style={{ overflow: "hiden", textOverflow: "ellipsis", whiteSpace: 'nowrap', width: "500px" }}>{cell.renderedCellValue}</div>,
            },
            {
                accessorKey: 'code',
                header: 'Code khuyến mãi',
                enableEditing: false,
                muiEditTextFieldProps: {
                    required: true,
                    error: !!validationErrors?.email,
                    helperText: validationErrors?.email,
                    //remove any previous validation errors when discount focuses on the input
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            email: undefined,
                        }),
                },
            },

            {
                accessorKey: 'beginDate',
                header: 'Ngày bắt đầu',
                muiEditTextFieldProps: {
                    required: true,
                },
                Edit: ({ cell, column, row, table }) =>
                    <Box sx={{ height: "100px" }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs} >
                            <DemoContainer components={['DateTimePicker']} >
                                <DateTimePicker label="Ngày bắt đầu" onChange={(newValue) => row._valuesCache[column.id] = newValue} defaultValue={row.original.beginDate !== "" ? dayjs(row.original.beginDate) : null} />
                            </DemoContainer>
                        </LocalizationProvider>
                    </Box>,
                Cell: ({ renderedCellValue }) => {
                    return <span>{new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }).format(new Date(renderedCellValue))}</span>;
                },
            },

            {
                accessorKey: 'endDate',
                header: 'Ngày kết thúc',
                muiEditTextFieldProps: {
                    required: true,
                },
                Edit: ({ cell, column, row, table }) =>
                    <Box sx={{ height: "100px" }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs} >
                            <DemoContainer components={['DateTimePicker']} >
                                <DateTimePicker label="Ngày kết thúc" onChange={(newValue) => row._valuesCache[column.id] = newValue} defaultValue={row.original.endDate !== "" ? dayjs(row.original.endDate) : null} />
                            </DemoContainer>
                        </LocalizationProvider>
                    </Box>,
                Cell: ({ renderedCellValue }) => {
                    return <span>{new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }).format(new Date(renderedCellValue))}</span>;
                },
            },
            {
                accessorKey: 'quantity',
                header: 'Số lượng còn lại',
                muiEditTextFieldProps: {
                    required: true,
                    type: 'number',
                    inputProps: { min: 0 },
                },
            },

            {
                accessorKey: 'unlimitedQty',
                header: 'Giới hạn số lượng',
                editVariant: 'select',
                editSelectOptions: [
                    { label: "Giới hạn", value: true },
                    { label: "Không giới hạn", value: false }
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
                        displayValue = 'Giới hạn số lượng';
                    } else if (value === false) {
                        displayValue = 'Không giới hạn số lượng';
                    } else {
                        displayValue = 'Lỗi'
                    }
                    return <span>{displayValue}</span>;
                },
            },

            {
                accessorKey: 'discount',
                header: 'Lượng khuyến mãi',
                muiEditTextFieldProps: {
                    required: true,
                    type: 'number',
                    inputProps: { min: 0 },
                },
            },

            {
                accessorKey: 'discountType',
                header: 'Loại khuyến mãi',
                editSelectOptions: [
                    { label: "Phần trăm %", value: 'percent' },
                    { label: "Số tiền VNĐ", value: 'price' }
                ],
                muiEditTextFieldProps: {
                    select: true,
                },
                Cell: (cell) => {
                    const value = cell.renderedCellValue;
                    let displayValue = '';
                    if (value === "percent") {
                        displayValue = 'Phần trăm %';
                    } else if (value === 'price') {
                        displayValue = 'Số tiền VNĐ';
                    } else {
                        displayValue = 'Lỗi'
                    }
                    return <span>{displayValue}</span>;
                },
            },

            {
                accessorKey: 'minimumTotal',
                header: 'Mức tối thiểu áp dụng',
                muiEditTextFieldProps: {
                    required: true,
                    type: 'number',
                    inputProps: { min: 0 },
                },
            },

            {
                accessorKey: 'maximumApplied',
                header: 'Mức tối đa áp dụng',
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
    const { mutateAsync: createDiscount, isPending: isCreatingDiscount } =
        useCreateDiscount();
    //call READ hook
    const {
        data: fetchedDiscounts = [],
        isError: isLoadingDiscountsError,
        isFetching: isFetchingDiscounts,
        isLoading: isLoadingDiscounts,
    } = useGetDiscounts();

    //call UPDATE hook
    const { mutateAsync: updateDiscount, isPending: isUpdatingDiscount } =
        useUpdateDiscount();
    //call DELETE hook
    const { mutateAsync: deleteDiscount, isPending: isDeletingDiscount } =
        useDeleteDiscount();

    //CREATE action
    const handleCreateDiscount = async ({ values, table }) => {
        setValidationErrors({});
        await createDiscount(values);
        table.setCreatingRow(null); //exit creating mode
    };

    //UPDATE action
    const handleSaveDiscount = async ({ values, table }) => {
        setValidationErrors({});
        await updateDiscount(values);
        table.setEditingRow(null); //exit editing mode
    };

    //DELETE action
    const openDeleteConfirmModal = (row) => {
        if (window.confirm('Are you sure you want to delete this discount?')) {
            deleteDiscount(row.original._id);
        }
    };

    const table = useMaterialReactTable({
        columns,
        data: fetchedDiscounts,
        createDisplayMode: 'modal', //default ('row', and 'custom' are also available)
        editDisplayMode: 'modal', //default ('row', 'cell', 'table', and 'custom' are also available)
        enableEditing: true,
        getRowId: (row) => row.id,
        muiToolbarAlertBannerProps: isLoadingDiscountsError
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
        onCreatingRowCancel: () => { setValidationErrors({}); setImage(null) },
        onCreatingRowSave: handleCreateDiscount,
        onEditingRowCancel: () => { setValidationErrors({}); setImage(null) },
        onEditingRowSave: handleSaveDiscount,
        //optionally customize modal content
        renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
            <>
                <DialogTitle variant="h3">Tạo khuyến mãi mới</DialogTitle>
                <DialogContent
                    sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                >
                    {internalEditComponents}
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
                Tạo khuyến mãi mới
            </Button>
        ),
        state: {
            isLoading: isLoadingDiscounts,
            isSaving: isCreatingDiscount || isUpdatingDiscount || isDeletingDiscount,
            showAlertBanner: isLoadingDiscountsError,
            showProgressBars: isFetchingDiscounts,
        },
    });

    return <MaterialReactTable table={table} />;
};

//CREATE hook (post new discount to api)
function useCreateDiscount() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data) => {
            delete data._id;
            delete data.slug;
            delete data.code;
            delete data.createdAt
            delete data.updatedAt
            if (data.image instanceof File ? true : false) {
                const formData = new FormData();
                formData.append("image", data.image);
                const imageResponse = await axios.post(`http://localhost:3030/image/`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    }
                })
                data.image = imageResponse.data.data.url;
            }
            const response = await axios.post(`http://localhost:3030/discount/`, data)
            return (response.data);
        },
        //client side optimistic update
        onSuccess: () => {
            queryClient.invalidateQueries(['discounts']);
        },
        // onSettled: () => queryClient.invalidateQueries({ queryKey: ['discounts'] }), //refetch discounts after mutation, disabled for demo
    });
}

//READ hook (get discounts from api)
function useGetDiscounts() {
    return useQuery({
        queryKey: ['discounts'],
        queryFn: async () => {
            const response = await axios.get(`http://localhost:3030/discount/by-admin`)
            return (response.data?.data);
        },
        refetchOnWindowFocus: false,
    });
}

//UPDATE hook (put discount in api)
function useUpdateDiscount() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data) => {
            console.log(data)
            const id = data._id;
            delete data._id;
            delete data.createdAt
            delete data.updatedAt
            if (data.image instanceof File ? true : false) {
                const formData = new FormData();
                formData.append("image", data.image);
                const imageResponse = await axios.patch(`http://localhost:3030/discount/image/${id}`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    }
                })
                data.image = imageResponse.data.data.url;
            }
            const response = await axios.patch(`http://localhost:3030/discount/${id}`, data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['discounts']);
        },
    });
}

//DELETE hook (delete discount in api)
function useDeleteDiscount() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (discountId) => {
            const response = await axios.delete(`http://localhost:3030/discount/${discountId}`)
            console.log(response)
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['discounts']);
        },
        // onSettled: () => queryClient.invalidateQueries({ queryKey: ['discounts'] }), //refetch discounts after mutation, disabled for demo
    });
}

const queryClient = new QueryClient();

const Discount = () => (
    //Put this with your other react-query providers near root of your app
    <QueryClientProvider client={queryClient}>
        <Example />
    </QueryClientProvider>
);

export default Discount;

const validateRequired = (value) => !!value.length;
const validateEmail = (email) =>
    !!email.length &&
    email
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        );

function validateDiscount(discount) {
    return {
        firstName: !validateRequired(discount.firstName)
            ? 'First Name is Required'
            : '',
        lastName: !validateRequired(discount.lastName) ? 'Last Name is Required' : '',
        email: !validateEmail(discount.email) ? 'Incorrect Email Format' : '',
    };
}
