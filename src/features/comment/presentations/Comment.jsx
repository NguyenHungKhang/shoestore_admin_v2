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
                accessorKey: 'userId._id',
                header: 'Người dùng',
                enableEditing: false,
                muiEditTextFieldProps: {
                    required: true,
                    error: !!validationErrors?.firstName,
                    helperText: validationErrors?.firstName,
                    //remove any previous validation errors when comment focuses on the input
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            firstName: undefined,
                        }),
                    //optionally add validation checking for onBlur or onChange
                },
            },
            {
                accessorKey: 'productId',
                header: 'Sản phẩm',
                enableEditing: false,
                muiEditTextFieldProps: {
                    required: true,
                    error: !!validationErrors?.firstName,
                    helperText: validationErrors?.firstName,
                    //remove any previous validation errors when comment focuses on the input
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            firstName: undefined,
                        }),
                    //optionally add validation checking for onBlur or onChange
                },
            },
            {
                accessorKey: 'orderId',
                header: 'Đơn hàng',
                enableEditing: false,
                muiEditTextFieldProps: {
                    required: true,
                    error: !!validationErrors?.firstName,
                    helperText: validationErrors?.firstName,
                    //remove any previous validation errors when comment focuses on the input
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            firstName: undefined,
                        }),
                    //optionally add validation checking for onBlur or onChange
                },
            },
            {
                accessorKey: 'content',
                header: 'Nội dung',
                enableEditing: false,
                muiEditTextFieldProps: {
                    required: true,
                    error: !!validationErrors?.firstName,
                    helperText: validationErrors?.firstName,
                    //remove any previous validation errors when comment focuses on the input
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            firstName: undefined,
                        }),
                    //optionally add validation checking for onBlur or onChange
                },
            },
            {
                accessorKey: 'star',
                header: 'Số sao đánh giá',
                enableEditing: false,
                muiEditTextFieldProps: {
                    required: true,
                    type: 'number',
                    error: !!validationErrors?.lastName,
                    helperText: validationErrors?.lastName,
                    //remove any previous validation errors when comment focuses on the input
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            lastName: undefined,
                        }),
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
    const { mutateAsync: createComment, isPending: isCreatingComment } =
        useCreateComment();
    //call READ hook
    const {
        data: fetchedComments = [],
        isError: isLoadingCommentsError,
        isFetching: isFetchingComments,
        isLoading: isLoadingComments,
    } = useGetComments();

    //call UPDATE hook
    const { mutateAsync: updateComment, isPending: isUpdatingComment } =
        useUpdateComment();
    //call DELETE hook
    const { mutateAsync: deleteComment, isPending: isDeletingComment } =
        useDeleteComment();

    //CREATE action
    const handleCreateComment = async ({ values, table }) => {
        const newValidationErrors = values;
        // if (Object.values(newValidationErrors).some((error) => error)) {
        //     setValidationErrors(newValidationErrors);
        //     return;
        // }
        setValidationErrors({});
        await createComment(values);
        table.setCreatingRow(null); //exit creating mode
    };

    //UPDATE action
    const handleSaveComment = async ({ values, table }) => {
        const newValidationErrors = values
        // if (Object.values(newValidationErrors).some((error) => error)) {
        //     setValidationErrors(newValidationErrors);
        //     return;
        // }
        setValidationErrors({});
        await updateComment(values);
        table.setEditingRow(null); //exit editing mode
    };

    //DELETE action
    const openDeleteConfirmModal = (row) => {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            deleteComment(row.original._id);
        }
    };

    const table = useMaterialReactTable({
        columns,
        data: fetchedComments,
        createDisplayMode: 'modal', //default ('row', and 'custom' are also available)
        editDisplayMode: 'modal', //default ('row', 'cell', 'table', and 'custom' are also available)
        enableEditing: true,
        getRowId: (row) => row.id,
        muiToolbarAlertBannerProps: isLoadingCommentsError
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
        onCreatingRowSave: handleCreateComment,
        onEditingRowCancel: () => setValidationErrors({}),
        onEditingRowSave: handleSaveComment,
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
            </Box>
        ),
        state: {
            isLoading: isLoadingComments,
            isSaving: isCreatingComment || isUpdatingComment || isDeletingComment,
            showAlertBanner: isLoadingCommentsError,
            showProgressBars: isFetchingComments,
        },
    });

    return <MaterialReactTable table={table} />;
};

//CREATE hook (post new comment to api)
function useCreateComment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data) => {
            delete data._id;
            delete data.slug;
            delete data.createdAt;
            delete data.updatedAt;
            const userId = data['userId._id']
            delete data['userId._id'];
            data.userId = userId;
            if (!data.parentCommentId) {
                delete data.parentCommentId;
            }
            const response = await axios.post(`http://localhost:3030/comment/by-admin`, data)
            return (response.data);
        },
        //client side optimistic update
        onSuccess: () => {
            queryClient.invalidateQueries(['comments']);
        },
        // onSettled: () => queryClient.invalidateQueries({ queryKey: ['comments'] }), //refetch comments after mutation, disabled for demo
    });
}

//READ hook (get comments from api)
function useGetComments() {
    return useQuery({
        queryKey: ['comments'],
        queryFn: async () => {
            const response = await axios.get(`http://localhost:3030/comment/by-admin`)
            return (response.data?.data);
        },
        refetchOnWindowFocus: false,
    });
}

//UPDATE hook (put comment in api)
function useUpdateComment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data) => {
            const id = data._id;
            delete data._id;
            delete data.createdAt;
            delete data.updatedAt;
            delete data.productId;
            delete data.orderId;
            delete data['userId._id'];
            if (!data.parentCommentId) {
                delete data.parentCommentId;
            }
            const response = await axios.patch(`http://localhost:3030/comment/by-admin/${id}`, data)
            console.log(response);
        },
        //client side optimistic update
        onSuccess: () => {
            queryClient.invalidateQueries(['comments']);
        },
        // onSettled: () => queryClient.invalidateQueries({ queryKey: ['comments'] }), //refetch comments after mutation, disabled for demo
    });
}

//DELETE hook (delete comment in api)
function useDeleteComment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (commentId) => {
            const response = await axios.delete(`http://localhost:3030/comment/by-admin/${commentId}`)
            console.log(response)
        },
        //client side optimistic update
        onSuccess: () => {
            queryClient.invalidateQueries(['comments']);
        },
        // onSettled: () => queryClient.invalidateQueries({ queryKey: ['comments'] }), //refetch comments after mutation, disabled for demo
    });
}

const queryClient = new QueryClient();

const Comment = () => (
    //Put this with your other react-query providers near root of your app
    <QueryClientProvider client={queryClient}>
        <Example />
    </QueryClientProvider>
);

export default Comment;

const validateRequired = (value) => !!value.length;
const validateEmail = (email) =>
    !!email.length &&
    email
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        );

function validateComment(comment) {
    return {
        firstName: !validateRequired(comment.firstName)
            ? 'First Name is Required'
            : '',
        lastName: !validateRequired(comment.lastName) ? 'Last Name is Required' : '',
        email: !validateEmail(comment.email) ? 'Incorrect Email Format' : '',
    };
}
