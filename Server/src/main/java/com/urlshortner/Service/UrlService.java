package com.urlshortner.Service;

import com.urlshortner.Entity.UrlMapping;
import com.urlshortner.Repository.UrlRepository;
import com.urlshortner.Utility.Base62Encoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class UrlService {

    @Autowired
    private UrlRepository repo;

    @Autowired
    private Base62Encoder encoder;

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    public String shortenUrl(String longUrl) {
        UrlMapping entity = new UrlMapping();
        entity.setLongUrl(longUrl);

        repo.save(entity); // generates ID

        String shortCode = encoder.encode(entity.getId());
        entity.setShortCode(shortCode);

        repo.save(entity);

        return "http://localhost:8080/" + shortCode;
    }

    public String getOriginalUrl(String shortCode) {

        String cachedUrl = redisTemplate.opsForValue()
                .get(shortCode);

        if (cachedUrl != null) {
            System.out.println("Fetched from Redis");
            return cachedUrl;
        }


        String longUrl = repo.findByShortCode(shortCode)
                .map(UrlMapping::getLongUrl)
                .orElseThrow(() -> new RuntimeException("URL not found"));


        redisTemplate.opsForValue()
                .set(shortCode, longUrl, 10, TimeUnit.HOURS);

        return longUrl;
    }
}
