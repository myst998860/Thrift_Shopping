package com.event.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.event.dto.CartDTO;
import com.event.dto.CartItemDTO;
import com.event.model.Cart;
import com.event.model.CartItem;
import com.event.model.User;
import com.event.model.Venue;
import com.event.repository.CartItemRepo;
import com.event.repository.CartRepo;
import com.event.repository.UserRepo;
import com.event.repository.VenueRepo;

@Service
public class CartService {

    @Autowired
    private CartRepo cartRepo;

    @Autowired
    private CartItemRepo cartItemRepo;
    
    @Autowired
    private VenueRepo venuRepo;

    public Cart addToCart(Long userId, Long venueId, Integer quantity) {

        Cart cart = cartRepo.findByUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUserId(userId);
                    return cartRepo.save(newCart);
                });

        CartItem item = cartItemRepo.findByCartIdAndVenueId(cart.getId(), venueId)
                .orElseGet(() -> {
                    CartItem newItem = new CartItem();
                    newItem.setCart(cart);
                    newItem.setVenueId(venueId);
                    newItem.setQuantity(0);
                    return newItem;
                });

        item.setQuantity(item.getQuantity() + quantity);
        cartItemRepo.save(item);

        return cart;
    }

    public Cart getCart(Long userId) {
        return cartRepo.findByUserId(userId).orElse(null);
    }
    public CartItem updateItem(Long cartItemId, Integer quantity) {
        CartItem item = cartItemRepo.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        item.setQuantity(quantity);
        return cartItemRepo.save(item);
    }
    public void removeItem(Long cartItemId) {
        cartItemRepo.deleteById(cartItemId);
    }
    public void clearCart(Long userId) {
        Cart cart = cartRepo.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        cartItemRepo.deleteAll(cart.getItems());
        cart.getItems().clear();

        cartRepo.save(cart);
    }
    
    public CartDTO getCartByUserId(Long userId) {
        Optional<Cart> cartOpt = cartRepo.findByUserId(userId);
        if (!cartOpt.isPresent()) return null;

        Cart cart = cartOpt.get(); // ✅ get the entity from DB

        CartDTO cartDTO = new CartDTO();
        cartDTO.setId(cart.getId());
        cartDTO.setUserId(cart.getUserId());

        List<CartItemDTO> itemDTOs = cart.getItems().stream().map(item -> {
            CartItemDTO dto = new CartItemDTO();
            dto.setId(item.getId());
            dto.setCartId(cart.getId());
            dto.setQuantity(item.getQuantity());
            dto.setVenueId(item.getVenueId());

            Venue venue = venuRepo.findById(item.getVenueId()).orElse(null);
            if (venue != null) {
                dto.setVenueName(venue.getVenueName());
                dto.setPrice(venue.getPrice());
            }
            return dto;
        }).collect(Collectors.toList());

        cartDTO.setItems(itemDTOs);
        return cartDTO;
    }
}
