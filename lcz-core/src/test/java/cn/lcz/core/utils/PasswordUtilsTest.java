package cn.lcz.core.utils;

import org.junit.Test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class PasswordUtilsTest {
    // 注意：Web端的密码是先经过一次md5，然后再进行加盐加密：encrypted = PasswordUtils.encryptWithSalt(md5(password), salt)
    private final String password = "somepassword";
    private final String salt = "randomstring";

    @Test
    public void encryptWithSalt() {
        String encrypted = PasswordUtils.encryptWithSalt(password, salt);
        assertEquals("randomstring:ec7d0b9a33ae2caff1514ba544583ad4", encrypted);
    }

    @Test
    public void encryptWithRandomSalt() {
        String encrypted = PasswordUtils.encryptWithRandomSalt(password);
        assertTrue(PasswordUtils.validate(password, encrypted));
    }

    @Test
    public void encrypt() {
        String encrypted = PasswordUtils.encrypt(password);
        assertEquals("9c42a1346e333a770904b2a2b37fa7d3", encrypted);
    }

    @Test
    public void encryptBasis() {
        String encrypted = PasswordUtils.encrypt("123456");
        assertEquals("e10adc3949ba59abbe56e057f20f883e", encrypted);
    }

    @Test
    public void validatePasswordWithSalt() {
        boolean result = PasswordUtils.validate(password, "randomstring:ec7d0b9a33ae2caff1514ba544583ad4");
        assertTrue(result);
    }

    @Test
    public void validateWebPassword() {
        String md5 = PasswordUtils.MD5("123456");
        assertTrue(PasswordUtils.validate(md5, "21900783:720f8dc0f68ec3aee887d89ded3ace11"));
    }

    @Test
    public void validatePasswordWithoutSalt() {
        boolean result = PasswordUtils.validate(password, "9c42a1346e333a770904b2a2b37fa7d3");
        assertTrue(result);
    }

}
