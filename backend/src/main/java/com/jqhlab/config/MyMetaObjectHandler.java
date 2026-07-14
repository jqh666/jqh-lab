package com.jqhlab.config;

import com.baomidou.mybatisplus.core.handlers.MetaObjectHandler;
import org.apache.ibatis.reflection.MetaObject;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;

@Component
public class MyMetaObjectHandler implements MetaObjectHandler {
    @Override
    public void insertFill(MetaObject metaObject) {
        this.strictInsertFill(metaObject, "createdAt", LocalDateTime::now, LocalDateTime.class);
        try {
            this.strictInsertFill(metaObject, "updatedAt", LocalDateTime::now, LocalDateTime.class);
        } catch (Exception ignored) {
        }
    }

    @Override
    public void updateFill(MetaObject metaObject) {
        try {
            this.strictUpdateFill(metaObject, "updatedAt", LocalDateTime::now, LocalDateTime.class);
        } catch (Exception ignored) {
        }
    }
}
