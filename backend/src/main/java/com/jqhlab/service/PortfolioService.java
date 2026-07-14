package com.jqhlab.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.jqhlab.entity.PortfolioItem;
import com.jqhlab.repository.PortfolioItemMapper;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PortfolioService {

    private final PortfolioItemMapper portfolioItemMapper;

    public PortfolioService(PortfolioItemMapper portfolioItemMapper) {
        this.portfolioItemMapper = portfolioItemMapper;
    }

    public List<PortfolioItem> getAll() {
        return portfolioItemMapper.selectList(
            new LambdaQueryWrapper<PortfolioItem>().orderByAsc(PortfolioItem::getSortOrder));
    }

    public PortfolioItem getById(Long id) {
        return portfolioItemMapper.selectById(id);
    }

    public void create(PortfolioItem item) {
        portfolioItemMapper.insert(item);
    }

    public void update(Long id, PortfolioItem item) {
        item.setId(id);
        portfolioItemMapper.updateById(item);
    }

    public void delete(Long id) {
        portfolioItemMapper.deleteById(id);
    }
}
