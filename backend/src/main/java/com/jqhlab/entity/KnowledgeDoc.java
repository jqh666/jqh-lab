package com.jqhlab.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("knowledge_docs")
public class KnowledgeDoc {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String title;
    private String source;
    private String content;
    private String embedding;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
