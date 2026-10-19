package com.smartlostfound.controller;

import com.smartlostfound.dto.common.ApiResponse;
import com.smartlostfound.dto.matching.MatchResultDto;
import com.smartlostfound.service.MatchingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/matches")
@Tag(name = "Matching Engine", description = "Endpoints for computing deterministic multi-factor match candidates with explanations")
public class MatchingController {

    private final MatchingService matchingService;

    public MatchingController(MatchingService matchingService) {
        this.matchingService = matchingService;
    }

    @GetMapping("/item/{itemId}")
    @Operation(summary = "Find and rank potential matching reports for an item with scoring explanations")
    public ResponseEntity<ApiResponse<List<MatchResultDto>>> getMatchesForItem(@PathVariable Long itemId) {
        List<MatchResultDto> matches = matchingService.findMatchesForItem(itemId);
        return ResponseEntity.ok(ApiResponse.success(matches));
    }
}
