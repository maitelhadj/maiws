package fr.mai.apigateway.model;

public class Detection {

    private float confidence;
    private String language;

    public Detection() {
    }

    public Detection(float confidence, String language) {
        this.confidence = confidence;
        this.language = language;
    }

    public float getConfidence() {
        return confidence;
    }

    public void setConfidence(float confidence) {
        this.confidence = confidence;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }
}
