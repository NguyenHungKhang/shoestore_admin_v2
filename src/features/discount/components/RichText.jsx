import {
    Grid,
    Container,
    Toolbar,
    Typography,
    TextField,
    Button,
    Card,
    CardMedia,
} from "@mui/material";
import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
const RichText = ({row, column}) => {
    return (
        <>
            <Grid
                container
                sx={{
                    maxWidth: "1250px",
                    backgroundColor: "#eeebeb",
                    display: "flex",
                    margin: "auto",
                    marginTop: "8px",
                }}
            >
                <Grid item xs={12}>
                    <Toolbar
                        sx={{
                            flexDirection: "column",
                            margin: "10px",
                            backgroundColor: "#eeebeb",
                            borderRadius: "10px",
                            boxShadow: (theme) => theme.shadows[3],
                            display: "flex",
                        }}
                    >
                        <MyRichTextEditor row={row} column={column} />
                    </Toolbar>
                </Grid>
            </Grid>
        </>
    );
};

const MyRichTextEditor = ({row, column}) => {
    const [editorContent, setEditorContent] = useState("");
    const fontOptions = ["Arial", "Times New Roman", "Verdana"];
    var toolbarOptions = [
        ["bold", "italic", "underline", "strike"], // toggled buttons
        ["blockquote", "code-block"]

        [{ header: 1 }, { header: 2 }], // custom button values
        [{ list: "ordered" }, { list: "bullet" }],
        [{ script: "sub" }, { script: "super" }], // superscript/subscript
        [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
        [{ direction: "rtl" }], // text direction

        [{ size: ["small", false, "large", "huge"] }], // custom dropdown
        [{ header: [1, 2, 3, 4, 5, 6, false] }],

        [{ color: [] }, { background: [] }], // dropdown with defaults from theme
        [{ font: [] }],
        [{ align: [] }],

        ["clean"],
    ];
    const module = {
        toolbar: toolbarOptions,
    };
    const handleEditorChange = (content) => {
        row._valuesCache[column.id] = content
        setEditorContent(content);
    };
    const handleSave = () => {
        // Làm điều gì đó với nội dung đã chỉnh sửa, ví dụ: lưu lên máy chủ
        console.log("Nội dung đã chỉnh sửa:", editorContent);
    };

    return (
        <div>
            <ReactQuill
                modules={module}
                theme="snow"
                value={editorContent}
                defaultValue={ row._valuesCache[column.id]}
                onChange={handleEditorChange}
            />
            <div className="ql-editor">
                <div dangerouslySetInnerHTML={{ __html:  row._valuesCache[column.id] }} />
            </div>

        </div>
    );
};
export default RichText;
