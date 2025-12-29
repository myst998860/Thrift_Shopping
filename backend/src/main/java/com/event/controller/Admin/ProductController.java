package com.event.controller.Admin;

import com.event.model.Product;
import com.event.repository.ProductRepo;
import com.event.service.CloudinaryService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepo productRepo;

    @Autowired
    private CloudinaryService cloudinaryService;

    // ------------------------------------------------------
    // ✅ GET ALL PRODUCTS
    // ------------------------------------------------------
    @GetMapping("/all")
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productRepo.findAll());
    }

    // ------------------------------------------------------
    // ✅ GET SINGLE PRODUCT
    // ------------------------------------------------------
    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        Optional<Product> productOpt = productRepo.findById(id);
        if (productOpt.isPresent()) {
            return ResponseEntity.ok(productOpt.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Product not found"));
        }
    }

    // ------------------------------------------------------
    // ✅ CREATE NEW PRODUCT
    // ------------------------------------------------------
    @PostMapping("/new")
    public ResponseEntity<?> createProduct(
            @RequestParam("productName") String productName,
            @RequestParam("description") String description,
            @RequestParam("price") BigDecimal price,
            @RequestParam(value = "discountPrice", required = false) BigDecimal discountPrice,
            @RequestParam(value = "quantity", required = false) Integer quantity,
            @RequestParam(value = "quality", required = false) Integer quality,
            @RequestParam(value = "isAvailable", required = false, defaultValue = "true") Boolean isAvailable,
            @RequestParam(value = "sku", required = false) String sku,
            @RequestParam(value = "brand", required = false) String brand,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "weight", required = false) Double weight,
            @RequestParam(value = "height", required = false) Double height,
            @RequestParam(value = "width", required = false) Double width,
            @RequestParam(value = "length", required = false) Double length,
            @RequestParam(value = "images", required = false) MultipartFile[] imageFiles
    ) {
        try {
            List<String> imageUrls = new ArrayList<>();

            if (imageFiles != null) {
                for (MultipartFile file : imageFiles) {
                    if (!file.isEmpty()) {
                        String url = cloudinaryService.uploadFile(file, "products");
                        imageUrls.add(url);
                    }
                }
            }

            Product product = new Product();
            product.setProductName(productName);
            product.setDescription(description);
            product.setPrice(price);
            product.setDiscountPrice(discountPrice);
            product.setQuantity(quantity != null ? quantity : 0);
            product.setQuality(quality != null ? quality : 0);
            product.setAvailable(isAvailable != null ? isAvailable : true);
            product.setSku(sku);
            product.setBrand(brand);
            product.setCategory(category);
            product.setWeight(weight != null ? weight : 0.0);
            product.setHeight(height != null ? height : 0.0);
            product.setWidth(width != null ? width : 0.0);
            product.setLength(length != null ? length : 0.0);
            product.setImages(imageUrls);
            product.setCreatedAt(java.time.LocalDateTime.now());
            product.setUpdatedAt(java.time.LocalDateTime.now());

            Product savedProduct = productRepo.save(product);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedProduct);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Product creation failed: " + e.getMessage()));
        }
    }

    // ------------------------------------------------------
    // ✅ UPDATE PRODUCT
    // ------------------------------------------------------
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateProduct(
            @PathVariable Long id,
            @RequestParam("productName") String productName,
            @RequestParam("description") String description,
            @RequestParam("price") BigDecimal price,
            @RequestParam(value = "discountPrice", required = false) BigDecimal discountPrice,
            @RequestParam("quantity") int quantity,
            @RequestParam("quality") int quality,
            @RequestParam("isAvailable") boolean isAvailable,
            @RequestParam("sku") String sku,
            @RequestParam("brand") String brand,
            @RequestParam("category") String category,
            @RequestParam("weight") double weight,
            @RequestParam("height") double height,
            @RequestParam("width") double width,
            @RequestParam("length") double length,
            @RequestParam(value = "tags", required = false) List<String> tags,
            @RequestParam(value = "images", required = false) MultipartFile[] imageFiles
    ) {

        Optional<Product> optionalProduct = productRepo.findById(id);
        if (optionalProduct.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Product not found"));
        }

        try {
            Product product = optionalProduct.get();

            // Upload new images (if provided)
            List<String> imageUrls = product.getImages(); // keep old images

            if (imageFiles != null) {
                for (MultipartFile file : imageFiles) {
                    if (!file.isEmpty()) {
                        String url = cloudinaryService.uploadFile(file, "products");
                        imageUrls.add(url);
                    }
                }
            }

            // Update fields
            product.setProductName(productName);
            product.setDescription(description);
            product.setPrice(price);
            product.setDiscountPrice(discountPrice);
            product.setQuantity(quantity);
            product.setQuality(quality);
            product.setAvailable(isAvailable);
            product.setSku(sku);
            product.setBrand(brand);
            product.setCategory(category);
            product.setWeight(weight);
            product.setHeight(height);
            product.setWidth(width);
            product.setLength(length);
          
            product.setImages(imageUrls);
            product.setUpdatedAt(java.time.LocalDateTime.now());

            Product updated = productRepo.save(product);

            return ResponseEntity.ok(updated);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error updating product: " + e.getMessage()));
        }
    }

    // ------------------------------------------------------
    // ✅ DELETE PRODUCT
    // ------------------------------------------------------
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        if (!productRepo.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Product not found"));
        }

        productRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Product deleted successfully"));
    }
}
