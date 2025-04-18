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
                accessorKey: 'id',
                header: 'Id',
                Edit: ({ cell, column, row, table }) =>
                    <></>
                ,
            },
            {
                accessorKey: 'orderNums',
                header: 'Số thứ tự',
                size: 1
            },
            {
                accessorKey: 'image',
                header: 'Hình ảnh',
                enableEditing: false,
                Edit: ({ cell, column, row, table }) =>
                    <>
                        <TextField type='file' onChange={(event) => { handleFileChange(event); row._valuesCache[column.id] = event.target.files[0] }} inputProps={{ multiple: false, accept: "image/*", }} />
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                            <img src={image ? image : row.original.image} height={300} />
                        </Box>

                    </>
                ,
                Cell: ({ renderedCellValue }) => {
                    return <img src={renderedCellValue} height={300} />
                },
            },

        ],
        [validationErrors],
    );

    //call CREATE hook
    const { mutateAsync: createHightLightPic, isPending: isCreatingHightLightPic } =
        useCreateHightLightPic(productId);
    //call READ hook
    const {
        data: fetchedHightLightPics = [],
        isError: isLoadingHightLightPicsError,
        isFetching: isFetchingHightLightPics,
        isLoading: isLoadingHightLightPics,
    } = useGetHightLightPics({ productId });

    //call UPDATE hook
    const { mutateAsync: updateHightLightPic, isPending: isUpdatingHightLightPic } =
        useUpdateHightLightPic(productId);
    //call DELETE hook
    const { mutateAsync: deleteHightLightPic, isPending: isDeletingHightLightPic } =
        useDeleteHightLightPic(productId);

    //CREATE action
    const handleCreateHightLightPic = async ({ values, table }) => {
        const newValidationErrors = values;
        // if (Object.values(newValidationErrors).some((error) => error)) {
        //     setValidationErrors(newValidationErrors);
        //     return;
        // }
        setValidationErrors({});
        await createHightLightPic(values);
        table.setCreatingRow(null); //exit creating mode
    };

    //UPDATE action
    const handleSaveHightLightPic = async ({ values, table }) => {
        const newValidationErrors = values
        // if (Object.values(newValidationErrors).some((error) => error)) {
        //     setValidationErrors(newValidationErrors);
        //     return;
        // }
        setValidationErrors({});
        await updateHightLightPic(values);
        table.setEditingRow(null); //exit editing mode
    };

    //DELETE action
    const openDeleteConfirmModal = (row) => {
        if (window.confirm('Are you sure you want to delete this variant?')) {
            deleteHightLightPic(row.original);
        }
    };

    const table = useMaterialReactTable({
        columns,
        data: fetchedHightLightPics,
        initialState: { columnVisibility: { id: false } },
        createDisplayMode: 'modal', //default ('row', and 'custom' are also available)
        editDisplayMode: 'modal', //default ('row', 'cell', 'table', and 'custom' are also available)
        enableEditing: true,
        getRowId: (row) => row.id,
        muiToolbarAlertBannerProps: isLoadingHightLightPicsError
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
        onCreatingRowSave: handleCreateHightLightPic,
        onEditingRowCancel: () => setValidationErrors({}),
        onEditingRowSave: handleSaveHightLightPic,
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
                Tạo ảnh nổi bật mới
            </Button>
        ),
        state: {
            isLoading: isLoadingHightLightPics,
            isSaving: isCreatingHightLightPic || isUpdatingHightLightPic || isDeletingHightLightPic,
            showAlertBanner: isLoadingHightLightPicsError,
            showProgressBars: isFetchingHightLightPics,
        },
    });

    return <MaterialReactTable table={table} />;
};

//CREATE hook (post new variant to api)
function useCreateHightLightPic(productId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data) => {
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

            const sendData = {
                'hightLightPics': data,
                'action': 'create'
            }
            const response = await axios.patch(`http://localhost:3030/product/${productId}`, sendData)
            return (response.data);
        },
        //client side optimistic update
        onSuccess: () => {
            queryClient.invalidateQueries(['overspecs']);
        },
        // onSettled: () => queryClient.invalidateQueries({ queryKey: ['overspecs'] }), //refetch overspecs after mutation, disabled for demo
    });
}

//READ hook (get overspecs from api)
function useGetHightLightPics({ productId }) {
    return useQuery({
        queryKey: ['overspecs'],
        queryFn: async () => {
            const response = await axios.get(`http://localhost:3030/product/${productId}`)
            const list = response.data?.hightLightPics.map((text, index) => {
                return { id: index + 1, orderNums: index + 1, image: text };
            });
            return (list);
        },
        refetchOnWindowFocus: false,
    });
}

//UPDATE hook (put variant in api)
function useUpdateHightLightPic(productId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data) => {
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
            const sendData = {
                'hightLightPics': data,
                'action': 'update'
            }
            const response = await axios.patch(`http://localhost:3030/product/${productId}`, sendData)
            console.log(response);
        },
        //client side optimistic update
        onSuccess: () => {
            queryClient.invalidateQueries(['overspecs']);
        },
        // onSettled: () => queryClient.invalidateQueries({ queryKey: ['overspecs'] }), //refetch overspecs after mutation, disabled for demo
    });
}

//DELETE hook (delete variant in api)
function useDeleteHightLightPic(productId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data) => {
            const sendData = {
                'hightLightPics': data,
                'action': 'delete'
            }
            const response = await axios.patch(`http://localhost:3030/product/${productId}`, sendData)
            console.log(response);
        },
        //client side optimistic update
        onSuccess: () => {
            queryClient.invalidateQueries(['overspecs']);
        },
        // onSettled: () => queryClient.invalidateQueries({ queryKey: ['overspecs'] }), //refetch overspecs after mutation, disabled for demo
    });
}

const queryClient = new QueryClient();

const HightLightPic = () => {
    const { productId } = useParams();
    return !productId ? (<>Loading</>) : (<QueryClientProvider client={queryClient}>
        <Example productId={productId} />
    </QueryClientProvider>);
};

export default HightLightPic;

const validateRequired = (value) => !!value.length;
const validateEmail = (email) =>
    !!email.length &&
    email
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        );

function validateHightLightPic(variant) {
    return {
        firstName: !validateRequired(variant.firstName)
            ? 'First Name is Required'
            : '',
        lastName: !validateRequired(variant.lastName) ? 'Last Name is Required' : '',
        email: !validateEmail(variant.email) ? 'Incorrect Email Format' : '',
    };
}
