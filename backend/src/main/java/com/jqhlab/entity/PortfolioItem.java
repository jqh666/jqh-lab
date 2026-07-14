package com.jqhlab.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("portfolio_items")
public class PortfolioItem {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String title;
    private String description;
    private String images;
    private String demoUrl;
    private String category;
    private Integer sortOrder;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
