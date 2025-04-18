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
    Card,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
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
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';

const formatDateTime = (value) =>
    new Intl.DateTimeFormat('vi-VN', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
    }).format(new Date(value));

const renderBooleanText = (value, trueText, falseText) => {
    if (value === true) return trueText;
    if (value === false) return falseText;
    return 'Lỗi';
};

const renderSelectText = (value, map) => map[value] || 'Lỗi';

const Example = () => {
    const [validationErrors, setValidationErrors] = useState({});

    const {
        mutateAsync: createOrder, isPending: isCreatingOrder,
    } = useCreateOrder();

    const {
        data: fetchedOrders = [],
        isError: isLoadingOrdersError,
        isFetching: isFetchingOrders,
        isLoading: isLoadingOrders,
    } = useGetOrders();

    const {
        mutateAsync: updateOrder, isPending: isUpdatingOrder,
    } = useUpdateOrder();

    const {
        mutateAsync: deleteOrder, isPending: isDeletingOrder,
    } = useDeleteOrder();

    const handleCreateOrder = async ({ values, table }) => {
        setValidationErrors({});
        await createOrder(values);
        table.setCreatingRow(null);
    };

    const handleSaveOrder = async ({ values, table }) => {
        setValidationErrors({});
        await updateOrder(values);
        table.setEditingRow(null);
    };

    const openDeleteConfirmModal = (row) => {
        if (window.confirm('Bạn có chắc muốn xóa đơn hàng này không?')) {
            deleteOrder(row.original._id);
        }
    };

    const columns = useMemo(() => [
        {
            accessorKey: '_id',
            header: 'Id',
            enableEditing: false,
            size: 80,
        },
        {
            accessorKey: 'customer.name',
            header: 'Họ tên khách hàng',
            muiEditTextFieldProps: { required: true },
        },
        {
            accessorKey: 'customer.phone',
            header: 'Số điện thoại khách hàng',
            muiEditTextFieldProps: { required: true },
        },
        {
            accessorKey: 'userId',
            header: 'Người dùng đặt hàng',
            muiEditTextFieldProps: { required: true },
        },
        {
            accessorKey: 'isReceiveAtStore',
            header: 'Nhận tại cửa hàng',
            enableEditing: false,
            muiEditTextFieldProps: {
                error: !!validationErrors?.state,
                helperText: validationErrors?.state,
            },
            Cell: ({ renderedCellValue }) => (
                <span>
                    {renderBooleanText(renderedCellValue, 'Nhận tại cửa hàng', 'Không nhận tại cửa hàng')}
                </span>
            ),
        },
        {
            accessorKey: 'items',
            header: 'Các sản phẩm',
            enableEditing: false,
            Cell: ({ row }) => (
                <Button
                    variant='contained'
                    component={Link}
                    to={`/order/${row.original._id}/item`}
                >
                    Chi tiết
                </Button>
            ),
        },
        { accessorKey: 'address.province', header: 'Tỉnh', enableEditing: false },
        { accessorKey: 'address.district', header: 'Quận/Huyện', enableEditing: false },
        { accessorKey: 'address.ward', header: 'Phường/Xã', enableEditing: false },
        { accessorKey: 'address.street', header: 'Đường/Địa chỉ', enableEditing: false },
        { accessorKey: 'note', header: 'Ghi chú', enableEditing: false },
        { accessorKey: 'paymentMethod', header: 'Hình thức thanh toán', enableEditing: false },
        {
            accessorKey: 'paymentStatus',
            header: 'Trạng thái thanh toán',
            editVariant: 'select',
            editSelectOptions: [
                { label: 'Chưa thanh toán', value: "pending" },
                { label: 'Đã thanh toán', value: "paid" },
                { label: 'Đã hủy', value: "cancelled" },
            ],
            muiEditTextFieldProps: { select: true },
            Cell: ({ renderedCellValue }) => (
                <span>
                    {renderSelectText(renderedCellValue, {
                        pending: 'Chưa thanh toán',
                        paid: 'Đã thanh toán',
                        cancelled: 'Đã hủy',
                    })}
                </span>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Trạng thái',
            editVariant: 'select',
            editSelectOptions: [
                { label: 'Chưa xác nhận', value: "pending" },
                { label: 'Đã xác nhận', value: "confirmed" },
                { label: 'Đang giao', value: "shipping" },
                { label: 'Đã giao', value: "completed" },
                { label: 'Đã hủy', value: "cancelled" },
            ],
            muiEditTextFieldProps: { select: true },
            Cell: ({ renderedCellValue }) => (
                <span>
                    {renderSelectText(renderedCellValue, {
                        pending: 'Chưa xác nhận',
                        confirmed: 'Đã xác nhận',
                        shipping: 'Đang giao',
                        completed: 'Đã giao',
                        cancelled: 'Đã hủy',
                    })}
                </span>
            ),
        },
        { accessorKey: 'subTotal', header: 'Tổng tiền sản phẩm', enableEditing: false },
        { accessorKey: 'discountCode', header: 'Mã khuyến mãi', enableEditing: false },
        { accessorKey: 'discount', header: 'Giá khuyến mãi', enableEditing: false },
        { accessorKey: 'total', header: 'Tổng tiền', enableEditing: false },
        {
            accessorKey: 'createdAt',
            header: 'Ngày tạo',
            enableEditing: false,
            Cell: ({ renderedCellValue }) => <span>{formatDateTime(renderedCellValue)}</span>,
        },
        {
            accessorKey: 'updatedAt',
            header: 'Ngày cập nhật',
            enableEditing: false,
            Cell: ({ renderedCellValue }) => <span>{formatDateTime(renderedCellValue)}</span>,
        },
    ], [validationErrors]);

    const table = useMaterialReactTable({
        columns,
        data: fetchedOrders,
        getRowId: (row) => row._id,
        createDisplayMode: 'modal',
        editDisplayMode: 'modal',
        enableEditing: true,
        onCreatingRowSave: handleCreateOrder,
        onEditingRowSave: handleSaveOrder,
        onCreatingRowCancel: () => setValidationErrors({}),
        onEditingRowCancel: () => setValidationErrors({}),
    
        renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
            <>
                <DialogTitle variant="h6">Tạo đơn hàng mới</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {internalEditComponents}
                </DialogContent>
                <DialogActions>
                    <MRT_EditActionButtons table={table} row={row} />
                </DialogActions>
            </>
        ),
        renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
            <>
                <DialogTitle variant="h6">Sửa đơn hàng</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {internalEditComponents}
                </DialogContent>
                <DialogActions>
                    <MRT_EditActionButtons table={table} row={row} />
                </DialogActions>
            </>
        ),
        renderRowActions: ({ row, table }) => (
            <Box sx={{ display: 'flex', gap: '1rem' }}>
                <Tooltip title="Chỉnh sửa">
                    <IconButton onClick={() => table.setEditingRow(row)}>
                        <EditIcon />
                    </IconButton>
                </Tooltip>
            </Box>
        ),
    
        // 🎨 Styling các thành phần
        muiTableHeadCellProps: {
            sx: {
                backgroundColor: '#f1f1f1',
                fontWeight: 'bold',
                fontSize: '14px',
                borderRight: '1px solid #ddd', // viền cột
            },
        },
        muiTableBodyCellProps: {
            sx: {
                fontSize: '13px',
                paddingY: '10px',
                backgroundColor: 'inherit', // dùng màu theo dòng
                borderRight: '1px solid #eee', // viền cột
            },
        },
        muiTableBodyRowProps: ({ row }) => ({
            sx: {
                backgroundColor: row.index % 2 === 0 ? '#fffdf7' : '#f9f9f9',
                borderBottom: '1px solid #e0e0e0', // viền dòng
                '&:hover': {
                    backgroundColor: '#f0f0f0',
                },
            },
        }),
        muiTableContainerProps: {
            sx: { minHeight: '500px' },
        },
        muiTableProps: {
            sx: {
                border: '1px solid #ccc',
            },
        },
    
        // ⚠️ Thông báo khi lỗi
        muiToolbarAlertBannerProps: isLoadingOrdersError
            ? { color: 'error', children: 'Lỗi khi tải dữ liệu' }
            : undefined,
    
        state: {
            isLoading: isLoadingOrders,
            isSaving: isCreatingOrder || isUpdatingOrder || isDeletingOrder,
            showAlertBanner: isLoadingOrdersError,
            showProgressBars: isFetchingOrders,
        },
        muiTopToolbarProps: {
            sx: {
                backgroundColor: '#fff',
                borderBottom: '1px solid #ddd',
                paddingY: 1,
            },
        },
        muiBottomToolbarProps: {
            sx: {
                backgroundColor: '#fff',
                borderTop: '1px solid #ddd',
                paddingY: 1,
            },
        },
    });
    

    return <MaterialReactTable table={table} />;
};
//CREATE hook (post new order to api)
function useCreateOrder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data) => {
            delete data._id;
            delete data.slug;
            const token = Cookies.get("token");
            const response = await axios.post(`https://shoestore-be.onrender.com/order/`, data, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            return (response.data);
        },
        //client side optimistic update
        onMutate: (newOrderInfo) => {
            queryClient.setQueryData(['orders'], (prevOrders) => [
                ...prevOrders,
                {
                    ...newOrderInfo,
                    id: (Math.random() + 1).toString(36).substring(7),
                },
            ]);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['orders']);
        },
        // onSettled: () => queryClient.invalidateQueries({ queryKey: ['orders'] }), //refetch orders after mutation, disabled for demo
    });
}

//READ hook (get orders from api)
function useGetOrders() {
    return useQuery({
        queryKey: ['orders'],
        queryFn: async () => {
            const token = Cookies.get("token");
            const response = await axios.get(`https://shoestore-be.onrender.com/order/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            console.log(response)
            return (response.data?.data);
        },
        refetchOnWindowFocus: false,
    });
}

//UPDATE hook (put order in api)
function useUpdateOrder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data) => {
            const id = data._id;
            delete data._id;
            delete data.createdAt
            delete data.updatedAt
            const token = Cookies.get("token");
            const response = await axios.patch(`https://shoestore-be.onrender.com/order/by-admin/${id}`, data, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            console.log(response);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['orders']);
        },
        // onSettled: () => queryClient.invalidateQueries({ queryKey: ['orders'] }), //refetch orders after mutation, disabled for demo
    });
}

//DELETE hook (delete order in api)
function useDeleteOrder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (orderId) => {
            const token = Cookies.get("token");
            const response = await axios.delete(`https://shoestore-be.onrender.com/order/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            console.log(response)
        },
        //client side optimistic update
        onMutate: (orderId) => {
            queryClient.setQueryData(['orders'], (prevOrders) =>
                prevOrders?.filter((order) => order.id !== orderId),
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['orders']);
        },
        // onSettled: () => queryClient.invalidateQueries({ queryKey: ['orders'] }), //refetch orders after mutation, disabled for demo
    });
}

const queryClient = new QueryClient();

const Order = () => (
    //Put this with your other react-query providers near root of your app
    <QueryClientProvider client={queryClient}>
        <Example />
    </QueryClientProvider>
);

export default Order;

const validateRequired = (value) => !!value.length;
const validateEmail = (email) =>
    !!email.length &&
    email
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        );

function validateOrder(order) {
    return {
        firstName: !validateRequired(order.firstName)
            ? 'First Name is Required'
            : '',
        lastName: !validateRequired(order.lastName) ? 'Last Name is Required' : '',
        email: !validateEmail(order.email) ? 'Incorrect Email Format' : '',
    };
}
