package com.jqhlab.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.jqhlab.entity.KnowledgeDoc;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface KnowledgeDocMapper extends BaseMapper<KnowledgeDoc> {
    int insertKnowledgeDoc(KnowledgeDoc doc);

    List<KnowledgeDoc> findSimilar(@Param("vector") String vector, @Param("topK") int topK);
}
