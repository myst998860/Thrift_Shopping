package com.event.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
public class FileStorageService {

    @Autowired
    private Cloudinary cloudinary;

    /**
     * Uploads a program image to Cloudinary.
     * @param file MultipartFile from request
     * @return URL of uploaded image
     * @throws IOException
     */
    public String storeProgramImage(MultipartFile file) throws IOException {
        return uploadToCloudinary(file, "programs");
    }

    /**
     * Uploads a venue image to Cloudinary.
     * @param file MultipartFile from request
     * @return URL of uploaded image
     * @throws IOException
     */
    public String storeVenueImage(MultipartFile file) throws IOException {
        return uploadToCloudinary(file, "venues");
    }

    /**
     * Uploads user documents (PAN, business transcripts, etc.) to Cloudinary.
     * @param file MultipartFile from request
     * @param folder Optional folder name ("pancards", "transcripts")
     * @return URL of uploaded file
     * @throws IOException
     */
    public String storeUserDocument(MultipartFile file, String folder) throws IOException {
        if(folder == null || folder.isEmpty()) folder = "users";
        return uploadToCloudinary(file, folder);
    }

    /**
     * Generic Cloudinary upload method.
     */
    private String uploadToCloudinary(MultipartFile file, String folder) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IOException("File is empty");
        }

        String publicId = folder + "/" + UUID.randomUUID().toString();

        Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                ObjectUtils.asMap(
                        "folder", folder,
                        "public_id", publicId,
                        "overwrite", true,
                        "resource_type", "auto"
                ));

        return uploadResult.get("secure_url").toString();
    }

    /**
     * Delete a file from Cloudinary using its URL.
     */
    public boolean deleteFile(String fileUrl) {
        if (fileUrl == null || !fileUrl.startsWith("http")) return false;

        try {
            String publicId = fileUrl.substring(fileUrl.indexOf("upload/") + 7);
            publicId = publicId.substring(0, publicId.lastIndexOf("."));

            Map result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            return "ok".equals(result.get("result"));
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
