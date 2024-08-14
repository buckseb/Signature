package org.example.Controller;

import org.example.Model.Signature;
import org.example.Rapository.SignatureRepository;
import org.example.Request.SignatureRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/signatures")
public class SignatureController {

    @Autowired
    private SignatureRepository signatureRepository;

    @PostMapping("/save")
    public ResponseEntity<Map<String, String>> saveSignature(@RequestBody SignatureRequest request) {
        Map<String, String> response = new HashMap<>();
        try {
            // Check if both signatures are non-empty
            if (request.getSignature1() == null || request.getSignature1().trim().isEmpty() ||
                    request.getSignature2() == null || request.getSignature2().trim().isEmpty()) {
                response.put("message", "Both signatures are required");
                return ResponseEntity.badRequest().body(response);
            }

            Signature signature = new Signature();
            signature.setData(request.getSignature1());
            signature.setData2(request.getSignature2());

            // Log data to verify
            System.out.println("Saving signature: " + signature);

            signatureRepository.save(signature);

            response.put("message", "Signatures saved successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            response.put("message", "Failed to save signatures");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/view/{id}")
    public ResponseEntity<Map<String, String>> viewSignatures(@PathVariable Long id) {
        Map<String, String> response = new HashMap<>();
        try {
            Optional<Signature> optionalSignature = signatureRepository.findById(id);
            if (!optionalSignature.isPresent()) {
                response.put("message", "Signature not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            Signature signature = optionalSignature.get();

            // Return Base64-encoded image data
            response.put("signature1Base64", signature.getData());
            response.put("signature2Base64", signature.getData2());

            response.put("message", "Signatures retrieved successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            response.put("message", "Failed to retrieve signatures");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
