package com.jqhlab.controller;

import com.jqhlab.dto.ApiResponse;
import com.jqhlab.dto.EventLogRequest;
import com.jqhlab.service.DataCenterService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/data")
public class DataCenterController {
    private final DataCenterService dataCenterService;

    public DataCenterController(DataCenterService dataCenterService) {
        this.dataCenterService = dataCenterService;
    }

    @PostMapping("/events")
    public ApiResponse<?> record(@RequestBody EventLogRequest request, HttpServletRequest servletRequest) {
        dataCenterService.record(request, servletRequest);
        return ApiResponse.success(Map.of("accepted", true));
    }

    @GetMapping("/overview")
    public ApiResponse<?> overview(@RequestParam(required = false) Integer days) {
        return ApiResponse.success(dataCenterService.overview(days));
    }
}
