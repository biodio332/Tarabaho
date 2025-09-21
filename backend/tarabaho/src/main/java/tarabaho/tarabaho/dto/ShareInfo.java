package tarabaho.tarabaho.dto;

public class ShareInfo {
    private String shareToken;
    private String shareUrl;

    public ShareInfo(String shareToken, String shareUrl) {
        this.shareToken = shareToken;
        this.shareUrl = shareUrl;
    }

    public String getShareToken() { return shareToken; }
    public void setShareToken(String shareToken) { this.shareToken = shareToken; }
    
    public String getShareUrl() { return shareUrl; }
    public void setShareUrl(String shareUrl) { this.shareUrl = shareUrl; }
}