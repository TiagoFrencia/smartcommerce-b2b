package com.smartcommerce.iam.infrastructure.config;

import com.smartcommerce.iam.domain.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import com.smartcommerce.SmartCommerceApplication;

@SpringBootTest(classes = SmartCommerceApplication.class)
@EnableAutoConfiguration(exclude = {
        DataSourceAutoConfiguration.class,
        HibernateJpaAutoConfiguration.class
})
class SecurityConfigTest {

    @MockBean
    private UserRepository userRepository;

    @Test
    void contextLoads() {
        // Verification that the security context and beans load successfully
    }
}
