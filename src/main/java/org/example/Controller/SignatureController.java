package org.example.Controller;

import org.example.Model.Signature;
import org.example.Rapository.SignatureRepository;
import org.example.Request.SignatureRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

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
}
