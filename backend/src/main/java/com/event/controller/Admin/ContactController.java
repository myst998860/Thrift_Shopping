package com.event.controller.Admin;


import com.event.model.Contact;
import com.event.repository.ContactRepo;
import com.event.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contacts")
public class ContactController {

    @Autowired
    private ContactRepo contactRepo;

    @Autowired
    private CloudinaryService cloudinaryService;
    
    
    @GetMapping("/all")
    public ResponseEntity<List<Contact>> getAllContacts() {
        return ResponseEntity.ok(contactRepo.findAll());
    }

    @PostMapping("/new")
    public ResponseEntity<?> createContact(
            @RequestParam("fullName") String fullName,
            @RequestParam("contactNumber") String contactNumber,
            @RequestParam("emailAddress") String emailAddress,
            @RequestParam("message") String message,
            @RequestParam(value = "images", required = false) MultipartFile[] imageFiles) {

        List<String> uploadedUrls = new ArrayList<>();

        try {
            if (imageFiles != null && imageFiles.length > 0) {
                for (MultipartFile file : imageFiles) {
                    if (file != null && !file.isEmpty()) {
                        String uploadedUrl = cloudinaryService.uploadFile(file, "contacts");
                        System.out.println("Uploaded URL: " + uploadedUrl);
                        uploadedUrls.add(uploadedUrl); // <-- MUST add to list
                    }
                }
            }

            Contact contact = new Contact();
            contact.setFullName(fullName);
            contact.setContactNumber(contactNumber);
            contact.setEmailAddress(emailAddress);
            contact.setMessage(message);
            contact.setImages(uploadedUrls); // <-- save URLs to entity

            Contact savedContact = contactRepo.save(contact);
            System.out.println("Saved Contact: " + savedContact);

            return new ResponseEntity<>(savedContact, HttpStatus.CREATED);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create contact: " + e.getMessage()));
        }
    }

    
}