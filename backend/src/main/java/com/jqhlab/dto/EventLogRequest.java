package com.jqhlab.dto;

import lombok.Data;

@Data
public class EventLogRequest {
    private String eventType;
    private String pagePath;
    private String pageTitle;
    private String referrer;
    private String userRole;
    private String deviceType;
    private String browser;
    private String targetType;
    private String targetId;
    private String targetTitle;
    private String sessionId;
    private String metadata;
}
