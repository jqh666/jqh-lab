package com.jqhlab.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("blog_posts")
public class BlogPost {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String title;
    private String slug;
    private String contentMd;
    private Long categoryId;
    private String tags;
    private String status;
    private String coverImage;
    private Integer viewCount;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
