package com.event.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import com.event.model.Venue;
import com.event.repository.VenueRepo;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;

@RestController
public class ImageProxyController {

    private final RestTemplate restTemplate = new RestTemplate();

    @Autowired
    private VenueRepo venueRepo;

    @GetMapping("/proxy/image")
    public ResponseEntity<byte[]> proxyImage(@RequestParam Long venue_id) {
        Venue venue = venueRepo.findById(venue_id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Venue not found"));

        String url = venue.getImageUrl();
        if (url == null || url.isBlank()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No image set for venue");
        }

        try {
            URL imageUrl = new URL(url);
            HttpURLConnection conn = (HttpURLConnection) imageUrl.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);

            try (InputStream in = conn.getInputStream()) {
                byte[] bytes = in.readAllBytes();
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.parseMediaType(conn.getContentType()));
                return new ResponseEntity<>(bytes, headers, HttpStatus.OK);
            }
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Unable to fetch image", e);
        }
    }
}

