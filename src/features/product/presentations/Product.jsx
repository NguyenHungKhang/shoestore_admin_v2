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
    TextField,
    Typography
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
import { Link } from 'react-router-dom';

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
                },
            },
            {
                accessorKey: 'brandId._id',
                header: 'sản phẩm',
                muiEditTextFieldProps: {
                    required: true,
                },
            },
            {
                accessorKey: 'categoryId._id',
                header: 'Danh mục',
                muiEditTextFieldProps: {
                    required: true,
                },
            },
            {
                accessorKey: 'specPicture',
                header: 'Hình ảnh',
                size: 80,
                Edit: ({ cell, column, row, table }) =>
                    <>
                        <TextField type='file' onChange={(event) => { handleFileChange(event); row._valuesCache[column.id] = event.target.files[0] }} inputProps={{ multiple: false, accept: "image/*", }} />
                        <img src={image ? image : row.original.specPicture} height={50} />
                    </>
                ,
                Cell: ({ renderedCellValue }) => {
                    return <img src={renderedCellValue} height={50} />
                },
            },
            {
                accessorKey: 'slug',
                header: 'Slug',
                enableEditing: false,
                size: 80,
            },
            {
                accessorKey: 'desc',
                header: 'Mô tả',
                muiEditTextFieldProps: {
                    required: true,
                },
            },
            {
                header: 'Hình ảnh nổi bật',
                enableEditing: false,
                Cell: (cell) => {
                    return <Button variant='contained' component={Link} to={`/product/${cell.row.original._id}/high-light-pics`} >Hình ảnh nổi bật</Button>;
                },
            },
            {
                header: 'Thông số chung',
                enableEditing: false,
                Cell: (cell) => {
                    return <Button variant='contained' component={Link} to={`/product/${cell.row.original._id}/over-spec`} >Thông số chung</Button>;
                },
            },
            {
                header: 'Thông số cụ thể',
                enableEditing: false,
                Cell: (cell) => {
                    return <Button variant='contained' component={Link} to={`/product/${cell.row.original._id}/detail-spec`} >Thông số cụ thể</Button>;
                },
            },
            {
                accessorKey: 'variants',
                header: 'Kiểu mẫu',
                enableEditing: false,
                Cell: (cell) => {
                    return <Button variant='contained' component={Link} to={`/product/${cell.row.original._id}/variant`} >Chi tiết kiểu mẫu</Button>;
                },
            },
            {
                accessorKey: 'createdAt',
                header: 'Ngày tạo',
                enableEditing: false,
                muiEditTextFieldProps: {
                    required: true,
                },
            },

            {
                accessorKey: 'updatedAt',
                header: 'Ngày sửa',
                enableEditing: false,
                muiEditTextFieldProps: {
                    required: true,
                },
            },
            {
                accessorKey: 'views',
                header: 'Lượt xem',
                enableEditing: false,
                muiEditTextFieldProps: {
                    required: true,
                },
            },
            {
                accessorKey: 'rateTimes',
                header: 'Lượt đánh giá',
                enableEditing: false,
                muiEditTextFieldProps: {
                    required: true,
                },
            },
            {
                accessorKey: 'rates',
                header: 'Đánh giá trung bình',
                enableEditing: false,
                muiEditTextFieldProps: {
                    required: true,
                },
            },
            {
                accessorKey: 'minPrice',
                header: 'Giá tối thiểu',
                muiEditTextFieldProps: {
                    required: true,
                    type: 'number',
                    inputProps: { min: 1000 },
                },
            },
            {
                accessorKey: 'maxPrice',
                header: 'Giá tối đa',
                muiEditTextFieldProps: {
                    required: true,
                    type: 'number',
                    inputProps: { min: 1000 },
                },
            },
            {
                accessorKey: 'warrantyPeriod',
                header: 'Bảo hành (theo tháng)',
                muiEditTextFieldProps: {
                    required: true,
                    type: 'number',
                    inputProps: { min: 12 },
                },
            },
            {
                accessorKey: 'policies',
                header: 'Chính sách',
                Edit: ({ cell, column, row, table }) =>
                    <TextField
                        label="Chính sách"
                        variant='standard'
                        multiline
                        defaultValue={row.original.policies && row.original.policies.join('\n')}
                        onChange={(event) => { row._valuesCache[column.id] = event.target.value }}
                    />
                ,
                Cell: ({ renderedCellValue }) => {
                    if (Array.isArray(renderedCellValue)) {
                        return (
                            <Typography>
                                {renderedCellValue.join('\n')}
                            </Typography>
                        );
                    }
                }
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
    const { mutateAsync: createProduct, isPending: isCreatingProduct } =
        useCreateProduct();
    //call READ hook
    const {
        data: fetchedProducts = [],
        isError: isLoadingProductsError,
        isFetching: isFetchingProducts,
        isLoading: isLoadingProducts,
    } = useGetProducts();

    //call UPDATE hook
    const { mutateAsync: updateProduct, isPending: isUpdatingProduct } =
        useUpdateProduct();
    //call DELETE hook
    const { mutateAsync: deleteProduct, isPending: isDeletingProduct } =
        useDeleteProduct();

    //CREATE action
    const handleCreateProduct = async ({ values, table }) => {
        const newValidationErrors = values;
        // if (Object.values(newValidationErrors).some((error) => error)) {
        //     setValidationErrors(newValidationErrors);
        //     return;
        // }
        setValidationErrors({});
        await createProduct(values);
        table.setCreatingRow(null); //exit creating mode
    };

    //UPDATE action
    const handleSaveProduct = async ({ values, table }) => {
        const newValidationErrors = values
        // if (Object.values(newValidationErrors).some((error) => error)) {
        //     setValidationErrors(newValidationErrors);
        //     return;
        // }
        setValidationErrors({});
        await updateProduct(values);
        table.setEditingRow(null); //exit editing mode
    };

    //DELETE action
    const openDeleteConfirmModal = (row) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            deleteProduct(row.original._id);
        }
    };

    const table = useMaterialReactTable({
        columns,
        data: fetchedProducts,
        createDisplayMode: 'modal', //default ('row', and 'custom' are also available)
        editDisplayMode: 'modal', //default ('row', 'cell', 'table', and 'custom' are also available)
        enableEditing: true,
        getRowId: (row) => row.id,
        muiToolbarAlertBannerProps: isLoadingProductsError
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
        onCreatingRowSave: handleCreateProduct,
        onEditingRowCancel: () => setValidationErrors({}),
        onEditingRowSave: handleSaveProduct,
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
                Tạo sản phẩm mới
            </Button>
        ),
        state: {
            isLoading: isLoadingProducts,
            isSaving: isCreatingProduct || isUpdatingProduct || isDeletingProduct,
            showAlertBanner: isLoadingProductsError,
            showProgressBars: isFetchingProducts,
        },
    });

    return <MaterialReactTable table={table} />;
};

//CREATE hook (post new product to api)
function useCreateProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data) => {
            delete data._id;
            delete data.slug;
            delete data.views;
            delete data.variants;
            delete data.createdAt;
            delete data.updatedAt;
            delete data.rates;
            delete data.rateTimes;
            delete data.createdAt
            delete data.updatedAt
            const brandId = data['brandId._id'];
            const categoryId = data['categoryId._id'];
            delete data['brandId._id'];
            delete data['categoryId._id'];
            data.policies = data.policies.split('\n');
            data.brandId = brandId;
            data.categoryId = categoryId
            data.minPrice = parseInt(data.minPrice);
            data.maxPrice = parseInt(data.maxPrice);
            data.minPrwarrantyPeriodice = parseInt(data.warrantyPeriod);
            if (data.specPicture instanceof File ? true : false) {
                const formData = new FormData();
                formData.append("image", data.specPicture);
                const imageResponse = await axios.post(`http://localhost:3030/image/`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    }
                })
                data.specPicture = imageResponse.data.data.url;
            }

            const response = await axios.post(`http://localhost:3030/product/`, data)
            console.log(response);
            return (response.data);
        },
        //client side optimistic update
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
        },
        // onSettled: () => queryClient.invalidateQueries({ queryKey: ['products'] }), //refetch products after mutation, disabled for demo
    });
}

//READ hook (get products from api)
function useGetProducts() {
    return useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const response = await axios.get(`http://localhost:3030/product/`)
            return (response.data);
        },
        refetchOnWindowFocus: false,
    });
}

//UPDATE hook (put product in api)
function useUpdateProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data) => {
            const id = data._id;
            delete data.slug;
            delete data.views;
            delete data.variants;
            delete data.createdAt;
            delete data.updatedAt;
            delete data.rates;
            delete data.rateTimes;
            delete data.createdAt
            delete data.updatedAt
            if (!Array.isArray(data.policies))
                data.policies = data.policies.split('\n');
            const brandId = data['brandId._id'];
            const categoryId = data['categoryId._id'];
            delete data['brandId._id'];
            delete data['categoryId._id'];
            data.brandId = brandId;
            data.categoryId = categoryId
            data.minPrice = parseInt(data.minPrice);
            data.maxPrice = parseInt(data.maxPrice);
            data.minPrwarrantyPeriodice = parseInt(data.warrantyPeriod);
            if (data.specPicture instanceof File ? true : false) {
                const responseProduct = await axios.get(`http://localhost:3030/product/${id}`)
                const image_url = responseProduct.data.specPicture;
                const parts = image_url.split("/");
                const imageId = parts[parts.length - 2];
                const formData = new FormData();
                formData.append("image", data.specPicture);
                const imageResponse = await axios.patch(`http://localhost:3030/image/${imageId}`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    }
                })
                data.specPicture = imageResponse.data.data.url;
            }
            const response = await axios.patch(`http://localhost:3030/product/${id}`, data);
            console.log(response)
        },
        //client side optimistic update
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
        },
        // onSettled: () => queryClient.invalidateQueries({ queryKey: ['products'] }), //refetch products after mutation, disabled for demo
    });
}

//DELETE hook (delete product in api)
function useDeleteProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (productId) => {
            const response = await axios.delete(`http://localhost:3030/product/${productId}`)
        },
        //client side optimistic update
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
        },
        // onSettled: () => queryClient.invalidateQueries({ queryKey: ['products'] }), //refetch products after mutation, disabled for demo
    });
}

const queryClient = new QueryClient();

const Product = () => (
    //Put this with your other react-query providers near root of your app
    <QueryClientProvider client={queryClient}>
        <Example />
    </QueryClientProvider>
);

export default Product;

const validateRequired = (value) => !!value.length;
const validateEmail = (email) =>
    !!email.length &&
    email
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        );

function validateProduct(product) {
    return {
        firstName: !validateRequired(product.firstName)
            ? 'First Name is Required'
            : '',
        lastName: !validateRequired(product.lastName) ? 'Last Name is Required' : '',
        email: !validateEmail(product.email) ? 'Incorrect Email Format' : '',
    };
}
