package com.jqhlab.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.jqhlab.entity.EventLog;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Mapper
public interface EventLogMapper extends BaseMapper<EventLog> {
    @Select("""
        SELECT COALESCE(COUNT(*), 0) AS count
        FROM event_logs
        WHERE created_at >= #{since}
        """)
    Long countEventsSince(@Param("since") LocalDateTime since);

    @Select("""
        SELECT COALESCE(COUNT(DISTINCT COALESCE(NULLIF(session_id, ''), ip_address)), 0) AS count
        FROM event_logs
        WHERE created_at >= #{since}
        """)
    Long countVisitorsSince(@Param("since") LocalDateTime since);

    @Select("""
        SELECT COALESCE(COUNT(*), 0) AS count
        FROM event_logs
        WHERE event_type = #{eventType}
          AND created_at >= #{since}
        """)
    Long countByTypeSince(@Param("eventType") String eventType, @Param("since") LocalDateTime since);

    @Select("""
        SELECT TO_CHAR(DATE(created_at), 'YYYY-MM-DD') AS "date",
               COUNT(*) AS "value"
        FROM event_logs
        WHERE created_at >= #{since}
          AND event_type = #{eventType}
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at)
        """)
    List<Map<String, Object>> trendByType(@Param("eventType") String eventType, @Param("since") LocalDateTime since);

    @Select("""
        SELECT COALESCE(NULLIF(page_path, ''), '/') AS "pagePath",
               COALESCE(MAX(NULLIF(page_title, '')), COALESCE(NULLIF(page_path, ''), '/')) AS "pageTitle",
               COUNT(*) AS "views"
        FROM event_logs
        WHERE created_at >= #{since}
          AND event_type = 'page_view'
        GROUP BY COALESCE(NULLIF(page_path, ''), '/')
        ORDER BY views DESC
        LIMIT #{limit}
        """)
    List<Map<String, Object>> topPages(@Param("since") LocalDateTime since, @Param("limit") int limit);

    @Select("""
        SELECT COALESCE(NULLIF(target_type, ''), 'unknown') AS "targetType",
               COALESCE(NULLIF(target_id, ''), '-') AS "targetId",
               COALESCE(MAX(NULLIF(target_title, '')), COALESCE(NULLIF(target_id, ''), '-')) AS "targetTitle",
               COUNT(*) AS "views"
        FROM event_logs
        WHERE created_at >= #{since}
          AND target_type IS NOT NULL
          AND target_type <> ''
        GROUP BY COALESCE(NULLIF(target_type, ''), 'unknown'),
                 COALESCE(NULLIF(target_id, ''), '-')
        ORDER BY views DESC
        LIMIT #{limit}
        """)
    List<Map<String, Object>> topTargets(@Param("since") LocalDateTime since, @Param("limit") int limit);

    @Select("""
        SELECT event_type AS "eventType",
               COUNT(*) AS "count"
        FROM event_logs
        WHERE created_at >= #{since}
        GROUP BY event_type
        ORDER BY count DESC
        LIMIT #{limit}
        """)
    List<Map<String, Object>> eventBreakdown(@Param("since") LocalDateTime since, @Param("limit") int limit);
}
