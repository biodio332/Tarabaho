package tarabaho.tarabaho.dto;

import java.time.Instant;

public class OtpInfo {
    private final String otp;
        private final Instant expiry;

        public OtpInfo(String otp, Instant expiry) {
            this.otp = otp;
            this.expiry = expiry;
        }

        public String getOtp() {
            return otp;
        }

        public Instant getExpiry() {
            return expiry;
        }
    
}
