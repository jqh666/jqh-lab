package com.jqhlab.service;

import com.jqhlab.dto.EventLogRequest;
import com.jqhlab.entity.EventLog;
import com.jqhlab.repository.EventLogMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DataCenterService {
    private final EventLogMapper eventLogMapper;

    public DataCenterService(EventLogMapper eventLogMapper) {
        this.eventLogMapper = eventLogMapper;
    }

    public void record(EventLogRequest request, HttpServletRequest servletRequest) {
        if (request == null || !StringUtils.hasText(request.getEventType())) {
            return;
        }

        EventLog log = new EventLog();
        log.setEventType(trim(request.getEventType(), 80));
        log.setPagePath(trim(request.getPagePath(), 500));
        log.setPageTitle(trim(request.getPageTitle(), 200));
        log.setReferrer(trim(request.getReferrer(), 500));
        log.setUserRole(trim(request.getUserRole(), 40));
        log.setDeviceType(trim(request.getDeviceType(), 40));
        log.setBrowser(trim(request.getBrowser(), 120));
        log.setTargetType(trim(request.getTargetType(), 80));
        log.setTargetId(trim(request.getTargetId(), 80));
        log.setTargetTitle(trim(request.getTargetTitle(), 200));
        log.setSessionId(trim(request.getSessionId(), 120));
        log.setMetadata(trim(request.getMetadata(), 2000));
        log.setIpAddress(trim(clientIp(servletRequest), 80));
        log.setUserAgent(trim(servletRequest.getHeader("User-Agent"), 1000));
        log.setCreatedAt(LocalDateTime.now());

        eventLogMapper.insert(log);
    }

    public Map<String, Object> overview(Integer days) {
        int rangeDays = days == null || days < 1 || days > 90 ? 7 : days;
        LocalDate startDate = LocalDate.now().minusDays(rangeDays - 1L);
        LocalDateTime since = startDate.atStartOfDay();

        Map<String, Object> overview = new HashMap<>();
        overview.put("days", rangeDays);
        overview.put("startDate", startDate.toString());
        overview.put("totalEvents", value(eventLogMapper.countEventsSince(since)));
        overview.put("visitors", value(eventLogMapper.countVisitorsSince(since)));
        overview.put("pageViews", value(eventLogMapper.countByTypeSince("page_view", since)));
        overview.put("aiMessages", value(eventLogMapper.countByTypeSince("ai_chat_send", since)));
        overview.put("aiSuccess", value(eventLogMapper.countByTypeSince("ai_chat_success", since)));
        overview.put("aiErrors", value(eventLogMapper.countByTypeSince("ai_chat_error", since)));
        overview.put("trend", fillTrend(eventLogMapper.trendByType("page_view", since), rangeDays));
        overview.put("topPages", eventLogMapper.topPages(since, 8));
        overview.put("topTargets", eventLogMapper.topTargets(since, 8));
        overview.put("eventBreakdown", eventLogMapper.eventBreakdown(since, 10));
        return overview;
    }

    private List<Map<String, Object>> fillTrend(List<Map<String, Object>> rows, int days) {
        Map<String, Long> values = new HashMap<>();
        for (Map<String, Object> row : rows) {
            values.put(String.valueOf(row.get("date")), ((Number) row.get("value")).longValue());
        }

        return java.util.stream.IntStream.range(0, days)
            .mapToObj((offset) -> {
                String date = LocalDate.now().minusDays(days - 1L - offset).toString();
                Map<String, Object> item = new HashMap<>();
                item.put("date", date);
                item.put("value", values.getOrDefault(date, 0L));
                return item;
            })
            .toList();
    }

    private long value(Long number) {
        return number == null ? 0L : number;
    }

    private String clientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(forwardedFor)) {
            return forwardedFor.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (StringUtils.hasText(realIp)) {
            return realIp;
        }
        return request.getRemoteAddr();
    }

    private String trim(String value, int maxLength) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.length() > maxLength ? trimmed.substring(0, maxLength) : trimmed;
    }
}
