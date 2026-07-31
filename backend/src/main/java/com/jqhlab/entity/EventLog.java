package com.jqhlab.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("event_logs")
public class EventLog {
    @TableId(type = IdType.AUTO)
    private Long id;
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
    private String ipAddress;
    private String userAgent;
    @TableField
    private LocalDateTime createdAt;
}
