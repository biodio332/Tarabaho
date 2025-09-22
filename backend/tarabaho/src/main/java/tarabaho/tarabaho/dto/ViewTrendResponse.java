package tarabaho.tarabaho.dto;

public class ViewTrendResponse {
    private String date;
    private long views;

    // Default constructor
    public ViewTrendResponse() {}

    // Constructor with parameters
    public ViewTrendResponse(String date, long views) {
        this.date = date;
        this.views = views;
    }

    // Getters and setters
    public String getDate() { 
        return date; 
    }
    
    public void setDate(String date) { 
        this.date = date; 
    }
    
    public long getViews() { 
        return views; 
    }
    
    public void setViews(long views) { 
        this.views = views; 
    }

    @Override
    public String toString() {
        return "ViewTrendResponse{" +
                "date='" + date + '\'' +
                ", views=" + views +
                '}';
    }
}