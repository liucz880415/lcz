package cn.lcz.kafka.util;

public class KafkaUtils {
    /**
     * Get kafka replay interval according to the retry count.
     *
     * @param retryCount How many times has ready tried.
     * @return The time interval in seconds.
     */
    public static int getRetryInternal(int retryCount) {
        retryCount += 2;
        return 60 * (retryCount < 10 ? (1 << retryCount) : (1 << 10));
    }
}
