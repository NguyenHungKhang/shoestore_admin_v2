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
import { useParams } from 'react-router-dom';
import Cookies from 'js-cookie';

const Example = ({ orderId }) => {
    const [validationErrors, setValidationErrors] = useState({});

    const columns = useMemo(
        () => [
            {
                accessorKey: 'productId',
                header: 'Id sản phẩm',
                enableEditing: false,
            },
            {
                accessorKey: 'sku',
                header: 'Sku kiểu mẫu',
                enableEditing: false,
            },
            {
                accessorKey: 'variantName',
                header: 'Kiểu mẫu sản phẩm',
                enableEditing: false,
            },
            {
                accessorKey: 'thumbnail',
                header: 'Hình ảnh',
                enableEditing: false,
                Cell: ({ renderedCellValue }) => {
                    return <img src={renderedCellValue} height={50} />
                },
            },
            {
                accessorKey: 'quantity',
                header: 'Số lượng',
                enableEditing: false,
            },
            {
                accessorKey: 'pricePerUnit',
                header: 'Giá bán',
                enableEditing: false,
            },
            {
                accessorKey: 'marketPrice',
                header: 'Giá thị trường',
                enableEditing: false,
            },
        ],
        [validationErrors],
    );
    const {
        data: fetchedItems = [],
        isError: isLoadingItemsError,
        isFetching: isFetchingItems,
        isLoading: isLoadingItems,
    } = useGetItems(orderId);

    const table = useMaterialReactTable({
        columns,
        data: fetchedItems,
        createDisplayMode: 'modal', //default ('row', and 'custom' are also available)
        editDisplayMode: 'modal', //default ('row', 'cell', 'table', and 'custom' are also available)
        getRowId: (row) => row.id,
        muiToolbarAlertBannerProps: isLoadingItemsError
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
        state: {
            isLoading: isLoadingItems,
            showAlertBanner: isLoadingItemsError,
            showProgressBars: isFetchingItems,
        },
    });

    return <MaterialReactTable table={table} />;
};

//READ hook (get items from api)
function useGetItems(orderId) {
    return useQuery({
        queryKey: ['items'],
        queryFn: async () => {
            const token = Cookies.get("token");
            const response = await axios.get(`https://shoestore-be.onrender.com/order/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            console.log(response)
            return (response.data?.data.items);
        },
        refetchOnWindowFocus: false,
    });
}


const queryClient = new QueryClient();

const Item = () => {
    const { orderId } = useParams();
    return !orderId ? (<>Loading</>) : (<QueryClientProvider client={queryClient}>
        <Example />
    </QueryClientProvider>);
};

export default Item;

const validateRequired = (value) => !!value.length;
const validateEmail = (email) =>
    !!email.length &&
    email
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        );

function validateItem(item) {
    return {
        firstName: !validateRequired(item.firstName)
            ? 'First Name is Required'
            : '',
        lastName: !validateRequired(item.lastName) ? 'Last Name is Required' : '',
        email: !validateEmail(item.email) ? 'Incorrect Email Format' : '',
    };
}
