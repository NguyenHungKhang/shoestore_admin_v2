import React, { useState } from 'react';

function ImageEditor({ image, setImage }) {
  const [previewImage, setPreviewImage] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setImage(reader.result); // Gửi giá trị ảnh đã chọn về nơi sử dụng ImageEditor
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
      setImage(null); // Gửi giá trị null về nếu không có ảnh được chọn
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      {previewImage && <img src={previewImage} width={230} height={100} />}
    </div>
  );
}

export default ImageEditor;