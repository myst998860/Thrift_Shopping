package com.event.controller.Admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.event.dto.CartDTO;
import com.event.model.Cart;
import com.event.model.CartItem;
import com.event.service.CartService;

@RestController
@RequestMapping("/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    // ADD TO CART
    @PostMapping("/add")
    public ResponseEntity<Cart> addToCart(
            @RequestParam Long userId,
            @RequestParam Long venueId,
            @RequestParam(defaultValue = "1") Integer quantity
    ) {
        Cart cart = cartService.addToCart(userId, venueId, quantity);
        return ResponseEntity.ok(cart);  // always return a JSON object
    }


    // GET CART
//    @GetMapping("/{userId}")
//    public ResponseEntity<Cart> getCart(@PathVariable Long userId) {
//        return ResponseEntity.ok(cartService.getCart(userId));
//        
//    }
 // GET CART for frontend (returns DTO)
    @GetMapping("/{userId}")
    public ResponseEntity<CartDTO> getCart(@PathVariable Long userId) {
        CartDTO cartDTO = cartService.getCartByUserId(userId);
        if (cartDTO == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(cartDTO);
    }
    
  

    // UPDATE CART ITEM QUANTITY
    @PatchMapping("/update/{cartItemId}")
    public ResponseEntity<CartItem> updateItem(
            @PathVariable Long cartItemId,
            @RequestParam Integer quantity
    ) {
        return ResponseEntity.ok(cartService.updateItem(cartItemId, quantity));
    }

    // REMOVE A CART ITEM
    @DeleteMapping("/remove/{cartItemId}")
    public ResponseEntity<String> removeItem(@PathVariable Long cartItemId) {
        cartService.removeItem(cartItemId);
        return ResponseEntity.ok("Item removed from cart");
    }

    // CLEAR ENTIRE CART FOR A USER
    @DeleteMapping("/clear/{userId}")
    public ResponseEntity<String> clearCart(@PathVariable Long userId) {
        cartService.clearCart(userId);
        return ResponseEntity.ok("Cart cleared successfully");
    }
}

