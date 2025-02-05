import { GET_UPLOAD_SIGNATURE } from "../Graphql/mutations/getSignature";
import ME_QUERY from "../Graphql/query/meGql";
import { useMutation } from "@apollo/client";
import { checkImageModeration } from "./Purify";
import { toast } from "react-toastify";
import { useDeleteImage } from "./deleteImage";

// A reusable function for uploading images to Cloudinary
export const useUploadImage = () => {
  const {deleteImage} = useDeleteImage()
  const [getUploadSignature, { error, loading }] = useMutation(GET_UPLOAD_SIGNATURE,{
    refetchQueries: {query: ME_QUERY},
    awaitRefetchQueries: true
  });
  const uploadImage = async (cloudName, file, upload_preset, uploadFolder, fileName) => {
    try {
      const res = await getUploadSignature({
        variables: {
          upload_preset,
          uploadFolder,
        },
      });
  
      const { timestamp, signature } = res.data?.getUploadSignature;
  
      const data = new FormData();
      data.append("file", file);
      data.append("api_key", import.meta.env.VITE_CLOUD_API_KEY);
      data.append("upload_preset", upload_preset);
      data.append("folder", uploadFolder);
      data.append("timestamp", timestamp);
      data.append("signature", signature);
  
      // Set a custom name for the image
      const uniqueSuffix = Date.now(); // To avoid duplicate names
      const sanitizedFileName = fileName.replace(/\s+/g, "_"); // Replace spaces with underscores
      const publicId = `${uploadFolder}/${sanitizedFileName}_${uniqueSuffix}`; 
      data.append("public_id", publicId);
  
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: data }
      );
  
      if (!response.ok) throw new Error("Image upload failed");
  
      const uploadResult = await response.json();
  
      // Handle moderation result (optional)
      const moderation = await checkImageModeration(uploadResult.secure_url);
      if (moderation) {
        await deleteImage(cloudName, uploadResult.public_id);
        toast.warn("Image was rejected due to content moderation.");
        throw new Error("Image was rejected due to content moderation.");
      }
      
      return uploadResult;
    } catch (err) {
      console.error(`Image upload failed: ${err.message}`);
      return null;
    }
  };
  
  

  return { uploadImage, error, loading };
};
