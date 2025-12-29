package com.event.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    @Autowired
    private Cloudinary cloudinary;

    /**
     * Generic method to upload any file to Cloudinary under a given folder
     */
    // public String uploadFile(MultipartFile file, String folder) throws IOException {
        
    //   System.out.println(file+"File inside upload file");  
    //     if (file == null || file.isEmpty()) {
    //         throw new IOException("File is empty");
    //     }

    //     try {
    //         Map<String, Object> options = ObjectUtils.asMap(
    //                 "folder", folder,
    //                 "resource_type", "auto",
    //                 "transformation", "f_auto,q_auto"
    //         );

    //         Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), options);

    //         System.out.println(result.get("secure_url") + "Secure url from cloudinary");
    //         return (String) result.get("secure_url");

    //     } catch (IOException e) {
    //   System.out.println(file+"File inside upload file error");  

    //         throw new IOException("Failed to upload file to Cloudinary", e);
    //     }
    // }
public String uploadFile(MultipartFile file, String folder) throws IOException {
        // if (file == null || file.isEmpty()) {
        //     throw new IOException("File is empty");
        // }

        System.out.println("Uploading file to Cloudinary: " + file.getOriginalFilename());

        try {
            Map<String, Object> options = ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", "auto",
                    "transformation", "f_auto,q_auto"
            );

            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), options);

            System.out.println(result.get("secure_url") + " Secure URL from Cloudinary");
            return (String) result.get("secure_url");

        } catch (IOException e) {
            System.out.println("Failed to upload file: " + file.getOriginalFilename());
            throw new IOException("Failed to upload file to Cloudinary", e);
        }
    }
    // ------------------ Specific folders ------------------

    public String uploadProgramImage(MultipartFile file) throws IOException {
        return uploadFile(file, "event/programs");
    }

    public String uploadVenueImage(MultipartFile file) throws IOException {
        return uploadFile(file, "event/venues");
    }

    public String uploadUserDocument(MultipartFile file) throws IOException {
        return uploadFile(file, "event/users");
    }

    // Optional: old methods for backward compatibility
    public String uploadProfileImage(MultipartFile file) throws IOException {
        return uploadFile(file, "event/profiles");
    }

    public String uploadIdCardImage(MultipartFile file) throws IOException {
        return uploadFile(file, "event/id-cards");
    }

    public String uploadDocumentImage(MultipartFile file) throws IOException {
        return uploadFile(file, "event/documents");
    }

    public String uploadBookImage(MultipartFile file) throws IOException {
        return uploadFile(file, "event/books");
    }

    // ------------------ Delete file by public ID ------------------

    public boolean deleteImage(String publicId) {
        if (publicId == null || publicId.isEmpty()) return false;

        try {
            Map<?, ?> result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            return "ok".equals(result.get("result"));
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }
    }

    // ------------------ Extract public ID from URL ------------------

    public String getPublicIdFromUrl(String url) {
        if (url == null || url.isEmpty()) return null;

        // Cloudinary URL example:
        // https://res.cloudinary.com/<cloud_name>/image/upload/v1234567890/bookbridge/programs/uuid.jpg
        int uploadIndex = url.indexOf("/upload/");
        if (uploadIndex < 0) return null;

        String publicIdWithExtension = url.substring(uploadIndex + 8); // skip "/upload/"
        // Remove version if present: v1234567890/
        if (publicIdWithExtension.startsWith("v")) {
            int slashIndex = publicIdWithExtension.indexOf('/');
            if (slashIndex > 0) {
                publicIdWithExtension = publicIdWithExtension.substring(slashIndex + 1);
            }
        }
        // Remove file extension
        int dotIndex = publicIdWithExtension.lastIndexOf('.');
        return (dotIndex > 0) ? publicIdWithExtension.substring(0, dotIndex) : publicIdWithExtension;
    }
}
